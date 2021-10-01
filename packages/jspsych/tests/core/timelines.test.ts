import htmlKeyboardResponse from "@jspsych/plugin-html-keyboard-response";
import { pressKey, startTimeline } from "@jspsych/test-utils";

import { initJsPsych } from "../../src";

describe("loop function", () => {
  test("repeats a timeline when returns true", async () => {
    let count = 0;

    const trial = {
      timeline: [{ type: htmlKeyboardResponse, stimulus: "foo" }],
      loop_function: () => {
        if (count < 1) {
          count++;
          return true;
        } else {
          return false;
        }
      },
    };

    const { jsPsych } = await startTimeline([trial]);

    // first trial
    pressKey("a");
    expect(jsPsych.data.get().count()).toBe(1);

    // second trial
    pressKey("a");
    expect(jsPsych.data.get().count()).toBe(2);
  });

  test("does not repeat when returns false", async () => {
    const { jsPsych } = await startTimeline([
      {
        timeline: [
          {
            type: htmlKeyboardResponse,
            stimulus: "foo",
          },
        ],
        loop_function: () => false,
      },
    ]);

    // first trial
    pressKey("a");
    expect(jsPsych.data.get().count()).toBe(1);

    // second trial
    pressKey("a");
    expect(jsPsych.data.get().count()).toBe(1);
  });

  test("gets the data from the most recent iteration", async () => {
    let data_count = [];
    let count = 0;

    const { jsPsych } = await startTimeline([
      {
        timeline: [
          {
            type: htmlKeyboardResponse,
            stimulus: "foo",
          },
        ],
        loop_function: (data) => {
          data_count.push(data.count());
          if (count < 2) {
            count++;
            return true;
          } else {
            return false;
          }
        },
      },
    ]);

    // first trial
    pressKey("a");

    // second trial
    pressKey("a");

    // third trial
    pressKey("a");

    expect(data_count).toEqual([1, 1, 1]);
    expect(jsPsych.data.get().count()).toBe(3);
  });

  test("timeline variables from nested timelines are available in loop function", async () => {
    let counter = 0;

    const jsPsych = initJsPsych();
    const { getHTML } = await startTimeline(
      [
        {
          timeline: [
            {
              type: htmlKeyboardResponse,
              stimulus: jsPsych.timelineVariable("word"),
            },
            {
              timeline: [
                {
                  type: htmlKeyboardResponse,
                  stimulus: "foo",
                },
              ],
              loop_function: () => {
                if (jsPsych.timelineVariable("word") == "b" && counter < 2) {
                  counter++;
                  return true;
                } else {
                  counter = 0;
                  return false;
                }
              },
            },
          ],
          timeline_variables: [{ word: "a" }, { word: "b" }, { word: "c" }],
        },
      ],
      jsPsych
    );

    expect(getHTML()).toMatch("a");
    pressKey("a");
    expect(getHTML()).toMatch("foo");
    pressKey("a");
    expect(getHTML()).toMatch("b");
    pressKey("a");
    expect(getHTML()).toMatch("foo");
    pressKey("a");
    expect(getHTML()).toMatch("foo");
    pressKey("a");
    expect(getHTML()).toMatch("foo");
    pressKey("a");
    expect(getHTML()).toMatch("c");
    pressKey("a");
    expect(getHTML()).toMatch("foo");
    pressKey("a");
  });

  test("only runs once when timeline variables are used", async () => {
    let count = 0;

    await startTimeline([
      {
        timeline: [
          {
            type: htmlKeyboardResponse,
            stimulus: "foo",
          },
        ],
        timeline_variables: [{ a: 1 }, { a: 2 }],
        loop_function: () => {
          count++;
          return false;
        },
      },
    ]);

    // first trial
    pressKey("a");
    expect(count).toBe(0);

    // second trial
    pressKey("a");
    expect(count).toBe(1);
  });
});

