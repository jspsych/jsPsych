import { initJsPsych } from "jspsych";

import htmlVideoResponse from ".";

jest.useFakeTimers();

describe("html-video-response", () => {
  test("throws a helpful error when the camera has not been initialized", async () => {
    const jsPsych = initJsPsych();

    await expect(async () => {
      await jsPsych.run([{ type: htmlVideoResponse, stimulus: "<p>Show something</p>" }]);
    }).rejects.toThrow(/initialize-camera/);
  });
});
