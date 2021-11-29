import { pressKey, simulateTimeline, startTimeline } from "@jspsych/test-utils";
import { initJsPsych } from "jspsych";

import canvasSliderResponse from ".";

function drawRect(c) {
  var ctx = c.getContext("2d");
  ctx.beginPath();
  ctx.rect(150, 225, 200, 50);
  ctx.stroke();
}

jest.useFakeTimers();

describe("canvas-keyboard-response simulation", () => {
  test("data mode works", async () => {
    const timeline = [
      {
        type: canvasSliderResponse,
        stimulus: drawRect,
      },
    ];

    const { expectFinished, getData } = await simulateTimeline(timeline);

    await expectFinished();

    const data = getData().values()[0];

    expect(data.response).toBeGreaterThanOrEqual(0);
    expect(data.response).toBeLessThanOrEqual(100);
    expect(data.rt).toBeGreaterThan(0);
  });

  // can't run this until we mock canvas elements.
  test("visual mode works", async () => {
    const jsPsych = initJsPsych();

    const timeline = [
      {
        type: canvasSliderResponse,
        stimulus: drawRect,
      },
    ];

    const { expectFinished, expectRunning, getHTML, getData } = await simulateTimeline(
      timeline,
      "visual",
      {},
      jsPsych
    );

    await expectRunning();

    jest.runAllTimers();

    await expectFinished();

    const data = getData().values()[0];

    expect(data.response).toBeGreaterThanOrEqual(0);
    expect(data.response).toBeLessThanOrEqual(100);
    expect(data.rt).toBeGreaterThan(0);
  });
});
