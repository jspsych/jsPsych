import htmlKeyboardResponse from "@jspsych/plugin-html-keyboard-response";
import { flushPromises, pressKey, startTimeline } from "@jspsych/test-utils";

import { initJsPsych } from "../../src";

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

test("if on_finish returns a Promise, wait for resolve before showing end message", async () => {
  let resolve_end_experiment;

  const jsPsych = initJsPsych({
    on_finish: () => {
      return new Promise((resolve, reject) => {
        resolve_end_experiment = resolve;
      });
    },
  });

  const timeline = [
    {
      type: htmlKeyboardResponse,
      stimulus: "foo",
      on_finish: () => {
        jsPsych.endExperiment("done");
      },
    },
    {
      type: htmlKeyboardResponse,
      stimulus: "bar",
    },
  ];

  const { getHTML, expectFinished, expectRunning } = await startTimeline(timeline, jsPsych);

  expect(getHTML()).toMatch("foo");
  pressKey("a");
  expect(getHTML()).not.toMatch("foo");
  expect(getHTML()).not.toMatch("bar");

  await expectRunning();

  expect(getHTML()).not.toMatch("done");
  resolve_end_experiment();

  await flushPromises();

  expect(getHTML()).toMatch("done");

  await expectFinished();
});
