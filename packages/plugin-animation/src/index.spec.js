import { jest } from "@jest/globals";
import jsPsych from "jspsych";

import animation from "./";

jest.useFakeTimers();

describe("animation plugin", function () {
  // SKIP FOR NOW
  test.skip("displays stimuli", function () {
    var animation_sequence = ["img/face_1.jpg", "img/face_2.jpg"];

    var trial = {
      type: animation,
      stimuli: animation_sequence,
      render_on_canvas: false,
    };

    jsPsych.init({
      timeline: [trial],
    });

    expect(jsPsych.getDisplayElement().innerHTML).toMatch(
      '<img src="img/face_1.jpg" id="jspsych-animation-image"></img>'
    );
  });
});
