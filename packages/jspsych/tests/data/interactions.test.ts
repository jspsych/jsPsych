import htmlKeyboardResponse from "@jspsych/plugin-html-keyboard-response";
import { pressKey, startTimeline } from "@jspsych/test-utils";

import { initJsPsych } from "../../src";

describe("Data recording", () => {
  test("record focus events", async () => {
    const { jsPsych } = await startTimeline([{ type: htmlKeyboardResponse, stimulus: "hello" }]);
    window.dispatchEvent(new Event("focus"));
    // click through first trial
    pressKey("a");
    // check data
    expect(jsPsych.data.getInteractionData().filter({ event: "focus" }).count()).toBe(1);
  });

  test("record blur events", async () => {
    const { jsPsych } = await startTimeline([{ type: htmlKeyboardResponse, stimulus: "hello" }]);
    window.dispatchEvent(new Event("blur"));
    // click through first trial
    pressKey("a");
    // check data
    expect(jsPsych.data.getInteractionData().filter({ event: "blur" }).count()).toBe(1);
  });

  /* not sure yet how to test fullscreen events with jsdom engine */

  test.skip("record fullscreenenter events", async () => {
    const { jsPsych } = await startTimeline([{ type: htmlKeyboardResponse, stimulus: "hello" }]);
    // click through first trial
    pressKey("a");
    // check if data contains rt
  });

  test.skip("record fullscreenexit events", async () => {
    const { jsPsych } = await startTimeline([{ type: htmlKeyboardResponse, stimulus: "hello" }]);
    // click through first trial
    pressKey("a");
    // check if data contains rt
  });
});

describe("on_interaction_data_update", () => {
  test("fires for blur", async () => {
    const updateFunction = jest.fn();
    const jsPsych = initJsPsych({
      on_interaction_data_update: updateFunction,
    });

    await startTimeline([{ type: htmlKeyboardResponse, stimulus: "hello" }], jsPsych);

    window.dispatchEvent(new Event("blur"));
    expect(updateFunction).toHaveBeenCalledTimes(1);

    // click through first trial
    pressKey("a");
  });

  test("fires for focus", async () => {
    const updateFunction = jest.fn();

    const jsPsych = initJsPsych({
      on_interaction_data_update: updateFunction,
    });
    await startTimeline([{ type: htmlKeyboardResponse, stimulus: "hello" }], jsPsych);

    window.dispatchEvent(new Event("focus"));
    expect(updateFunction).toHaveBeenCalledTimes(1);
    // click through first trial
    pressKey("a");
  });

  /* not sure yet how to test fullscreen events with jsdom engine */

  test.skip("fires for fullscreenexit", () => {});

  test.skip("fires for fullscreenenter", () => {});
});
