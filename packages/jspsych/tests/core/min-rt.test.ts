import htmlKeyboardResponse from "@jspsych/plugin-html-keyboard-response";
import { pressKey, startTimeline } from "@jspsych/test-utils";

jest.useFakeTimers();

describe("minimum_valid_rt parameter", () => {
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

  test("correctly prevents fast responses when set", async () => {
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
      { minimum_valid_rt: 100 }
    );

    expect(getHTML()).toMatch("foo");
    pressKey("a");
    expect(getHTML()).toMatch("foo");

    jest.advanceTimersByTime(100);

    pressKey("a");
    expect(getHTML()).toMatch("bar");
  });
});
