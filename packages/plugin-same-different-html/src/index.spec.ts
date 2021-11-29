import { pressKey, simulateTimeline, startTimeline } from "@jspsych/test-utils";

import sameDifferentHtml from ".";

jest.useFakeTimers();

describe("same-different-html", () => {
  test("runs trial", async () => {
    const { displayElement, expectFinished, getData, getHTML } = await startTimeline([
      {
        type: sameDifferentHtml,
        stimuli: ["foo", "bar"],
        answer: "same",
      },
    ]);

    expect(getHTML()).toMatch("foo");

    jest.advanceTimersByTime(1000); // first_stim_duration

    expect(getHTML()).not.toMatch("foo"); // cleared display

    jest.advanceTimersByTime(500); // gap_duration

    expect(getHTML()).toMatch("bar");

    jest.advanceTimersByTime(1000); // second_stim_duration

    expect(getHTML()).toMatch("visibility: hidden");

    pressKey("q"); // same_key
    await expectFinished();

    expect(getData().values()[0].correct).toBe(true);
  });
});

describe("same-different-html simulation", () => {
  test("data mode works", async () => {
    const { expectFinished, getData } = await simulateTimeline([
      {
        type: sameDifferentHtml,
        stimuli: ["foo", "bar"],
        answer: "same",
      },
    ]);

    await expectFinished();

    const data = getData().values()[0];
    expect(data.correct).toBe(data.response == "q");
  });

  test("visual mode works", async () => {
    const { expectRunning, expectFinished, getData } = await simulateTimeline(
      [
        {
          type: sameDifferentHtml,
          stimuli: ["foo", "bar"],
          answer: "same",
        },
      ],
      "visual"
    );

    await expectRunning();

    jest.runAllTimers();

    await expectFinished();

    const data = getData().values()[0];
    expect(data.correct).toBe(data.response == "q");
  });
});
