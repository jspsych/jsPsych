import { jest } from "@jest/globals";
import jsPsych from "jspsych";

import callFunction from "./";

jest.useFakeTimers();

describe("call-function plugin", function () {
  test("calls function", function () {
    var trial = {
      type: callFunction,
      func: function () {
        return 1;
      },
    };

    jsPsych.init({
      timeline: [trial],
    });

    expect(jsPsych.data.get().values()[0].value).toBe(1);
  });

  test("async function works", function () {
    var trial = {
      type: callFunction,
      async: true,
      func: function (done) {
        var data = 10;
        done(10);
      },
    };

    jsPsych.init({
      timeline: [trial],
    });

    expect(jsPsych.data.get().values()[0].value).toBe(10);
  });
});
