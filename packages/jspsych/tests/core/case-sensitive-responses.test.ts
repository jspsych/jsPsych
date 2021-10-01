import htmlKeyboardResponse from "@jspsych/plugin-html-keyboard-response";
import { pressKey, startTimeline } from "@jspsych/test-utils";

describe("case_sensitive_responses parameter", () => {
  test("has a default value of false", async () => {
    const { getHTML, expectFinished } = await startTimeline([
      {
        type: htmlKeyboardResponse,
        stimulus: "foo",
        choices: ["a"],
      },
    ]);

    expect(getHTML()).toMatch("foo");
    pressKey("A");
    await expectFinished();
  });

  test("responses are not case sensitive when set to false", async () => {
    const { getHTML, expectFinished } = await startTimeline(
      [
        {
          type: htmlKeyboardResponse,
          stimulus: "foo",
          choices: ["a"],
        },
      ],
      { case_sensitive_responses: false }
    );

    expect(getHTML()).toMatch("foo");
    pressKey("A");
    await expectFinished();
  });

  test("responses are case sensitive when set to true", async () => {
    const { getHTML, expectFinished } = await startTimeline(
      [
        {
          type: htmlKeyboardResponse,
          stimulus: "foo",
          choices: ["a"],
        },
      ],
      { case_sensitive_responses: true }
    );

    expect(getHTML()).toMatch("foo");
    pressKey("A");
    expect(getHTML()).toMatch("foo");
    pressKey("a");
    await expectFinished();
  });
});
