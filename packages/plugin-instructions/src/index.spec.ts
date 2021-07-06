import { jest } from "@jest/globals";
import jsPsych from "jspsych";
import { pressKey } from "jspsych/tests/utils";

import instructions from ".";

jest.useFakeTimers();

describe("instructions plugin", function () {
  test("keys can be specified as strings", function () {
    var trial = {
      type: instructions,
      pages: ["page 1", "page 2"],
      key_forward: "a",
    };

    jsPsych.init({
      timeline: [trial],
    });

    expect(jsPsych.getDisplayElement().innerHTML).toMatch("page 1");

    pressKey("a");

    expect(jsPsych.getDisplayElement().innerHTML).toMatch("page 2");

    pressKey("a");

    expect(jsPsych.getDisplayElement().innerHTML).toBe("");
  });

  test("bug issue #544 reproduce", function () {
    var trial = {
      type: instructions,
      pages: ["page 1", "page 2"],
      key_forward: "a",
      allow_backward: false,
    };

    jsPsych.init({
      timeline: [trial],
    });

    expect(jsPsych.getDisplayElement().innerHTML).toMatch("page 1");

    pressKey("a");

    expect(jsPsych.getDisplayElement().innerHTML).toMatch("page 2");

    pressKey("ArrowLeft");

    expect(jsPsych.getDisplayElement().innerHTML).toMatch("page 2");

    pressKey("a");

    expect(jsPsych.getDisplayElement().innerHTML).toBe("");
  });

  test("view history data is stored as array of objects", function () {
    var trial = {
      type: instructions,
      pages: ["page 1", "page 2"],
      key_forward: "a",
    };

    jsPsych.init({
      timeline: [trial],
    });

    pressKey("a");
    pressKey("a");
    expect(jsPsych.getDisplayElement().innerHTML).toBe("");
    var data = jsPsych.data.get().values()[0].view_history;
    expect(data[0].page_index).toBe(0);
    expect(data[1].page_index).toBe(1);
  });
});
