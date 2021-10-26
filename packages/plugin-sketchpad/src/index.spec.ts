import { clickTarget, pressKey, startTimeline } from "@jspsych/test-utils";

import sketchpad from ".";

jest.useFakeTimers();

describe("sketchpad", () => {
  test("basic load with defaults", async () => {
    const { displayElement, getHTML, expectFinished } = await startTimeline([
      {
        type: sketchpad,
      },
    ]);

    const canvas = displayElement.querySelector("canvas");
    expect(canvas).not.toBeNull();

    clickTarget(displayElement.querySelector("#sketchpad-end"));
    await expectFinished();
  });

  test("displays canvas with different dimensions", async () => {
    const { displayElement, getHTML, expectFinished } = await startTimeline([
      {
        type: sketchpad,
        canvas_width: 800,
        canvas_height: 300,
      },
    ]);

    const canvas = displayElement.querySelector("canvas");
    expect(canvas.getAttribute("width")).toBe("800");
    expect(canvas.getAttribute("height")).toBe("300");

    clickTarget(displayElement.querySelector("#sketchpad-end"));
    await expectFinished();
  });

  test("renders a circular canvas", async () => {
    const { displayElement, getHTML, expectFinished } = await startTimeline([
      {
        type: sketchpad,
        canvas_diameter: 300,
        canvas_shape: "circle",
      },
    ]);

    const canvas: HTMLElement = displayElement.querySelector("canvas");
    expect(canvas.className).toContain("sketchpad-circle");
    expect(canvas.getAttribute("width")).toBe("300");
    expect(canvas.getAttribute("height")).toBe("300");

    clickTarget(displayElement.querySelector("#sketchpad-end"));
    await expectFinished();
  });

  test("prompt shows abovecanvas", async () => {
    const { displayElement, getHTML, expectFinished } = await startTimeline([
      {
        type: sketchpad,
        prompt: '<p id="prompt">Foo</p>',
        prompt_location: "abovecanvas",
      },
    ]);

    const display_content = Array.from(displayElement.children, (x) => {
      return (x as HTMLElement).id;
    });

    expect(display_content.indexOf("prompt")).toBeLessThan(
      display_content.indexOf("sketchpad-canvas")
    );

    clickTarget(displayElement.querySelector("#sketchpad-end"));
    await expectFinished();
  });

  test("prompt shows belowcanvas", async () => {
    const { displayElement, getHTML, expectFinished } = await startTimeline([
      {
        type: sketchpad,
        prompt: '<p id="prompt">Foo</p>',
        prompt_location: "belowcanvas",
      },
    ]);

    const display_content = Array.from(displayElement.children, (x) => {
      return (x as HTMLElement).id;
    });

    expect(display_content.indexOf("prompt")).toBeGreaterThan(
      display_content.indexOf("sketchpad-canvas")
    );
    expect(display_content.indexOf("prompt")).toBeGreaterThan(
      display_content.indexOf("sketchpad-controls")
    );
    expect(display_content.indexOf("prompt")).toBeLessThan(display_content.indexOf("finish-btn"));

    clickTarget(displayElement.querySelector("#sketchpad-end"));
    await expectFinished();
  });

  test("prompt shows belowbutton", async () => {
    const { displayElement, getHTML, expectFinished } = await startTimeline([
      {
        type: sketchpad,
        prompt: '<p id="prompt">Foo</p>',
        prompt_location: "belowbutton",
      },
    ]);

    const display_content = Array.from(displayElement.children, (x) => {
      return (x as HTMLElement).id;
    });

    expect(display_content.indexOf("prompt")).toBeGreaterThan(
      display_content.indexOf("sketchpad-canvas")
    );
    expect(display_content.indexOf("prompt")).toBeGreaterThan(
      display_content.indexOf("sketchpad-controls")
    );
    expect(display_content.indexOf("prompt")).toBeGreaterThan(
      display_content.indexOf("finish-btn")
    );

    clickTarget(displayElement.querySelector("#sketchpad-end"));
    await expectFinished();
  });
});
