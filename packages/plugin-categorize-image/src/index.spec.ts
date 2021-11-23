import { pressKey, simulateTimeline, startTimeline } from "@jspsych/test-utils";

import categorizeImage from ".";

jest.useFakeTimers();

describe("categorize-image plugin", () => {
  test("basic functionality works", async () => {
    const { getHTML, expectFinished } = await startTimeline([
      {
        type: categorizeImage,
        stimulus: "FOO.png",
        key_answer: "d",
        choices: ["p", "d"],
      },
    ]);

    expect(getHTML()).toMatch("FOO.png");
    pressKey("d");
    expect(getHTML()).toMatch("Correct");
    jest.advanceTimersByTime(2000);

    await expectFinished();
  });
});

describe("categorize-html plugin simulation", () => {
  test("data-only mode works", async () => {
    const { getData, expectFinished } = await simulateTimeline([
      {
        type: categorizeImage,
        stimulus: "FOO.png",
        key_answer: "d",
        choices: ["p", "d"],
      },
    ]);
    await expectFinished();

    const data = getData().values()[0];

    expect(["p", "d"].includes(data.response)).toBe(true);
    expect(data.correct).toBe(data.response == "d");
  });

  test("visual mode works", async () => {
    const { getData, expectRunning, expectFinished } = await simulateTimeline(
      [
        {
          type: categorizeImage,
          stimulus: "FOO.png",
          key_answer: "d",
          choices: ["p", "d"],
        },
      ],
      "visual"
    );
    await expectRunning();

    jest.runAllTimers();

    await expectFinished();

    const data = getData().values()[0];

    expect(["p", "d"].includes(data.response)).toBe(true);
    expect(data.correct).toBe(data.response == "d");
  });
});
