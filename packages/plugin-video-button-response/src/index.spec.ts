import { pressKey, simulateTimeline, startTimeline } from "@jspsych/test-utils";
import { initJsPsych } from "jspsych";

import videoButtonResponse from ".";

jest.useFakeTimers();

beforeAll(() => {
  window.HTMLMediaElement.prototype.pause = () => {};
});

describe("video-button-response", () => {
  test("throws error when stimulus is not array #1537", async () => {
    const jsPsych = initJsPsych();

    const timeline = [
      {
        type: videoButtonResponse,
        stimulus: "foo.mp4",
        choices: ["foo"],
      },
    ];

    await expect(async () => {
      await jsPsych.run(timeline);
    }).rejects.toThrowError();
  });

  test("enable buttons during video playing", async () => {
    const timeline = [
      {
        type: videoButtonResponse,
        stimulus: ["foo.mp4"],
        prompt: "foo",
        choices: ["choice1"],
        response_allowed_while_playing: true,
        enable_button_after: 500,
      },
    ];

    const jsPsych = initJsPsych();

    const { getHTML, finished } = await startTimeline(timeline, jsPsych);

    const btns = document.querySelectorAll(".jspsych-html-button-response-button button");

    for (let i = 0; i < btns.length; i++) {
      expect(btns[i].getAttribute("disabled")).toBe(true);
    }

    jest.advanceTimersByTime(500);

    for (let i = 0; i < btns.length; i++) {
      expect(btns[i].getAttribute("disabled")).toBe(false);
    }
  });
});

describe("video-button-response simulation", () => {
  test("data mode works", async () => {
    const ENABLE_BUTTON_AFTER = 2000;

    const timeline = [
      {
        type: videoButtonResponse,
        stimulus: ["foo.mp4"],
        choices: ["click"],
        enable_button_after: ENABLE_BUTTON_AFTER,
      },
    ];

    const { expectFinished, getData } = await simulateTimeline(timeline);

    await expectFinished();

    expect(getData().values()[0].rt).toBeGreaterThan(ENABLE_BUTTON_AFTER);
    expect(getData().values()[0].response).toBe(0);
  });

  // can't run this until we mock video elements.
  test("visual mode works", async () => {
    const jsPsych = initJsPsych();

    const ENABLE_BUTTON_AFTER = 2000;

    const timeline = [
      {
        type: videoButtonResponse,
        stimulus: ["foo.mp4"],
        prompt: "foo",
        choices: ["click"],
        enable_button_after: ENABLE_BUTTON_AFTER,
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

    expect(getData().values()[0].rt).toBeGreaterThan(ENABLE_BUTTON_AFTER);
    expect(getData().values()[0].response).toBe(0);
  });
});