describe("conditional function", () => {
  test("skips the timeline when returns false", async () => {
    const conditional = {
      timeline: [
        {
          type: htmlKeyboardResponse,
          stimulus: "foo",
        },
      ],
      conditional_function: () => false,
    };

    const trial = {
      type: htmlKeyboardResponse,
      stimulus: "bar",
    };

    const { getHTML } = await startTimeline([conditional, trial]);

    expect(getHTML()).toMatch("bar");

    // clear
    pressKey("a");
  });

  test("completes the timeline when returns true", async () => {
    const conditional = {
      timeline: [
        {
          type: htmlKeyboardResponse,
          stimulus: "foo",
        },
      ],
      conditional_function: () => {
        return true;
      },
    };

    const trial = {
      type: htmlKeyboardResponse,
      stimulus: "bar",
    };

    const { getHTML } = await startTimeline([conditional, trial]);

    expect(getHTML()).toMatch("foo");

    // next
    pressKey("a");

    expect(getHTML()).toMatch("bar");

    // clear
    pressKey("a");
  });

  test("executes on every loop of the timeline", async () => {
    let count = 0;
    let conditional_count = 0;

    await startTimeline([
      {
        timeline: [
          {
            type: htmlKeyboardResponse,
            stimulus: "foo",
          },
        ],
        loop_function: () => {
          if (count < 1) {
            count++;
            return true;
          } else {
            return false;
          }
        },
        conditional_function: () => {
          conditional_count++;
          return true;
        },
      },
    ]);

    expect(conditional_count).toBe(1);

    // first trial
    pressKey("a");

    expect(conditional_count).toBe(2);

    // second trial
    pressKey("a");

    expect(conditional_count).toBe(2);
  });

  test("executes only once even when repetitions is > 1", async () => {
    let conditional_count = 0;

    await startTimeline([
      {
        timeline: [
          {
            type: htmlKeyboardResponse,
            stimulus: "foo",
          },
        ],
        repetitions: 2,
        conditional_function: () => {
          conditional_count++;
          return true;
        },
      },
    ]);

    expect(conditional_count).toBe(1);

    // first trial
    pressKey("a");

    expect(conditional_count).toBe(1);

    // second trial
    pressKey("a");

    expect(conditional_count).toBe(1);
  });

  test("executes only once when timeline variables are used", async () => {
    let conditional_count = 0;

    await startTimeline([
      {
        timeline: [
          {
            type: htmlKeyboardResponse,
            stimulus: "foo",
          },
        ],
        timeline_variables: [{ a: 1 }, { a: 2 }],
        conditional_function: () => {
          conditional_count++;
          return true;
        },
      },
    ]);

    expect(conditional_count).toBe(1);

    // first trial
    pressKey("a");

    expect(conditional_count).toBe(1);

    // second trial
    pressKey("a");

    expect(conditional_count).toBe(1);
  });

  test("timeline variables from nested timelines are available", async () => {
    const jsPsych = initJsPsych();
    const { getHTML } = await startTimeline(
      [
        {
          timeline: [
            {
              type: htmlKeyboardResponse,
              stimulus: jsPsych.timelineVariable("word"),
            },
            {
              timeline: [
                {
                  type: htmlKeyboardResponse,
                  stimulus: "foo",
                },
              ],
              conditional_function: () => {
                if (jsPsych.timelineVariable("word") == "b") {
                  return false;
                } else {
                  return true;
                }
              },
            },
          ],
          timeline_variables: [{ word: "a" }, { word: "b" }, { word: "c" }],
        },
      ],
      jsPsych
    );

    expect(getHTML()).toMatch("a");
    pressKey("a");
    expect(getHTML()).toMatch("foo");
    pressKey("a");
    expect(getHTML()).toMatch("b");
    pressKey("a");
    expect(getHTML()).toMatch("c");
    pressKey("a");
    expect(getHTML()).toMatch("foo");
    pressKey("a");
  });
});

describe("endCurrentTimeline", () => {
  test("stops the current timeline, skipping to the end after the trial completes", async () => {
    const jsPsych = initJsPsych();
    const { getHTML } = await startTimeline(
      [
        {
          timeline: [
            {
              type: htmlKeyboardResponse,
              stimulus: "foo",
              on_finish: () => {
                jsPsych.endCurrentTimeline();
              },
            },
            {
              type: htmlKeyboardResponse,
              stimulus: "bar",
            },
          ],
        },
        {
          type: htmlKeyboardResponse,
          stimulus: "woo",
        },
      ],
      jsPsych
    );

    expect(getHTML()).toMatch("foo");
    pressKey("a");
    expect(getHTML()).toMatch("woo");
    pressKey("a");
  });

  test("works inside nested timelines", async () => {
    const jsPsych = initJsPsych();
    const { getHTML } = await startTimeline(
      [
        {
          timeline: [
            {
              timeline: [
                {
                  type: htmlKeyboardResponse,
                  stimulus: "foo",
                  on_finish: () => {
                    jsPsych.endCurrentTimeline();
                  },
                },
                {
                  type: htmlKeyboardResponse,
                  stimulus: "skip me!",
                },
              ],
            },
            {
              type: htmlKeyboardResponse,
              stimulus: "bar",
            },
          ],
        },
        {
          type: htmlKeyboardResponse,
          stimulus: "woo",
        },
      ],
      jsPsych
    );

    expect(getHTML()).toMatch("foo");

    pressKey("a");

    expect(getHTML()).toMatch("bar");

    pressKey("a");

    expect(getHTML()).toMatch("woo");

    pressKey("a");
  });
});

describe("nested timelines", () => {
  test("works without other parameters", async () => {
    const { getHTML } = await startTimeline([
      {
        timeline: [
          {
            type: htmlKeyboardResponse,
            stimulus: "foo",
          },
          {
            type: htmlKeyboardResponse,
            stimulus: "bar",
          },
        ],
      },
    ]);

    expect(getHTML()).toMatch("foo");
    pressKey("a");
    expect(getHTML()).toMatch("bar");
    pressKey("a");
  });
});

describe("add node to end of timeline", () => {
  test("adds node to end of timeline", async () => {
    const jsPsych = initJsPsych();
    const { getHTML } = await startTimeline(
      [
        {
          type: htmlKeyboardResponse,
          stimulus: "foo",
          on_start: () => {
            jsPsych.addNodeToEndOfTimeline({
              timeline: [{ type: htmlKeyboardResponse, stimulus: "bar" }],
            });
          },
        },
      ],
      jsPsych
    );

    expect(getHTML()).toMatch("foo");
    pressKey("a");
    expect(getHTML()).toMatch("bar");
    pressKey("a");
  });
});
