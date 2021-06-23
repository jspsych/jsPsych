import { jest } from "@jest/globals";
import jsPsych from "jspsych";
import { pressKey } from "jspsych/tests/utils";

import iatImage from "./";

jest.useFakeTimers();

describe("iat-image plugin", function () {
  test("displays image by default", function () {
    var trial = {
      type: iatImage,
      stimulus: "../media/blue.png",
      response_ends_trial: true,
      display_feedback: false,
      left_category_key: "f",
      right_category_key: "j",
      left_category_label: ["FRIENDLY"],
      right_category_label: ["UNFRIENDLY"],
      stim_key_association: "left",
      trial_duration: 500,
    };

    jsPsych.init({
      timeline: [trial],
    });

    expect(jsPsych.getDisplayElement().innerHTML).toMatch(/blue.png/);

    pressKey("f");

    expect(jsPsych.getDisplayElement().innerHTML).toBe("");
  });

  test("display should only clear when left key is pressed", function () {
    var trial = {
      type: iatImage,
      stimulus: "../media/blue.png",
      left_category_key: "f",
      left_category_label: ["FRIENDLY"],
      stim_key_association: "left",
      key_to_move_forward: ["f"],
    };

    jsPsych.init({
      timeline: [trial],
    });

    pressKey("j");
    expect(jsPsych.getDisplayElement().innerHTML).toMatch(
      '<img src="../media/blue.png" id="jspsych-iat-stim">'
    );

    pressKey("f");
    expect(jsPsych.getDisplayElement().innerHTML).toBe("");
  });

  test("display should only clear when right key is pressed", function () {
    var trial = {
      type: iatImage,
      stimulus: "../media/blue.png",
      right_category_key: "j",
      right_category_label: ["UNFRIENDLY"],
      stim_key_association: "right",
      key_to_move_forward: ["j"],
    };

    jsPsych.init({
      timeline: [trial],
    });

    pressKey("f");
    expect(jsPsych.getDisplayElement().innerHTML).toMatch(
      new RegExp('<img src="../media/blue.png" id="jspsych-iat-stim">')
    );

    pressKey("j");
    expect(jsPsych.getDisplayElement().innerHTML).toBe("");
  });

  test("display should clear when any key is pressed", function () {
    var trial = {
      type: iatImage,
      stimulus: "../media/blue.png",
      left_category_key: "f",
      right_category_key: "j",
      left_category_label: ["FRIENDLY"],
      right_category_label: ["UNFRIENDLY"],
      stim_key_association: "right",
      key_to_move_forward: [jsPsych.ALL_KEYS],
    };

    jsPsych.init({
      timeline: [trial],
    });

    pressKey("f");
    expect(jsPsych.getDisplayElement().innerHTML).toMatch(
      new RegExp('<img src="../media/blue.png" id="jspsych-iat-stim" class=" responded">')
    );

    pressKey("a");
    expect(jsPsych.getDisplayElement().innerHTML).toBe("");
  });

  test('display should clear only when "other key" is pressed', function () {
    var trial = {
      type: iatImage,
      stimulus: "../media/blue.png",
      left_category_key: "f",
      right_category_key: "j",
      left_category_label: ["FRIENDLY"],
      right_category_label: ["UNFRIENDLY"],
      stim_key_association: "left",
      key_to_move_forward: ["other key"],
    };

    jsPsych.init({
      timeline: [trial],
    });

    pressKey("j");
    expect(jsPsych.getDisplayElement().innerHTML).toMatch(
      new RegExp('<img src="../media/blue.png" id="jspsych-iat-stim" class=" responded">')
    );

    pressKey("f");
    expect(jsPsych.getDisplayElement().innerHTML).toBe("");
  });

  test("labels should be with assigned key characters", function () {
    var trial = {
      type: iatImage,
      stimulus: "../media/blue.png",
      left_category_key: "f",
      right_category_key: "j",
      left_category_label: ["FRIENDLY"],
      right_category_label: ["UNFRIENDLY"],
      stim_key_association: "left",
    };

    jsPsych.init({
      timeline: [trial],
    });

    expect(jsPsych.getDisplayElement().innerHTML).toMatch(
      new RegExp("<p>Press j for:<br> <b>UNFRIENDLY</b>")
    );
    expect(jsPsych.getDisplayElement().innerHTML).toMatch(
      new RegExp("<p>Press f for:<br> <b>FRIENDLY</b>")
    );

    pressKey("f");
    expect(jsPsych.getDisplayElement().innerHTML).toBe("");
  });

  test("should display wrong image when wrong key is pressed", function () {
    var trial = {
      type: iatImage,
      stimulus: "../media/blue.png",
      html_when_wrong: '<span style="color: red; font-size: 80px">X</span>',
      display_feedback: true,
      left_category_key: "f",
      right_category_key: "j",
      left_category_label: ["FRIENDLY"],
      right_category_label: ["UNFRIENDLY"],
      stim_key_association: "left",
      key_to_move_forward: [jsPsych.ALL_KEYS],
      response_ends_trial: true,
    };

    jsPsych.init({
      timeline: [trial],
    });

    expect(jsPsych.getDisplayElement().querySelector("#wrongImgContainer").style.visibility).toBe(
      "hidden"
    );
    pressKey("j");
    expect(jsPsych.getDisplayElement().querySelector("#wrongImgContainer").style.visibility).toBe(
      "visible"
    );

    pressKey("a");
    expect(jsPsych.getDisplayElement().innerHTML).toBe("");
  });

  test("trial_duration should end trial after time has elapsed; only if display_feedback is false", function () {
    var trial = {
      type: iatImage,
      stimulus: "../media/blue.png",
      display_feedback: false,
      response_ends_trial: false,
      stim_key_association: "left",
      trial_duration: 500,
    };

    jsPsych.init({
      timeline: [trial],
    });

    expect(jsPsych.getDisplayElement().innerHTML).toMatch(
      new RegExp('<img src="../media/blue.png" id="jspsych-iat-stim">')
    );

    jest.runAllTimers();

    expect(jsPsych.getDisplayElement().innerHTML).toBe("");
  });

  test("trial should not end when response_ends_trial is false and stimulus should get responded class", function () {
    var trial = {
      type: iatImage,
      stimulus: "../media/blue.png",
      response_ends_trial: false,
      display_feedback: false,
      left_category_key: "f",
      right_category_key: "j",
      left_category_label: ["FRIENDLY"],
      right_category_label: ["UNFRIENDLY"],
      stim_key_association: "left",
      trial_duration: 500,
    };

    jsPsych.init({
      timeline: [trial],
    });

    pressKey("f");
    expect(jsPsych.getDisplayElement().innerHTML).toMatch(
      new RegExp('<img src="../media/blue.png" id="jspsych-iat-stim" class=" responded">')
    );

    jest.runAllTimers();
  });

  test("should accept functions as parameters(trial_duration in use, response ends trial false)", function () {
    var trial = {
      type: iatImage,
      stimulus: function () {
        return "../media/blue.png";
      },
      display_feedback: function () {
        return true;
      },
      html_when_wrong: function () {
        return '<span style="color: red; font-size: 80px">X</span>';
      },
      left_category_key: function () {
        return "e";
      },
      right_category_key: function () {
        return "i";
      },
      left_category_label: function () {
        return ["FRIENDLY"];
      },
      right_category_label: function () {
        return ["UNFRIENDLY"];
      },
      stim_key_association: function () {
        return "left";
      },
      trial_duration: function () {
        return 1000;
      },
      response_ends_trial: function () {
        return false;
      },
    };

    jsPsych.init({
      timeline: [trial],
    });

    expect(jsPsych.getDisplayElement().innerHTML).toMatch(
      new RegExp('<img src="../media/blue.png" id="jspsych-iat-stim">')
    );

    jest.advanceTimersByTime(500);

    pressKey("i");
    expect(jsPsych.getDisplayElement().querySelector("#wrongImgContainer").style.visibility).toBe(
      "visible"
    );

    jest.advanceTimersByTime(600);

    expect(jsPsych.getDisplayElement().innerHTML).toBe("");
  });

  test("should accept functions as parameters(trial_duration is not in use)", function () {
    var trial = {
      type: iatImage,
      stimulus: function () {
        return "../media/blue.png";
      },
      display_feedback: function () {
        return true;
      },
      html_when_wrong: function () {
        return '<span style="color: red; font-size: 80px">X</span>';
      },
      left_category_key: function () {
        return "e";
      },
      right_category_key: function () {
        return "i";
      },
      left_category_label: function () {
        return ["FRIENDLY"];
      },
      right_category_label: function () {
        return ["UNFRIENDLY"];
      },
      stim_key_association: function () {
        return "left";
      },
      key_to_move_forward: function () {
        return [jsPsych.ALL_KEYS];
      },
      trial_duration: function () {
        return 1000;
      },
      response_ends_trial: function () {
        return true;
      },
    };

    jsPsych.init({
      timeline: [trial],
    });

    expect(jsPsych.getDisplayElement().innerHTML).toMatch(
      new RegExp('<img src="../media/blue.png" id="jspsych-iat-stim">')
    );

    pressKey("i");
    expect(jsPsych.getDisplayElement().innerHTML).toMatch(
      new RegExp('<img src="../media/blue.png" id="jspsych-iat-stim" class=" responded">')
    );

    jest.advanceTimersByTime(1000);

    expect(jsPsych.getDisplayElement().innerHTML).toMatch(
      new RegExp('<img src="../media/blue.png" id="jspsych-iat-stim" class=" responded">')
    );

    jest.advanceTimersByTime(500);

    pressKey("a");
    expect(jsPsych.getDisplayElement().innerHTML).toBe("");
  });
});
