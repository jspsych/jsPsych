import htmlKeyboardResponse from "@jspsych/plugin-html-keyboard-response";
import { pressKey, startTimeline } from "@jspsych/test-utils";

import { initJsPsych } from "../../src";

describe("The record_data parameter", () => {
  it("Defaults to true", async () => {
    const { getData } = await startTimeline([
      {
        type: htmlKeyboardResponse,
        stimulus: "<p>foo</p>",
      },
    ]);

    await pressKey(" ");

    expect(getData().count()).toBe(1);
  });

  it("Can be set to false to prevent the data from being recorded", async () => {
    const { getData } = await startTimeline([
      {
        type: htmlKeyboardResponse,
        stimulus: "<p>foo</p>",
        record_data: false,
      },
    ]);

    await pressKey(" ");

    expect(getData().count()).toBe(0);
  });

  it("Can be set as a timeline variable", async () => {
    const jsPsych = initJsPsych();
    const { getData } = await startTimeline(
      [
        {
          timeline: [
            {
              type: htmlKeyboardResponse,
              stimulus: "<p>foo</p>",
              record_data: jsPsych.timelineVariable("record_data"),
            },
          ],
          timeline_variables: [{ record_data: true }, { record_data: false }],
        },
      ],
      jsPsych
    );

    await pressKey(" ");
    await pressKey(" ");

    expect(getData().count()).toBe(1);
  });

  it("Can be set as a function", async () => {
    const jsPsych = initJsPsych();
    const { getData } = await startTimeline(
      [
        {
          type: htmlKeyboardResponse,
          stimulus: "<p>foo</p>",
          record_data: () => false,
        },
      ],
      jsPsych
    );

    await pressKey(" ");

    expect(getData().count()).toBe(0);
  });
});
