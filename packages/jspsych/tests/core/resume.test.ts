import { pressKey, startTimeline } from "@jspsych/test-utils";

import { JsPsych, JsPsychPlugin, ParameterType, TrialType, initJsPsych } from "../../src";
import { setSeed } from "../../src/modules/randomization";
import {
  DEFAULT_BLOCK_MESSAGE,
  RESUME_FORMAT_VERSION,
  SessionLogEntry,
  StorageLike,
} from "../../src/modules/resume";

/** An in-memory `Storage` implementation that is shared between "page loads" */
class MockStorage implements StorageLike {
  public items: Record<string, string> = {};

  getItem(key: string) {
    return Object.hasOwn(this.items, key) ? this.items[key] : null;
  }

  setItem(key: string, value: string) {
    this.items[key] = value;
  }

  removeItem(key: string) {
    delete this.items[key];
  }
}

const info = <const>{
  name: "resume-test",
  version: "1.0.0",
  parameters: {
    stimulus: { type: ParameterType.STRING, default: "" },
  },
  data: {
    stimulus: { type: ParameterType.STRING },
    response: { type: ParameterType.STRING },
  },
};

/** Records the stimulus of every trial that is actually executed by a plugin */
const trialSpy = jest.fn<void, [string]>();

/**
 * A minimal keyboard response plugin that produces fully deterministic data (unlike `rt`-based
 * plugins), which makes it possible to compare data across runs.
 */
class ResumeTestPlugin implements JsPsychPlugin<typeof info> {
  static info = info;

  constructor(private jsPsych: JsPsych) {}

  trial(display_element: HTMLElement, trial: TrialType<typeof info>) {
    trialSpy(trial.stimulus);
    display_element.innerHTML = `<div id="stim">${trial.stimulus}</div>`;

    this.jsPsych.pluginAPI.getKeyboardResponse({
      callback_function: (response: { key: string }) => {
        this.jsPsych.finishTrial({ stimulus: trial.stimulus, response: response.key });
      },
      valid_responses: "ALL_KEYS",
      rt_method: "performance",
      persist: false,
      allow_held_key: false,
    });
  }
}

const trial = (stimulus: string, options: Record<string, any> = {}) => ({
  type: ResumeTestPlugin,
  stimulus,
  ...options,
});

/**
 * Simulates a page reload by detaching the jsPsych instance from the DOM and cancelling its
 * listeners, so that it no longer reacts to key presses issued for the next instance.
 */
const simulateReload = (jsPsych: JsPsych) => {
  jsPsych.pluginAPI.cancelAllKeyboardResponses();
  jsPsych.pluginAPI.clearAllTimeouts();
  jsPsych.getDisplayElement().parentElement.remove();
};

const readSession = (storage: MockStorage, key = "test-key") =>
  JSON.parse(storage.getItem(`jspsych-resume:${key}`));

const writeSession = (storage: MockStorage, session: any, key = "test-key") =>
  storage.setItem(`jspsych-resume:${key}`, JSON.stringify(session));

const getLoggedTrials = (storage: MockStorage, key = "test-key") =>
  (readSession(storage, key).log as SessionLogEntry[]).filter(
    (entry): entry is Extract<SessionLogEntry, { type: "trial" }> => entry.type === "trial"
  );

/** Data with the fields that legitimately vary between runs removed */
const stableData = (jsPsych: JsPsych) =>
  jsPsych.data
    .get()
    .values()
    .map(({ time_elapsed, ...rest }) => rest);

