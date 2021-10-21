import { clickTarget, pressKey, startTimeline } from "@jspsych/test-utils";

import sketchpad from ".";

jest.useFakeTimers();

describe("sketchpad", () => {
  test("displays canvas with different dimensions", async () => {
    const { displayElement, getHTML, expectFinished } = await startTimeline([
      {
        type: sketchpad,
        canvas_width: 800,
        canvas_height: 300,
      },
    ]);

    console.log(getHTML());

    const canvas_rect = displayElement.querySelector("canvas");
    expect(canvas_rect.getAttribute("width")).toBe("800");
    expect(canvas_rect.getAttribute("height")).toBe("300");

    clickTarget(displayElement.querySelector("#sketchpad-end"));
    await expectFinished();
  });
});
