import { clickTarget, simulateTimeline, startTimeline } from "@jspsych/test-utils";

import surveyLikert from ".";

jest.useFakeTimers();

const selectInput = (name: string, value: string, displayElement: HTMLElement) =>
  displayElement.querySelector(`input[name="${name}"][value="${value}"]`) as HTMLInputElement;

describe("survey-likert plugin", () => {
  test("data are logged with the right question when randomize order is true", async () => {
    const scale = ["a", "b", "c", "d", "e"];
    const { getData, expectFinished, displayElement } = await startTimeline([
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

    selectInput("Q0", "0", displayElement).checked = true;
    selectInput("Q1", "1", displayElement).checked = true;
    selectInput("Q2", "2", displayElement).checked = true;
    selectInput("Q3", "3", displayElement).checked = true;
    selectInput("Q4", "4", displayElement).checked = true;

    await clickTarget(displayElement.querySelector("#jspsych-survey-likert-next"));

    await expectFinished();

    const surveyData = getData().values()[0].response;
    expect(surveyData.Q0).toEqual(0);
    expect(surveyData.Q1).toEqual(1);
    expect(surveyData.Q2).toEqual(2);
    expect(surveyData.Q3).toEqual(3);
    expect(surveyData.Q4).toEqual(4);
  });

  test("default_response options are pre-selected correctly", async () => {
    const scale = ["a", "b", "c", "d", "e"];
    const { displayElement } = await startTimeline([
      {
        type: surveyLikert,
        questions: [
          { prompt: "Q0", labels: scale, default_response: 2 },
          { prompt: "Q1", labels: scale, default_response: 0 },
          { prompt: "Q2", labels: scale, default_response: 4 },
          { prompt: "Q3", labels: scale }, // No default
        ],
        randomize_question_order: false,
      },
    ]);

    // Check correct radio buttons are pre-selected
    expect(selectInput("Q0", "2", displayElement).checked).toBe(true);
    expect(selectInput("Q1", "0", displayElement).checked).toBe(true);
    expect(selectInput("Q2", "4", displayElement).checked).toBe(true);

    // Check other options are NOT selected
    expect(selectInput("Q0", "0", displayElement).checked).toBe(false);
    expect(selectInput("Q0", "1", displayElement).checked).toBe(false);
    expect(selectInput("Q1", "1", displayElement).checked).toBe(false);
    expect(selectInput("Q2", "0", displayElement).checked).toBe(false);

    // Check question without default has no selection
    expect(selectInput("Q3", "0", displayElement).checked).toBe(false);
    expect(selectInput("Q3", "1", displayElement).checked).toBe(false);
    expect(selectInput("Q3", "2", displayElement).checked).toBe(false);
    expect(selectInput("Q3", "3", displayElement).checked).toBe(false);
    expect(selectInput("Q3", "4", displayElement).checked).toBe(false);
  });

  test("default_response null does not pre-select anything", async () => {
    const scale = ["a", "b", "c"];
    const { displayElement } = await startTimeline([
      {
        type: surveyLikert,
        questions: [{ prompt: "Q0", labels: scale, default_response: null }],
        randomize_question_order: false,
      },
    ]);

    // Check that no options are pre-selected
    expect(selectInput("Q0", "0", displayElement).checked).toBe(false);
    expect(selectInput("Q0", "1", displayElement).checked).toBe(false);
    expect(selectInput("Q0", "2", displayElement).checked).toBe(false);
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
