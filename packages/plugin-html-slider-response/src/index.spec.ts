import { clickTarget, simulateTimeline, startTimeline } from "@jspsych/test-utils";

import htmlSliderResponse from ".";

jest.useFakeTimers();

describe("html-slider-response", () => {
  test("displays html stimulus", async () => {
    const { getHTML } = await startTimeline([
      {
        type: htmlSliderResponse,
        stimulus: "this is html",
        labels: ["left", "right"],
        button_label: "button",
      },
    ]);

    expect(getHTML()).toContain(
      '<div id="jspsych-html-slider-response-stimulus">this is html</div>'
    );
  });

  test("displays labels", async () => {
    const { getHTML } = await startTimeline([
      {
        type: htmlSliderResponse,
        stimulus: "this is html",
        labels: ["left", "right"],
        button_label: "button",
      },
    ]);

    expect(getHTML()).toContain('<span style="text-align: center; font-size: 80%;">left</span>');
    expect(getHTML()).toContain('<span style="text-align: center; font-size: 80%;">right</span>');
  });

  test("displays button label", async () => {
    const { getHTML } = await startTimeline([
      {
        type: htmlSliderResponse,
        stimulus: "this is html",
        labels: ["left", "right"],
        button_label: "button",
      },
    ]);

    expect(getHTML()).toContain(
      '<button id="jspsych-html-slider-response-next" class="jspsych-btn">button</button>'
    );
  });

  test("should set min, max and step", async () => {
    const { displayElement } = await startTimeline([
      {
        type: htmlSliderResponse,
        stimulus: "this is html",
        labels: ["left", "right"],
        min: 2,
        max: 10,
        step: 2,
        button_label: "button",
      },
    ]);

    const responseElement = displayElement.querySelector<HTMLInputElement>(
      "#jspsych-html-slider-response-response"
    );
    expect(responseElement.min).toBe("2");
    expect(responseElement.max).toBe("10");
    expect(responseElement.step).toBe("2");
  });

  test("should append to bottom on stimulus", async () => {
    const { getHTML } = await startTimeline([
      {
        type: htmlSliderResponse,
        stimulus: "this is html",
        labels: ["left", "right"],
        button_label: "button",
        prompt: "<p>This is a prompt</p>",
      },
    ]);

    expect(getHTML()).toContain("<p>This is a prompt</p>");
  });

  test("should hide stimulus if stimulus_duration is set", async () => {
    const { displayElement } = await startTimeline([
      {
        type: htmlSliderResponse,
        stimulus: "this is html",
        labels: ["left", "right"],
        button_label: "button",
        stimulus_duration: 500,
      },
    ]);

    const stimulusElement = displayElement.querySelector<HTMLElement>(
      "#jspsych-html-slider-response-stimulus"
    );

    expect(stimulusElement.style.visibility).toBe("");
    jest.advanceTimersByTime(500);
    expect(stimulusElement.style.visibility).toBe("hidden");
  });

  test("should end trial when trial duration is reached", async () => {
    const { getHTML, expectFinished } = await startTimeline([
      {
        type: htmlSliderResponse,
        stimulus: "this is html",
        labels: ["left", "right"],
        button_label: "button",
        trial_duration: 500,
      },
    ]);

    expect(getHTML()).toContain(
      '<div id="jspsych-html-slider-response-stimulus">this is html</div>'
    );
    jest.advanceTimersByTime(500);
    await expectFinished();
  });

  test("should end trial when button is clicked", async () => {
    const { getHTML, expectFinished } = await startTimeline([
      {
        type: htmlSliderResponse,
        stimulus: "this is html",
        labels: ["left", "right"],
        button_label: "button",
        response_ends_trial: true,
      },
    ]);

    expect(getHTML()).toContain(
      '<div id="jspsych-html-slider-response-stimulus">this is html</div>'
    );

    clickTarget(document.querySelector("#jspsych-html-slider-response-next"));

    await expectFinished();
  });
});

describe("html-slider-response simulation", () => {
  test("data-only mode works", async () => {
    const { getData, expectFinished } = await simulateTimeline([
      {
        type: htmlSliderResponse,
        stimulus: "this is html",
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
          type: htmlSliderResponse,
          stimulus: "this is html",
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
