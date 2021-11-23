import { pressKey, simulateTimeline, startTimeline } from "@jspsych/test-utils";

import sameDifferentImage from ".";

jest.useFakeTimers();

describe("same-different-image", () => {
  test("runs trial", async () => {
    const { displayElement, expectFinished, getData, getHTML } = await startTimeline([
      {
        type: sameDifferentImage,
        stimuli: ["foo.png", "bar.png"],
        answer: "same",
      },
    ]);

    expect(getHTML()).toMatch("foo.png");

    jest.advanceTimersByTime(1000); // first_stim_duration

    expect(getHTML()).not.toMatch("foo.png"); // cleared display

    jest.advanceTimersByTime(500); // gap_duration

    expect(getHTML()).toMatch("bar.png");

    jest.advanceTimersByTime(1000); // second_stim_duration

    expect(getHTML()).toMatch("visibility: hidden");

    pressKey("q"); // same_key
    await expectFinished();

    expect(getData().values()[0].correct).toBe(true);
  });
});

describe("same-different-image simulation", () => {
  test("data mode works", async () => {
    const { expectFinished, getData } = await simulateTimeline([
      {
        type: sameDifferentImage,
        stimuli: ["foo.png", "bar.png"],
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
          type: sameDifferentImage,
          stimuli: ["foo.png", "bar.png"],
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
