import { mouseDownMouseUpTarget, simulateTimeline, startTimeline } from "@jspsych/test-utils";

import serialReactionTimeMouse from ".";

jest.useFakeTimers();

const getCellElement = (cellId: string, displayElement: HTMLElement) =>
  displayElement.querySelector(
    `#jspsych-serial-reaction-time-stimulus-cell-${cellId}`
  ) as HTMLElement;

describe("serial-reaction-time-mouse plugin", () => {
  test("default behavior", async () => {
    const { getHTML, expectFinished, displayElement } = await startTimeline([
      {
        type: serialReactionTimeMouse,
        target: [0, 0],
      },
    ]);

    expect(getCellElement("0-0", displayElement).style.backgroundColor).toBe("rgb(153, 153, 153)");
    expect(getCellElement("0-1", displayElement).style.backgroundColor).toBe("");
    expect(getCellElement("0-2", displayElement).style.backgroundColor).toBe("");
    expect(getCellElement("0-3", displayElement).style.backgroundColor).toBe("");

    mouseDownMouseUpTarget(getCellElement("0-1", displayElement));

    expect(getHTML()).not.toBe("");

    mouseDownMouseUpTarget(getCellElement("0-0", displayElement));

    await expectFinished();
  });

  test("shows green feedback on correct response when show_response_feedback is true", async () => {
    const { expectFinished, getData, displayElement } = await startTimeline([
      {
        type: serialReactionTimeMouse,
        target: [0, 0],
        show_response_feedback: true,
        feedback_duration: 200,
      },
    ]);

    mouseDownMouseUpTarget(getCellElement("0-0", displayElement));

    expect(getCellElement("0-0", displayElement).style.backgroundColor).toBe("rgb(0, 255, 0)");

    jest.advanceTimersByTime(200);

    await expectFinished();
    expect(getData().last(1).values()[0].correct).toBe(true);
  });

  test("shows red feedback on incorrect response when show_response_feedback is true", async () => {
    const { expectFinished, getData, displayElement } = await startTimeline([
      {
        type: serialReactionTimeMouse,
        target: [0, 0],
        allow_nontarget_responses: true,
        show_response_feedback: true,
        feedback_duration: 200,
      },
    ]);

    mouseDownMouseUpTarget(getCellElement("0-2", displayElement));

    expect(getCellElement("0-2", displayElement).style.backgroundColor).toBe("rgb(255, 0, 0)");

    jest.advanceTimersByTime(200);

    await expectFinished();
    expect(getData().last(1).values()[0].correct).toBe(false);
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
