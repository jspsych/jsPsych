import { clickTarget, simulateTimeline, startTimeline } from "@jspsych/test-utils";

import imageButtonResponse from ".";

jest.useFakeTimers();

describe("image-button-response", () => {
  test("displays image stimulus and buttons", async () => {
    const { getHTML } = await startTimeline([
      {
        type: imageButtonResponse,
        stimulus: "../media/blue.png",
        choices: ["button-choice"],
        render_on_canvas: false,
      },
    ]);

    // expect(getHTML()).toContain('<img ');
    expect(getHTML()).toMatchInlineSnapshot(
      '"<img src="../media/blue.png" id="jspsych-image-button-response-stimulus"><div id="jspsych-image-button-response-btngroup" class="jspsych-btn-group-grid" style="grid-template-columns: repeat(1, 1fr); grid-template-rows: repeat(1, 1fr);"><button class="jspsych-btn" data-choice="0">button-choice</button></div>"'
    );
  });

  it("respects the `button_html` parameter", async () => {
    const buttonHtmlFn = jest.fn();
    buttonHtmlFn.mockReturnValue("<button>something-unique</button>");

    const { getHTML } = await startTimeline([
      {
        type: imageButtonResponse,
        stimulus: "../media/blue.png",
        choices: ["buttonChoice"],
        button_html: buttonHtmlFn,
      },
    ]);

    expect(buttonHtmlFn).toHaveBeenCalledWith("buttonChoice", 0);
    expect(getHTML()).toContain("something-unique");
  });

  test("display should clear after button click", async () => {
    const { getHTML, displayElement, expectFinished } = await startTimeline([
      {
        type: imageButtonResponse,
        stimulus: "../media/blue.png",
        choices: ["button-choice"],
        render_on_canvas: false,
      },
    ]);

    await clickTarget(displayElement.querySelector('[data-choice="0"]'));
    await expectFinished();
    expect(getHTML()).toEqual("");
  });

  test("prompt should append below button", async () => {
    const { getHTML } = await startTimeline([
      {
        type: imageButtonResponse,
        stimulus: "../media/blue.png",
        choices: ["button-choice"],
        prompt: "<p>This is a prompt</p>",
        render_on_canvas: false,
      },
    ]);

    expect(getHTML()).toContain("</button></div><p>This is a prompt</p>");
  });

  test("should hide stimulus if stimulus-duration is set", async () => {
    const { getHTML, displayElement } = await startTimeline([
      {
        type: imageButtonResponse,
        stimulus: "../media/blue.png",
        choices: ["button-choice"],
        stimulus_duration: 500,
        render_on_canvas: false,
      },
    ]);

    const stimulusElement = displayElement.querySelector<HTMLElement>(
      "#jspsych-image-button-response-stimulus"
    );
    expect(stimulusElement.style.visibility).toEqual("");
    jest.advanceTimersByTime(500);
    expect(stimulusElement.style.visibility).toEqual("hidden");
  });

  test("should end trial when trial duration is reached", async () => {
    const { getHTML, expectFinished } = await startTimeline([
      {
        type: imageButtonResponse,
        stimulus: "../media/blue.png",
        choices: ["f", "j"],
        trial_duration: 500,
        render_on_canvas: false,
      },
    ]);

    expect(getHTML()).toContain(
      '<img src="../media/blue.png" id="jspsych-image-button-response-stimulus"'
    );
    jest.advanceTimersByTime(500);
    await expectFinished();
  });

  test("should end trial when button is clicked", async () => {
    const { getHTML, expectFinished, displayElement } = await startTimeline([
      {
        type: imageButtonResponse,
        stimulus: "../media/blue.png",
        choices: ["button-choice"],
        response_ends_trial: true,
        render_on_canvas: false,
      },
    ]);

    await clickTarget(displayElement.querySelector('[data-choice="0"]'));
    await expectFinished();
  });

  test("should show console warning when trial duration is null and response ends trial is false", async () => {
    const spy = jest.spyOn(console, "warn").mockImplementation(() => {});

    await startTimeline([
      {
        type: imageButtonResponse,
        stimulus: "../media/blue.png",
        choices: ["button-choice"],
        response_ends_trial: false,
        trial_duration: null,
        render_on_canvas: false,
      },
    ]);

    expect(spy).toHaveBeenCalled();
    spy.mockRestore();
  });

  test("delay enable button", async () => {
    const { getHTML, expectFinished } = await startTimeline([
      {
        type: imageButtonResponse,
        stimulus: "../media/blue.png",
        choices: ["button-choice"],
        enable_button_after: 500,
        render_on_canvas: false,
      },
    ]);

    const btns = document.querySelectorAll(".jspsych-image-button-response-button button");

    for (let i = 0; i < btns.length; i++) {
      expect(btns[i].getAttribute("disabled")).toBe("disabled");
    }

    jest.advanceTimersByTime(500);

    for (let i = 0; i < btns.length; i++) {
      expect(btns[i].hasAttribute("disabled")).toBe(false);
    }
  });
});

describe("image-button-response simulation", () => {
  test("data mode works", async () => {
    const ENABLE_BUTTON_AFTER = 2000;

    const timeline = [
      {
        type: imageButtonResponse,
        stimulus: "foo.png",
        choices: ["a", "b", "c"],
        render_on_canvas: false,
        enable_button_after: ENABLE_BUTTON_AFTER,
      },
    ];

    const { expectFinished, getData } = await simulateTimeline(timeline);

    await expectFinished();

    const response = getData().values()[0].response;

    expect(getData().values()[0].rt).toBeGreaterThan(ENABLE_BUTTON_AFTER);
    expect(response).toBeGreaterThanOrEqual(0);
    expect(response).toBeLessThanOrEqual(2);
  });

  test("visual mode works", async () => {
    const ENABLE_BUTTON_AFTER = 2000;

    const timeline = [
      {
        type: imageButtonResponse,
        stimulus: "foo.png",
        choices: ["a", "b", "c"],
        render_on_canvas: false,
        enable_button_after: ENABLE_BUTTON_AFTER,
      },
    ];

    const { expectFinished, expectRunning, getHTML, getData } = await simulateTimeline(
      timeline,
      "visual"
    );

    await expectRunning();

    jest.runAllTimers();

    await expectFinished();

    const response = getData().values()[0].response;

    expect(getData().values()[0].rt).toBeGreaterThan(ENABLE_BUTTON_AFTER);
    expect(response).toBeGreaterThanOrEqual(0);
    expect(response).toBeLessThanOrEqual(2);
  });
});
