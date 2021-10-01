import htmlKeyboardResponse from "@jspsych/plugin-html-keyboard-response";
import { pressKey, startTimeline } from "@jspsych/test-utils";

import { initJsPsych } from "../../src";

describe("automatic progress bar", () => {
  test("progress bar does not display by default", async () => {
    await startTimeline([
      {
        type: htmlKeyboardResponse,
        stimulus: "foo",
      },
    ]);

    expect(document.querySelector("#jspsych-progressbar-container")).toBe(null);
    pressKey("a");
  });

  test("progress bar displays when show_progress_bar is true", async () => {
    await startTimeline(
      [
        {
          type: htmlKeyboardResponse,
          stimulus: "foo",
        },
      ],
      { show_progress_bar: true }
    );

    expect(document.querySelector("#jspsych-progressbar-container").innerHTML).toMatch(
      '<span>Completion Progress</span><div id="jspsych-progressbar-outer"><div id="jspsych-progressbar-inner"></div></div>'
    );
  });

  test("progress bar automatically updates by default", async () => {
    const trial = {
      type: htmlKeyboardResponse,
      stimulus: "foo",
    };

    await startTimeline([trial, trial, trial, trial], { show_progress_bar: true });

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

  test("progress bar does not automatically update when auto_update_progress_bar is false", async () => {
    const trial = {
      type: htmlKeyboardResponse,
      stimulus: "foo",
    };

    await startTimeline([trial, trial, trial, trial], {
      show_progress_bar: true,
      auto_update_progress_bar: false,
    });

    const progressbarElement = document.querySelector<HTMLElement>("#jspsych-progressbar-inner");

    for (let i = 0; i < 4; i++) {
      expect(progressbarElement.style.width).toBe("");
      pressKey("a");
    }
    expect(progressbarElement.style.width).toBe("");
  });

  test("setProgressBar() manually", async () => {
    const jsPsych = initJsPsych({
      show_progress_bar: true,
      auto_update_progress_bar: false,
    });

    const timeline = [
      {
        type: htmlKeyboardResponse,
        stimulus: "foo",
        on_finish: () => {
          jsPsych.setProgressBar(0.2);
        },
      },
      {
        type: htmlKeyboardResponse,
        stimulus: "foo",
        on_finish: () => {
          jsPsych.setProgressBar(0.8);
        },
      },
    ];

    await startTimeline(timeline, jsPsych);

    const progressbarElement = document.querySelector<HTMLElement>("#jspsych-progressbar-inner");

    expect(progressbarElement.style.width).toBe("");
    pressKey("a");
    expect(jsPsych.getProgressBarCompleted()).toBe(0.2);
    expect(progressbarElement.style.width).toBe("20%");
    pressKey("a");
    expect(progressbarElement.style.width).toBe("80%");
    expect(jsPsych.getProgressBarCompleted()).toBe(0.8);
  });

  test("getProgressBarCompleted() -- automatic updates", async () => {
    const trial = {
      type: htmlKeyboardResponse,
      stimulus: "foo",
    };

    const { jsPsych } = await startTimeline([trial, trial, trial, trial], {
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
