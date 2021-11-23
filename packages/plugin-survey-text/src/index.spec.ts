import { clickTarget, simulateTimeline, startTimeline } from "@jspsych/test-utils";

import surveyText from ".";

const selectInput = (selector: string) => document.querySelector<HTMLInputElement>(selector);

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
    expect(selectInput("#input-0").size).toBe(40);
    expect(selectInput("#input-1").size).toBe(40);

    clickTarget(document.querySelector("#jspsych-survey-text-next"));

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
    expect(selectInput("#input-0").size).toBe(50);
    expect(selectInput("#input-1").size).toBe(20);

    clickTarget(document.querySelector("#jspsych-survey-text-next"));

    await expectFinished();
  });

  test("required parameter works", async () => {
    const { displayElement } = await startTimeline([
      {
        type: surveyText,
        questions: [
          { prompt: "How old are you?", columns: 50, required: true },
          { prompt: "Where were you born?", columns: 20 },
        ],
      },
    ]);

    expect(displayElement.querySelectorAll("p.jspsych-survey-text").length).toBe(2);
    expect(selectInput("#input-0").required).toBe(true);
    expect(selectInput("#input-1").required).toBe(false);
  });

  test("data are logged with the right question when randomize order is true", async () => {
    const { expectFinished, getData } = await startTimeline([
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

    selectInput("#input-0").value = "a0";
    selectInput("#input-1").value = "a1";
    selectInput("#input-2").value = "a2";
    selectInput("#input-3").value = "a3";
    selectInput("#input-4").value = "a4";

    clickTarget(document.querySelector("#jspsych-survey-text-next"));

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
