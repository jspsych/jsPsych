import { clickTarget, simulateTimeline, startTimeline } from "@jspsych/test-utils";

import surveyText from ".";

const selectInput = (
  inputId: number,
  displayElement: HTMLElement
) => displayElement.querySelector<HTMLInputElement>(`#input-${inputId}`);

jest.useFakeTimers();

describe("survey-text plugin", () => {
  test("default parameters work correctly", async () => {
    const { displayElement, expectFinished } = await startTimeline([
      {
        type: surveyText,
        questions: [{ prompt: "How old are you?" }, { prompt: "Where were you born?" }],
      },
    ]);

    expect(displayElement.querySelectorAll("p.jspsych-survey-text").length).toBe(2);
    expect(selectInput(0, displayElement).size).toBe(40);
    expect(selectInput(1, displayElement).size).toBe(40);

    await clickTarget(displayElement.querySelector("#jspsych-survey-text-next"));

    await expectFinished();
  });

  test("specifying only columns works", async () => {
    const { displayElement, expectFinished } = await startTimeline([
      {
        type: surveyText,
        questions: [
          { prompt: "How old are you?", columns: 50 },
          { prompt: "Where were you born?", columns: 20 },
        ],
      },
    ]);

    expect(displayElement.querySelectorAll("p.jspsych-survey-text").length).toBe(2);
    expect(selectInput(0, displayElement).size).toBe(50);
    expect(selectInput(1, displayElement).size).toBe(20);

    await clickTarget(displayElement.querySelector("#jspsych-survey-text-next"));

    await expectFinished();
  });

  test("required parameter works", async () => {
    const { displayElement, expectFinished } = await startTimeline([
      {
        type: surveyText,
        questions: [
          { prompt: "How old are you?", columns: 50, required: true },
          { prompt: "Where were you born?", columns: 20 },
        ],
      },
    ]);

    expect(displayElement.querySelectorAll("p.jspsych-survey-text").length).toBe(2);
    expect(selectInput(0, displayElement).required).toBe(true);
    expect(selectInput(1, displayElement).required).toBe(false);

    selectInput(0, displayElement).value = "42";
    await clickTarget(displayElement.querySelector("#jspsych-survey-text-next"));
    await expectFinished();
  });

  test("data are logged with the right question when randomize order is true", async () => {
    const { expectFinished, getData, displayElement } = await startTimeline([
      {
        type: surveyText,
        questions: [
          { prompt: "Q0" },
          { prompt: "Q1" },
          { prompt: "Q2" },
          { prompt: "Q3" },
          { prompt: "Q4" },
        ],
        randomize_question_order: true,
      },
    ]);

    selectInput(0, displayElement).value = "a0";
    selectInput(1, displayElement).value = "a1";
    selectInput(2, displayElement).value = "a2";
    selectInput(3, displayElement).value = "a3";
    selectInput(4, displayElement).value = "a4";

    await clickTarget(displayElement.querySelector("#jspsych-survey-text-next"));

    await expectFinished();

    const surveyData = getData().values()[0].response;
    expect(surveyData.Q0).toBe("a0");
    expect(surveyData.Q1).toBe("a1");
    expect(surveyData.Q2).toBe("a2");
    expect(surveyData.Q3).toBe("a3");
    expect(surveyData.Q4).toBe("a4");
  });
});

describe("survey-text simulation", () => {
  test("data-only mode works", async () => {
    const { getData, expectFinished } = await simulateTimeline([
      {
        type: surveyText,
        questions: [{ prompt: "How old are you?" }, { prompt: "Where were you born?" }],
      },
    ]);

    await expectFinished();

    const data = getData().values()[0];

    expect(Object.entries(data.response).length).toBe(2);
  });

  test("visual mode works", async () => {
    const { getData, expectFinished, expectRunning } = await simulateTimeline(
      [
        {
          type: surveyText,
          questions: [{ prompt: "How old are you?" }, { prompt: "Where were you born?" }],
        },
      ],
      "visual"
    );

    await expectRunning();

    jest.runAllTimers();

    await expectFinished();

    const data = getData().values()[0];

    expect(Object.entries(data.response).length).toBe(2);
  });
});
