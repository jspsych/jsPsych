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
});
