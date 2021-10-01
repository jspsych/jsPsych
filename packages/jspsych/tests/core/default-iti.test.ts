import { jest } from "@jest/globals";
import htmlKeyboardResponse from "@jspsych/plugin-html-keyboard-response";
import { pressKey, startTimeline } from "@jspsych/test-utils";

jest.useFakeTimers();

describe("default iti parameter", () => {
  test("has a default value of 0", async () => {
    const { getHTML } = await startTimeline([
      {
        type: htmlKeyboardResponse,
        stimulus: "foo",
      },
      {
        type: htmlKeyboardResponse,
        stimulus: "bar",
      },
    ]);

    expect(getHTML()).toMatch("foo");
    pressKey("a");
    expect(getHTML()).toMatch("bar");
  });

  test("creates a correct delay when set", async () => {
    const { getHTML } = await startTimeline(
      [
        {
          type: htmlKeyboardResponse,
          stimulus: "foo",
        },
        {
          type: htmlKeyboardResponse,
          stimulus: "bar",
        },
      ],
      { default_iti: 100 }
    );

    expect(getHTML()).toMatch("foo");
    expect(getHTML()).not.toMatch("bar");
    pressKey("a");
    jest.advanceTimersByTime(100);
    expect(getHTML()).toMatch("bar");
  });
});
