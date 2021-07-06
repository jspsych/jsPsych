import { jest } from "@jest/globals";
import jsPsych from "jspsych";
import { clickTarget } from "jspsych/tests/utils";

import surveyText from ".";

jest.useFakeTimers();

const selectInput = (selector: string) => document.querySelector(selector) as HTMLInputElement;

describe("survey-text plugin", function () {
  test("default parameters work correctly", function () {
    var trial = {
      type: surveyText,
      questions: [{ prompt: "How old are you?" }, { prompt: "Where were you born?" }],
    };

    jsPsych.init({
      timeline: [trial],
    });

    expect(jsPsych.getDisplayElement().querySelectorAll("p.jspsych-survey-text").length).toBe(2);
    expect(
      jsPsych.getDisplayElement().querySelector('input[name="#jspsych-survey-text-response-0"]')
        .size
    ).toBe(40);
    expect(
      jsPsych.getDisplayElement().querySelector('input[name="#jspsych-survey-text-response-1"]')
        .size
    ).toBe(40);

    clickTarget(document.querySelector("#jspsych-survey-text-next"));

    expect(jsPsych.getDisplayElement().innerHTML).toBe("");
  });

  test("specifying only columns works", function () {
    var trial = {
      type: surveyText,
      questions: [
        { prompt: "How old are you?", columns: 50 },
        { prompt: "Where were you born?", columns: 20 },
      ],
    };

    jsPsych.init({
      timeline: [trial],
    });

    expect(jsPsych.getDisplayElement().querySelectorAll("p.jspsych-survey-text").length).toBe(2);
    expect(
      jsPsych.getDisplayElement().querySelector('input[name="#jspsych-survey-text-response-0"]')
        .size
    ).toBe(50);
    expect(
      jsPsych.getDisplayElement().querySelector('input[name="#jspsych-survey-text-response-1"]')
        .size
    ).toBe(20);

    clickTarget(document.querySelector("#jspsych-survey-text-next"));

    expect(jsPsych.getDisplayElement().innerHTML).toBe("");
  });

  // might be useful: https://github.com/jsdom/jsdom/issues/544
  test.skip("required parameter works", function () {
    var trial = {
      type: surveyText,
      questions: [
        { prompt: "How old are you?", columns: 50, required: true },
        { prompt: "Where were you born?", columns: 20 },
      ],
    };

    jsPsych.init({
      timeline: [trial],
    });

    expect(jsPsych.getDisplayElement().querySelectorAll("p.jspsych-survey-text").length).toBe(2);

    clickTarget(document.querySelector("#jspsych-survey-text-next"));

    expect(jsPsych.getDisplayElement().innerHTML).not.toBe("");

    (
      document.querySelector('input[name="#jspsych-survey-text-response-0"]') as HTMLInputElement
    ).value = "100";

    clickTarget(document.querySelector("#jspsych-survey-text-next"));

    expect(jsPsych.getDisplayElement().innerHTML).toBe("");
  });

  test("data are logged with the right question when randomize order is true", function () {
    var t = {
      type: surveyText,
      questions: [
        { prompt: "Q0" },
        { prompt: "Q1" },
        { prompt: "Q2" },
        { prompt: "Q3" },
        { prompt: "Q4" },
      ],
      randomize_question_order: true,
    };
    jsPsych.init({ timeline: [t] });

    selectInput("#input-0").value = "a0";
    selectInput("#input-1").value = "a1";
    selectInput("#input-2").value = "a2";
    selectInput("#input-3").value = "a3";
    selectInput("#input-4").value = "a4";

    clickTarget(document.querySelector("#jspsych-survey-text-next"));

    var survey_data = jsPsych.data.get().values()[0].response;
    expect(survey_data.Q0).toBe("a0");
    expect(survey_data.Q1).toBe("a1");
    expect(survey_data.Q2).toBe("a2");
    expect(survey_data.Q3).toBe("a3");
    expect(survey_data.Q4).toBe("a4");
  });
});
