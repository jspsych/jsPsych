import { clickTarget, simulateTimeline, startTimeline } from "@jspsych/test-utils";

import imageSliderResponse from ".";

jest.useFakeTimers();

describe("image-slider-response", () => {
  test("displays image stimulus", async () => {
    const { getHTML, expectFinished } = await startTimeline([
      {
        type: imageSliderResponse,
        stimulus: "../media/blue.png",
        labels: ["left", "right"],
        button_label: "button",
        render_on_canvas: false,
      },
    ]);

    expect(getHTML()).toContain(
      '<div id="jspsych-image-slider-response-stimulus"><img src="../media/blue.png"'
    );
    clickTarget(document.querySelector("#jspsych-image-slider-response-next"));
    await expectFinished();
  });

  test("displays labels", async () => {
    const { getHTML, expectFinished } = await startTimeline([
      {
        type: imageSliderResponse,
        stimulus: "../media/blue.png",
        labels: ["left", "right"],
        button_label: "button",
        render_on_canvas: false,
      },
    ]);

    expect(getHTML()).toContain('<span style="text-align: center; font-size: 80%;">left</span>');
    expect(getHTML()).toContain('<span style="text-align: center; font-size: 80%;">right</span>');

    clickTarget(document.querySelector("#jspsych-image-slider-response-next"));
    await expectFinished();
  });

  test("displays button label", async () => {
    const { getHTML, expectFinished } = await startTimeline([
      {
        type: imageSliderResponse,
        stimulus: "../media/blue.png",
        labels: ["left", "right"],
        button_label: "button",
        render_on_canvas: false,
      },
    ]);

    expect(getHTML()).toContain(
      '<button id="jspsych-image-slider-response-next" class="jspsych-btn">button</button>'
    );

    clickTarget(document.querySelector("#jspsych-image-slider-response-next"));
    await expectFinished();
  });

  test("should set min, max and step", async () => {
    const { displayElement, expectFinished } = await startTimeline([
      {
        type: imageSliderResponse,
        stimulus: "../media/blue.png",
        labels: ["left", "right"],
        button_label: "button",
        min: 2,
        max: 10,
        step: 2,
        render_on_canvas: false,
      },
    ]);

    const responseElement = displayElement.querySelector<HTMLInputElement>(
      "#jspsych-image-slider-response-response"
    );

    expect(responseElement.min).toBe("2");
    expect(responseElement.max).toBe("10");
    expect(responseElement.step).toBe("2");

    clickTarget(document.querySelector("#jspsych-image-slider-response-next"));
    await expectFinished();
  });

  test("prompt should append to bottom of stimulus", async () => {
    const { getHTML, expectFinished } = await startTimeline([
      {
        type: imageSliderResponse,
        stimulus: "../media/blue.png",
        labels: ["left", "right"],
        button_label: "button",
        prompt: "<p>This is a prompt</p>",
        render_on_canvas: false,
      },
    ]);

    expect(getHTML()).toContain("<p>This is a prompt</p>");

    clickTarget(document.querySelector("#jspsych-image-slider-response-next"));
    await expectFinished();
  });

  test("should hide stimulus if stimulus_duration is set", async () => {
    const { displayElement, expectFinished } = await startTimeline([
      {
        type: imageSliderResponse,
        stimulus: "../media/blue.png",
        labels: ["left", "right"],
        button_label: "button",
        stimulus_duration: 500,
        render_on_canvas: false,
      },
    ]);

    const stimulusElement = displayElement.querySelector<HTMLElement>(
      "#jspsych-image-slider-response-stimulus"
    );
    expect(stimulusElement.style.visibility).toContain("");
    jest.advanceTimersByTime(500);
    expect(stimulusElement.style.visibility).toContain("hidden");

    clickTarget(document.querySelector("#jspsych-image-slider-response-next"));
    await expectFinished();
  });

  test("should end trial when trial duration is reached", async () => {
    const { getHTML, expectFinished } = await startTimeline([
      {
        type: imageSliderResponse,
        stimulus: "../media/blue.png",
        labels: ["left", "right"],
        button_label: "button",
        trial_duration: 500,
        render_on_canvas: false,
      },
    ]);

    expect(getHTML()).toContain(
      '<div id="jspsych-image-slider-response-stimulus"><img src="../media/blue.png"'
    );

    jest.advanceTimersByTime(500);
    await expectFinished();
  });

  test("should end trial when button is clicked", async () => {
    const { getHTML, expectFinished } = await startTimeline([
      {
        type: imageSliderResponse,
        stimulus: "../media/blue.png",
        labels: ["left", "right"],
        button_label: "button",
        response_ends_trial: true,
        render_on_canvas: false,
      },
    ]);

    expect(getHTML()).toContain(
      '<div id="jspsych-image-slider-response-stimulus"><img src="../media/blue.png"'
    );

    clickTarget(document.querySelector("#jspsych-image-slider-response-next"));
    await expectFinished();
  });
});

describe("image-slider-response simulation", () => {
  test("data-only mode works", async () => {
    const { getData, expectFinished } = await simulateTimeline([
      {
        type: imageSliderResponse,
        stimulus: "foo.png",
        labels: ["left", "right"],
        button_label: "button",
      },
    ]);

    await expectFinished();

    const data = getData().values()[0];

    expect(data.response).toBeGreaterThanOrEqual(0);
    expect(data.response).toBeLessThanOrEqual(100);
    expect(data.rt).toBeGreaterThan(0);
  });

  test("data-only mode works", async () => {
    const { getData, expectRunning, expectFinished } = await simulateTimeline(
      [
        {
          type: imageSliderResponse,
          stimulus: "foo.png",
          labels: ["left", "right"],
          button_label: "button",
        },
      ],
      "visual"
    );

    await expectRunning();

    jest.runAllTimers();

    await expectFinished();

    const data = getData().values()[0];

    expect(data.response).toBeGreaterThanOrEqual(0);
    expect(data.response).toBeLessThanOrEqual(100);
    expect(data.rt).toBeGreaterThan(0);
  });
});
