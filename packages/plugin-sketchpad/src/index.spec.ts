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

    await clickTarget(displayElement.querySelector("#sketchpad-end"));
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

    await clickTarget(displayElement.querySelector("#sketchpad-end"));
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

    await clickTarget(displayElement.querySelector("#sketchpad-end"));
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

    await clickTarget(displayElement.querySelector("#sketchpad-end"));
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

    await clickTarget(displayElement.querySelector("#sketchpad-end"));
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

    await clickTarget(displayElement.querySelector("#sketchpad-end"));
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

    await clickTarget(displayElement.querySelector("#sketchpad-end"));
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

    await clickTarget(displayElement.querySelector("#sketchpad-end"));
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

    await clickTarget(displayElement.querySelector("#sketchpad-end"));
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

    await clickTarget(displayElement.querySelector("#sketchpad-end"));
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

    await clickTarget(displayElement.querySelector("#sketchpad-end"));
    await expectFinished();
  });
});

describe("sketchpad background_image", () => {
  let images: HTMLImageElement[];

  beforeEach(() => {
    images = [];
    jest.spyOn(window, "Image").mockImplementation(() => {
      const image = document.createElement("img");
      images.push(image);
      return image;
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test("requests the background image with CORS so the final image can be saved", async () => {
    const { displayElement, expectFinished, getData } = await startTimeline([
      {
        type: sketchpad,
        background_image: "https://example.com/image.png",
      },
    ]);

    expect(images).toHaveLength(1);
    expect(images[0].crossOrigin).toBe("anonymous");
    images[0].dispatchEvent(new Event("load"));

    await clickTarget(displayElement.querySelector("#sketchpad-end"));
    await expectFinished();
    expect(getData().values()[0].png).toMatch(/^data:image\/png/);
  });

  test("does not use CORS when save_final_image is false", async () => {
    const { displayElement, expectFinished } = await startTimeline([
      {
        type: sketchpad,
        background_image: "https://example.com/image.png",
        save_final_image: false,
      },
    ]);

    expect(images[0].hasAttribute("crossorigin")).toBe(false);
    images[0].dispatchEvent(new Event("load"));

    await clickTarget(displayElement.querySelector("#sketchpad-end"));
    await expectFinished();
  });

  test("falls back to a plain request when the server does not allow CORS", async () => {
    const warn = jest.spyOn(console, "warn").mockImplementation(() => {});
    const { displayElement, expectFinished, getData } = await startTimeline([
      {
        type: sketchpad,
        background_image: "https://example.com/image.png",
      },
    ]);

    images[0].dispatchEvent(new Event("error"));
    expect(images).toHaveLength(2);
    expect(images[1].hasAttribute("crossorigin")).toBe(false);
    images[1].dispatchEvent(new Event("load"));

    // The canvas is now tainted, so the browser refuses to export it.
    jest.spyOn(HTMLCanvasElement.prototype, "toDataURL").mockImplementation(() => {
      throw new DOMException("Tainted canvases may not be exported.", "SecurityError");
    });

    await clickTarget(displayElement.querySelector("#sketchpad-end"));
    await expectFinished();
    expect(getData().values()[0].png).toBeNull();
    expect(warn).toHaveBeenCalled();
  });
});
