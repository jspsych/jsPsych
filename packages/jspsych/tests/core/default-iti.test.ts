import htmlKeyboardResponse from "@jspsych/plugin-html-keyboard-response";
import { flushPromises, pressKey, startTimeline } from "@jspsych/test-utils";

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
    await pressKey("a");
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
    await pressKey("a");
    expect(getHTML()).not.toMatch("bar");
    jest.advanceTimersByTime(100);
    await flushPromises();
    expect(getHTML()).toMatch("bar");
  });
});
