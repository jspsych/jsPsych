import { clickTarget, startTimeline } from "@jspsych/test-utils";

import surveyHtmlForm from ".";

const TEST_VALUE = "jsPsych";

describe("survey-html-form plugin", () => {
  test("default parameters work correctly", async () => {
    const { displayElement, expectFinished, getData } = await startTimeline([
      {
        type: surveyHtmlForm,
        html: '<p> I am feeling <input name="first" type="text" />, <input name="second" type="text" />, and <input name="third" type="text" />.</p>',
      },
    ]);

    expect(
      displayElement.querySelectorAll('#jspsych-survey-html-form input:not([type="submit"])').length
    ).toBe(3);

    // Provide some test input
    displayElement.querySelectorAll<HTMLInputElement>(
      '#jspsych-survey-html-form input[name="second"]'
    )[0].value = TEST_VALUE;

    clickTarget(document.querySelector("#jspsych-survey-html-form-next"));

    await expectFinished();

    // Check whether data is parsed properly
    const data = getData().values()[0].response;
    expect(data.second).toBe(TEST_VALUE);
  });
});
