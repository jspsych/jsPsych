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

    expect(displayElement.querySelector("#sketchpad-clear")).not.toBeNull();
    expect(displayElement.querySelector("#sketchpad-undo")).not.toBeNull();
    expect(displayElement.querySelector("#sketchpad-redo")).not.toBeNull();

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

  test("color palette generates correct buttons", async () => {
    const { displayElement, getHTML, expectFinished } = await startTimeline([
      {
        type: sketchpad,
        stroke_color_palette: ["#ff0000", "green", "#0000ff"],
      },
    ]);

    const buttons = displayElement.querySelectorAll("button.sketchpad-color-select");
    expect(buttons.length).toBe(3);
    expect(buttons[0].getAttribute("data-color")).toBe("#ff0000");
    expect(buttons[1].getAttribute("data-color")).toBe("green");
    expect(buttons[2].getAttribute("data-color")).toBe("#0000ff");

    clickTarget(displayElement.querySelector("#sketchpad-end"));
    await expectFinished();
  });

  test("redo_button_label changes text", async () => {
    const { displayElement, getHTML, expectFinished } = await startTimeline([
      {
        type: sketchpad,
        redo_button_label: "foo",
      },
    ]);

    const button = displayElement.querySelector("#sketchpad-redo");

    expect(button.innerHTML).toBe("foo");

    clickTarget(displayElement.querySelector("#sketchpad-end"));
    await expectFinished();
  });

  test("undo_button_label changes text", async () => {
    const { displayElement, getHTML, expectFinished } = await startTimeline([
      {
        type: sketchpad,
        undo_button_label: "foo",
      },
    ]);

    const button = displayElement.querySelector("#sketchpad-undo");

    expect(button.innerHTML).toBe("foo");

    clickTarget(displayElement.querySelector("#sketchpad-end"));
    await expectFinished();
  });

  test("clear_button_label changes text", async () => {
    const { displayElement, getHTML, expectFinished } = await startTimeline([
      {
        type: sketchpad,
        clear_button_label: "foo",
      },
    ]);

    const button = displayElement.querySelector("#sketchpad-clear");

    expect(button.innerHTML).toBe("foo");

    clickTarget(displayElement.querySelector("#sketchpad-end"));
    await expectFinished();
  });

  test("finished_button_label changes text", async () => {
    const { displayElement, getHTML, expectFinished } = await startTimeline([
      {
        type: sketchpad,
        finished_button_label: "foo",
      },
    ]);

    const button = displayElement.querySelector("#sketchpad-end");

    expect(button.innerHTML).toBe("foo");

    clickTarget(displayElement.querySelector("#sketchpad-end"));
    await expectFinished();
  });
});
