jest.mock("../../jspsych/src/modules/plugin-api/AudioPlayer");

import { clickTarget, flushPromises, simulateTimeline, startTimeline } from "@jspsych/test-utils";
import { initJsPsych } from "jspsych";

//@ts-expect-error mock
import { mockStop } from "../../jspsych/src/modules/plugin-api/AudioPlayer";
import audioButtonResponse from ".";

jest.useFakeTimers();

beforeEach(() => {
  jest.clearAllMocks();
});

// skip this until we figure out how to mock the audio loading
describe("audio-button-response", () => {
  it.skip("works with all defaults", async () => {
    const { expectFinished, expectRunning, displayElement, getHTML } = await startTimeline([
      {
        type: audioButtonResponse,
        choices: ["choice1"],
        stimulus: "foo.mp3",
      },
    ]);

    expectRunning();

    console.log(getHTML());

    clickTarget(displayElement.querySelector("button"));

    expectFinished();

    await flushPromises();
  });
  it("works with use_webaudio:false", async () => {
    const jsPsych = initJsPsych({ use_webaudio: false });

    const { expectFinished, expectRunning, displayElement } = await startTimeline(
      [
        {
          type: audioButtonResponse,
          choices: ["choice1"],
          stimulus: "foo.mp3",
        },
      ],
      jsPsych
    );

    await expectRunning();

    clickTarget(displayElement.querySelector("button"));

    await expectFinished();
  });
  test("on_load event triggered after page setup complete", async () => {
    const onLoadCallback = jest.fn();

    const timeline = [
      {
        type: audioButtonResponse,
        stimulus: "mymp3.mp3",
        prompt: "foo",
        choices: ["choice1"],
        on_load: () => {
          onLoadCallback();
        },
      },
    ];

    const jsPsych = initJsPsych({
      use_webaudio: false,
    });

    await startTimeline(timeline, jsPsych);

    expect(onLoadCallback).toHaveBeenCalled();
  });
  it("trial ends when button is clicked", async () => {
    const jsPsych = initJsPsych({ use_webaudio: false });

    const { expectFinished, expectRunning, displayElement } = await startTimeline(
      [
        {
          type: audioButtonResponse,
          stimulus: "foo.mp3",
          prompt: "foo",
          choices: ["choice1"],
        },
      ],
      jsPsych
    );

    await expectRunning();

    clickTarget(displayElement.querySelector("button"));

    await expectFinished();
  });

  it("ends when trial_ends_after_audio is true and audio finishes", async () => {
    const jsPsych = initJsPsych({ use_webaudio: false });

    const { expectFinished, expectRunning } = await startTimeline(
      [
        {
          type: audioButtonResponse,
          stimulus: "foo.mp3",
          choices: ["choice1"],
          trial_duration: 30000,
          trial_ends_after_audio: true,
        },
      ],
      jsPsych
    );

    await expectRunning();

    jest.runAllTimers();

    await expectFinished();
  });
  it("ends when trial_duration is shorter than the audio duration, stopping the audio", async () => {
    const jsPsych = initJsPsych({ use_webaudio: false });

    const { expectFinished, expectRunning } = await startTimeline(
      [
        {
          type: audioButtonResponse,
          stimulus: "foo.mp3",
          choices: ["choice1"],
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
  it("prevents responses when response_allowed_while_playing is false", async () => {
    const jsPsych = initJsPsych({ use_webaudio: false });

    const { expectFinished, expectRunning, displayElement, getHTML } = await startTimeline(
      [
        {
          type: audioButtonResponse,
          stimulus: "foo.mp3",
          choices: ["choice1"],
          response_allowed_while_playing: false,
        },
      ],
      jsPsych
    );

    await expectRunning();

    clickTarget(displayElement.querySelector("button"));

    await expectRunning();

    jest.runAllTimers();

    await expectRunning();

    clickTarget(displayElement.querySelector("button"));

    await expectFinished();
  });
});

describe("audio-button-response simulation", () => {
  test("data mode works", async () => {
    const timeline = [
      {
        type: audioButtonResponse,
        stimulus: "foo.mp3",
        choices: ["click"],
      },
    ];

    const { expectFinished, getData } = await simulateTimeline(timeline);

    await expectFinished();

    expect(getData().values()[0].rt).toBeGreaterThan(0);
    expect(getData().values()[0].response).toBe(0);
  });

  // can't run this until we mock Audio elements.
  test.skip("visual mode works", async () => {
    const jsPsych = initJsPsych({ use_webaudio: false });

    const timeline = [
      {
        type: audioButtonResponse,
        stimulus: "foo.mp3",
        prompt: "foo",
        choices: ["click"],
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
    expect(getData().values()[0].response).toBe(0);
  });
});
