import callFunction from "@jspsych/plugin-call-function";
import htmlKeyboardResponse from "@jspsych/plugin-html-keyboard-response";
import { pressKey, startTimeline } from "@jspsych/test-utils";

import { initJsPsych } from "../../src";

describe("randomize order", () => {});

describe("repetitons", () => {});

describe("sampling", () => {
  test("alternate-groups method produces alternating groups", async () => {
    const jsPsych = initJsPsych();

    const { getHTML } = await startTimeline(
      [
        {
          timeline: [
            {
              type: htmlKeyboardResponse,
              stimulus: jsPsych.timelineVariable("stimulus"),
            },
          ],
          timeline_variables: ["a", "a", "b", "b", "c", "c"].map((stimulus) => ({ stimulus })),
          sample: {
            type: "alternate-groups",
            groups: [
              [0, 0, 0, 0, 1, 1, 1, 1],
              [2, 2, 2, 2, 3, 3, 3, 3],
              [4, 4, 4, 4, 5, 5, 5, 5],
            ],
            randomize_group_order: true,
          },
        },
      ],
      jsPsych
    );

    let last = getHTML();
    for (let i = 0; i < 23; i++) {
      await pressKey("a");
      let curr = getHTML();
      expect(last).not.toMatch(curr);
      last = curr;
    }
    await pressKey("a");
  });

  test("sampling functions run when timeline loops", async () => {
    let count = 0;
    const reps = 100;

    const jsPsych = initJsPsych();

    const { getHTML } = await startTimeline(
      [
        {
          timeline: [
            {
              type: htmlKeyboardResponse,
              stimulus: jsPsych.timelineVariable("stimulus"),
            },
          ],
          timeline_variables: ["1", "2", "3"].map((stimulus) => ({ stimulus })),
          sample: {
            type: "without-replacement",
            size: 1,
          },
          loop_function: () => {
            count++;
            return count < reps;
          },
        },
      ],
      jsPsych
    );

    const result1 = [];
    const result2 = [];
    for (let i = 0; i < reps / 2; i++) {
      result1.push(getHTML());
      await pressKey("a");
      result2.push(getHTML());
      await pressKey("a");
    }

    expect(result1).not.toEqual(result2);
  });

  test("fixed repetitions method produces random order", async () => {
    const jsPsych = initJsPsych();
    const seed = jsPsych.randomization.setSeed("jspsych");

    const { expectFinished } = await startTimeline(
      [
        {
          timeline: [
            {
              type: htmlKeyboardResponse,
              stimulus: jsPsych.timelineVariable("stimulus"),
              data: {
                s: jsPsych.timelineVariable("stimulus"),
              },
            },
          ],
          timeline_variables: [{ stimulus: "a" }, { stimulus: "b" }],
          sample: {
            type: "fixed-repetitions",
            size: 5,
          },
        },
      ],
      jsPsych
    );

    for (let i = 0; i < 10; i++) {
      await pressKey("a");
    }

    await expectFinished();

    const order = jsPsych.data.get().select("s").values;
    expect(order).not.toEqual(["a", "b", "a", "b", "a", "b", "a", "b", "a", "b"]);
    const countA = order.filter((s) => s === "a").length;
    const countB = order.filter((s) => s === "b").length;
    expect(countA).toEqual(5);
    expect(countB).toEqual(5);
  });
});

