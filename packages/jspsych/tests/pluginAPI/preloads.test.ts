import imageKeyboardResponse from "@jspsych/plugin-image-keyboard-response";

import jsPsych from "../../src";
import * as pluginAPI from "../../src/plugin-api";

describe("getAutoPreloadList", function () {
  test("gets whole timeline when no argument provided", function () {
    var t = {
      type: imageKeyboardResponse,
      stimulus: "img/foo.png",
      render_on_canvas: false,
    };

    var timeline = [t];

    jsPsych.init({
      timeline: timeline,
    });

    var images = pluginAPI.getAutoPreloadList().images;

    expect(images[0]).toBe("img/foo.png");
  });
  test("works with images", function () {
    var t = {
      type: imageKeyboardResponse,
      stimulus: "img/foo.png",
    };

    var timeline = [t];

    var images = pluginAPI.getAutoPreloadList(timeline).images;

    expect(images[0]).toBe("img/foo.png");
  });
});
