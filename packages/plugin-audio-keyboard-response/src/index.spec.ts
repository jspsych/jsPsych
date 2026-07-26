jest.mock("../../jspsych/src/modules/plugin-api/AudioPlayer");

import {
  flushPromises,
  keyDown,
  keyUp,
  pressKey,
  simulateTimeline,
  startTimeline,
} from "@jspsych/test-utils";
import { initJsPsych } from "jspsych";

//@ts-expect-error mock
import { mockStop } from "../../jspsych/src/modules/plugin-api/AudioPlayer";
import audioKeyboardResponse from ".";

jest.useFakeTimers();

beforeEach(() => {
  jest.clearAllMocks();
});

describe("audio-keyboard-response", () => {
  // this relies on AudioContext, which we haven't mocked yet
  it.skip("works with all defaults", async () => {
    const { expectFinished, expectRunning } = await startTimeline([
      {
        type: audioKeyboardResponse,
        stimulus: "foo.mp3",
      },
    ]);

    expectRunning();

    pressKey("a");

    expectFinished();

    await flushPromises();
  });

  it("works with use_webaudio:false", async () => {
    const jsPsych = initJsPsych({ use_webaudio: false });

    const { expectFinished, expectRunning } = await startTimeline(
      [
        {
          type: audioKeyboardResponse,
          stimulus: "foo.mp3",
        },
      ],
      jsPsych
    );

    await expectRunning();
    pressKey("a");
    await expectFinished();
  });

  it("ends when trial_ends_after_audio is true and audio finishes", async () => {
    const jsPsych = initJsPsych({ use_webaudio: false });

    const { expectFinished, expectRunning } = await startTimeline(
      [
        {
          type: audioKeyboardResponse,
          stimulus: "foo.mp3",
          trial_ends_after_audio: true,
        },
      ],
      jsPsych
    );

    await expectRunning();

    jest.runAllTimers();

    await expectFinished();
  });

  it("prevents responses when response_allowed_while_playing is false", async () => {
    const jsPsych = initJsPsych({ use_webaudio: false });

    const { expectFinished, expectRunning } = await startTimeline(
      [
        {
          type: audioKeyboardResponse,
          stimulus: "foo.mp3",
          response_allowed_while_playing: false,
        },
      ],
      jsPsych
    );

    await expectRunning();

    pressKey("a");

    await expectRunning();

    jest.runAllTimers();

    await expectRunning();

    pressKey("a");

    await expectFinished();
  });

  it("ends when trial_duration is shorter than the audio duration, stopping the audio", async () => {
    const jsPsych = initJsPsych({ use_webaudio: false });

    const { expectFinished, expectRunning } = await startTimeline(
      [
        {
          type: audioKeyboardResponse,
          stimulus: "foo.mp3",
          trial_duration: 500,
        },
      ],
      jsPsych
    );

    await expectRunning();

    expect(mockStop).not.toHaveBeenCalled();

    jest.advanceTimersByTime(500);

    expect(mockStop).toHaveBeenCalled();

    await expectFinished();
  });
});

