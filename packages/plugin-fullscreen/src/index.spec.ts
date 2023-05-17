import { clickTarget, simulateTimeline, startTimeline } from "@jspsych/test-utils";

import fullscreen from ".";

jest.useFakeTimers();

describe("fullscreen plugin", () => {
  beforeEach(() => {
    document.documentElement.requestFullscreen = jest
      .fn<Promise<void>, any[]>()
      .mockResolvedValue();
  });

  test("launches fullscreen mode by default", async () => {
    await startTimeline([
      {
        type: fullscreen,
        delay_after: 0,
      },
    ]);

    expect(document.documentElement.requestFullscreen).not.toHaveBeenCalled();
    clickTarget(document.querySelector("#jspsych-fullscreen-btn"));
    expect(document.documentElement.requestFullscreen).toHaveBeenCalled();
  });

  test("records RT of click", async () => {
    const { getData, expectFinished } = await startTimeline([
      {
        type: fullscreen,
        delay_after: 0,
      },
    ]);

    expect(document.documentElement.requestFullscreen).not.toHaveBeenCalled();
    jest.advanceTimersByTime(1000);
    clickTarget(document.querySelector("#jspsych-fullscreen-btn"));
    expect(document.documentElement.requestFullscreen).toHaveBeenCalled();
    jest.runAllTimers();
    await expectFinished();
    expect(getData().values()[0].rt).toBeGreaterThanOrEqual(1000);
  });
});

describe("fullscreen plugin simulation", () => {
  beforeEach(() => {
    document.documentElement.requestFullscreen = jest
      .fn<Promise<void>, any[]>()
      .mockResolvedValue();
  });

  test("data-only mode works", async () => {
    const { expectFinished, getData } = await simulateTimeline([
      {
        type: fullscreen,
        delay_after: 0,
      },
    ]);

    await expectFinished();

    expect(getData().values()[0].success).toBe(true);
  });

  test("visual mode works", async () => {
    const { expectRunning, expectFinished, getData } = await simulateTimeline(
      [
        {
          type: fullscreen,
          delay_after: 0,
        },
      ],
      "visual"
    );

    await expectRunning();

    jest.runAllTimers();

    await expectFinished();

    expect(getData().values()[0].success).toBe(true);
    expect(getData().values()[0].rt).toBeGreaterThan(0);
  });
});
