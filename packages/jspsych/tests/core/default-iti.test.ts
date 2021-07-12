import { jest } from "@jest/globals";
import htmlKeyboardResponse from "@jspsych/plugin-html-keyboard-response";

import { JsPsych, initJsPsych } from "../../src";
import { pressKey } from "../utils";

let jsPsych: JsPsych;

jest.useFakeTimers();

describe("default iti parameter", function () {
  test("has a default value of 0", function () {
    var t = {
      type: htmlKeyboardResponse,
      stimulus: "foo",
    };

    var t2 = {
      type: htmlKeyboardResponse,
      stimulus: "bar",
    };

    jsPsych = initJsPsych({ timeline: [t, t2] });

    expect(jsPsych.getDisplayElement().innerHTML).toMatch("foo");
    pressKey("a");
    expect(jsPsych.getDisplayElement().innerHTML).toMatch("bar");
    pressKey("a");
  });

  test("creates a correct delay when set", function () {
    var t = {
      type: htmlKeyboardResponse,
      stimulus: "foo",
    };

    var t2 = {
      type: htmlKeyboardResponse,
      stimulus: "bar",
    };

    jsPsych = initJsPsych({ timeline: [t, t2], default_iti: 100 });

    expect(jsPsych.getDisplayElement().innerHTML).toMatch("foo");
    pressKey("a");
    expect(jsPsych.getDisplayElement().innerHTML).not.toMatch("bar");
    jest.advanceTimersByTime(100);
    expect(jsPsych.getDisplayElement().innerHTML).toMatch("bar");
    pressKey("a");
  });
});
