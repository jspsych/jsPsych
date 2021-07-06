import { jest } from "@jest/globals";
import jsPsych from "jspsych";
import { clickTarget } from "jspsych/tests/utils";

import surveyMultiSelect from ".";

jest.useFakeTimers();

const getInputElement = (selectId: number, value: string) =>
  document.querySelector(
    `#jspsych-survey-multi-select-${selectId} input[value="${value}"]`
  ) as HTMLInputElement;

describe("survey-multi-select plugin", function () {
  test("quoted values for options work", function () {
    var trial = {
      type: surveyMultiSelect,
      questions: [
        {
          prompt: "foo",
          options: ['Hello "boo"', "yes, 'bar'"],
        },
      ],
    };

    jsPsych.init({
      timeline: [trial],
    });

    expect(
      jsPsych.getDisplayElement().querySelector("#jspsych-survey-multi-select-option-0-0 input")
        .value
    ).toBe('Hello "boo"');
    expect(
      jsPsych.getDisplayElement().querySelector("#jspsych-survey-multi-select-option-0-1 input")
        .value
    ).toBe("yes, 'bar'");

    jsPsych
      .getDisplayElement()
      .querySelector("#jspsych-survey-multi-select-form")
      .dispatchEvent(new Event("submit"));

    expect(jsPsych.getDisplayElement().innerHTML).toBe("");
  });

  test("data are logged with the right question when randomize order is true", function () {
    var scale = ["a", "b", "c", "d", "e"];
    var t = {
      type: surveyMultiSelect,
      questions: [
        { prompt: "Q0", options: scale },
        { prompt: "Q1", options: scale },
        { prompt: "Q2", options: scale },
        { prompt: "Q3", options: scale },
        { prompt: "Q4", options: scale },
      ],
      randomize_question_order: true,
    };
    jsPsych.init({ timeline: [t] });

    getInputElement(0, "a").checked = true;
    getInputElement(1, "b").checked = true;
    getInputElement(2, "c").checked = true;
    getInputElement(3, "d").checked = true;
    getInputElement(4, "e").checked = true;

    clickTarget(document.querySelector("#jspsych-survey-multi-select-next"));

    var survey_data = jsPsych.data.get().values()[0].response;
    expect(survey_data.Q0[0]).toBe("a");
    expect(survey_data.Q1[0]).toBe("b");
    expect(survey_data.Q2[0]).toBe("c");
    expect(survey_data.Q3[0]).toBe("d");
    expect(survey_data.Q4[0]).toBe("e");
  });
});
