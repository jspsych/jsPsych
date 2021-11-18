import { clickTarget, simulateTimeline, startTimeline } from "@jspsych/test-utils";

import surveyMultiChoice from ".";

jest.useFakeTimers();

const getInputElement = (choiceId: number, value: string) =>
  document.querySelector(
    `#jspsych-survey-multi-choice-${choiceId} input[value="${value}"]`
  ) as HTMLInputElement;

describe("survey-multi-choice plugin", () => {
  test("data are logged with the right question when randomize order is true", async () => {
    var scale = ["a", "b", "c", "d", "e"];
    const { getData, expectFinished } = await startTimeline([
      {
        type: surveyMultiChoice,
        questions: [
          { prompt: "Q0", options: scale },
          { prompt: "Q1", options: scale },
          { prompt: "Q2", options: scale },
          { prompt: "Q3", options: scale },
          { prompt: "Q4", options: scale },
        ],
        randomize_question_order: true,
      },
    ]);

    getInputElement(0, "a").checked = true;
    getInputElement(1, "b").checked = true;
    getInputElement(2, "c").checked = true;
    getInputElement(3, "d").checked = true;
    getInputElement(4, "e").checked = true;

    clickTarget(document.querySelector("#jspsych-survey-multi-choice-next"));

    await expectFinished();

    const surveyData = getData().values()[0].response;
    expect(surveyData.Q0).toBe("a");
    expect(surveyData.Q1).toBe("b");
    expect(surveyData.Q2).toBe("c");
    expect(surveyData.Q3).toBe("d");
    expect(surveyData.Q4).toBe("e");
  });
});

describe("survey-likert plugin simulation", () => {
  test("data-only mode works", async () => {
    const scale = ["a", "b", "c", "d", "e"];
    const { getData, expectFinished } = await simulateTimeline([
      {
        type: surveyMultiChoice,
        questions: [
          { prompt: "Q0", options: scale },
          { prompt: "Q1", options: scale },
          { prompt: "Q2", options: scale },
          { prompt: "Q3", options: scale },
          { prompt: "Q4", options: scale },
        ],
        randomize_question_order: true,
      },
    ]);

    await expectFinished();

    const surveyData = getData().values()[0].response;
    const all_valid = Object.entries(surveyData).every((x) => {
      return scale.includes(x[1] as string);
    });
    expect(all_valid).toBe(true);
  });

  test("visual mode works", async () => {
    const scale = ["a", "b", "c", "d", "e"];
    const { getData, expectFinished, expectRunning } = await simulateTimeline(
      [
        {
          type: surveyMultiChoice,
          questions: [
            { prompt: "Q0", options: scale },
            { prompt: "Q1", options: scale },
            { prompt: "Q2", options: scale },
            { prompt: "Q3", options: scale },
            { prompt: "Q4", options: scale },
          ],
          randomize_question_order: true,
        },
      ],
      "visual"
    );

    await expectRunning();

    jest.runAllTimers();

    await expectFinished();

    const surveyData = getData().values()[0].response;
    const all_valid = Object.entries(surveyData).every((x) => {
      return scale.includes(x[1] as string);
    });
    expect(all_valid).toBe(true);
  });
});
