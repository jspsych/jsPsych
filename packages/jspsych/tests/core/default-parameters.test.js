import surveyText from "@jspsych/plugin-survey-text";

import jsPsych from "../../src";

describe("nested defaults", function () {
  test("work in basic situation", function () {
    var t = {
      type: surveyText,
      questions: [
        {
          prompt: "Question 1.",
        },
        {
          prompt: "Question 2.",
        },
      ],
    };

    jsPsych.init({ timeline: [t] });

    var display = jsPsych.getDisplayElement();

    expect(display.querySelector("input").placeholder).toBe("");
    expect(display.querySelector("input").size).toBe(40);
  });

  test("safe against extending the array.prototype (issue #989)", function () {
    Array.prototype.qq = jest.fn();
    const spy = jest.spyOn(console, "error").mockImplementation();

    var t = {
      type: surveyText,
      questions: [
        {
          prompt: "Question 1.",
        },
        {
          prompt: "Question 2.",
        },
      ],
    };

    jsPsych.init({ timeline: [t] });

    var display = jsPsych.getDisplayElement();

    expect(display.querySelector("input").placeholder).toBe("");
    expect(display.querySelector("input").size).toBe(40);

    expect(spy).not.toHaveBeenCalled();

    spy.mockRestore();
  });
});
