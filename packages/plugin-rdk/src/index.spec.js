import { jest } from "@jest/globals";
import jsPsych from "jspsych";
import { pressKey } from "jspsych/tests/utils";

import rdk from "./";

jest.useFakeTimers();

describe("rdk plugin", function () {
  test("choices and frame data are stored as arrays", function () {
    var trial = {
      type: rdk,
      number_of_dots: 200,
      RDK_type: 3,
      choices: ["a", "l"],
      correct_choice: "l",
      coherent_direction: 0,
    };

    jsPsych.init({
      timeline: [trial],
    });

    pressKey("l");
    var data = jsPsych.data.get().values()[0];
    expect(Array.isArray(data.choices)).toBe(true);
    expect(data.choices).toStrictEqual(["a", "l"]);
    expect(Array.isArray(data.frame_rate_array)).toBe(true);
  });

  test("responses are scored correctly", function () {
    var trial = {
      type: rdk,
      number_of_dots: 200,
      RDK_type: 3,
      choices: ["a", "l"],
      correct_choice: "l",
      coherent_direction: 0,
    };
    jsPsych.init({
      timeline: [trial, trial],
    });

    pressKey("l");
    pressKey("a");

    var data = jsPsych.data.get().values();
    expect(data[0].response).toBe("l");
    expect(data[0].correct).toBe(true);
    expect(data[1].response).toBe("a");
    expect(data[1].correct).toBe(false);
  });
});
