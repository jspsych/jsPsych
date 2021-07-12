import htmlKeyboardResponse from "@jspsych/plugin-html-keyboard-response";

import { JsPsych, initJsPsych } from "../../src";
import { pressKey } from "../utils";

let jsPsych: JsPsych;

describe("automatic progress bar", function () {
  test("progress bar does not display by default", function () {
    var trial = {
      type: htmlKeyboardResponse,
      stimulus: "foo",
    };

    jsPsych = initJsPsych({
      timeline: [trial],
    });

    expect(document.querySelector("#jspsych-progressbar-container")).toBe(null);

    pressKey("a");
  });

  test("progress bar displays when show_progress_bar is true", function () {
    var trial = {
      type: htmlKeyboardResponse,
      stimulus: "foo",
    };

    jsPsych = initJsPsych({
      timeline: [trial],
      show_progress_bar: true,
    });

    expect(document.querySelector("#jspsych-progressbar-container").innerHTML).toMatch(
      '<span>Completion Progress</span><div id="jspsych-progressbar-outer"><div id="jspsych-progressbar-inner"></div></div>'
    );

    pressKey("a");
  });

  test("progress bar automatically updates by default", function () {
    var trial = {
      type: htmlKeyboardResponse,
      stimulus: "foo",
    };

    jsPsych = initJsPsych({
      timeline: [trial, trial, trial, trial],
      show_progress_bar: true,
    });

    const progressbarElement = document.querySelector<HTMLElement>("#jspsych-progressbar-inner");

    expect(progressbarElement.style.width).toBe("");

    pressKey("a");

    expect(progressbarElement.style.width).toBe("25%");

    pressKey("a");

    expect(progressbarElement.style.width).toBe("50%");

    pressKey("a");

    expect(progressbarElement.style.width).toBe("75%");

    pressKey("a");

    expect(progressbarElement.style.width).toBe("100%");
  });

  test("progress bar does not automatically update when auto_update_progress_bar is false", function () {
    var trial = {
      type: htmlKeyboardResponse,
      stimulus: "foo",
    };

    jsPsych = initJsPsych({
      timeline: [trial, trial, trial, trial],
      show_progress_bar: true,
      auto_update_progress_bar: false,
    });

    const progressbarElement = document.querySelector<HTMLElement>("#jspsych-progressbar-inner");

    expect(progressbarElement.style.width).toBe("");

    pressKey("a");

    expect(progressbarElement.style.width).toBe("");

    pressKey("a");

    expect(progressbarElement.style.width).toBe("");

    pressKey("a");

    expect(progressbarElement.style.width).toBe("");

    pressKey("a");

    expect(progressbarElement.style.width).toBe("");
  });

  test("setProgressBar() manually", function () {
    var trial = {
      type: htmlKeyboardResponse,
      stimulus: "foo",
      on_finish: function () {
        jsPsych.setProgressBar(0.2);
      },
    };

    var trial_2 = {
      type: htmlKeyboardResponse,
      stimulus: "foo",
      on_finish: function () {
        jsPsych.setProgressBar(0.8);
      },
    };

    jsPsych = initJsPsych({
      timeline: [trial, trial_2],
      show_progress_bar: true,
      auto_update_progress_bar: false,
    });

    const progressbarElement = document.querySelector<HTMLElement>("#jspsych-progressbar-inner");

    expect(progressbarElement.style.width).toBe("");

    pressKey("a");

    expect(progressbarElement.style.width).toBe("20%");

    pressKey("a");

    expect(progressbarElement.style.width).toBe("80%");
  });

  test("getProgressBarCompleted() -- manual updates", function () {
    var trial = {
      type: htmlKeyboardResponse,
      stimulus: "foo",
      on_finish: function () {
        jsPsych.setProgressBar(0.2);
      },
    };

    var trial_2 = {
      type: htmlKeyboardResponse,
      stimulus: "foo",
      on_finish: function () {
        jsPsych.setProgressBar(0.8);
      },
    };

    jsPsych = initJsPsych({
      timeline: [trial, trial_2],
      show_progress_bar: true,
      auto_update_progress_bar: false,
    });

    pressKey("a");

    expect(jsPsych.getProgressBarCompleted()).toBe(0.2);

    pressKey("a");

    expect(jsPsych.getProgressBarCompleted()).toBe(0.8);
  });

  test("getProgressBarCompleted() -- automatic updates", function () {
    var trial = {
      type: htmlKeyboardResponse,
      stimulus: "foo",
    };

    jsPsych = initJsPsych({
      timeline: [trial, trial, trial, trial],
      show_progress_bar: true,
    });

    pressKey("a");

    expect(jsPsych.getProgressBarCompleted()).toBe(0.25);

    pressKey("a");

    expect(jsPsych.getProgressBarCompleted()).toBe(0.5);

    pressKey("a");

    expect(jsPsych.getProgressBarCompleted()).toBe(0.75);

    pressKey("a");

    expect(jsPsych.getProgressBarCompleted()).toBe(1);
  });
});
