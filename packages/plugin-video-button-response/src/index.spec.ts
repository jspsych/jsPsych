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
});

describe("video-button-response simulation", () => {
  test("data mode works", async () => {
    const timeline = [
      {
        type: videoButtonResponse,
        stimulus: ["foo.mp4"],
        choices: ["click"],
      },
    ];

    const { expectFinished, getData } = await simulateTimeline(timeline);

    await expectFinished();

    expect(getData().values()[0].rt).toBeGreaterThan(0);
    expect(getData().values()[0].response).toBe(0);
  });

  // can't run this until we mock video elements.
  test("visual mode works", async () => {
    const jsPsych = initJsPsych();

    const timeline = [
      {
        type: videoButtonResponse,
        stimulus: ["foo.mp4"],
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
