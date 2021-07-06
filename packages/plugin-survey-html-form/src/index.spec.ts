import { jest } from "@jest/globals";
import jsPsych from "jspsych";
import { clickTarget } from "jspsych/tests/utils";

import surveyHtmlForm from ".";

jest.useFakeTimers();

const TEST_VALUE = "jsPsych";

describe("survey-html-form plugin", function () {
  test("default parameters work correctly", function () {
    var trial = {
      type: surveyHtmlForm,
      html: '<p> I am feeling <input name="first" type="text" />, <input name="second" type="text" />, and <input name="third" type="text" />.</p>',
    };

    jsPsych.init({
      timeline: [trial],
    });

    expect(
      jsPsych
        .getDisplayElement()
        .querySelectorAll('#jspsych-survey-html-form input:not([type="submit"]').length
    ).toBe(3);

    // Provide some test input
    jsPsych
      .getDisplayElement()
      .querySelectorAll('#jspsych-survey-html-form input[name="second"]')[0].value = TEST_VALUE;

    clickTarget(document.querySelector("#jspsych-survey-html-form-next"));

    // Ensure, there are no remaining contents
    expect(jsPsych.getDisplayElement().innerHTML).toBe("");

    // Check whether data is parsed properly
    var data = jsPsych.data.get().values()[0].response;
    expect(data.second).toBe(TEST_VALUE);
  });
});
