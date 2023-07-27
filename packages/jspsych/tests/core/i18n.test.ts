import htmlKeyboardResponse from "@jspsych/plugin-html-keyboard-response";
import { pressKey, startTimeline } from "@jspsych/test-utils";

import { initJsPsych } from "../../src";

describe("translations are correctly fetched", () => {
  test("when drawing from the global translations", async () => {
    const jsPsych = initJsPsych({
      locale: "de",
      translations: {
        de: {
          "Hello World!": "Hallo Welt!",
        },
      },
    });
    const { getHTML } = await startTimeline(
      [
        {
          type: htmlKeyboardResponse,
          stimulus: () => jsPsych.translate("Hello World!"),
          on_finish: () => {
            jsPsych.setLocale("en");
          },
        },
        {
          type: htmlKeyboardResponse,
          stimulus: () => jsPsych.translate("Hello World!"),
        },
      ],
      jsPsych
    );

    expect(getHTML()).toMatch("Hallo Welt!");
    pressKey("a");
    expect(getHTML()).toMatch("Hello World!");
  });

  test("when drawing from trial-level translations", async () => {
    const jsPsych = initJsPsych({
      locale: "de",
    });
    const { getHTML } = await startTimeline(
      [
        {
          type: htmlKeyboardResponse,
          stimulus: () => jsPsych.translate("Hello World!"),
          translations: {
            de: {
              "Hello World!": "Hallo Welt!",
            },
          },
          on_finish: () => {
            jsPsych.setLocale("en");
          },
        },
        {
          type: htmlKeyboardResponse,
          stimulus: () => jsPsych.translate("Hello World!"),
          translations: {
            de: {
              "Hello World!": "Hallo Welt!",
            },
          },
        },
      ],
      jsPsych
    );

    expect(getHTML()).toMatch("Hallo Welt!");
    pressKey("a");
    expect(getHTML()).toMatch("Hello World!");
  });
});
