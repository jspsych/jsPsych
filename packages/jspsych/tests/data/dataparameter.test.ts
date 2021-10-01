import htmlKeyboardResponse from "@jspsych/plugin-html-keyboard-response";
import { pressKey, startTimeline } from "@jspsych/test-utils";

import { initJsPsych } from "../../src";

describe("The data parameter", () => {
  test("should record data to a trial", async () => {
    const { finished, getData } = await startTimeline([
      {
        type: htmlKeyboardResponse,
        stimulus: "hello",
        data: { added: true },
      },
    ]);

    pressKey("a");
    await finished;

    expect(getData().values()[0].added).toBe(true);
  });

  test("should record data to all nested trials", async () => {
    const { finished, getData } = await startTimeline([
      {
        type: htmlKeyboardResponse,
        timeline: [{ stimulus: "a" }, { stimulus: "b" }],
        data: { added: true },
      },
    ]);

    pressKey("a");
    pressKey("a");
    await finished;

    expect(getData().filter({ added: true }).count()).toBe(2);
  });

  test("should record data to all nested trials with timeline variables", async () => {
    const jsPsych = initJsPsych();
    const { finished, getData } = await startTimeline(
      [
        {
          timeline: [
            { type: htmlKeyboardResponse, stimulus: jsPsych.timelineVariable("stimulus") },
          ],
          timeline_variables: [{ stimulus: "a" }, { stimulus: "b" }],
          data: { added: true },
        },
      ],
      jsPsych
    );

    pressKey("a");
    pressKey("a");
    await finished;

    expect(getData().filter({ added: true }).count()).toBe(2);
  });

  test("should work as timeline variable at root level", async () => {
    const jsPsych = initJsPsych();
    const { getData } = await startTimeline(
      [
        {
          timeline: [
            { type: htmlKeyboardResponse, stimulus: "foo", data: jsPsych.timelineVariable("d") },
          ],
          timeline_variables: [{ d: { added: true } }, { d: { added: false } }],
        },
      ],
      jsPsych
    );

    pressKey("a"); // trial 1
    pressKey("a"); // trial 2

    expect(getData().filter({ added: true }).count()).toBe(1);
    expect(getData().filter({ added: false }).count()).toBe(1);
  });

  test("should work as timeline variable at nested level", async () => {
    const jsPsych = initJsPsych();
    const { getData } = await startTimeline(
      [
        {
          timeline: [
            {
              type: htmlKeyboardResponse,
              stimulus: "foo",
              data: { added: jsPsych.timelineVariable("added") },
            },
          ],
          timeline_variables: [{ added: true }, { added: false }],
        },
      ],
      jsPsych
    );

    pressKey("a"); // trial 1
    pressKey("a"); // trial 2

    expect(getData().filter({ added: true }).count()).toBe(1);
    expect(getData().filter({ added: false }).count()).toBe(1);
  });

  test("timeline variable should be available in trial on_finish", async () => {
    const jsPsych = initJsPsych();
    const { getData } = await startTimeline(
      [
        {
          timeline: [
            {
              type: htmlKeyboardResponse,
              stimulus: "foo",
              data: { added: jsPsych.timelineVariable("added") },
              on_finish: (data) => {
                data.added_copy = data.added;
              },
            },
          ],
          timeline_variables: [{ added: true }, { added: false }],
        },
      ],
      jsPsych
    );

    pressKey("a"); // trial 1
    pressKey("a"); // trial 2

    expect(getData().filter({ added_copy: true }).count()).toBe(1);
    expect(getData().filter({ added_copy: false }).count()).toBe(1);
  });

  test("should record data to all nested trials with timeline variables even when nested trials have own data", async () => {
    const jsPsych = initJsPsych();
    const { finished, getData } = await startTimeline(
      [
        {
          timeline: [
            {
              type: htmlKeyboardResponse,
              stimulus: jsPsych.timelineVariable("stimulus"),
              data: { foo: 1 },
            },
          ],
          timeline_variables: [{ stimulus: "a" }, { stimulus: "b" }],
          data: { added: true },
        },
      ],
      jsPsych
    );

    pressKey("a");
    pressKey("a");
    await finished;

    expect(getData().filter({ added: true, foo: 1 }).count()).toBe(2);
  });

  test("should accept a function as a parameter", async () => {
    const { finished, getData } = await startTimeline([
      {
        type: htmlKeyboardResponse,
        stimulus: "foo",
        data: {
          a: () => 1,
        },
      },
    ]);

    pressKey("a");
    await finished;

    expect(getData().values()[0].a).toBe(1);
  });
});
