import { pressKey, simulateTimeline, startTimeline } from "@jspsych/test-utils";
import { initJsPsych } from "jspsych";

import canvasKeyboardResponse from ".";

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
        type: canvasKeyboardResponse,
        stimulus: drawRect,
      },
    ];

    const { expectFinished, getData } = await simulateTimeline(timeline);

    await expectFinished();

    expect(getData().values()[0].rt).toBeGreaterThan(0);
    expect(typeof getData().values()[0].response).toBe("string");
  });

  // can't run this until we mock canvas elements.
  test("visual mode works", async () => {
    const jsPsych = initJsPsych();

    const timeline = [
      {
        type: canvasKeyboardResponse,
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

    expect(getHTML()).toContain("canvas");

    jest.runAllTimers();

    await expectFinished();

    expect(getData().values()[0].rt).toBeGreaterThan(0);
    expect(typeof getData().values()[0].response).toBe("string");
  });
});
