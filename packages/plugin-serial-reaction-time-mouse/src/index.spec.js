import { jest } from "@jest/globals";
import jsPsych from "jspsych";
import { mouseDownMouseUpTarget } from "jspsych/tests/utils";

import serialReactionTimeMouse from "./";

jest.useFakeTimers();

describe("serial-reaction-time-mouse plugin", function () {
  test("default behavior", function () {
    var trial = {
      type: serialReactionTimeMouse,
      target: [0, 0],
    };

    jsPsych.init({
      timeline: [trial],
    });

    expect(
      document.querySelector("#jspsych-serial-reaction-time-stimulus-cell-0-0").style
        .backgroundColor
    ).toBe("rgb(153, 153, 153)");
    expect(
      document.querySelector("#jspsych-serial-reaction-time-stimulus-cell-0-1").style
        .backgroundColor
    ).toBe("");
    expect(
      document.querySelector("#jspsych-serial-reaction-time-stimulus-cell-0-2").style
        .backgroundColor
    ).toBe("");
    expect(
      document.querySelector("#jspsych-serial-reaction-time-stimulus-cell-0-3").style
        .backgroundColor
    ).toBe("");

    mouseDownMouseUpTarget(
      document.querySelector("#jspsych-serial-reaction-time-stimulus-cell-0-1")
    );

    expect(jsPsych.getDisplayElement().innerHTML).not.toBe("");

    mouseDownMouseUpTarget(
      document.querySelector("#jspsych-serial-reaction-time-stimulus-cell-0-0")
    );

    expect(jsPsych.getDisplayElement().innerHTML).toBe("");
  });
});
