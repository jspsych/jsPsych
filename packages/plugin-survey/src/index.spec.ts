import { clickTarget, startTimeline } from "@jspsych/test-utils";

import survey from ".";

describe("survey plugin", () => {
  test("loads", async () => {
    const survey_json = {
      pages: [
        {
          name: "page1",
          elements: [
            {
              type: "text",
              name: "question1",
              title: "Question 1",
            },
            {
              type: "ranking",
              name: "question2",
              title: "Question 2",
              choices: ["Item 1", "Item 2", "Item 3"],
            },
          ],
        },
      ],
    };

    const { displayElement, expectRunning, getData } = await startTimeline([
      {
        type: survey,
        survey_json: survey_json,
      },
    ]);

    await expectRunning();
  });

  test("works with empty JSON and a survey function", async () => {
    const survey_function = (survey) => {
      const page = survey.addNewPage("DynamicExample");
      const radio_question = page.addNewQuestion("radiogroup", "radio_question");
      radio_question.title = "Example question.";
      radio_question.choices = [
        { value: 1, text: "Option 1" },
        { value: 2, text: "Option 2" },
      ];
    };

    const { displayElement, expectRunning, expectFinished, getData } = await startTimeline([
      {
        type: survey,
        survey_function: survey_function,
      },
    ]);

    await expectRunning();

    const complete_button = displayElement.querySelector(
      'input[type="button"].sd-navigation__complete-btn'
    );
    expect(complete_button).not.toBeNull();
    clickTarget(complete_button);
    await expectFinished();
  });
});
