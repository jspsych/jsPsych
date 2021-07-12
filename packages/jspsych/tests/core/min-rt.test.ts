import htmlKeyboardResponse from "@jspsych/plugin-html-keyboard-response";

import { JsPsych, initJsPsych } from "../../src";
import { pressKey } from "../utils";

let jsPsych: JsPsych;

// ideally, use fake timers for this test, but 'modern' timers that work
// with performance.now() break something in the first test. wait for fix?
//jest.useFakeTimers('modern');
//jest.useFakeTimers();

describe("minimum_valid_rt parameter", function () {
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

  test("correctly prevents fast responses when set", function (done) {
    var t = {
      type: htmlKeyboardResponse,
      stimulus: "foo",
    };

    var t2 = {
      type: htmlKeyboardResponse,
      stimulus: "bar",
    };

    jsPsych = initJsPsych({ timeline: [t, t2], minimum_valid_rt: 100 });

    expect(jsPsych.getDisplayElement().innerHTML).toMatch("foo");
    pressKey("a");
    expect(jsPsych.getDisplayElement().innerHTML).toMatch("foo");
    setTimeout(function () {
      pressKey("a");
      expect(jsPsych.getDisplayElement().innerHTML).toMatch("bar");
      pressKey("a");
      done();
    }, 100);
  });
});
