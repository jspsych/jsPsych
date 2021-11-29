import { pressKey, simulateTimeline, startTimeline } from "@jspsych/test-utils";
import { initJsPsych } from "jspsych";

import videoKeyboardResponse from ".";

jest.useFakeTimers();

beforeAll(() => {
  window.HTMLMediaElement.prototype.pause = () => {};
});

// I can't figure out how to get this tested with jest
describe("video-keyboard-response", () => {
  test("throws error when stimulus is not array #1537", async () => {
    const jsPsych = initJsPsych();

    const timeline = [
      {
        type: videoKeyboardResponse,
        stimulus: "foo.mp4",
      },
    ];

    await expect(async () => {
      await jsPsych.run(timeline);
    }).rejects.toThrowError();
  });
});

describe("video-keyboard-response simulation", () => {
  test("data mode works", async () => {
    const timeline = [
      {
        type: videoKeyboardResponse,
        stimulus: ["foo.mp4"],
      },
    ];

    const { expectFinished, getData } = await simulateTimeline(timeline);

    await expectFinished();

    expect(getData().values()[0].rt).toBeGreaterThan(0);
    expect(typeof getData().values()[0].response).toBe("string");
  });

  // can't run this until we mock video elements.
  test("visual mode works", async () => {
    const jsPsych = initJsPsych();

    const timeline = [
      {
        type: videoKeyboardResponse,
        stimulus: ["foo.mp4"],
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
