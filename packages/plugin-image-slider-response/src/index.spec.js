import { jest } from "@jest/globals";
import jsPsych from "jspsych";
import { clickTarget } from "jspsych/tests/utils";

import imageSliderResponse from "./";

jest.useFakeTimers();

describe("image-slider-response", function () {
  test("displays image stimulus", function (done) {
    var trial = {
      type: imageSliderResponse,
      stimulus: "../media/blue.png",
      labels: ["left", "right"],
      button_label: "button",
      render_on_canvas: false,
      on_load: function () {
        expect(jsPsych.getDisplayElement().innerHTML).toMatch(
          '<div id="jspsych-image-slider-response-stimulus"><img src="../media/blue.png"'
        );
        clickTarget(document.querySelector("#jspsych-image-slider-response-next"));
        done();
      },
    };

    jsPsych.init({
      timeline: [trial],
    });
  });

  test("displays labels", function () {
    var trial = {
      type: imageSliderResponse,
      stimulus: "../media/blue.png",
      labels: ["left", "right"],
      button_label: "button",
      render_on_canvas: false,
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

    clickTarget(document.querySelector("#jspsych-image-slider-response-next"));
  });

  test("displays button label", function () {
    var trial = {
      type: imageSliderResponse,
      stimulus: "../media/blue.png",
      labels: ["left", "right"],
      button_label: "button",
      render_on_canvas: false,
    };

    jsPsych.init({
      timeline: [trial],
    });

    expect(jsPsych.getDisplayElement().innerHTML).toMatch(
      '<button id="jspsych-image-slider-response-next" class="jspsych-btn">button</button>'
    );

    clickTarget(document.querySelector("#jspsych-image-slider-response-next"));
  });

  test("should set min, max and step", function () {
    var trial = {
      type: imageSliderResponse,
      stimulus: "../media/blue.png",
      labels: ["left", "right"],
      button_label: "button",
      min: 2,
      max: 10,
      step: 2,
      render_on_canvas: false,
    };

    jsPsych.init({
      timeline: [trial],
    });

    expect(
      jsPsych.getDisplayElement().querySelector("#jspsych-image-slider-response-response").min
    ).toBe("2");
    expect(
      jsPsych.getDisplayElement().querySelector("#jspsych-image-slider-response-response").max
    ).toBe("10");
    expect(
      jsPsych.getDisplayElement().querySelector("#jspsych-image-slider-response-response").step
    ).toBe("2");

    clickTarget(document.querySelector("#jspsych-image-slider-response-next"));
  });

  test("prompt should append to bottom of stimulus", function () {
    var trial = {
      type: imageSliderResponse,
      stimulus: "../media/blue.png",
      labels: ["left", "right"],
      button_label: "button",
      prompt: "<p>This is a prompt</p>",
      render_on_canvas: false,
    };

    jsPsych.init({
      timeline: [trial],
    });

    expect(jsPsych.getDisplayElement().innerHTML).toMatch("<p>This is a prompt</p>");

    clickTarget(document.querySelector("#jspsych-image-slider-response-next"));
  });

  test("should hide stimulus if stimulus_duration is set", function () {
    var trial = {
      type: imageSliderResponse,
      stimulus: "../media/blue.png",
      labels: ["left", "right"],
      button_label: "button",
      stimulus_duration: 500,
      render_on_canvas: false,
    };

    jsPsych.init({
      timeline: [trial],
    });

    expect(
      jsPsych.getDisplayElement().querySelector("#jspsych-image-slider-response-stimulus").style
        .visibility
    ).toMatch("");
    jest.advanceTimersByTime(500);
    expect(
      jsPsych.getDisplayElement().querySelector("#jspsych-image-slider-response-stimulus").style
        .visibility
    ).toMatch("hidden");
    clickTarget(document.querySelector("#jspsych-image-slider-response-next"));
  });

  test("should end trial when trial duration is reached", function () {
    var trial = {
      type: imageSliderResponse,
      stimulus: "../media/blue.png",
      labels: ["left", "right"],
      button_label: "button",
      trial_duration: 500,
      render_on_canvas: false,
    };

    jsPsych.init({
      timeline: [trial],
    });

    expect(jsPsych.getDisplayElement().innerHTML).toMatch(
      '<div id="jspsych-image-slider-response-stimulus"><img src="../media/blue.png"'
    );
    jest.advanceTimersByTime(500);
    expect(jsPsych.getDisplayElement().innerHTML).toBe("");
  });

  test("should end trial when button is clicked", function () {
    var trial = {
      type: imageSliderResponse,
      stimulus: "../media/blue.png",
      labels: ["left", "right"],
      button_label: "button",
      response_ends_trial: true,
      render_on_canvas: false,
    };

    jsPsych.init({
      timeline: [trial],
    });

    expect(jsPsych.getDisplayElement().innerHTML).toMatch(
      '<div id="jspsych-image-slider-response-stimulus"><img src="../media/blue.png"'
    );

    clickTarget(document.querySelector("#jspsych-image-slider-response-next"));

    expect(jsPsych.getDisplayElement().innerHTML).toBe("");
  });
});
