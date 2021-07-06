import cloze from "@jspsych/plugin-cloze";
import htmlKeyboardResponse from "@jspsych/plugin-html-keyboard-response";
import surveyMultiChoice from "@jspsych/plugin-survey-multi-choice";
import surveyText from "@jspsych/plugin-survey-text";

import jsPsych from "../../src";
import { clickTarget, pressKey } from "../utils";

describe("standard use of function as parameter", function () {
  test("function value is used as parameter", function () {
    var trial = {
      type: htmlKeyboardResponse,
      stimulus: function () {
        return "foo";
      },
    };

    jsPsych.init({
      timeline: [trial],
    });

    expect(jsPsych.getDisplayElement().innerHTML).toMatch("foo");
    pressKey("a");
  });

  test("function evaluates at runtime", function () {
    var x = "foo";

    var trial = {
      type: htmlKeyboardResponse,
      stimulus: function () {
        return x;
      },
    };

    x = "bar";

    jsPsych.init({
      timeline: [trial],
    });

    expect(jsPsych.getDisplayElement().innerHTML).toMatch("bar");
    pressKey("a");
  });

  test("parameters can be protected from early evaluation using jsPsych.plugins.parameterType.FUNCTION", function () {
    var mock = jest.fn();

    var trial = {
      type: cloze,
      text: "%foo%",
      check_answers: true,
      mistake_fn: mock,
    };

    jsPsych.init({ timeline: [trial] });

    expect(mock).not.toHaveBeenCalled();
    clickTarget(document.querySelector("#finish_cloze_button"));
    expect(mock).toHaveBeenCalledTimes(1);
  });
});

describe("data as function", function () {
  test("entire data object can be function", function () {
    var trial = {
      type: htmlKeyboardResponse,
      stimulus: "foo",
      data: function () {
        return { x: 1 };
      },
    };

    jsPsych.init({
      timeline: [trial],
    });

    pressKey("a");
    expect(jsPsych.data.get().values()[0].x).toBe(1);
  });

  test("single parameter of data object can be function", function () {
    var trial = {
      type: htmlKeyboardResponse,
      stimulus: "foo",
      data: {
        x: function () {
          return 1;
        },
      },
    };

    jsPsych.init({
      timeline: [trial],
    });

    pressKey("a");
    expect(jsPsych.data.get().values()[0].x).toBe(1);
  });
});

describe("nested parameters as functions", function () {
  test("entire parameter can be a function", function () {
    var trial = {
      type: surveyText,
      questions: function () {
        return [{ prompt: "How old are you?" }, { prompt: "Where were you born?" }];
      },
    };

    jsPsych.init({
      timeline: [trial],
    });

    expect(jsPsych.getDisplayElement().querySelectorAll("p.jspsych-survey-text").length).toBe(2);

    clickTarget(document.querySelector("#jspsych-survey-text-next"));

    expect(jsPsych.getDisplayElement().innerHTML).toBe("");
  });

  test("nested parameter can be a function", function () {
    var trial = {
      type: surveyText,
      questions: [
        {
          prompt: function () {
            return "foo";
          },
        },
        { prompt: "bar" },
      ],
    };

    jsPsych.init({
      timeline: [trial],
    });

    expect(document.querySelector("#jspsych-survey-text-0 p.jspsych-survey-text").innerHTML).toBe(
      "foo"
    );
    expect(document.querySelector("#jspsych-survey-text-1 p.jspsych-survey-text").innerHTML).toBe(
      "bar"
    );
    clickTarget(document.querySelector("#jspsych-survey-text-next"));
    expect(jsPsych.getDisplayElement().innerHTML).toBe("");
  });

  test("multiple nested parameters can be functions", function () {
    var trial = {
      type: surveyMultiChoice,
      questions: [
        {
          prompt: function () {
            return "foo";
          },
          options: function () {
            return ["buzz", "fizz"];
          },
        },
        {
          prompt: "bar",
          options: function () {
            return ["one", "two"];
          },
        },
      ],
    };

    jsPsych.init({
      timeline: [trial],
    });

    expect(document.querySelector("#jspsych-survey-multi-choice-0").innerHTML).toMatch("foo");
    expect(document.querySelector("#jspsych-survey-multi-choice-0").innerHTML).toMatch("buzz");
    expect(document.querySelector("#jspsych-survey-multi-choice-1").innerHTML).toMatch("bar");
    expect(document.querySelector("#jspsych-survey-multi-choice-1").innerHTML).toMatch("one");
    clickTarget(document.querySelector("#jspsych-survey-multi-choice-next"));
    expect(jsPsych.getDisplayElement().innerHTML).toBe("");
  });

  test("nested parameters can be protected from early evaluation using jsPsych.plugins.parameterType.FUNCTION", function () {
    // currently no plugins that use this feature (Jan. 2021), so here's a simple placeholder plugin.
    const fnTest = {
      info: {
        parameters: {
          foo: {
            type: jsPsych.plugins.parameterType.COMPLEX,
            default: null,
            nested: {
              not_protected: {
                type: jsPsych.plugins.parameterType.STRING,
                default: null,
              },
              protected: {
                type: jsPsych.plugins.parameterType.FUNCTION,
                default: null,
              },
            },
          },
        },
      },
      trial: function (display_element, trial) {
        jsPsych.finishTrial({
          not_protected: trial.foo[0].not_protected,
          protected: trial.foo[0].protected,
        });
      },
    };

    var trial = {
      type: fnTest,
      foo: [
        {
          not_protected: function () {
            return "x";
          },
          protected: function () {
            return "y";
          },
        },
      ],
    };

    jsPsych.init({ timeline: [trial] });

    var data = jsPsych.data.get().values()[0];
    expect(data.not_protected).toBe("x");
    expect(data.protected).not.toBe("y");
    expect(data.protected()).toBe("y");
  });
});