describe("resume on reload", () => {
  let storage: MockStorage;
  let warnSpy: jest.SpyInstance;
  let infoSpy: jest.SpyInstance;

  beforeEach(() => {
    storage = new MockStorage();
    trialSpy.mockClear();
    warnSpy = jest.spyOn(console, "warn").mockImplementation(() => {});
    infoSpy = jest.spyOn(console, "info").mockImplementation(() => {});
  });

  afterEach(() => {
    warnSpy.mockRestore();
    infoSpy.mockRestore();
  });

  const resumeOptions = (overrides: Record<string, any> = {}) => ({
    resume: { key: "test-key", storage, ...overrides },
  });

  it("resumes at the trial that was interrupted and reproduces an uninterrupted run", async () => {
    const timeline = [trial("one"), trial("two"), trial("three")];

    // Uninterrupted control run
    const control = await startTimeline(timeline);
    await pressKey("a");
    await pressKey("b");
    await pressKey("c");
    await control.expectFinished();
    simulateReload(control.jsPsych);

    // Interrupted run
    const first = await startTimeline(timeline, initJsPsych(resumeOptions()));
    await pressKey("a");
    await pressKey("b");
    await first.expectRunning();
    expect(first.getHTML()).toMatch("three");
    simulateReload(first.jsPsych);

    trialSpy.mockClear();

    // Resumed run
    const second = await startTimeline(timeline, initJsPsych(resumeOptions()));

    // The first two trials were replayed rather than executed
    expect(trialSpy.mock.calls.map(([stimulus]) => stimulus)).toEqual(["three"]);
    expect(second.getData().count()).toBe(2);
    expect(second.getHTML()).toMatch("three");

    await pressKey("c");
    await second.expectFinished();

    expect(stableData(second.jsPsych)).toEqual(stableData(control.jsPsych));
    expect(
      second
        .getData()
        .values()
        .map((t) => t.trial_index)
    ).toEqual([0, 1, 2]);
  });

  it("preserves the original `time_elapsed` of replayed trials and continues the experiment clock", async () => {
    const timeline = [trial("one"), trial("two"), trial("three")];

    const first = await startTimeline(timeline, initJsPsych(resumeOptions()));
    await pressKey("a");
    await pressKey("b");
    simulateReload(first.jsPsych);

    // Backdate the saved session so that the assertions below cannot be satisfied by the resumed
    // instance's own (near-zero) clock
    const session = readSession(storage);
    const loggedTrials = session.log.filter((entry) => entry.type === "trial");
    loggedTrials[0].result.time_elapsed = 12345;
    loggedTrials[1].result.time_elapsed = 67890;
    session.elapsedTime = 100000;
    writeSession(storage, session);

    const second = await startTimeline(timeline, initJsPsych(resumeOptions()));
    expect(
      second
        .getData()
        .values()
        .map((t) => t.time_elapsed)
    ).toEqual([12345, 67890]);

    await pressKey("c");
    await second.expectFinished();
    expect(second.getData().values()[2].time_elapsed).toBeGreaterThanOrEqual(100000);
  });

  it("reproduces a randomized timeline variable order without randomizing again", async () => {
    const variables = [{ x: 0 }, { x: 1 }, { x: 2 }, { x: 3 }, { x: 4 }];
    const timeline = [
      {
        timeline: [
          trial("stim", { data: { x: () => jsPsychInstance.evaluateTimelineVariable("x") } }),
        ],
        timeline_variables: variables,
        randomize_order: true,
      },
    ];

    let jsPsychInstance = initJsPsych(resumeOptions());
    const first = await startTimeline(timeline, jsPsychInstance);
    await pressKey("a");
    await pressKey("b");
    simulateReload(first.jsPsych);

    const recordedOrder = readSession(storage).log.find(
      (entry: SessionLogEntry) => entry.type === "tv-order" && entry.order.length === 5
    ).order;

    jsPsychInstance = initJsPsych(resumeOptions());
    const second = await startTimeline(timeline, jsPsychInstance);
    for (const key of ["c", "d", "e"]) {
      await pressKey(key);
    }
    await second.expectFinished();

    expect(
      second
        .getData()
        .values()
        .map((t) => t.x)
    ).toEqual(recordedOrder.map((index: number) => variables[index].x));
  });

  it("does not re-invoke a custom `sample` function when resuming", async () => {
    const sampleFn = jest.fn((ids: number[]) => [...ids].reverse());
    const timeline = [
      {
        timeline: [trial("stim")],
        timeline_variables: [{ x: 0 }, { x: 1 }, { x: 2 }],
        sample: { type: "custom", fn: sampleFn },
      },
    ];

    const first = await startTimeline(timeline, initJsPsych(resumeOptions()));
    await pressKey("a");
    expect(sampleFn).toHaveBeenCalledTimes(1);
    simulateReload(first.jsPsych);

    sampleFn.mockClear();

    const second = await startTimeline(timeline, initJsPsych(resumeOptions()));
    expect(sampleFn).not.toHaveBeenCalled();
    expect(second.getData().count()).toBe(1);
  });

  it("honors logged `conditional_function` outcomes without invoking the function", async () => {
    const conditionalFn = jest.fn(() => true);
    const timeline = [
      trial("one"),
      { timeline: [trial("two")], conditional_function: conditionalFn },
      trial("three"),
    ];

    const first = await startTimeline(timeline, initJsPsych(resumeOptions()));
    await pressKey("a");
    await pressKey("b");
    expect(conditionalFn).toHaveBeenCalledTimes(1);
    simulateReload(first.jsPsych);

    // A function that would take the other branch if it were invoked again
    conditionalFn.mockClear();
    conditionalFn.mockReturnValue(false);

    const second = await startTimeline(timeline, initJsPsych(resumeOptions()));
    expect(conditionalFn).not.toHaveBeenCalled();
    expect(second.getData().count()).toBe(2);
    expect(second.getHTML()).toMatch("three");

    await pressKey("c");
    await second.expectFinished();
    expect(
      second
        .getData()
        .values()
        .map((t) => t.stimulus)
    ).toEqual(["one", "two", "three"]);
  });

  it("honors logged `loop_function` outcomes and keeps looping correctly after the resume point", async () => {
    let iteration = 0;
    const loopFn = jest.fn((data: any) => data.count() === -1); // never loops
    const timeline = [
      {
        timeline: [trial("a"), trial("b")],
        loop_function: () => {
          iteration++;
          return iteration < 2;
        },
      },
    ];

    const first = await startTimeline(timeline, initJsPsych(resumeOptions()));
    await pressKey("1"); // iteration 1, trial a
    await pressKey("2"); // iteration 1, trial b -> loop_function returns true
    await pressKey("3"); // iteration 2, trial a
    await first.expectRunning();
    simulateReload(first.jsPsych);

    // Replace the loop function with one that records its invocations
    const secondTimeline = [{ ...timeline[0], loop_function: loopFn }];

    const second = await startTimeline(secondTimeline, initJsPsych(resumeOptions()));
    expect(loopFn).not.toHaveBeenCalled();
    expect(second.getData().count()).toBe(3);

    await pressKey("4"); // iteration 2, trial b -> live loop_function invocation
    await second.expectFinished();

    expect(loopFn).toHaveBeenCalledTimes(1);
    // The loop function sees the replayed trial of the current iteration as well as the live one
    expect(loopFn.mock.calls[0][0].values().map((t: any) => t.response)).toEqual(["3", "4"]);
    expect(
      second
        .getData()
        .values()
        .map((t) => t.response)
    ).toEqual(["1", "2", "3", "4"]);
  });

  it("re-runs `run_on_resume` trials and replaces their logged result", async () => {
    const timeline = [trial("one"), trial("two", { run_on_resume: true }), trial("three")];

    const first = await startTimeline(timeline, initJsPsych(resumeOptions()));
    await pressKey("a");
    await pressKey("b");
    simulateReload(first.jsPsych);

    trialSpy.mockClear();

    const second = await startTimeline(timeline, initJsPsych(resumeOptions()));

    // "one" was replayed, "two" is executed again
    expect(trialSpy.mock.calls.map(([stimulus]) => stimulus)).toEqual(["two"]);
    expect(second.getData().count()).toBe(1);

    await pressKey("z");

    // The fresh result replaced the logged one at the same position
    expect(getLoggedTrials(storage).map((entry) => entry.result.response)).toEqual(["a", "z"]);
    expect(
      second
        .getData()
        .values()
        .map((t) => t.response)
    ).toEqual(["a", "z"]);

    await pressKey("c");
    await second.expectFinished();
    expect(
      second
        .getData()
        .values()
        .map((t) => t.trial_index)
    ).toEqual([0, 1, 2]);
  });

  it("persists and restores the `jsPsych.state` object and fires `on_resume` once", async () => {
    let jsPsychInstance: JsPsych;
    const timeline = [
      trial("one", {
        on_finish: (data: any) => {
          jsPsychInstance.state.responses = [data.response];
        },
      }),
      trial("two", {
        on_finish: (data: any) => {
          jsPsychInstance.state.responses.push(data.response);
        },
      }),
      trial("three"),
    ];

    jsPsychInstance = initJsPsych(resumeOptions());
    const first = await startTimeline(timeline, jsPsychInstance);
    await pressKey("a");
    await pressKey("b");
    expect(jsPsychInstance.state.responses).toEqual(["a", "b"]);
    simulateReload(first.jsPsych);

    const onResume = jest.fn();
    jsPsychInstance = initJsPsych(resumeOptions({ on_resume: onResume }));
    const second = await startTimeline(timeline, jsPsychInstance);

    expect(jsPsychInstance.state.responses).toEqual(["a", "b"]);
    expect(onResume).toHaveBeenCalledTimes(1);
    expect(onResume.mock.calls[0][0].values().map((t: any) => t.response)).toEqual(["a", "b"]);

    await pressKey("c");
    await second.expectFinished();
    expect(onResume).toHaveBeenCalledTimes(1);
  });

  it("generates and persists a seed and reproduces build-time randomization after a resume", async () => {
    const items = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
    const timeline = [trial("one"), trial("two")];

    const firstInstance = initJsPsych(resumeOptions());
    const seed = firstInstance.state._rng_seed;
    expect(typeof seed).toBe("string");

    // A shuffle that happens while the timeline is being built, i.e. after `initJsPsych()` but
    // before `run()`
    const firstShuffle = firstInstance.randomization.shuffle(items);

    const first = await startTimeline(timeline, firstInstance);
    await pressKey("a");
    expect(readSession(storage).state._rng_seed).toBe(seed);
    simulateReload(first.jsPsych);

    const secondInstance = initJsPsych(resumeOptions());
    expect(secondInstance.state._rng_seed).toBe(seed);
    expect(secondInstance.randomization.shuffle(items)).toEqual(firstShuffle);

    const second = await startTimeline(timeline, secondInstance);
    await pressKey("b");
    await second.expectFinished();
  });

  it("adopts a seed that was set before `initJsPsych()` instead of generating one", async () => {
    const userSeed = "a-seed-of-my-own";

    setSeed(userSeed);
    const firstDraw = Math.random();

    // Restart the stream so that the assertion below can tell whether jsPsych re-seeded it
    setSeed(userSeed);
    const jsPsych = initJsPsych(resumeOptions());

    expect(jsPsych.state._rng_seed).toBe(userSeed);
    expect(Math.random()).toBe(firstDraw);
  });

  it("restores data properties that were added in the interrupted session", async () => {
    let jsPsychInstance: JsPsych;
    const timeline = [
      trial("one", {
        on_finish: () => {
          jsPsychInstance.data.addProperties({ condition: "loud" });
        },
      }),
      trial("two"),
      trial("three"),
    ];

    jsPsychInstance = initJsPsych(resumeOptions());
    const first = await startTimeline(timeline, jsPsychInstance);
    await pressKey("a");
    await pressKey("b");
    simulateReload(first.jsPsych);

    expect(readSession(storage).state._data_properties).toEqual({ condition: "loud" });

    jsPsychInstance = initJsPsych(resumeOptions());
    const second = await startTimeline(timeline, jsPsychInstance);

    // The live trial gets the property even though `addProperties()` was called in a callback that
    // does not run again
    await pressKey("c");
    await second.expectFinished();

    expect(
      second
        .getData()
        .values()
        .map((t) => t.condition)
    ).toEqual(["loud", "loud", "loud"]);
  });

  it("restores a manually set progress bar position", async () => {
    let jsPsychInstance: JsPsych;
    const progressBarOptions = () => ({
      ...resumeOptions(),
      show_progress_bar: true,
      auto_update_progress_bar: false,
    });
    const timeline = [
      trial("one", {
        on_finish: () => {
          jsPsychInstance.progressBar.progress = 0.5;
        },
      }),
      trial("two"),
    ];

    jsPsychInstance = initJsPsych(progressBarOptions());
    const first = await startTimeline(timeline, jsPsychInstance);
    await pressKey("a");
    expect(jsPsychInstance.state._progress).toBe(0.5);
    simulateReload(first.jsPsych);

    jsPsychInstance = initJsPsych(progressBarOptions());
    const second = await startTimeline(timeline, jsPsychInstance);

    expect(jsPsychInstance.progressBar.progress).toBe(0.5);
    expect(
      second.jsPsych
        .getDisplayContainerElement()
        .querySelector<HTMLElement>("#jspsych-progressbar-inner").style.width
    ).toBe("50%");

    await pressKey("b");
    await second.expectFinished();
  });

  it("does not store automatic progress bar updates", async () => {
    const jsPsych = initJsPsych({ ...resumeOptions(), show_progress_bar: true });
    const experiment = await startTimeline([trial("one"), trial("two")], jsPsych);

    await pressKey("a");
    expect(jsPsych.progressBar.progress).toBe(0.5);
    expect(jsPsych.state._progress).toBeUndefined();

    await pressKey("b");
    await experiment.expectFinished();
  });

  it("writes the reserved keys of `jsPsych.state` and nothing else", async () => {
    const jsPsych = initJsPsych({
      ...resumeOptions(),
      show_progress_bar: true,
      auto_update_progress_bar: false,
    });

    // The seed is the only reserved key that is always present
    expect(Object.keys(jsPsych.state)).toEqual(["_rng_seed"]);

    const experiment = await startTimeline([trial("one")], jsPsych);
    jsPsych.data.addProperties({ subject_id: "s1" });
    jsPsych.progressBar.progress = 0.25;

    expect(jsPsych.state).toEqual({
      _rng_seed: expect.any(String),
      _data_properties: { subject_id: "s1" },
      _progress: 0.25,
    });

    await pressKey("a");
    await experiment.expectFinished();
  });

  describe("_resumes", () => {
    const timeline = [trial("one"), trial("two"), trial("three")];

    /**
     * Creates a jsPsych instance as if the page were loaded `timeAway` milliseconds after the saved
     * session was last written, so that the recorded `time_away` is deterministic
     */
    const reloadAfter = (
      timeAway: number,
      resumeOverrides: Record<string, any> = {},
      initOptions: Record<string, any> = {}
    ) => {
      const { savedAt } = readSession(storage);
      const nowSpy = jest.spyOn(Date, "now").mockReturnValue(savedAt + timeAway);
      const jsPsych = initJsPsych({ ...resumeOptions(resumeOverrides), ...initOptions });
      nowSpy.mockRestore();
      trialSpy.mockClear();
      return { jsPsych, savedAt };
    };

    /** Runs the timeline until it is interrupted after `trialCount` trials */
    const interruptAfter = async (trialCount: number) => {
      const first = await startTimeline(timeline, initJsPsych(resumeOptions()));
      for (const key of ["a", "b", "c"].slice(0, trialCount)) {
        await pressKey(key);
      }
      simulateReload(first.jsPsych);
    };

    it("records the resume in `jsPsych.state._resumes`", async () => {
      await interruptAfter(2);

      const { jsPsych, savedAt } = reloadAfter(5000);
      expect(jsPsych.state._resumes).toEqual([
        { trial_index: 2, time_away: 5000, resumed_at: savedAt + 5000 },
      ]);

      const second = await startTimeline(timeline, jsPsych);
      await pressKey("c");
      await second.expectFinished();
    });

    it("appends an entry for every interruption of the same session", async () => {
      await interruptAfter(1);

      const { jsPsych: secondInstance, savedAt: firstSavedAt } = reloadAfter(1000);
      const second = await startTimeline(timeline, secondInstance);
      await pressKey("b");
      simulateReload(second.jsPsych);

      const { jsPsych: thirdInstance, savedAt: secondSavedAt } = reloadAfter(2000);
      expect(thirdInstance.state._resumes).toEqual([
        { trial_index: 1, time_away: 1000, resumed_at: firstSavedAt + 1000 },
        { trial_index: 2, time_away: 2000, resumed_at: secondSavedAt + 2000 },
      ]);

      const third = await startTimeline(timeline, thirdInstance);
      await pressKey("c");
      await third.expectFinished();
    });

    it("does not add the key when the experiment starts fresh", async () => {
      const jsPsych = initJsPsych(resumeOptions());
      expect(jsPsych.state._resumes).toBeUndefined();

      const experiment = await startTimeline(timeline, jsPsych);
      await pressKey("a");
      await pressKey("b");
      await pressKey("c");
      await experiment.expectFinished();

      expect(jsPsych.state._resumes).toBeUndefined();
    });

    it("does not record a resume when the saved session expires with `max_age`", async () => {
      await interruptAfter(1);

      const { jsPsych } = reloadAfter(5000, { max_age: 1000 });
      expect(jsPsych.state._resumes).toBeUndefined();

      const second = await startTimeline(timeline, jsPsych);
      expect(trialSpy.mock.calls.map(([stimulus]) => stimulus)).toEqual(["one"]);
      expect(second.getData().count()).toBe(0);
      expect(jsPsych.state._resumes).toBeUndefined();
    });

    it("does not record a resume when the saved session is discarded by `incomplete_session: 'restart'`", async () => {
      await interruptAfter(1);

      const { jsPsych } = reloadAfter(1000, { incomplete_session: "restart" });
      expect(jsPsych.state._resumes).toBeUndefined();

      const second = await startTimeline(timeline, jsPsych);
      expect(trialSpy.mock.calls.map(([stimulus]) => stimulus)).toEqual(["one"]);
      expect(second.getData().count()).toBe(0);
      expect(jsPsych.state._resumes).toBeUndefined();
    });

    it("does not record a resume when the run is blocked", async () => {
      await interruptAfter(1);

      const { jsPsych } = reloadAfter(1000, { incomplete_session: "block" });
      expect(jsPsych.state._resumes).toBeUndefined();

      const second = await startTimeline(timeline, jsPsych);
      await second.expectFinished();

      expect(second.getHTML()).toBe(DEFAULT_BLOCK_MESSAGE);
      expect(trialSpy).not.toHaveBeenCalled();
      expect(jsPsych.state._resumes).toBeUndefined();
    });

    it("has recorded the resume before `on_resume` fires", async () => {
      await interruptAfter(2);

      let jsPsychInstance: JsPsych;
      let resumesInCallback: any;
      const { jsPsych, savedAt } = reloadAfter(1500, {
        on_resume: () => {
          resumesInCallback = jsPsychInstance.state._resumes;
        },
      });
      jsPsychInstance = jsPsych;

      const second = await startTimeline(timeline, jsPsych);
      expect(resumesInCallback).toEqual([
        { trial_index: 2, time_away: 1500, resumed_at: savedAt + 1500 },
      ]);

      await pressKey("c");
      await second.expectFinished();
    });

    it("keeps the entry in the state of a run that is completed after the resume", async () => {
      await interruptAfter(2);

      let jsPsychInstance: JsPsych;
      let resumesAtFinish: any;
      const { jsPsych, savedAt } = reloadAfter(
        4000,
        {},
        {
          on_finish: () => {
            resumesAtFinish = jsPsychInstance.state._resumes;
          },
        }
      );
      jsPsychInstance = jsPsych;

      const second = await startTimeline(timeline, jsPsych);
      await pressKey("c");
      await second.expectFinished();

      expect(resumesAtFinish).toEqual([
        { trial_index: 2, time_away: 4000, resumed_at: savedAt + 4000 },
      ]);
      expect(jsPsych.state._resumes).toEqual(resumesAtFinish);
    });

    it("records a `null` `time_away` for a session without a timestamp", async () => {
      await interruptAfter(1);

      const { savedAt, ...sessionWithoutTimestamp } = readSession(storage);
      writeSession(storage, sessionWithoutTimestamp);

      const jsPsych = initJsPsych(resumeOptions());
      expect(jsPsych.state._resumes).toEqual([
        { trial_index: 1, time_away: null, resumed_at: expect.any(Number) },
      ]);

      const second = await startTimeline(timeline, jsPsych);
      await pressKey("b");
      await pressKey("c");
      await second.expectFinished();
    });
  });

  it("fires `on_resume` when the saved session ends exactly at the end of the experiment", async () => {
    const first = await startTimeline(
      [trial("one"), trial("two"), trial("three")],
      initJsPsych(resumeOptions())
    );
    await pressKey("a");
    await pressKey("b");
    simulateReload(first.jsPsych);

    // The resumed experiment consists of exactly the trials that are in the saved session
    const onResume = jest.fn();
    const second = await startTimeline(
      [trial("one"), trial("two")],
      initJsPsych(resumeOptions({ on_resume: onResume }))
    );

    await second.expectFinished();
    expect(onResume).toHaveBeenCalledTimes(1);
    expect(second.getData().count()).toBe(2);
    expect(storage.items).toEqual({});
  });

  it("does not invoke `on_start`, `on_load`, and `on_finish` callbacks for replayed trials", async () => {
    const callbacks = {
      on_start: jest.fn(),
      on_load: jest.fn(),
      on_finish: jest.fn(),
    };
    const timeline = [trial("one", callbacks), trial("two")];

    const first = await startTimeline(timeline, initJsPsych(resumeOptions()));
    await pressKey("a");
    simulateReload(first.jsPsych);

    for (const callback of Object.values(callbacks)) {
      callback.mockClear();
    }

    const second = await startTimeline(timeline, initJsPsych(resumeOptions()));
    for (const callback of Object.values(callbacks)) {
      expect(callback).not.toHaveBeenCalled();
    }

    await pressKey("b");
    await second.expectFinished();
  });

  it("replays trials with `record_data: false` without adding data", async () => {
    const timeline = [trial("one", { record_data: false }), trial("two"), trial("three")];

    const first = await startTimeline(timeline, initJsPsych(resumeOptions()));
    await pressKey("a");
    await pressKey("b");
    simulateReload(first.jsPsych);

    expect(getLoggedTrials(storage).map((entry) => entry.result)).toEqual([
      null,
      expect.objectContaining({ stimulus: "two" }),
    ]);

    trialSpy.mockClear();
    const second = await startTimeline(timeline, initJsPsych(resumeOptions()));

    expect(trialSpy.mock.calls.map(([stimulus]) => stimulus)).toEqual(["three"]);
    expect(
      second
        .getData()
        .values()
        .map((t) => t.stimulus)
    ).toEqual(["two"]);

    await pressKey("c");
    await second.expectFinished();
    expect(
      second
        .getData()
        .values()
        .map((t) => t.trial_index)
    ).toEqual([1, 2]);
  });

  it("clears the saved session when the experiment finishes", async () => {
    const finished = await startTimeline([trial("one")], initJsPsych(resumeOptions()));
    await pressKey("a");
    await finished.expectFinished();

    expect(storage.items).toEqual({});
  });

  it("clears the saved session when the experiment is aborted", async () => {
    const jsPsych = initJsPsych(resumeOptions());
    const aborted = await startTimeline([trial("one"), trial("two")], jsPsych);
    await pressKey("a");
    jsPsych.abortExperiment();
    await aborted.expectFinished();

    expect(storage.items).toEqual({});
  });

  describe("max_age", () => {
    /** Runs a session that is interrupted after one trial and backdates it by `age` milliseconds */
    const saveInterruptedSession = async (timeline: any[], age: number, options = {}) => {
      const first = await startTimeline(timeline, initJsPsych(resumeOptions(options)));
      await pressKey("a");
      simulateReload(first.jsPsych);

      const session = readSession(storage);
      session.savedAt = Date.now() - age;
      writeSession(storage, session);
      trialSpy.mockClear();
    };

    it("saves the time at which the session was written", async () => {
      const before = Date.now();
      const experiment = await startTimeline(
        [trial("one"), trial("two")],
        initJsPsych(resumeOptions())
      );
      await pressKey("a");

      const { savedAt } = readSession(storage);
      expect(savedAt).toBeGreaterThanOrEqual(before);
      expect(savedAt).toBeLessThanOrEqual(Date.now());

      await pressKey("b");
      await experiment.expectFinished();
    });

    it("discards a saved session that is older than `max_age`", async () => {
      const timeline = [trial("one"), trial("two")];
      await saveInterruptedSession(timeline, 5000, { max_age: 1000 });

      const second = await startTimeline(timeline, initJsPsych(resumeOptions({ max_age: 1000 })));

      expect(trialSpy.mock.calls.map(([stimulus]) => stimulus)).toEqual(["one"]);
      expect(second.getData().count()).toBe(0);
      expect(second.getHTML()).toMatch("one");
      expect(infoSpy).toHaveBeenCalledWith(expect.stringContaining("max_age"));

      await pressKey("y");
      await pressKey("z");
      await second.expectFinished();
      expect(
        second
          .getData()
          .values()
          .map((t) => t.response)
      ).toEqual(["y", "z"]);
    });

    it("resumes a saved session that is younger than `max_age`", async () => {
      const timeline = [trial("one"), trial("two")];
      await saveInterruptedSession(timeline, 5000, { max_age: 60000 });

      const second = await startTimeline(timeline, initJsPsych(resumeOptions({ max_age: 60000 })));

      expect(trialSpy.mock.calls.map(([stimulus]) => stimulus)).toEqual(["two"]);
      expect(second.getData().count()).toBe(1);

      await pressKey("b");
      await second.expectFinished();
    });

    it("never expires a saved session when `max_age` is not set", async () => {
      const timeline = [trial("one"), trial("two")];
      await saveInterruptedSession(timeline, 1000 * 60 * 60 * 24 * 365);

      const second = await startTimeline(timeline, initJsPsych(resumeOptions()));

      expect(trialSpy.mock.calls.map(([stimulus]) => stimulus)).toEqual(["two"]);
      expect(second.getData().count()).toBe(1);

      await pressKey("b");
      await second.expectFinished();
    });

    it("discards a saved session without a timestamp when `max_age` is set", async () => {
      const timeline = [trial("one"), trial("two")];
      await saveInterruptedSession(timeline, 0, { max_age: 60000 });

      const { savedAt, ...sessionWithoutTimestamp } = readSession(storage);
      writeSession(storage, sessionWithoutTimestamp);

      const second = await startTimeline(timeline, initJsPsych(resumeOptions({ max_age: 60000 })));

      expect(trialSpy.mock.calls.map(([stimulus]) => stimulus)).toEqual(["one"]);
      expect(second.getData().count()).toBe(0);
    });
  });

  describe("incomplete_session", () => {
    const timeline = [trial("one"), trial("two")];

    /** Runs the timeline until it is interrupted after the first trial, and returns the session */
    const interruptSession = async (options = {}) => {
      const first = await startTimeline(timeline, initJsPsych(resumeOptions(options)));
      await pressKey("a");
      simulateReload(first.jsPsych);
      trialSpy.mockClear();
      return readSession(storage);
    };

    it("resumes the saved session with `resume`", async () => {
      await interruptSession();

      const second = await startTimeline(
        timeline,
        initJsPsych(resumeOptions({ incomplete_session: "resume" }))
      );

      expect(trialSpy.mock.calls.map(([stimulus]) => stimulus)).toEqual(["two"]);
      expect(second.getData().count()).toBe(1);

      await pressKey("b");
      await second.expectFinished();
    });

    it("discards the saved session and starts fresh with `restart`", async () => {
      await interruptSession();

      const onResume = jest.fn();
      const second = await startTimeline(
        timeline,
        initJsPsych(resumeOptions({ incomplete_session: "restart", on_resume: onResume }))
      );

      expect(trialSpy.mock.calls.map(([stimulus]) => stimulus)).toEqual(["one"]);
      expect(second.getData().count()).toBe(0);
      expect(onResume).not.toHaveBeenCalled();

      // A new session is recorded from the start of the restarted run
      await pressKey("y");
      expect(getLoggedTrials(storage).map((entry) => entry.result.response)).toEqual(["y"]);

      await pressKey("z");
      await second.expectFinished();
      expect(
        second
          .getData()
          .values()
          .map((t) => t.response)
      ).toEqual(["y", "z"]);
      expect(storage.items).toEqual({});
    });

    it("does not run the experiment with `block` and leaves the saved session untouched", async () => {
      const savedSession = await interruptSession();

      const onFinish = jest.fn();
      const onTrialStart = jest.fn();
      const onResume = jest.fn();
      const second = await startTimeline(timeline, {
        ...resumeOptions({ incomplete_session: "block", on_resume: onResume }),
        on_finish: onFinish,
        on_trial_start: onTrialStart,
      });
      await second.expectFinished();

      expect(second.getHTML()).toBe(DEFAULT_BLOCK_MESSAGE);
      expect(trialSpy).not.toHaveBeenCalled();
      expect(onFinish).not.toHaveBeenCalled();
      expect(onTrialStart).not.toHaveBeenCalled();
      expect(onResume).not.toHaveBeenCalled();
      expect(second.getData().count()).toBe(0);

      // The record of the interrupted session is what blocks the experiment, so it must survive
      expect(readSession(storage)).toEqual(savedSession);
      simulateReload(second.jsPsych);

      const third = await startTimeline(
        timeline,
        initJsPsych(resumeOptions({ incomplete_session: "block" }))
      );
      await third.expectFinished();

      expect(third.getHTML()).toBe(DEFAULT_BLOCK_MESSAGE);
      expect(trialSpy).not.toHaveBeenCalled();
      expect(readSession(storage)).toEqual(savedSession);
    });

    it("displays a custom `block_message` for a blocked partial session", async () => {
      await interruptSession();

      const second = await startTimeline(
        timeline,
        initJsPsych(
          resumeOptions({ incomplete_session: "block", block_message: "<p>Come back later.</p>" })
        )
      );
      await second.expectFinished();

      expect(second.getHTML()).toBe("<p>Come back later.</p>");
    });

    it("does not expire a blocking session with `max_age`", async () => {
      await interruptSession();

      const session = readSession(storage);
      session.savedAt = Date.now() - 1000 * 60 * 60 * 24 * 365;
      writeSession(storage, session);

      const second = await startTimeline(
        timeline,
        initJsPsych(resumeOptions({ incomplete_session: "block", max_age: 1000 }))
      );
      await second.expectFinished();

      expect(second.getHTML()).toBe(DEFAULT_BLOCK_MESSAGE);
      expect(trialSpy).not.toHaveBeenCalled();
      expect(readSession(storage)).toEqual(session);
    });

    it("unblocks a partial session with `clearSavedSession()`", async () => {
      await interruptSession();

      const jsPsych = initJsPsych(resumeOptions({ incomplete_session: "block" }));
      jsPsych.clearSavedSession();
      expect(storage.items).toEqual({});

      const second = await startTimeline(timeline, jsPsych);

      expect(trialSpy.mock.calls.map(([stimulus]) => stimulus)).toEqual(["one"]);
      expect(second.getData().count()).toBe(0);

      await pressKey("y");
      await pressKey("z");
      await second.expectFinished();
      expect(second.getData().count()).toBe(2);
    });
  });

  describe("completed_session", () => {
    const completedMarker = {
      formatVersion: RESUME_FORMAT_VERSION,
      key: "test-key",
      completed: true,
      completedAt: expect.any(Number),
    };

    /** Completes an experiment and detaches it from the DOM */
    const completeExperiment = async (options = {}) => {
      const first = await startTimeline([trial("one")], initJsPsych(resumeOptions(options)));
      await pressKey("a");
      await first.expectFinished();
      simulateReload(first.jsPsych);
      trialSpy.mockClear();
    };

    it("clears the saved session with `restart`", async () => {
      await completeExperiment({ completed_session: "restart" });

      expect(storage.items).toEqual({});
    });

    it("writes a completed marker with `block` when the experiment finishes", async () => {
      await completeExperiment({ completed_session: "block" });

      // The log and the state are dropped, so no participant data is left in storage
      expect(Object.keys(storage.items)).toEqual(["jspsych-resume:test-key"]);
      expect(readSession(storage)).toEqual(completedMarker);
    });

    it("writes a completed marker with `block` when the experiment is aborted", async () => {
      const jsPsych = initJsPsych(resumeOptions({ completed_session: "block" }));
      const aborted = await startTimeline([trial("one"), trial("two")], jsPsych);
      await pressKey("a");
      jsPsych.abortExperiment();
      await aborted.expectFinished();

      expect(readSession(storage)).toEqual(completedMarker);
    });

    it("does not run the experiment again once it has been completed", async () => {
      await completeExperiment({ completed_session: "block" });

      const onFinish = jest.fn();
      const onTrialStart = jest.fn();
      const second = await startTimeline([trial("one")], {
        ...resumeOptions({ completed_session: "block" }),
        on_finish: onFinish,
        on_trial_start: onTrialStart,
      });
      await second.expectFinished();

      expect(second.getHTML()).toBe(DEFAULT_BLOCK_MESSAGE);
      expect(second.getHTML()).toBe("<p>This experiment is no longer available to you.</p>");
      expect(trialSpy).not.toHaveBeenCalled();
      expect(onFinish).not.toHaveBeenCalled();
      expect(onTrialStart).not.toHaveBeenCalled();
      expect(second.getData().count()).toBe(0);

      // The marker survives, so a further page load is blocked as well
      expect(readSession(storage)).toEqual(completedMarker);
    });

    it("displays a custom `block_message` for a completed session", async () => {
      await completeExperiment({ completed_session: "block" });

      const second = await startTimeline(
        [trial("one")],
        initJsPsych(
          resumeOptions({ completed_session: "block", block_message: "<p>Thanks, but no.</p>" })
        )
      );
      await second.expectFinished();

      expect(second.getHTML()).toBe("<p>Thanks, but no.</p>");
      expect(trialSpy).not.toHaveBeenCalled();
    });

    it("discards a completed marker when `completed_session` is `restart`", async () => {
      await completeExperiment({ completed_session: "block" });

      const second = await startTimeline([trial("one")], initJsPsych(resumeOptions()));

      expect(trialSpy.mock.calls.map(([stimulus]) => stimulus)).toEqual(["one"]);

      await pressKey("b");
      await second.expectFinished();
      expect(second.getData().count()).toBe(1);
      expect(storage.items).toEqual({});
    });

    it("removes a completed marker with `clearSavedSession()`", async () => {
      await completeExperiment({ completed_session: "block" });

      const jsPsych = initJsPsych(resumeOptions({ completed_session: "block" }));
      jsPsych.clearSavedSession();
      expect(storage.items).toEqual({});

      const second = await startTimeline([trial("one")], jsPsych);
      expect(trialSpy.mock.calls.map(([stimulus]) => stimulus)).toEqual(["one"]);

      await pressKey("b");
      await second.expectFinished();
      expect(second.getData().count()).toBe(1);
      expect(readSession(storage)).toEqual(completedMarker);
    });

    it("still resumes an interrupted session when completed sessions are blocked", async () => {
      const timeline = [trial("one"), trial("two")];
      const options = { completed_session: "block" };

      const first = await startTimeline(timeline, initJsPsych(resumeOptions(options)));
      await pressKey("a");
      simulateReload(first.jsPsych);
      trialSpy.mockClear();

      const second = await startTimeline(timeline, initJsPsych(resumeOptions(options)));

      expect(trialSpy.mock.calls.map(([stimulus]) => stimulus)).toEqual(["two"]);
      expect(second.getData().count()).toBe(1);

      await pressKey("b");
      await second.expectFinished();
      expect(readSession(storage)).toEqual(completedMarker);
    });
  });

  describe("combinations of the two policies", () => {
    const timeline = [trial("one"), trial("two")];

    /** Runs the timeline until it is interrupted after the first trial */
    const interruptSession = async (options: Record<string, any>) => {
      const first = await startTimeline(timeline, initJsPsych(resumeOptions(options)));
      await pressKey("a");
      simulateReload(first.jsPsych);
      trialSpy.mockClear();
    };

    /** Runs the timeline to completion */
    const completeTimeline = async (options: Record<string, any>) => {
      const experiment = await startTimeline(timeline, initJsPsych(resumeOptions(options)));
      await pressKey("a");
      await pressKey("b");
      await experiment.expectFinished();
      simulateReload(experiment.jsPsych);
      trialSpy.mockClear();
    };

    it("resume + restart: resumes an interruption and clears the session at the end", async () => {
      const options = { incomplete_session: "resume", completed_session: "restart" };
      await interruptSession(options);

      const second = await startTimeline(timeline, initJsPsych(resumeOptions(options)));
      expect(trialSpy.mock.calls.map(([stimulus]) => stimulus)).toEqual(["two"]);

      await pressKey("b");
      await second.expectFinished();
      expect(storage.items).toEqual({});
    });

    it("resume + block: resumes an interruption and locks out after completion", async () => {
      const options = { incomplete_session: "resume", completed_session: "block" };
      await interruptSession(options);

      const second = await startTimeline(timeline, initJsPsych(resumeOptions(options)));
      expect(trialSpy.mock.calls.map(([stimulus]) => stimulus)).toEqual(["two"]);

      await pressKey("b");
      await second.expectFinished();
      expect(readSession(storage).completed).toBe(true);
      simulateReload(second.jsPsych);
      trialSpy.mockClear();

      const third = await startTimeline(timeline, initJsPsych(resumeOptions(options)));
      await third.expectFinished();
      expect(third.getHTML()).toBe(DEFAULT_BLOCK_MESSAGE);
      expect(trialSpy).not.toHaveBeenCalled();
    });

    it("restart + restart: starts over after an interruption and clears the session", async () => {
      const options = { incomplete_session: "restart", completed_session: "restart" };
      await interruptSession(options);

      const second = await startTimeline(timeline, initJsPsych(resumeOptions(options)));
      expect(trialSpy.mock.calls.map(([stimulus]) => stimulus)).toEqual(["one"]);

      await pressKey("y");
      await pressKey("z");
      await second.expectFinished();
      expect(storage.items).toEqual({});
    });

    it("restart + block: retry until finished once, then locked out", async () => {
      const options = { incomplete_session: "restart", completed_session: "block" };
      await interruptSession(options);

      // The partial session is discarded and the experiment starts over
      const second = await startTimeline(timeline, initJsPsych(resumeOptions(options)));
      expect(trialSpy.mock.calls.map(([stimulus]) => stimulus)).toEqual(["one"]);

      await pressKey("y");
      await pressKey("z");
      await second.expectFinished();
      expect(readSession(storage).completed).toBe(true);
      simulateReload(second.jsPsych);
      trialSpy.mockClear();

      const third = await startTimeline(timeline, initJsPsych(resumeOptions(options)));
      await third.expectFinished();
      expect(third.getHTML()).toBe(DEFAULT_BLOCK_MESSAGE);
      expect(trialSpy).not.toHaveBeenCalled();
    });

    it("block + restart: one sitting, but a completed experiment can be taken again", async () => {
      const options = { incomplete_session: "block", completed_session: "restart" };
      await completeTimeline(options);

      expect(storage.items).toEqual({});

      const second = await startTimeline(timeline, initJsPsych(resumeOptions(options)));
      expect(trialSpy.mock.calls.map(([stimulus]) => stimulus)).toEqual(["one"]);

      await pressKey("y");
      await pressKey("z");
      await second.expectFinished();
    });

    it("block + block: one attempt in one sitting", async () => {
      const options = { incomplete_session: "block", completed_session: "block" };

      // An interruption locks the experiment
      await interruptSession(options);
      const second = await startTimeline(timeline, initJsPsych(resumeOptions(options)));
      await second.expectFinished();
      expect(second.getHTML()).toBe(DEFAULT_BLOCK_MESSAGE);
      expect(trialSpy).not.toHaveBeenCalled();
      simulateReload(second.jsPsych);

      // A run that finishes in one sitting locks the experiment too
      storage.items = {};
      await completeTimeline(options);
      expect(readSession(storage).completed).toBe(true);

      const third = await startTimeline(timeline, initJsPsych(resumeOptions(options)));
      await third.expectFinished();
      expect(third.getHTML()).toBe(DEFAULT_BLOCK_MESSAGE);
      expect(trialSpy).not.toHaveBeenCalled();
    });
  });

  it("ignores a saved session that was stored under a different key", async () => {
    const timeline = [trial("one"), trial("two")];

    const first = await startTimeline(timeline, initJsPsych(resumeOptions()));
    await pressKey("a");
    simulateReload(first.jsPsych);

    trialSpy.mockClear();
    const second = await startTimeline(timeline, initJsPsych(resumeOptions({ key: "other-key" })));

    expect(trialSpy.mock.calls.map(([stimulus]) => stimulus)).toEqual(["one"]);
    expect(second.getData().count()).toBe(0);
  });

  it("ignores a saved session with an unknown format version", async () => {
    const timeline = [trial("one"), trial("two")];

    const first = await startTimeline(timeline, initJsPsych(resumeOptions()));
    await pressKey("a");
    simulateReload(first.jsPsych);

    writeSession(storage, { ...readSession(storage), formatVersion: 999 });

    trialSpy.mockClear();
    const second = await startTimeline(timeline, initJsPsych(resumeOptions()));

    expect(trialSpy.mock.calls.map(([stimulus]) => stimulus)).toEqual(["one"]);
    expect(second.getData().count()).toBe(0);
  });

  it("degrades to live execution when the saved session does not match the experiment", async () => {
    const timeline = [trial("one"), trial("two"), trial("three")];

    const first = await startTimeline(timeline, initJsPsych(resumeOptions()));
    await pressKey("a");
    await pressKey("b");
    simulateReload(first.jsPsych);

    // Corrupt the second logged trial; everything before it stays replayable
    const session = readSession(storage);
    const secondTrialEntry = session.log.filter((entry) => entry.type === "trial")[1];
    secondTrialEntry.result = "not a result object";
    writeSession(storage, session);

    trialSpy.mockClear();
    const second = await startTimeline(timeline, initJsPsych(resumeOptions()));

    expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining("saved session"));
    expect(second.getData().count()).toBe(1);
    expect(second.getData().values()[0].response).toBe("a");

    await pressKey("y");
    await pressKey("z");
    await second.expectFinished();

    expect(trialSpy.mock.calls.map(([stimulus]) => stimulus)).toEqual(["two", "three"]);
    expect(
      second
        .getData()
        .values()
        .map((t) => t.response)
    ).toEqual(["a", "y", "z"]);
  });

  it("keeps the experiment running when storage is unavailable", async () => {
    const brokenStorage: StorageLike = {
      getItem: () => {
        throw new Error("storage disabled");
      },
      setItem: () => {
        throw new Error("quota exceeded");
      },
      removeItem: () => {
        throw new Error("storage disabled");
      },
    };

    const experiment = await startTimeline(
      [trial("one"), trial("two")],
      initJsPsych({ resume: { key: "test-key", storage: brokenStorage } })
    );

    await pressKey("a");
    await pressKey("b");
    await experiment.expectFinished();

    expect(experiment.getData().count()).toBe(2);
    expect(warnSpy).toHaveBeenCalled();
  });

  it("does nothing when the `resume` option is not used", async () => {
    const jsPsych = initJsPsych();
    const experiment = await startTimeline([trial("one")], jsPsych);

    // `jsPsych.state` works in memory (including the seed) and `clear()` is a no-op
    expect(typeof jsPsych.state._rng_seed).toBe("string");
    jsPsych.state.foo = "bar";
    expect(jsPsych.state.foo).toBe("bar");
    jsPsych.clearSavedSession();
    expect(jsPsych.state.foo).toBe("bar");

    await pressKey("a");
    await experiment.expectFinished();

    expect(storage.items).toEqual({});
    expect(warnSpy).not.toHaveBeenCalled();
  });
});
