import surveyText from "@jspsych/plugin-survey-text";
import { startTimeline } from "@jspsych/test-utils";

import jsPsychTestComplex from "./test-complex-plugin";

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

describe("defaults for COMPLEX parameters", () => {
  test("default at the top level should work", async () => {
    const { expectFinished, getData } = await startTimeline([
      {
        type: jsPsychTestComplex,
      },
    ]);

    await expectFinished();

    expect(getData().values()[0].blocks).toEqual([
      { x: 10, y: 10 },
      { x: 20, y: 20 },
      { x: 30, y: 30 },
    ]);
  });
});
