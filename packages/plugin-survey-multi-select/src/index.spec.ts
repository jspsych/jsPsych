import { clickTarget, simulateTimeline, startTimeline } from "@jspsych/test-utils";

import surveyMultiSelect from ".";

jest.useFakeTimers();

const getInputElement = (selectId: number, value: string) =>
  document.querySelector(
    `#jspsych-survey-multi-select-${selectId} input[value="${value}"]`
  ) as HTMLInputElement;

describe("survey-multi-select plugin", () => {
  test("quoted values for options work", async () => {
    const { displayElement, expectFinished } = await startTimeline([
      {
        type: surveyMultiSelect,
        questions: [
          {
            prompt: "foo",
            options: ['Hello "boo"', "yes, 'bar'"],
          },
        ],
      },
    ]);

    expect(
      displayElement.querySelector<HTMLInputElement>(
        "#jspsych-survey-multi-select-option-0-0 input"
      ).value
    ).toBe('Hello "boo"');
    expect(
      displayElement.querySelector<HTMLInputElement>(
        "#jspsych-survey-multi-select-option-0-1 input"
      ).value
    ).toBe("yes, 'bar'");

    displayElement
      .querySelector("#jspsych-survey-multi-select-form")
      .dispatchEvent(new Event("submit"));

    await expectFinished();
  });

  test("data are logged with the right question when randomize order is true", async () => {
    const scale = ["a", "b", "c", "d", "e"];
    const { expectFinished, getData } = await startTimeline([
      {
        type: surveyMultiSelect,
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

    clickTarget(document.querySelector("#jspsych-survey-multi-select-next"));

    await expectFinished();

    const surveyData = getData().values()[0].response;
    expect(surveyData.Q0[0]).toBe("a");
    expect(surveyData.Q1[0]).toBe("b");
    expect(surveyData.Q2[0]).toBe("c");
    expect(surveyData.Q3[0]).toBe("d");
    expect(surveyData.Q4[0]).toBe("e");
  });
});

describe("survey-likert plugin simulation", () => {
  test("data-only mode works", async () => {
    const scale = ["a", "b", "c", "d", "e"];
    const { getData, expectFinished } = await simulateTimeline([
      {
        type: surveyMultiSelect,
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
    const responses = Object.entries(surveyData);
    for (const r of responses) {
      expect(scale).toEqual(expect.arrayContaining(r[1] as []));
    }
  });

  test("visual mode works", async () => {
    const scale = ["a", "b", "c", "d", "e"];
    const { getData, expectFinished, expectRunning } = await simulateTimeline(
      [
        {
          type: surveyMultiSelect,
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
    const responses = Object.entries(surveyData);
    for (const r of responses) {
      expect(scale).toEqual(expect.arrayContaining(r[1] as []));
    }
  });
});
