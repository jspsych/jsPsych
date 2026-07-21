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

describe("audio-keyboard-response rt_key_duration", () => {
  it("records key hold duration when the response ends the trial", async () => {
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

    jest.advanceTimersByTime(250);
    await keyUp("a");

    expect(getData().values()[0].rt_key_duration).toBe(250);
  });

  it("records key hold duration when the trial ends by duration", async () => {
    const jsPsych = initJsPsych({ use_webaudio: false });

    const { getData, expectFinished } = await startTimeline(
      [
        {
          type: audioKeyboardResponse,
          stimulus: "foo.mp3",
          choices: ["a"],
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

  it("rt_key_duration is null when no response is given", async () => {
    const jsPsych = initJsPsych({ use_webaudio: false });

    const { getData, expectFinished } = await startTimeline(
      [
        {
          type: audioKeyboardResponse,
          stimulus: "foo.mp3",
          choices: ["a"],
          trial_duration: 1000,
        },
      ],
      jsPsych
    );

    jest.advanceTimersByTime(1000);
    await expectFinished();

    expect(getData().values()[0].rt_key_duration).toBe(null);
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
