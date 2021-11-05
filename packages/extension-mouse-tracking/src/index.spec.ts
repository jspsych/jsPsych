import htmlKeyboardResponse from "@jspsych/plugin-html-keyboard-response";
import { mouseDown, mouseMove, mouseUp, pressKey, startTimeline } from "@jspsych/test-utils";
import { initJsPsych } from "jspsych";

import MouseTrackingExtension from ".";

jest.useFakeTimers();

describe("Mouse Tracking Extension", () => {
  test("adds mouse move data to trial", async () => {
    const jsPsych = initJsPsych({
      extensions: [{ type: MouseTrackingExtension }],
    });

    const timeline = [
      {
        type: htmlKeyboardResponse,
        stimulus: "<div id='target' style='width:500px; height: 500px;'></div>",
        extensions: [{ type: MouseTrackingExtension }],
      },
    ];

    const { displayElement, getHTML, getData, expectFinished } = await startTimeline(
      timeline,
      jsPsych
    );

    const targetRect = displayElement.querySelector("#target").getBoundingClientRect();

    mouseMove(50, 50, displayElement.querySelector("#target"));
    mouseMove(55, 50, displayElement.querySelector("#target"));
    mouseMove(60, 50, displayElement.querySelector("#target"));

    pressKey("a");

    await expectFinished();

    expect(getData().values()[0].mouse_tracking_data[0]).toMatchObject({
      x: targetRect.x + 50,
      y: targetRect.y + 50,
      event: "mousemove",
    });
    expect(getData().values()[0].mouse_tracking_data[1]).toMatchObject({
      x: targetRect.x + 55,
      y: targetRect.y + 50,
      event: "mousemove",
    });
    expect(getData().values()[0].mouse_tracking_data[2]).toMatchObject({
      x: targetRect.x + 60,
      y: targetRect.y + 50,
      event: "mousemove",
    });
  });

  test("adds mouse down data to trial", async () => {
    const jsPsych = initJsPsych({
      extensions: [{ type: MouseTrackingExtension }],
    });

    const timeline = [
      {
        type: htmlKeyboardResponse,
        stimulus: "<div id='target' style='width:500px; height: 500px;'></div>",
        extensions: [
          {
            type: MouseTrackingExtension,
            params: { events: ["mousedown"] },
          },
        ],
      },
    ];

    const { displayElement, getHTML, getData, expectFinished } = await startTimeline(
      timeline,
      jsPsych
    );

    const targetRect = displayElement.querySelector("#target").getBoundingClientRect();

    mouseDown(50, 50, displayElement.querySelector("#target"));
    mouseDown(55, 50, displayElement.querySelector("#target"));
    mouseDown(60, 50, displayElement.querySelector("#target"));

    pressKey("a");

    await expectFinished();

    expect(getData().values()[0].mouse_tracking_data[0]).toMatchObject({
      x: targetRect.x + 50,
      y: targetRect.y + 50,
      event: "mousedown",
    });
    expect(getData().values()[0].mouse_tracking_data[1]).toMatchObject({
      x: targetRect.x + 55,
      y: targetRect.y + 50,
      event: "mousedown",
    });
    expect(getData().values()[0].mouse_tracking_data[2]).toMatchObject({
      x: targetRect.x + 60,
      y: targetRect.y + 50,
      event: "mousedown",
    });
  });

  test("adds mouse up data to trial", async () => {
    const jsPsych = initJsPsych({
      extensions: [{ type: MouseTrackingExtension }],
    });

    const timeline = [
      {
        type: htmlKeyboardResponse,
        stimulus: "<div id='target' style='width:500px; height: 500px;'></div>",
        extensions: [
          {
            type: MouseTrackingExtension,
            params: { events: ["mouseup"] },
          },
        ],
      },
    ];

    const { displayElement, getHTML, getData, expectFinished } = await startTimeline(
      timeline,
      jsPsych
    );

    const targetRect = displayElement.querySelector("#target").getBoundingClientRect();

    mouseUp(50, 50, displayElement.querySelector("#target"));
    mouseUp(55, 50, displayElement.querySelector("#target"));
    mouseUp(60, 50, displayElement.querySelector("#target"));

    pressKey("a");

    await expectFinished();

    expect(getData().values()[0].mouse_tracking_data[0]).toMatchObject({
      x: targetRect.x + 50,
      y: targetRect.y + 50,
      event: "mouseup",
    });
    expect(getData().values()[0].mouse_tracking_data[1]).toMatchObject({
      x: targetRect.x + 55,
      y: targetRect.y + 50,
      event: "mouseup",
    });
    expect(getData().values()[0].mouse_tracking_data[2]).toMatchObject({
      x: targetRect.x + 60,
      y: targetRect.y + 50,
      event: "mouseup",
    });
  });

  test("ignores mousemove when not in events", async () => {
    const jsPsych = initJsPsych({
      extensions: [{ type: MouseTrackingExtension }],
    });

    const timeline = [
      {
        type: htmlKeyboardResponse,
        stimulus: "<div id='target' style='width:500px; height: 500px;'></div>",
        extensions: [
          {
            type: MouseTrackingExtension,
            params: { events: ["mousedown"] },
          },
        ],
      },
    ];

    const { displayElement, getHTML, getData, expectFinished } = await startTimeline(
      timeline,
      jsPsych
    );

    const targetRect = displayElement.querySelector("#target").getBoundingClientRect();

    mouseMove(50, 50, displayElement.querySelector("#target"));
    mouseMove(55, 50, displayElement.querySelector("#target"));
    mouseDown(60, 50, displayElement.querySelector("#target"));

    pressKey("a");

    await expectFinished();

    expect(getData().values()[0].mouse_tracking_data.length).toBe(1);

    expect(getData().values()[0].mouse_tracking_data[0]).toMatchObject({
      x: targetRect.x + 60,
      y: targetRect.y + 50,
      event: "mousedown",
    });
  });

  test("records bounding rect of targets in data", async () => {
    const jsPsych = initJsPsych({
      extensions: [{ type: MouseTrackingExtension }],
    });

    const timeline = [
      {
        type: htmlKeyboardResponse,
        stimulus: `
          <div id='target' style='width:500px; height: 500px;'></div>
          <div id='target2' style='width:200px; height: 200px;'></div>
        `,
        extensions: [
          { type: MouseTrackingExtension, params: { targets: ["#target", "#target2"] } },
        ],
      },
    ];

    const { displayElement, getHTML, getData, expectFinished } = await startTimeline(
      timeline,
      jsPsych
    );

    const targetRect = displayElement.querySelector("#target").getBoundingClientRect();
    const target2Rect = displayElement.querySelector("#target2").getBoundingClientRect();

    pressKey("a");

    await expectFinished();

    expect(getData().values()[0].mouse_tracking_targets["#target"]).toEqual(targetRect);
    expect(getData().values()[0].mouse_tracking_targets["#target2"]).toEqual(target2Rect);
  });

  test("ignores mousemove events that are faster than minimum_sample_time", async () => {
    const jsPsych = initJsPsych({
      extensions: [{ type: MouseTrackingExtension, params: { minimum_sample_time: 100 } }],
    });

    const timeline = [
      {
        type: htmlKeyboardResponse,
        stimulus: "<div id='target' style='width:500px; height: 500px;'></div>",
        extensions: [{ type: MouseTrackingExtension }],
      },
    ];

    const { displayElement, getHTML, getData, expectFinished } = await startTimeline(
      timeline,
      jsPsych
    );

    const targetRect = displayElement.querySelector("#target").getBoundingClientRect();

    mouseMove(50, 50, displayElement.querySelector("#target"));
    jest.advanceTimersByTime(50);

    // this one should be ignored
    mouseMove(55, 50, displayElement.querySelector("#target"));
    jest.advanceTimersByTime(50);

    // this one should register
    mouseMove(60, 50, displayElement.querySelector("#target"));

    pressKey("a");

    await expectFinished();

    expect(getData().values()[0].mouse_tracking_data[0]).toMatchObject({
      x: targetRect.x + 50,
      y: targetRect.y + 50,
      event: "mousemove",
    });
    expect(getData().values()[0].mouse_tracking_data[1]).toMatchObject({
      x: targetRect.x + 60,
      y: targetRect.y + 50,
      event: "mousemove",
    });
  });
});
