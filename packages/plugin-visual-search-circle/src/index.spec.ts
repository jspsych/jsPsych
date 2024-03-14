import { pressKey, simulateTimeline, startTimeline } from "@jspsych/test-utils";

import visualSearchCircle from ".";

jest.useFakeTimers();

describe("visual-search-circle", () => {
  test("displays search array circle", async () => {
    const { displayElement, expectFinished, getData } = await startTimeline([
      {
        type: visualSearchCircle,
        target: "target.png",
        foil: "foil.png",
        fixation_image: "fixation.png",
        set_size: 4,
        target_present: true,
        target_present_key: "a",
        target_absent_key: "b",
      },
    ]);

    expect(displayElement.querySelectorAll("img").length).toBe(1);

    jest.advanceTimersByTime(1000); // fixation duration

    expect(displayElement.querySelectorAll("img").length).toBe(5);
    pressKey("a");
    await expectFinished();

    expect(displayElement.querySelectorAll("img").length).toBe(0);

    expect(getData().values()[0].correct).toBe(true);
  });

  it("wait when response_ends_trial is false", async () => {
    const { displayElement, expectFinished, expectRunning, getData } = await startTimeline([
      {
        type: visualSearchCircle,
        target: "target.png",
        foil: "foil.png",
        fixation_image: "fixation.png",
        set_size: 4,
        target_present: true,
        target_present_key: "a",
        target_absent_key: "b",
        response_ends_trial: false,
        trial_duration: 1500,
      },
    ]);

    expect(displayElement.querySelectorAll("img").length).toBe(1);

    jest.advanceTimersByTime(1000); // fixation duration

    expect(displayElement.querySelectorAll("img").length).toBe(5);
    pressKey("a");
    await expectRunning();

    jest.runAllTimers();
    await expectFinished();

    expect(displayElement.querySelectorAll("img").length).toBe(0);

    expect(getData().values()[0].correct).toBe(true);
  });
});

describe("visual-search-circle simulation", () => {
  test("data mode works", async () => {
    const { expectFinished, getData } = await simulateTimeline([
      {
        type: visualSearchCircle,
        target: "target.png",
        foil: "foil.png",
        fixation_image: "fixation.png",
        set_size: 4,
        target_present: true,
        target_present_key: "a",
        target_absent_key: "b",
      },
    ]);

    await expectFinished();

    const data = getData().values()[0];
    expect(data.correct).toBe(data.response == "a");
  });

  test("visual mode works", async () => {
    const { expectRunning, expectFinished, getData } = await simulateTimeline(
      [
        {
          type: visualSearchCircle,
          target: "target.png",
          foil: "foil.png",
          fixation_image: "fixation.png",
          set_size: 4,
          target_present: true,
          target_present_key: "a",
          target_absent_key: "b",
        },
      ],
      "visual"
    );

    await expectRunning();

    jest.runAllTimers();

    await expectFinished();

    const data = getData().values()[0];
    expect(data.correct).toBe(data.response == "a");
  });
});
