// this file is to test that jsPsych.randomization.setSeed works in context

import htmlKeyboardResponse from "@jspsych/plugin-html-keyboard-response";
import { pressKey, startTimeline } from "@jspsych/test-utils";

import { initJsPsych } from "../../src";

describe("setSeed generates predictable randomization", () => {
  test("timeline variable randomization is preserved", async () => {
    const jsPsych = initJsPsych();

    const seed = jsPsych.randomization.setSeed();

    const { getData } = await startTimeline(
      [
        {
          timeline: [
            {
              type: htmlKeyboardResponse,
              stimulus: "this is html",
              data: {
                i: jsPsych.timelineVariable("i"),
              },
            },
          ],
          timeline_variables: [
            { i: 0 },
            { i: 1 },
            { i: 2 },
            { i: 3 },
            { i: 4 },
            { i: 5 },
            { i: 6 },
            { i: 7 },
            { i: 8 },
          ],
          randomize_order: true,
        },
      ],
      jsPsych
    );

    for (let i = 0; i < 9; i++) {
      pressKey(" ");
    }

    const data_run_1 = getData().readOnly();

    const jsPsych_run2 = initJsPsych();

    jsPsych_run2.randomization.setSeed(seed);

    const { getData: getData2 } = await startTimeline(
      [
        {
          timeline: [
            {
              type: htmlKeyboardResponse,
              stimulus: "this is html",
              data: {
                i: jsPsych_run2.timelineVariable("i"),
              },
            },
          ],
          timeline_variables: [
            { i: 0 },
            { i: 1 },
            { i: 2 },
            { i: 3 },
            { i: 4 },
            { i: 5 },
            { i: 6 },
            { i: 7 },
            { i: 8 },
          ],
          randomize_order: true,
        },
      ],
      jsPsych_run2
    );

    for (let i = 0; i < 9; i++) {
      pressKey(" ");
    }

    const data_run_2 = getData2().readOnly();

    expect(data_run_1.select("i").values).toEqual(data_run_2.select("i").values);
  });
});
