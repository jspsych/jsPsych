import htmlKeyboardResponse from "@jspsych/plugin-html-keyboard-response";

import { initJsPsych } from "../../src";
import { pressKey, startTimeline } from "../utils";

test("works on basic timeline", async () => {
  const jsPsych = initJsPsych();
  const { getHTML, expectFinished } = await startTimeline(
    [
      {
        type: htmlKeyboardResponse,
        stimulus: "trial 1",
        on_finish: () => {
          jsPsych.endExperiment("the end");
        },
      },
      {
        type: htmlKeyboardResponse,
        stimulus: "trial 2",
      },
    ],
    jsPsych
  );

  expect(getHTML()).toMatch("trial 1");
  pressKey("a");
  expect(getHTML()).toMatch("the end");
  await expectFinished();
});

test("works with looping timeline (#541)", async () => {
  const jsPsych = initJsPsych();
  const { getHTML, expectFinished } = await startTimeline(
    [
      {
        timeline: [{ type: htmlKeyboardResponse, stimulus: "trial 1" }],
        loop_function: () => {
          jsPsych.endExperiment("the end");
        },
      },
    ],
    jsPsych
  );

  expect(getHTML()).toMatch("trial 1");
  pressKey("a");
  expect(getHTML()).toMatch("the end");
  await expectFinished();
});