describe("timeline variables are correctly evaluated", () => {
  test("when used as trial type parameter", async () => {
    const jsPsych = initJsPsych();

    const { getHTML } = await startTimeline(
      [
        {
          timeline: [
            {
              type: jsPsych.timelineVariable("type"),
              stimulus: "hello",
            },
          ],
          timeline_variables: [{ type: htmlKeyboardResponse }],
        },
      ],
      jsPsych
    );

    expect(getHTML()).toMatch("hello");
    await pressKey("a");
  });

  test("when used with a plugin that has a FUNCTION parameter type", async () => {
    const jsPsych = initJsPsych();

    const mockFn = jest.fn();

    const { finished } = await startTimeline(
      [
        {
          timeline: [
            {
              type: callFunction,
              func: jsPsych.timelineVariable("fn"),
            },
          ],
          timeline_variables: [{ fn: mockFn }, { fn: mockFn }],
        },
      ],
      jsPsych
    );

    await finished;
    expect(mockFn).toHaveBeenCalledTimes(2);
  });

  test("custom sampling returns correct trials", async () => {
    const jsPsych = initJsPsych();
    await startTimeline(
      [
        {
          timeline: [
            {
              type: htmlKeyboardResponse,
              stimulus: "foo",
              data: {
                id: jsPsych.timelineVariable("id"),
              },
            },
          ],
          timeline_variables: [{ id: 0 }, { id: 1 }, { id: 2 }, { id: 3 }],
          sample: {
            type: "custom",
            fn: () => [2, 0],
          },
        },
      ],
      jsPsych
    );

    await pressKey("a");
    await pressKey("a");
    expect(jsPsych.data.get().select("id").values).toEqual([2, 0]);
  });

  test("custom sampling works with a loop", async () => {
    let reps = 0;
    let sample = 3;

    const jsPsych = initJsPsych();
    await startTimeline(
      [
        {
          timeline: [
            {
              type: htmlKeyboardResponse,
              stimulus: "foo",
              data: {
                id: jsPsych.timelineVariable("id"),
              },
            },
          ],
          timeline_variables: [{ id: 0 }, { id: 1 }, { id: 2 }, { id: 3 }],
          sample: {
            type: "custom",
            fn: () => [sample],
          },
          loop_function: () => {
            reps++;
            if (reps < 4) {
              sample = 3 - reps;
              return true;
            } else {
              return false;
            }
          },
        },
      ],
      jsPsych
    );

    await pressKey("a");
    await pressKey("a");
    await pressKey("a");
    await pressKey("a");
    expect(jsPsych.data.get().select("id").values).toEqual([3, 2, 1, 0]);
  });

  test("when used inside a function", async () => {
    const jsPsych = initJsPsych();
    const { getHTML } = await startTimeline(
      [
        {
          timeline: [
            {
              type: htmlKeyboardResponse,
              stimulus: () => jsPsych.timelineVariable("x"),
            },
          ],
          timeline_variables: [{ x: "foo" }, { x: "bar" }],
        },
      ],
      jsPsych
    );

    expect(getHTML()).toMatch("foo");
    await pressKey("a");
    expect(getHTML()).toMatch("bar");
  });

  test("when used in a conditional_function", async () => {
    let x: string;

    const jsPsych = initJsPsych();
    await startTimeline(
      [
        {
          timeline: [
            {
              type: htmlKeyboardResponse,
              stimulus: "hello world",
            },
          ],
          timeline_variables: [{ x: "foo" }],
          conditional_function: () => {
            x = jsPsych.evaluateTimelineVariable("x");
            return true;
          },
        },
      ],
      jsPsych
    );

    await pressKey("a");
    expect(x).toBe("foo");
  });

  test("when used in a loop_function", async () => {
    let x: string;

    const jsPsych = initJsPsych();
    await startTimeline(
      [
        {
          timeline: [
            {
              type: htmlKeyboardResponse,
              stimulus: "hello world",
            },
          ],
          timeline_variables: [{ x: "foo" }],
          loop_function: () => {
            x = jsPsych.evaluateTimelineVariable("x");
            return false;
          },
        },
      ],
      jsPsych
    );

    await pressKey("a");
    expect(x).toBe("foo");
  });

  test("when used in on_finish", async () => {
    const jsPsych = initJsPsych();
    await startTimeline(
      [
        {
          timeline: [
            {
              type: htmlKeyboardResponse,
              stimulus: "hello world",
              on_finish: (data) => {
                data.x = jsPsych.evaluateTimelineVariable("x");
              },
            },
          ],
          timeline_variables: [{ x: "foo" }],
        },
      ],
      jsPsych
    );

    await pressKey("a");
    expect(jsPsych.data.get().values()[0].x).toBe("foo");
  });

  test("when used in on_start", async () => {
    let x: string;

    const jsPsych = initJsPsych();
    await startTimeline(
      [
        {
          timeline: [
            {
              type: htmlKeyboardResponse,
              stimulus: "hello world",
              on_start: () => {
                x = jsPsych.evaluateTimelineVariable("x");
              },
            },
          ],
          timeline_variables: [{ x: "foo" }],
        },
      ],
      jsPsych
    );

    await pressKey("a");
    expect(x).toBe("foo");
  });

  test("when used in on_load", async () => {
    let x: string;

    const jsPsych = initJsPsych();
    await startTimeline(
      [
        {
          timeline: [
            {
              type: htmlKeyboardResponse,
              stimulus: "hello world",
              on_load: () => {
                x = jsPsych.evaluateTimelineVariable("x");
              },
            },
          ],
          timeline_variables: [{ x: "foo" }],
        },
      ],
      jsPsych
    );

    await pressKey("a");
    expect(x).toBe("foo");
  });
});

// using console.warn instead of error for now. plan is to enable this test with version 8.
test.skip("timelineVariable() throws an error when variable doesn't exist", async () => {
  const jsPsych = initJsPsych();
  const { expectFinished } = await startTimeline(
    [
      {
        timeline: [
          {
            type: htmlKeyboardResponse,
            stimulus: "foo",
            on_start: () => {
              expect(() => jsPsych.evaluateTimelineVariable("c")).toThrowError();
            },
          },
        ],
        timeline_variables: [
          { a: 1, b: 2 },
          { a: 2, b: 3 },
        ],
      },
    ],
    jsPsych
  );

  await pressKey("a");
  await pressKey("a");

  await expectFinished();
});

test("timelineVariable() can fetch a variable called 'data'", async () => {
  const jsPsych = initJsPsych();
  const { expectFinished } = await startTimeline(
    [
      {
        timeline: [
          {
            type: htmlKeyboardResponse,
            stimulus: "foo",
            on_start: () => {
              expect(() => jsPsych.evaluateTimelineVariable("data")).not.toThrowError();
            },
          },
        ],
        timeline_variables: [
          { data: { a: 1 }, b: 2 },
          { data: { a: 2 }, b: 3 },
        ],
      },
    ],
    jsPsych
  );

  await pressKey("a");
  await pressKey("a");

  await expectFinished();
});
