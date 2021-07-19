// import imageKeyboardResponse from "@jspsych/plugin-image-keyboard-response";

import { initJsPsych } from "../../src";

describe("getAutoPreloadList", () => {
  test.skip("gets whole timeline when no argument provided", async () => {
    const timeline = [
      {
        // @ts-ignore TODO enable this test once the plugin is a class
        type: imageKeyboardResponse,
        stimulus: "img/foo.png",
        render_on_canvas: false,
      },
    ];

    const jsPsych = initJsPsych();
    expect(jsPsych.pluginAPI.getAutoPreloadList(timeline).images).toBe("img/foo.png");
  });

  test.skip("works with images", async () => {
    const timeline = [
      {
        // @ts-ignore TODO enable this test once the plugin is a class
        type: imageKeyboardResponse,
        stimulus: "img/foo.png",
      },
    ];

    const jsPsych = initJsPsych();
    expect(jsPsych.pluginAPI.getAutoPreloadList(timeline).images[0]).toBe("img/foo.png");
  });
});
