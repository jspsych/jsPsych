import { jest } from "@jest/globals";
import { clickTarget, pressKey, startTimeline } from "jspsych/tests/utils";

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

    const { jsPsych } = await startTimeline(timeline);

    expect(jsPsych.getDisplayElement().querySelector("button").innerHTML).toContain("foo");
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

    const { jsPsych, expectFinished } = await startTimeline(timeline);

    clickTarget(jsPsych.getDisplayElement().querySelector("button"));

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

    const { jsPsych, getData } = await startTimeline(timeline);

    pressKey("h");

    clickTarget(jsPsych.getDisplayElement().querySelector("button"));

    expect(getData().values()[0].final_value).toEqual(0.55);
  });
});
