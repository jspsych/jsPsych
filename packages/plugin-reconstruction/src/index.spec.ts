import { clickTarget, pressKey, simulateTimeline, startTimeline } from "@jspsych/test-utils";

import reconstruction from ".";

jest.useFakeTimers();

describe("reconstruction", () => {
  test("default starting value renders correctly", async () => {
    const timeline = [
      {
        type: reconstruction,
        stim_function: function (val) {
          return `<p>${Math.round(val * 10)}</p>`;
        },
      },
    ];

    const { getHTML } = await startTimeline(timeline);

    expect(getHTML()).toContain("<p>5</p>");
  });

  test("custom starting value renders correctly", async () => {
    const timeline = [
      {
        type: reconstruction,
        stim_function: function (val) {
          return `<p>${Math.round(val * 10)}</p>`;
        },
        starting_value: 0.9,
      },
    ];

    const { getHTML } = await startTimeline(timeline);

    expect(getHTML()).toContain("<p>9</p>");
  });

  test("default increment key works", async () => {
    const timeline = [
      {
        type: reconstruction,
        stim_function: function (val) {
          return `<p>${Math.round(val * 10)}</p>`;
        },
        step_size: 0.1,
      },
    ];

    const { getHTML } = await startTimeline(timeline);

    pressKey("h");
    expect(getHTML()).toContain("<p>6</p>");
    pressKey("h");
    expect(getHTML()).toContain("<p>7</p>");
  });

  test("default decrement key works", async () => {
    const timeline = [
      {
        type: reconstruction,
        stim_function: function (val) {
          return `<p>${Math.round(val * 10)}</p>`;
        },
        step_size: 0.1,
      },
    ];

    const { getHTML } = await startTimeline(timeline);

    pressKey("g");
    expect(getHTML()).toContain("<p>4</p>");
    pressKey("g");
    expect(getHTML()).toContain("<p>3</p>");
  });

  test("custom increment key works", async () => {
    const timeline = [
      {
        type: reconstruction,
        stim_function: function (val) {
          return `<p>${Math.round(val * 10)}</p>`;
        },
        key_increase: "a",
        step_size: 0.1,
      },
    ];

    const { getHTML } = await startTimeline(timeline);

    pressKey("a");
    expect(getHTML()).toContain("<p>6</p>");
    pressKey("a");
    expect(getHTML()).toContain("<p>7</p>");
    pressKey("h");
    expect(getHTML()).toContain("<p>7</p>");
  });

  test("custom decrement key works", async () => {
    const timeline = [
      {
        type: reconstruction,
        stim_function: function (val) {
          return `<p>${Math.round(val * 10)}</p>`;
        },
        key_decrease: "a",
        step_size: 0.1,
      },
    ];

    const { getHTML } = await startTimeline(timeline);

    pressKey("a");
    expect(getHTML()).toContain("<p>4</p>");
    pressKey("a");
    expect(getHTML()).toContain("<p>3</p>");
    pressKey("g");
    expect(getHTML()).toContain("<p>3</p>");
  });

  test("custom button label works", async () => {
    const timeline = [
      {
        type: reconstruction,
        stim_function: function (val) {
          return `<p>${Math.round(val * 10)}</p>`;
        },
        button_label: "foo",
      },
    ];

    const { displayElement } = await startTimeline(timeline);

    expect(displayElement.querySelector("button").innerHTML).toContain("foo");
  });

  test("clicking button ends trial", async () => {
    const timeline = [
      {
        type: reconstruction,
        stim_function: function (val) {
          return `<p>${Math.round(val * 10)}</p>`;
        },
        button_label: "foo",
      },
    ];

    const { displayElement, expectFinished } = await startTimeline(timeline);

    clickTarget(displayElement.querySelector("button"));

    await expectFinished();
  });

  test("data contains accurate final value", async () => {
    const timeline = [
      {
        type: reconstruction,
        stim_function: function (val) {
          return `<p>${Math.round(val * 10)}</p>`;
        },
        button_label: "foo",
      },
    ];

    const { displayElement, getData } = await startTimeline(timeline);

    pressKey("h");

    clickTarget(displayElement.querySelector("button"));

    expect(getData().values()[0].final_value).toEqual(0.55);
  });
});

describe("reconstruction simulation", () => {
  test("data-only mode works", async () => {
    const timeline = [
      {
        type: reconstruction,
        stim_function: function (val) {
          return `<p>${Math.round(val * 10)}</p>`;
        },
        starting_value: 0.5,
        step_size: 0.05,
      },
    ];

    const { getData, expectFinished } = await simulateTimeline(timeline);

    await expectFinished();

    expect(getData().values()[0].final_value).toBeGreaterThanOrEqual(0);
    expect(getData().values()[0].final_value).toBeLessThanOrEqual(1);
  });

  test("visual mode works", async () => {
    const timeline = [
      {
        type: reconstruction,
        stim_function: function (val) {
          return `<p>${Math.round(val * 10)}</p>`;
        },
        starting_value: 0.5,
        step_size: 0.05,
      },
    ];

    const { getData, expectFinished, expectRunning } = await simulateTimeline(timeline, "visual");

    await expectRunning();

    jest.runAllTimers();

    await expectFinished();

    expect(getData().values()[0].final_value).toBeGreaterThanOrEqual(0);
    expect(getData().values()[0].final_value).toBeLessThanOrEqual(1);
  });
});
