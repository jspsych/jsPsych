import { mouseDownMouseUpTarget, startTimeline } from "@jspsych/test-utils";

import serialReactionTimeMouse from ".";

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
