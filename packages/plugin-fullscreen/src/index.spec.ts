import { jest } from "@jest/globals";
import jsPsych from "jspsych";

import fullscreen from ".";

jest.useFakeTimers();

describe("fullscreen plugin", function () {
  // can't test this right now because jsdom doesn't support fullscreen API.
  test.skip("launches fullscreen mode by default", function () {
    var trial = {
      type: fullscreen,
      delay_after: 0,
    };

    var text = {
      type: "html-keyboard-response",
      stimulus: "fullscreen",
    };

    jsPsych.init({
      timeline: [trial, text],
    });

    expect(document.fullscreenElement).toBeUndefined();
    console.log(jsPsych.getDisplayElement().requestFullscreen);
    document.querySelector("#jspsych-fullscreen-btn").dispatchEvent(new MouseEvent("click", {}));

    expect(document.fullscreenElement).not.toBeUndefined();
  });
});
