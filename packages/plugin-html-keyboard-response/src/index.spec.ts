import { jest } from "@jest/globals";
import { JsPsych, initJsPsych } from "jspsych";
import { pressKey } from "jspsych/tests/utils";

import htmlKeyboardResponse from ".";

jest.useFakeTimers();

let jsPsych: JsPsych;

describe("html-keyboard-response", function () {
  test("displays html stimulus", function () {
    var trial = {
      type: htmlKeyboardResponse,
      stimulus: "this is html",
    };

    jsPsych = initJsPsych({
      timeline: [trial],
    });

    expect(jsPsych.getDisplayElement().innerHTML).toBe(
      '<div id="jspsych-html-keyboard-response-stimulus">this is html</div>'
    );

    pressKey("a");
  });

  test("display clears after key press", function () {
    var trial = {
      type: htmlKeyboardResponse,
      stimulus: "this is html",
      choices: ["f", "j"],
    };

    jsPsych = initJsPsych({
      timeline: [trial],
    });

    expect(jsPsych.getDisplayElement().innerHTML).toMatch(
      new RegExp('<div id="jspsych-html-keyboard-response-stimulus">this is html</div>')
    );

    pressKey("f");

    expect(jsPsych.getDisplayElement().innerHTML).toBe("");
  });

  test("prompt should append html below stimulus", function () {
    var trial = {
      type: htmlKeyboardResponse,
      stimulus: "this is html",
      choices: ["f", "j"],
      prompt: '<div id="foo">this is a prompt</div>',
    };

    jsPsych = initJsPsych({
      timeline: [trial],
    });

    expect(jsPsych.getDisplayElement().innerHTML).toMatch(
      new RegExp(
        '<div id="jspsych-html-keyboard-response-stimulus">this is html</div><div id="foo">this is a prompt</div>'
      )
    );

    pressKey("f");
  });

  test("should hide stimulus if stimulus-duration is set", function () {
    var trial = {
      type: htmlKeyboardResponse,
      stimulus: "this is html",
      choices: ["f", "j"],
      stimulus_duration: 500,
    };

    jsPsych = initJsPsych({
      timeline: [trial],
    });

    expect(
      jsPsych
        .getDisplayElement()
        .querySelector<HTMLElement>("#jspsych-html-keyboard-response-stimulus").style.visibility
    ).toMatch("");

    jest.advanceTimersByTime(500);

    expect(
      jsPsych
        .getDisplayElement()
        .querySelector<HTMLElement>("#jspsych-html-keyboard-response-stimulus").style.visibility
    ).toMatch("hidden");

    pressKey("f");
  });

  test("should end trial when trial duration is reached", function () {
    var trial = {
      type: htmlKeyboardResponse,
      stimulus: "this is html",
      choices: ["f", "j"],
      trial_duration: 500,
    };

    jsPsych = initJsPsych({
      timeline: [trial],
    });

    expect(jsPsych.getDisplayElement().innerHTML).toMatch(
      '<div id="jspsych-html-keyboard-response-stimulus">this is html</div>'
    );
    jest.advanceTimersByTime(500);
    expect(jsPsych.getDisplayElement().innerHTML).toBe("");
  });

  test("should end trial when key press", function () {
    var trial = {
      type: htmlKeyboardResponse,
      stimulus: "this is html",
      choices: ["f", "j"],
      response_ends_trial: true,
    };

    jsPsych = initJsPsych({
      timeline: [trial],
    });

    expect(jsPsych.getDisplayElement().innerHTML).toMatch(
      new RegExp('<div id="jspsych-html-keyboard-response-stimulus">this is html</div>')
    );

    pressKey("f");

    expect(jsPsych.getDisplayElement().innerHTML).toBe("");
  });

  test("class should say responded when key is pressed", function () {
    var trial = {
      type: htmlKeyboardResponse,
      stimulus: "this is html",
      choices: ["f", "j"],
      response_ends_trial: false,
    };

    jsPsych = initJsPsych({
      timeline: [trial],
    });

    expect(jsPsych.getDisplayElement().innerHTML).toMatch(
      new RegExp('<div id="jspsych-html-keyboard-response-stimulus">this is html</div>')
    );

    pressKey("f");

    expect(document.querySelector("#jspsych-html-keyboard-response-stimulus").className).toBe(
      " responded"
    );
  });
});
