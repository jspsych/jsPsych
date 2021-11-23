import { mouseDownMouseUpTarget, simulateTimeline, startTimeline } from "@jspsych/test-utils";

import serialReactionTimeMouse from ".";

jest.useFakeTimers();

const getCellElement = (cellId: string) =>
  document.querySelector(`#jspsych-serial-reaction-time-stimulus-cell-${cellId}`) as HTMLElement;

describe("serial-reaction-time-mouse plugin", () => {
  test("default behavior", async () => {
    const { getHTML, expectFinished } = await startTimeline([
      {
        type: serialReactionTimeMouse,
        target: [0, 0],
      },
    ]);

    expect(getCellElement("0-0").style.backgroundColor).toBe("rgb(153, 153, 153)");
    expect(getCellElement("0-1").style.backgroundColor).toBe("");
    expect(getCellElement("0-2").style.backgroundColor).toBe("");
    expect(getCellElement("0-3").style.backgroundColor).toBe("");

    mouseDownMouseUpTarget(getCellElement("0-1"));

    expect(getHTML()).not.toBe("");

    mouseDownMouseUpTarget(getCellElement("0-0"));

    await expectFinished();
  });
});

describe("serial-reaction-time plugin simulation", () => {
  test("data-only mode works", async () => {
    const { expectFinished, getData } = await simulateTimeline([
      {
        type: serialReactionTimeMouse,
        grid: [[1, 1, 1, 1]],
        target: [0, 0],
      },
    ]);

    await expectFinished();

    const data = getData().values()[0];

    expect(data.correct).toBe(data.response[1] == data.target[1]);
    expect(data.rt).toBeGreaterThan(0);
  });

  test("visual mode works", async () => {
    const { expectFinished, expectRunning, getData } = await simulateTimeline(
      [
        {
          type: serialReactionTimeMouse,
          grid: [[1, 1, 1, 1]],
          target: [0, 0],
        },
      ],
      "visual"
    );

    await expectRunning();

    jest.runAllTimers();

    await expectFinished();

    const data = getData().values()[0];

    expect(data.correct).toBe(data.response[1] == data.target[1]);
    expect(data.rt).toBeGreaterThan(0);
  });
});
