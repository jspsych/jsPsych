import { clickTarget, startTimeline } from "@jspsych/test-utils";

import surveyMultiChoice from ".";

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
