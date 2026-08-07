import { pressKey, startTimeline } from "@jspsych/test-utils";

import { JsPsych, JsPsychPlugin, ParameterType, TrialType, initJsPsych } from "../../src";
import { SessionLogEntry, StorageLike } from "../../src/modules/resume";

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

  beforeEach(() => {
    storage = new MockStorage();
    trialSpy.mockClear();
    warnSpy = jest.spyOn(console, "warn").mockImplementation(() => {});
  });

  afterEach(() => {
    warnSpy.mockRestore();
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

  it("persists and restores the `resume.state` object and fires `on_resume` once", async () => {
    let jsPsychInstance: JsPsych;
    const timeline = [
      trial("one", {
        on_finish: (data: any) => {
          jsPsychInstance.resume.state.responses = [data.response];
        },
      }),
      trial("two", {
        on_finish: (data: any) => {
          jsPsychInstance.resume.state.responses.push(data.response);
        },
      }),
      trial("three"),
    ];

    jsPsychInstance = initJsPsych(resumeOptions());
    const first = await startTimeline(timeline, jsPsychInstance);
    await pressKey("a");
    await pressKey("b");
    expect(jsPsychInstance.resume.state).toEqual({ responses: ["a", "b"] });
    simulateReload(first.jsPsych);

    const onResume = jest.fn();
    jsPsychInstance = initJsPsych(resumeOptions({ on_resume: onResume }));
    const second = await startTimeline(timeline, jsPsychInstance);

    expect(jsPsychInstance.resume.state).toEqual({ responses: ["a", "b"] });
    expect(onResume).toHaveBeenCalledTimes(1);
    expect(onResume.mock.calls[0][0].values().map((t: any) => t.response)).toEqual(["a", "b"]);

    await pressKey("c");
    await second.expectFinished();
    expect(onResume).toHaveBeenCalledTimes(1);
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

    // `state` works in memory and `clear()` is a no-op
    jsPsych.resume.state.foo = "bar";
    expect(jsPsych.resume.state).toEqual({ foo: "bar" });
    jsPsych.resume.clear();
    expect(jsPsych.resume.state).toEqual({ foo: "bar" });

    await pressKey("a");
    await experiment.expectFinished();

    expect(storage.items).toEqual({});
    expect(warnSpy).not.toHaveBeenCalled();
  });
});
