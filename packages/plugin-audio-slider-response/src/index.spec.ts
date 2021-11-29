import { pressKey, simulateTimeline, startTimeline } from "@jspsych/test-utils";
import { initJsPsych } from "jspsych";

import audioSliderResponse from ".";

jest.useFakeTimers();

describe("audio-slider-response simulation", () => {
  test("data mode works", async () => {
    const timeline = [
      {
        type: audioSliderResponse,
        stimulus: "foo.mp3",
      },
    ];

    const { expectFinished, getData } = await simulateTimeline(timeline);

    await expectFinished();

    expect(getData().values()[0].rt).toBeGreaterThan(0);
    expect(getData().values()[0].response).toBeGreaterThanOrEqual(0);
    expect(getData().values()[0].response).toBeLessThanOrEqual(100);
  });

  // can't run this until we mock Audio elements.
  test.skip("visual mode works", async () => {
    const jsPsych = initJsPsych({ use_webaudio: false });

    const timeline = [
      {
        type: audioSliderResponse,
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
    expect(getData().values()[0].response).toBeGreaterThanOrEqual(0);
    expect(getData().values()[0].response).toBeLessThanOrEqual(100);
  });
});