describe("audio-keyboard-response wait_for_key_release", () => {
  it("does not end the trial until the key is released and records the hold duration", async () => {
    const jsPsych = initJsPsych({ use_webaudio: false });

    const { getData, expectRunning, expectFinished } = await startTimeline(
      [
        {
          type: audioKeyboardResponse,
          stimulus: "foo.mp3",
          choices: ["a"],
          wait_for_key_release: true,
        },
      ],
      jsPsych
    );

    jest.advanceTimersByTime(100);
    await keyDown("a");

    await expectRunning();

    jest.advanceTimersByTime(250);
    await keyUp("a");

    await expectFinished();

    expect(getData().values()[0].rt).toBe(100);
    expect(getData().values()[0].rt_key_duration).toBe(250);
  });

  it("records the hold duration when the trial ends by duration", async () => {
    const jsPsych = initJsPsych({ use_webaudio: false });

    const { getData, expectFinished } = await startTimeline(
      [
        {
          type: audioKeyboardResponse,
          stimulus: "foo.mp3",
          choices: ["a"],
          wait_for_key_release: true,
          response_ends_trial: false,
          trial_duration: 1000,
        },
      ],
      jsPsych
    );

    await keyDown("a");
    jest.advanceTimersByTime(250);
    await keyUp("a");

    jest.advanceTimersByTime(750);
    await expectFinished();

    expect(getData().values()[0].rt_key_duration).toBe(250);
  });

  it("records a null response when the trial ends while the key is still held", async () => {
    const jsPsych = initJsPsych({ use_webaudio: false });

    const { getData, expectFinished } = await startTimeline(
      [
        {
          type: audioKeyboardResponse,
          stimulus: "foo.mp3",
          choices: ["a"],
          wait_for_key_release: true,
          response_ends_trial: false,
          trial_duration: 1000,
        },
      ],
      jsPsych
    );

    await keyDown("a");
    jest.advanceTimersByTime(1000);
    await expectFinished();

    expect(getData().values()[0].response).toBe(null);
    expect(getData().values()[0].rt).toBe(null);
    expect(getData().values()[0].rt_key_duration).toBe(null);

    await keyUp("a");
  });

  it("rt_key_duration is null on default trials (wait_for_key_release false)", async () => {
    const jsPsych = initJsPsych({ use_webaudio: false });

    const { getData, expectFinished } = await startTimeline(
      [
        {
          type: audioKeyboardResponse,
          stimulus: "foo.mp3",
          choices: ["a"],
        },
      ],
      jsPsych
    );

    await keyDown("a");
    await expectFinished();

    expect(getData().values()[0].rt_key_duration).toBe(null);

    await keyUp("a");
  });

  it("a key held past trial_duration does not contaminate the next trial", async () => {
    const jsPsych = initJsPsych({ use_webaudio: false });

    const { getData, expectRunning, expectFinished } = await startTimeline(
      [
        {
          type: audioKeyboardResponse,
          stimulus: "foo.mp3",
          choices: ["a"],
          wait_for_key_release: true,
          trial_duration: 1000,
        },
        {
          type: audioKeyboardResponse,
          stimulus: "foo.mp3",
          choices: ["a"],
          wait_for_key_release: true,
        },
      ],
      jsPsych
    );

    // trial 1: press and hold the key, then let the trial time out
    await keyDown("a");
    jest.advanceTimersByTime(1000);
    await flushPromises();

    // trial 1 ended by duration with no response because the key was never released
    expect(getData().values()[0].response).toBe(null);
    expect(getData().values()[0].rt).toBe(null);
    expect(getData().values()[0].rt_key_duration).toBe(null);

    // trial 2 is now running with the key still held; a key-repeat must not register
    await keyDown("a");
    await expectRunning();

    // releasing the held-over key must not register a response in trial 2
    await keyUp("a");
    await expectRunning();

    // a fresh press/release cycle in trial 2 works normally
    jest.advanceTimersByTime(200);
    await keyDown("a");
    jest.advanceTimersByTime(125);
    await keyUp("a");

    await expectFinished();

    expect(getData().values()[1].response).toBe("a");
    expect(getData().values()[1].rt).toBe(200);
    expect(getData().values()[1].rt_key_duration).toBe(125);
  });
});

describe("audio-keyboard-response simulation", () => {
  test("data mode works", async () => {
    const timeline = [
      {
        type: audioKeyboardResponse,
        stimulus: "foo.mp3",
      },
    ];

    const { expectFinished, getData } = await simulateTimeline(timeline);

    await expectFinished();

    expect(getData().values()[0].rt).toBeGreaterThan(0);
    expect(typeof getData().values()[0].response).toBe("string");
  });

  test("visual mode works", async () => {
    const jsPsych = initJsPsych({ use_webaudio: false });

    const timeline = [
      {
        type: audioKeyboardResponse,
        stimulus: "foo.mp3",
        prompt: "foo",
      },
    ];

    const { expectFinished, expectRunning, getHTML, getData } = await simulateTimeline(
      timeline,
      "visual",
      {},
      jsPsych
    );

    await expectRunning();

    expect(getHTML()).toContain("foo");

    jest.runAllTimers();

    await expectFinished();

    expect(getData().values()[0].rt).toBeGreaterThan(0);
    expect(typeof getData().values()[0].response).toBe("string");
  });
});
