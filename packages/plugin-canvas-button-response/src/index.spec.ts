import { clickTarget, simulateTimeline, startTimeline } from "@jspsych/test-utils";
import { initJsPsych } from "jspsych";

import canvasButtonResponse from ".";

function drawRect(c) {
  var ctx = c.getContext("2d");
  ctx.beginPath();
  ctx.rect(150, 225, 200, 50);
  ctx.stroke();
}

jest.useFakeTimers();

describe("canvas-button-response simulation", () => {
  test("data mode works", async () => {
    const timeline = [
      {
        type: canvasButtonResponse,
        stimulus: drawRect,
        choices: ["click"],
      },
    ];

    const { expectFinished, getData } = await simulateTimeline(timeline);

    await expectFinished();

    expect(getData().values()[0].rt).toBeGreaterThan(0);
    expect(getData().values()[0].response).toBe(0);
  });

  // can't run this until we mock canvas elements.
  test("visual mode works", async () => {
    const jsPsych = initJsPsych();

    const timeline = [
      {
        type: canvasButtonResponse,
        stimulus: drawRect,
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

    expect(getHTML()).toContain("canvas");

    jest.runAllTimers();

    await expectFinished();

    expect(getData().values()[0].rt).toBeGreaterThan(0);
    expect(getData().values()[0].response).toBe(0);
  });
});
