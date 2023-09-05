import { clickTarget, simulateTimeline, startTimeline } from "@jspsych/test-utils";

import surveyLikert from ".";

jest.useFakeTimers();

const selectInput = (name: string, value: string) =>
  document.querySelector(`input[name="${name}"][value="${value}"]`) as HTMLInputElement;

describe("survey-likert plugin", () => {
  test("data are logged with the right question when randomize order is true", async () => {
    const scale = ["a", "b", "c", "d", "e"];
    const { getData, expectFinished } = await startTimeline([
      {
        type: surveyLikert,
        questions: [
          { prompt: "Q0", labels: scale },
          { prompt: "Q1", labels: scale },
          { prompt: "Q2", labels: scale },
          { prompt: "Q3", labels: scale },
          { prompt: "Q4", labels: scale },
        ],
        randomize_question_order: true,
      },
    ]);

    selectInput("Q0", "0").checked = true;
    selectInput("Q1", "1").checked = true;
    selectInput("Q2", "2").checked = true;
    selectInput("Q3", "3").checked = true;
    selectInput("Q4", "4").checked = true;

    clickTarget(document.querySelector("#jspsych-survey-likert-next"));

    await expectFinished();

    const surveyData = getData().values()[0].response;
    expect(surveyData.Q0).toEqual(0);
    expect(surveyData.Q1).toEqual(1);
    expect(surveyData.Q2).toEqual(2);
    expect(surveyData.Q3).toEqual(3);
    expect(surveyData.Q4).toEqual(4);
  });
});

describe("survey-likert plugin simulation", () => {
  test("data-only mode works", async () => {
    const scale = ["a", "b", "c", "d", "e"];
    const { getData, expectFinished } = await simulateTimeline([
      {
        type: surveyLikert,
        questions: [
          { prompt: "Q0", labels: scale },
          { prompt: "Q1", labels: scale },
          { prompt: "Q2", labels: scale },
          { prompt: "Q3", labels: scale },
          { prompt: "Q4", labels: scale },
        ],
        randomize_question_order: true,
      },
    ]);

    await expectFinished();

    const surveyData = getData().values()[0].response as Record<string, number>;
    const all_valid = Object.entries(surveyData).every((x) => {
      return x[1] <= 4 && x[1] >= 0;
    });
    expect(all_valid).toBe(true);
  });

  test("visual mode works", async () => {
    const scale = ["a", "b", "c", "d", "e"];
    const { getData, expectFinished, expectRunning } = await simulateTimeline(
      [
        {
          type: surveyLikert,
          questions: [
            { prompt: "Q0", labels: scale },
            { prompt: "Q1", labels: scale },
            { prompt: "Q2", labels: scale },
            { prompt: "Q3", labels: scale },
            { prompt: "Q4", labels: scale },
          ],
          randomize_question_order: true,
        },
      ],
      "visual"
    );

    await expectRunning();

    jest.runAllTimers();

    await expectFinished();

    const surveyData = getData().values()[0].response as Record<string, number>;
    const all_valid = Object.entries(surveyData).every((x) => {
      return x[1] <= 4 && x[1] >= 0;
    });
    expect(all_valid).toBe(true);
  });
});
