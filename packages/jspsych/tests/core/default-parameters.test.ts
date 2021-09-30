import surveyText from "@jspsych/plugin-survey-text";
import { startTimeline } from "@jspsych/test-utils";

describe("nested defaults", () => {
  test("work in basic situation", async () => {
    const { displayElement } = await startTimeline([
      {
        type: surveyText,
        questions: [
          {
            prompt: "Question 1.",
          },
          {
            prompt: "Question 2.",
          },
        ],
      },
    ]);

    expect(displayElement.querySelector("input").placeholder).toBe("");
    expect(displayElement.querySelector("input").size).toBe(40);
  });

  test("safe against extending the array.prototype (issue #989)", async () => {
    // @ts-expect-error
    Array.prototype.qq = jest.fn();
    const spy = jest.spyOn(console, "error").mockImplementation();

    const { displayElement } = await startTimeline([
      {
        type: surveyText,
        questions: [
          {
            prompt: "Question 1.",
          },
          {
            prompt: "Question 2.",
          },
        ],
      },
    ]);

    expect(displayElement.querySelector("input").placeholder).toBe("");
    expect(displayElement.querySelector("input").size).toBe(40);

    expect(spy).not.toHaveBeenCalled();

    spy.mockRestore();
  });
});
