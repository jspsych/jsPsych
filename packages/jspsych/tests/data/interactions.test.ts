import htmlKeyboardResponse from "@jspsych/plugin-html-keyboard-response";
import { pressKey, startTimeline } from "@jspsych/test-utils";

import { JsPsych, initJsPsych } from "../../src";

function setIsFullScreen(isFullscreen: boolean) {
  // @ts-expect-error
  window.document.isFullScreen = isFullscreen;
  document.dispatchEvent(new Event("fullscreenchange"));
}

afterEach(async () => {
  // Finish the experiment so its interaction listeners are removed
  await pressKey("a");
});

describe("Data recording", () => {
  let jsPsych: JsPsych;

  beforeEach(async () => {
    jsPsych = (await startTimeline([{ type: htmlKeyboardResponse, stimulus: "hello" }])).jsPsych;
  });

  test("record focus events", async () => {
    window.dispatchEvent(new Event("focus"));
    expect(jsPsych.data.getInteractionData().filter({ event: "focus" }).count()).toBe(1);
  });

  test("record blur events", async () => {
    window.dispatchEvent(new Event("blur"));
    expect(jsPsych.data.getInteractionData().filter({ event: "blur" }).count()).toBe(1);
  });

  test("record fullscreenenter events", async () => {
    setIsFullScreen(true);
    expect(jsPsych.data.getInteractionData().filter({ event: "fullscreenenter" }).count()).toBe(1);
  });

  test("record fullscreenexit events", async () => {
    setIsFullScreen(false);
    expect(jsPsych.data.getInteractionData().filter({ event: "fullscreenexit" }).count()).toBe(1);
  });
});

describe("on_interaction_data_update", () => {
  const updateFunction = jest.fn();
  let jsPsych: JsPsych;

  beforeEach(async () => {
    updateFunction.mockClear();
    jsPsych = initJsPsych({ on_interaction_data_update: updateFunction });
    await startTimeline([{ type: htmlKeyboardResponse, stimulus: "hello" }], jsPsych);
  });

  test("fires for blur", async () => {
    window.dispatchEvent(new Event("blur"));
    expect(updateFunction).toHaveBeenCalledTimes(1);
  });

  test("fires for focus", async () => {
    window.dispatchEvent(new Event("focus"));
    expect(updateFunction).toHaveBeenCalledTimes(1);
  });

  test("fires for fullscreenenter", async () => {
    setIsFullScreen(true);
    expect(updateFunction).toHaveBeenCalledTimes(1);
  });

  test("fires for fullscreenexit", async () => {
    setIsFullScreen(false);
    expect(updateFunction).toHaveBeenCalledTimes(1);
  });
});
