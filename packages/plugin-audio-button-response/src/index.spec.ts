import { clickTarget, simulateTimeline, startTimeline } from "@jspsych/test-utils";
import { initJsPsych } from "jspsych";

import audioButtonResponse from ".";

jest.useFakeTimers();

// skip this until we figure out how to mock the audio loading
describe.skip("audio-button-response", () => {
  test("on_load event triggered after page setup complete", async () => {
    const timeline = [
      {
        type: audioButtonResponse,
        stimulus: "mymp3.mp3",
        prompt: "foo",
        choices: ["choice1"],
        on_load: () => {
          expect(getHTML()).toContain("foo");

          clickTarget(displayElement.querySelector("button"));
        },
      },
    ];

    const jsPsych = initJsPsych({
      use_webaudio: false,
    });

    const { getHTML, finished, displayElement } = await startTimeline(timeline, jsPsych);

    expect(getHTML()).not.toContain("foo");

    await finished;
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
