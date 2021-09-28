import { clickTarget, startTimeline } from "@jspsych/test-utils";
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
          expect(getHTML()).toContain("ffgfgoo");

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
