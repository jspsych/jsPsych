import htmlKeyboardResponse from "@jspsych/plugin-html-keyboard-response";

import { JsPsych, initJsPsych } from "../../src";
import { pressKey } from "../utils";

let jsPsych: JsPsych;

test("works on basic timeline", function () {
  var timeline = [
    {
      type: htmlKeyboardResponse,
      stimulus: "trial 1",
      on_finish: function () {
        jsPsych.endExperiment("the end");
      },
    },
    {
      type: htmlKeyboardResponse,
      stimulus: "trial 2",
    },
  ];

  jsPsych = initJsPsych({ timeline });

  expect(jsPsych.getDisplayElement().innerHTML).toMatch("trial 1");

  pressKey("a");

  expect(jsPsych.getDisplayElement().innerHTML).toMatch("the end");
});

test("works with looping timeline (#541)", function () {
  var timeline = [
    {
      timeline: [{ type: htmlKeyboardResponse, stimulus: "trial 1" }],
      loop_function: function () {
        jsPsych.endExperiment("the end");
      },
    },
  ];

  jsPsych = initJsPsych({ timeline });

  expect(jsPsych.getDisplayElement().innerHTML).toMatch("trial 1");

  pressKey("a");

  expect(jsPsych.getDisplayElement().innerHTML).toMatch("the end");
});
