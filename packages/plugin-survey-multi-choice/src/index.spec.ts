import { clickTarget, simulateTimeline, startTimeline } from "@jspsych/test-utils";

import { initJsPsych } from "jspsych";
import surveyMultiChoice from ".";

jest.useFakeTimers();

const getInputElement = (
  choiceId: number, 
  value: string,
  displayElement: HTMLElement
) =>
  displayElement.querySelector(
    `#jspsych-survey-multi-choice-${choiceId} input[value="${value}"]`
  ) as HTMLInputElement;

describe("survey-multi-choice plugin", () => {
  test("properly ends when has sibling form", async () => {

    const container = document.createElement('div')
    const outerForm = document.createElement('form')
    outerForm.id = 'outer_form'
    container.appendChild(outerForm)
    const innerDiv = document.createElement('div')
    innerDiv.id = 'target_id';
    container.appendChild(innerDiv);
    document.body.appendChild(container)
    const jsPsychInst = initJsPsych({ display_element: innerDiv })
    const options = ["a", "b", "c"];

    const { displayElement, expectFinished } = await startTimeline([
      {
        type: surveyMultiChoice,
        questions: [
          { prompt: "Q0", options },
          { prompt: "Q1", options },
        ]
      },
    ], jsPsychInst);

    getInputElement(0, "a", displayElement).checked = true;
    await clickTarget(displayElement.querySelector("#jspsych-survey-multi-choice-next"));
    await expectFinished();
  })

  test("data are logged with the right question when randomize order is true", async () => {
    var scale = ["a", "b", "c", "d", "e"];
    const { getData, expectFinished, displayElement } = await startTimeline([
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

    getInputElement(0, "a", displayElement).checked = true;
    getInputElement(1, "b", displayElement).checked = true;
    getInputElement(2, "c", displayElement).checked = true;
    getInputElement(3, "d", displayElement).checked = true;
    getInputElement(4, "e", displayElement).checked = true;

    await clickTarget(displayElement.querySelector("#jspsych-survey-multi-choice-next"));

    await expectFinished();

    const surveyData = getData().values()[0].response;
    expect(surveyData.Q0).toBe("a");
    expect(surveyData.Q1).toBe("b");
    expect(surveyData.Q2).toBe("c");
    expect(surveyData.Q3).toBe("d");
    expect(surveyData.Q4).toBe("e");
  });
});

describe("survey-multi-choice plugin simulation", () => {
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
