import { jest } from "@jest/globals";
import jsPsych from "jspsych";

// don't load plugin here - need to spy on registerPreload before its called

jest.useFakeTimers();

describe("video-button-response plugin", function () {
  test("video preloading registers correctly", function () {
    const preload_spy = jest.spyOn(jsPsych.pluginAPI, "registerPreload");
    const videoButtonResponse = require("./").default;
    var trial = {
      type: videoButtonResponse,
      stimulus: ["vid.mp4"],
      choices: ["y"],
    };
    jsPsych.init({
      timeline: [trial],
    });
    expect(preload_spy).toHaveBeenCalled();
    preload_spy.mockRestore();
  });
});
