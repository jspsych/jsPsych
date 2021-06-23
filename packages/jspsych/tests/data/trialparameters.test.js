import htmlKeyboardResponse from "@jspsych/plugin-html-keyboard-response";
import reconstruction from "@jspsych/plugin-reconstruction";
import surveyText from "@jspsych/plugin-survey-text";

import jsPsych from "../../src";
import { clickTarget, pressKey } from "../utils";

describe("Trial parameters in the data", function () {
  test("Can be added by specifying the parameter with a value of true in save_trial_parameters", function () {
    var trial = {
      type: htmlKeyboardResponse,
      stimulus: "<p>foo</p>",
      save_trial_parameters: {
        choices: true,
        trial_duration: true,
      },
    };

    jsPsych.init({
      timeline: [trial],
    });

    pressKey(" ");

    var data = jsPsych.data.get().values()[0];
    expect(data.choices).not.toBeUndefined();
    expect(data.trial_duration).not.toBeUndefined();
  });

  test("Can be removed by specifying the parameter with a value of false in save_trial_parameters", function () {
    var trial = {
      type: htmlKeyboardResponse,
      stimulus: "<p>foo</p>",
      save_trial_parameters: {
        stimulus: false,
      },
    };

    jsPsych.init({
      timeline: [trial],
    });

    pressKey(" ");

    var data = jsPsych.data.get().values()[0];
    expect(data.stimulus).toBeUndefined();
  });

  test("For compatibility with data access functions, internal_node_id and trial_index cannot be removed", function () {
    var trial = {
      type: htmlKeyboardResponse,
      stimulus: "<p>foo</p>",
      save_trial_parameters: {
        internal_node_id: false,
        trial_index: false,
      },
    };

    jsPsych.init({
      timeline: [trial],
    });

    pressKey(" ");

    var data = jsPsych.data.get().values()[0];
    expect(data.internal_node_id).not.toBeUndefined();
    expect(data.trial_index).not.toBeUndefined();
  });

  test("Invalid parameter names throw a warning in the console", function () {
    const spy = jest.spyOn(console, "warn").mockImplementation();

    var trial = {
      type: htmlKeyboardResponse,
      stimulus: "<p>foo</p>",
      save_trial_parameters: {
        foo: true,
        bar: false,
      },
    };

    jsPsych.init({
      timeline: [trial],
    });

    pressKey(" ");

    expect(spy).toHaveBeenCalled();
    spy.mockRestore();
  });

  test("Arrayed objects work with save_trial_parameters ", function () {
    var q = [{ prompt: "foo" }, { prompt: "bar" }];
    var trial = {
      type: surveyText,
      questions: q,
      save_trial_parameters: {
        questions: true,
      },
    };

    jsPsych.init({
      timeline: [trial],
    });

    clickTarget(document.querySelector("#jspsych-survey-text-next"));

    var data = jsPsych.data.get().values()[0];
    expect(data.questions[0].prompt).toBe(q[0].prompt);
    expect(data.questions[1].prompt).toBe(q[1].prompt);
  });

  test("Function-based parameters are stored as string representations ", function () {
    var sample_function = function (param) {
      var size = 50 + Math.floor(param * 250);
      var html =
        '<div style="display: block; margin: auto; height: 300px;">' +
        '<div style="display: block; margin: auto; background-color: #000000; ' +
        "width: " +
        size +
        "px; height: " +
        size +
        'px;"></div></div>';
      return html;
    };

    var trial = {
      type: reconstruction,
      stim_function: sample_function,
      starting_value: 0.25,
      save_trial_parameters: {
        stim_function: true,
      },
    };

    jsPsych.init({
      timeline: [trial],
    });

    clickTarget(document.querySelector("button"));

    var data = jsPsych.data.get().values()[0];
    expect(data.stim_function).toBe(sample_function.toString());
  });

  test("Dynamic parameters record their evaluated value", function () {
    var trial = {
      type: htmlKeyboardResponse,
      stimulus: "<p>foo</p>",
      trial_duration: function () {
        return 1000;
      },
      save_trial_parameters: {
        trial_duration: true,
      },
    };

    jsPsych.init({
      timeline: [trial],
    });

    pressKey(" ");

    var data = jsPsych.data.get().values()[0];
    expect(data.trial_duration).toBe(1000);
  });
});
