import { pressKey, simulateTimeline, startTimeline } from "@jspsych/test-utils";

import serialReactionTime from ".";

jest.useFakeTimers();

const getCellElement = (cellId: string) =>
  document.querySelector(`#jspsych-serial-reaction-time-stimulus-cell-${cellId}`) as HTMLElement;

describe("serial-reaction-time plugin", () => {
  test("default behavior", async () => {
    const { expectFinished, getData } = await startTimeline([
      {
        type: serialReactionTime,
        target: [0, 0],
      },
    ]);

    expect(getCellElement("0-0").style.backgroundColor).toBe("rgb(153, 153, 153)");
    expect(getCellElement("0-1").style.backgroundColor).toBe("");
    expect(getCellElement("0-2").style.backgroundColor).toBe("");
    expect(getCellElement("0-3").style.backgroundColor).toBe("");

    pressKey("3");

    await expectFinished();
    expect(getData().last(1).values()[0].correct).toBe(true);
  });

  test("response ends trial is false", async () => {
    const { getHTML, expectFinished, getData } = await startTimeline([
      {
        type: serialReactionTime,
        target: [0, 0],
        response_ends_trial: false,
        trial_duration: 1000,
      },
    ]);

    expect(getCellElement("0-0").style.backgroundColor).toBe("rgb(153, 153, 153)");
    expect(getCellElement("0-1").style.backgroundColor).toBe("");
    expect(getCellElement("0-2").style.backgroundColor).toBe("");
    expect(getCellElement("0-3").style.backgroundColor).toBe("");

    pressKey("3");

    expect(getHTML()).not.toBe("");

    jest.advanceTimersByTime(1000);

    await expectFinished();
    expect(getData().last(1).values()[0].correct).toBe(true);
  });

  test("responses are scored correctly", async () => {
    const { getHTML, expectFinished, getData } = await startTimeline([
      {
        type: serialReactionTime,
        target: [0, 0],
      },
      {
        type: serialReactionTime,
        target: [0, 1],
      },
    ]);

    expect(getCellElement("0-0").style.backgroundColor).toBe("rgb(153, 153, 153)");
    expect(getCellElement("0-1").style.backgroundColor).toBe("");
    expect(getCellElement("0-2").style.backgroundColor).toBe("");
    expect(getCellElement("0-3").style.backgroundColor).toBe("");

    pressKey("3");

    jest.runAllTimers();

    expect(getCellElement("0-0").style.backgroundColor).toBe("");
    expect(getCellElement("0-1").style.backgroundColor).toBe("rgb(153, 153, 153)");
    expect(getCellElement("0-2").style.backgroundColor).toBe("");
    expect(getCellElement("0-3").style.backgroundColor).toBe("");

    pressKey("3");

    await expectFinished();

    var trial_data = getData().last(2).values();
    expect(trial_data[0].correct).toBe(true);
    expect(trial_data[1].correct).toBe(false);
  });
});

describe("serial-reaction-time plugin simulation", () => {
  test("data-only mode works", async () => {
    const { expectFinished, getData } = await simulateTimeline([
      {
        type: serialReactionTime,
        grid: [[1, 1, 1, 1]],
        target: [0, 0],
        choices: [["a", "b", "c", "d"]],
      },
    ]);

    await expectFinished();

    const data = getData().values()[0];

    expect(data.correct).toBe(data.response == "a");
    expect(data.rt).toBeGreaterThan(0);
  });

  test("visual mode works", async () => {
    const { expectFinished, expectRunning, getData } = await simulateTimeline(
      [
        {
          type: serialReactionTime,
          grid: [[1, 1, 1, 1]],
          target: [0, 0],
          choices: [["a", "b", "c", "d"]],
        },
      ],
      "visual"
    );

    await expectRunning();

    jest.runAllTimers();

    await expectFinished();

    const data = getData().values()[0];

    expect(data.correct).toBe(data.response == "a");
    expect(data.rt).toBeGreaterThan(0);
  });
});
