import { jest } from "@jest/globals";
import jsPsych from "jspsych";
import { pressKey } from "jspsych/tests/utils";

import imageKeyboardResponse from ".";

jest.useFakeTimers();

describe("image-keyboard-response", function () {
  test("displays image stimulus", function () {
    var trial = {
      type: imageKeyboardResponse,
      stimulus: "../media/blue.png",
      render_on_canvas: false,
    };

    jsPsych.init({
      timeline: [trial],
    });

    expect(jsPsych.getDisplayElement().innerHTML).toMatch(
      '<img src="../media/blue.png" id="jspsych-image-keyboard-response-stimulus"'
    );

    pressKey("a");
  });

  test("display clears after key press", function () {
    var trial = {
      type: imageKeyboardResponse,
      stimulus: "../media/blue.png",
      choices: ["f", "j"],
      render_on_canvas: false,
    };

    jsPsych.init({
      timeline: [trial],
    });

    expect(jsPsych.getDisplayElement().innerHTML).toMatch(
      '<img src="../media/blue.png" id="jspsych-image-keyboard-response-stimulus"'
    );

    pressKey("f");

    expect(jsPsych.getDisplayElement().innerHTML).toBe("");
  });

  test("prompt should append html", function () {
    var trial = {
      type: imageKeyboardResponse,
      stimulus: "../media/blue.png",
      choices: ["f", "j"],
      prompt: '<div id="foo">this is a prompt</div>',
      render_on_canvas: false,
    };

    jsPsych.init({
      timeline: [trial],
    });

    expect(jsPsych.getDisplayElement().innerHTML).toMatch('<div id="foo">this is a prompt</div>');
    pressKey("f");
  });

  test("should hide stimulus if stimulus-duration is set", function () {
    var trial = {
      type: imageKeyboardResponse,
      stimulus: "../media/blue.png",
      choices: ["f", "j"],
      stimulus_duration: 500,
      render_on_canvas: false,
    };

    jsPsych.init({
      timeline: [trial],
    });

    expect(
      jsPsych.getDisplayElement().querySelector("#jspsych-image-keyboard-response-stimulus").style
        .visibility
    ).toMatch("");
    jest.advanceTimersByTime(500);
    expect(
      jsPsych.getDisplayElement().querySelector("#jspsych-image-keyboard-response-stimulus").style
        .visibility
    ).toMatch("hidden");
    pressKey("f");
  });

  test("should end trial when trial duration is reached", function () {
    var trial = {
      type: imageKeyboardResponse,
      stimulus: "../media/blue.png",
      choices: ["f", "j"],
      trial_duration: 500,
      render_on_canvas: false,
    };

    jsPsych.init({
      timeline: [trial],
    });

    expect(jsPsych.getDisplayElement().innerHTML).toMatch(
      '<img src="../media/blue.png" id="jspsych-image-keyboard-response-stimulus"'
    );
    jest.advanceTimersByTime(500);
    expect(jsPsych.getDisplayElement().innerHTML).toBe("");
  });

  test("should end trial when key is pressed", function () {
    var trial = {
      type: imageKeyboardResponse,
      stimulus: "../media/blue.png",
      choices: ["f", "j"],
      response_ends_trial: true,
      render_on_canvas: false,
    };

    jsPsych.init({
      timeline: [trial],
    });

    expect(jsPsych.getDisplayElement().innerHTML).toMatch(
      '<img src="../media/blue.png" id="jspsych-image-keyboard-response-stimulus"'
    );

    pressKey("f");

    expect(jsPsych.getDisplayElement().innerHTML).toBe("");
  });

  test("should show console warning when trial duration is null and response ends trial is false", function () {
    const spy = jest.spyOn(console, "warn").mockImplementation(() => {});

    var trial = {
      type: imageKeyboardResponse,
      stimulus: "../media/blue.png",
      choices: ["f", "j"],
      response_ends_trial: false,
      trial_duration: null,
      render_on_canvas: false,
    };

    jsPsych.init({
      timeline: [trial],
    });

    expect(spy).toHaveBeenCalled();
    spy.mockRestore();
  });
});
