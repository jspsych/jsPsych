import { jest } from "@jest/globals";
import jsPsych from "jspsych";
import { clickTarget } from "jspsych/tests/utils";

import htmlSliderResponse from "./";

const root = "../../";

jest.useFakeTimers();

describe("html-slider-response", function () {
  test("displays html stimulus", function () {
    var trial = {
      type: htmlSliderResponse,
      stimulus: "this is html",
      labels: ["left", "right"],
      button_label: "button",
    };

    jsPsych.init({
      timeline: [trial],
    });

    expect(jsPsych.getDisplayElement().innerHTML).toMatch(
      '<div id="jspsych-html-slider-response-stimulus">this is html</div>'
    );
  });

  test("displays labels", function () {
    var trial = {
      type: htmlSliderResponse,
      stimulus: "this is html",
      labels: ["left", "right"],
      button_label: "button",
    };

    jsPsych.init({
      timeline: [trial],
    });

    expect(jsPsych.getDisplayElement().innerHTML).toMatch(
      '<span style="text-align: center; font-size: 80%;">left</span>'
    );
    expect(jsPsych.getDisplayElement().innerHTML).toMatch(
      '<span style="text-align: center; font-size: 80%;">right</span>'
    );
  });

  test("displays button label", function () {
    var trial = {
      type: htmlSliderResponse,
      stimulus: "this is html",
      labels: ["left", "right"],
      button_label: "button",
    };

    jsPsych.init({
      timeline: [trial],
    });

    expect(jsPsych.getDisplayElement().innerHTML).toMatch(
      '<button id="jspsych-html-slider-response-next" class="jspsych-btn">button</button>'
    );
  });

  test("should set min, max and step", function () {
    var trial = {
      type: htmlSliderResponse,
      stimulus: "this is html",
      labels: ["left", "right"],
      min: 2,
      max: 10,
      step: 2,
      button_label: "button",
    };

    jsPsych.init({
      timeline: [trial],
    });

    expect(
      jsPsych.getDisplayElement().querySelector("#jspsych-html-slider-response-response").min
    ).toBe("2");
    expect(
      jsPsych.getDisplayElement().querySelector("#jspsych-html-slider-response-response").max
    ).toBe("10");
    expect(
      jsPsych.getDisplayElement().querySelector("#jspsych-html-slider-response-response").step
    ).toBe("2");
  });

  test("should append to bottom on stimulus", function () {
    var trial = {
      type: htmlSliderResponse,
      stimulus: "this is html",
      labels: ["left", "right"],
      button_label: "button",
      prompt: "<p>This is a prompt</p>",
    };

    jsPsych.init({
      timeline: [trial],
    });

    expect(jsPsych.getDisplayElement().innerHTML).toMatch("<p>This is a prompt</p>");
  });

  test("should hide stimulus if stimulus_duration is set", function () {
    var trial = {
      type: htmlSliderResponse,
      stimulus: "this is html",
      labels: ["left", "right"],
      button_label: "button",
      stimulus_duration: 500,
    };

    jsPsych.init({
      timeline: [trial],
    });

    expect(
      jsPsych.getDisplayElement().querySelector("#jspsych-html-slider-response-stimulus").style
        .visibility
    ).toMatch("");
    jest.advanceTimersByTime(500);
    expect(
      jsPsych.getDisplayElement().querySelector("#jspsych-html-slider-response-stimulus").style
        .visibility
    ).toMatch("hidden");
  });

  test("should end trial when trial duration is reached", function () {
    var trial = {
      type: htmlSliderResponse,
      stimulus: "this is html",
      labels: ["left", "right"],
      button_label: "button",
      trial_duration: 500,
    };

    jsPsych.init({
      timeline: [trial],
    });

    expect(jsPsych.getDisplayElement().innerHTML).toMatch(
      '<div id="jspsych-html-slider-response-stimulus">this is html</div>'
    );
    jest.advanceTimersByTime(500);
    expect(jsPsych.getDisplayElement().innerHTML).toBe("");
  });

  test("should end trial when button is clicked", function () {
    var trial = {
      type: htmlSliderResponse,
      stimulus: "this is html",
      labels: ["left", "right"],
      button_label: "button",
      response_ends_trial: true,
    };

    jsPsych.init({
      timeline: [trial],
    });

    expect(jsPsych.getDisplayElement().innerHTML).toMatch(
      '<div id="jspsych-html-slider-response-stimulus">this is html</div>'
    );

    clickTarget(document.querySelector("#jspsych-html-slider-response-next"));

    expect(jsPsych.getDisplayElement().innerHTML).toBe("");
  });
});
