import htmlKeyboardResponse from "@jspsych/plugin-html-keyboard-response";
import { pressKey, startTimeline } from "@jspsych/test-utils";

import { initJsPsych } from "../../src";

describe("Basic data recording", () => {
  test("should be able to get rt after running experiment", async () => {
    const { getData } = await startTimeline([{ type: htmlKeyboardResponse, stimulus: "hello" }]);

    // click through first trial
    await pressKey("a");
    // check if data contains rt
    expect(getData().select("rt").count()).toBe(1);
  });
});

describe("#addProperties", () => {
  test("should add data to all trials retroactively", async () => {
    const { jsPsych, getData } = await startTimeline([
      { type: htmlKeyboardResponse, stimulus: "hello" },
    ]);

    // click through first trial
    await pressKey("a");
    // check if data contains testprop
    expect(getData().values()[0]).not.toHaveProperty("testprop");
    jsPsych.data.addProperties({ testprop: 1 });
    expect(getData().values()[0]).toHaveProperty("testprop");
  });
});

describe("#addDataToLastTrial", () => {
  test("should add any data properties to the last trial", async () => {
    const jsPsych = initJsPsych();
    const { getData } = await startTimeline(
      [
        {
          type: htmlKeyboardResponse,
          stimulus: "hello",
          on_finish: () => {
            jsPsych.data.addDataToLastTrial({ testA: 1, testB: 2 });
          },
        },
      ],
      jsPsych
    );

    // click through first trial
    await pressKey("a");
    // check data structure
    expect(getData().values()[0]).toEqual(expect.objectContaining({ testA: 1, testB: 2 }));
  });
});

describe("#getLastTrialData", () => {
  test("should return a new DataCollection with only the last trial's data", async () => {
    const jsPsych = initJsPsych();
    await startTimeline(
      [
        { type: htmlKeyboardResponse, stimulus: "hello" },
        { type: htmlKeyboardResponse, stimulus: "world" },
      ],
      jsPsych
    );

    // click through first trial
    await pressKey("a");
    // click through second trial
    await pressKey("a");
    // check data structure
    expect(jsPsych.data.getLastTrialData().select("trial_index").values[0]).toBe(1);
  });
});

describe("#getLastTimelineData", () => {
  test("should return a new DataCollection with only the last timeline's data", async () => {
    const { jsPsych } = await startTimeline([
      {
        timeline: [
          { type: htmlKeyboardResponse, stimulus: "hello" },
          { type: htmlKeyboardResponse, stimulus: "world" },
        ],
      },
      {
        timeline: [
          { type: htmlKeyboardResponse, stimulus: "second" },
          { type: htmlKeyboardResponse, stimulus: "time" },
        ],
      },
    ]);

    // click through all four trials
    for (let i = 0; i < 4; i++) {
      await pressKey("a");
    }
    // check data structure
    expect(jsPsych.data.getLastTimelineData().count()).toBe(2);
    expect(jsPsych.data.getLastTimelineData().select("trial_index").values[0]).toBe(2);
    expect(jsPsych.data.getLastTimelineData().select("trial_index").values[1]).toBe(3);
  });
});

describe("#displayData", () => {
  test("should display in json format", async () => {
    const { jsPsych, getHTML, getData } = await startTimeline([
      { type: htmlKeyboardResponse, stimulus: "hello" },
    ]);

    // click through first trial
    await pressKey("a");
    // display data in json format
    jsPsych.data.displayData("json");
    // check display element HTML
    expect(getHTML()).toBe(
      '<pre id="jspsych-data-display">' + JSON.stringify(getData().values(), null, "\t") + "</pre>"
    );
  });
  test("should display in csv format", async () => {
    const { jsPsych, getHTML } = await startTimeline([
      { type: htmlKeyboardResponse, stimulus: "hello" },
    ]);

    // click through first trial
    await pressKey("a");
    // overwrite data with custom data
    const data = [
      { col1: 1, col2: 2 },
      { col1: 3, col2: 4 },
    ];
    // display data in json format
    jsPsych.data.displayData("csv");
    // check display element HTML
    expect(getHTML()).toMatch(
      /<pre id="jspsych-data-display">"rt","stimulus","response","trial_type","trial_index","plugin_version","time_elapsed"\r\n"[\d]+","hello","a","html-keyboard-response","0","[\d.]+","[\d]+"\r\n<\/pre>/
    );
  });
});
