// import surveyText from "@jspsych/plugin-survey-text";

import { startTimeline } from "../utils";

describe("nested defaults", () => {
  test.skip("work in basic situation", async () => {
    const { displayElement } = await startTimeline([
      {
        // @ts-ignore TODO enable this test once the plugin is a class
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

  test.skip("safe against extending the array.prototype (issue #989)", async () => {
    // @ts-expect-error
    Array.prototype.qq = jest.fn();
    const spy = jest.spyOn(console, "error").mockImplementation();

    const { displayElement } = await startTimeline([
      {
        // @ts-ignore TODO enable this test once the plugin is a class
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
