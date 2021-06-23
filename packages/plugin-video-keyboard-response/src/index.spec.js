import { jest } from "@jest/globals";
import jsPsych from "jspsych";
import { clickTarget, mouseDownMouseUpTarget, pressKey } from "jspsych/tests/utils";

// don't load plugin here - need to spy on registerPreload before its called

jest.useFakeTimers();

describe("video-keyboard-response plugin", function () {
  test("video preloading registers correctly", function () {
    const preload_spy = jest.spyOn(jsPsych.pluginAPI, "registerPreload");
    const videoKeyboardResponse = require("./").default;
    var trial = {
      type: videoKeyboardResponse,
      stimulus: ["video.mp4"],
      choices: jsPsych.ALL_KEYS,
    };
    jsPsych.init({
      timeline: [trial],
    });
    expect(preload_spy).toHaveBeenCalled();
    preload_spy.mockRestore();
  });
});
