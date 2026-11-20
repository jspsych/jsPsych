import { initJsPsych } from "jspsych";

import htmlAudioResponse from ".";

jest.useFakeTimers();

describe("html-audio-response", () => {
  test("throws a helpful error when the microphone has not been initialized #2522", async () => {
    const jsPsych = initJsPsych();

    await expect(async () => {
      await jsPsych.run([{ type: htmlAudioResponse, stimulus: "<p>Say something</p>" }]);
    }).rejects.toThrow(/initialize-microphone/);
  });
});
