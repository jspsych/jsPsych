import { jest } from "@jest/globals";
import jsPsych from "jspsych";
import { mouseDownMouseUpTarget } from "jspsych/tests/utils";

import serialReactionTimeMouse from ".";

jest.useFakeTimers();

const getCellElement = (cellId: string) =>
  document.querySelector(`#jspsych-serial-reaction-time-stimulus-cell-${cellId}`) as HTMLElement;

describe("serial-reaction-time-mouse plugin", function () {
  test("default behavior", function () {
    var trial = {
      type: serialReactionTimeMouse,
      target: [0, 0],
    };

    jsPsych.init({
      timeline: [trial],
    });

    expect(getCellElement("0-0").style.backgroundColor).toBe("rgb(153, 153, 153)");
    expect(getCellElement("0-1").style.backgroundColor).toBe("");
    expect(getCellElement("0-2").style.backgroundColor).toBe("");
    expect(getCellElement("0-3").style.backgroundColor).toBe("");

    mouseDownMouseUpTarget(getCellElement("0-1"));

    expect(jsPsych.getDisplayElement().innerHTML).not.toBe("");

    mouseDownMouseUpTarget(getCellElement("0-0"));

    expect(jsPsych.getDisplayElement().innerHTML).toBe("");
  });
});
