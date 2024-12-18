import { clickTarget, simulateTimeline, startTimeline } from "@jspsych/test-utils";

import htmlButtonResponse from ".";

jest.useFakeTimers();

describe("html-button-response", () => {
  it("displays html stimulus and buttons", async () => {
    const { getHTML } = await startTimeline([
      {
        type: htmlButtonResponse,
        stimulus: "this is html",
        choices: ["button-choice"],
      },
    ]);

    expect(getHTML()).toMatchInlineSnapshot(
      '"<div id="jspsych-html-button-response-stimulus">this is html</div><div id="jspsych-html-button-response-btngroup" class="jspsych-btn-group-grid" style="grid-template-columns: repeat(1, 1fr); grid-template-rows: repeat(1, 1fr);"><button class="jspsych-btn" data-choice="0">button-choice</button></div>"'
    );
  });

  it("respects the `button_html` parameter", async () => {
    const buttonHtmlFn = jest.fn();
    buttonHtmlFn.mockReturnValue("<button>something-unique</button>");

    const { getHTML } = await startTimeline([
      {
        type: htmlButtonResponse,
        stimulus: "this is html",
        choices: ["buttonChoice"],
        button_html: buttonHtmlFn,
      },
    ]);

    expect(buttonHtmlFn).toHaveBeenCalledWith("buttonChoice", 0);
    expect(getHTML()).toContain("something-unique");
  });

  test("prompt should append below button", async () => {
    const { getHTML } = await startTimeline([
      {
        type: htmlButtonResponse,
        stimulus: "this is html",
        choices: ["button-choice"],
        prompt: "<p>this is a prompt</p>",
      },
    ]);

    expect(getHTML()).toContain("</button></div><p>this is a prompt</p>");
  });

  it("should clear the display after the button has been clicked", async () => {
    const { getHTML, expectFinished, displayElement } = await startTimeline([
      {
        type: htmlButtonResponse,
        stimulus: "this is html",
        choices: ["button-choice"],
      },
    ]);

    await clickTarget(displayElement.querySelector('[data-choice="0"]'));

    await expectFinished();

    expect(getHTML()).toEqual("");
  });

  it("should hide stimulus if stimulus-duration is set", async () => {
    const { displayElement } = await startTimeline([
      {
        type: htmlButtonResponse,
        stimulus: "this is html",
        choices: ["button-choice"],
        stimulus_duration: 500,
      },
    ]);

    const stimulusElement = displayElement.querySelector<HTMLElement>(
      "#jspsych-html-button-response-stimulus"
    );

    expect(stimulusElement.style.visibility).toBe("");

    jest.advanceTimersByTime(500);
    expect(stimulusElement.style.visibility).toBe("hidden");
  });

  it("should end trial when trial duration is reached", async () => {
    const { getHTML, expectFinished } = await startTimeline([
      {
        type: htmlButtonResponse,
        stimulus: "this is html",
        choices: ["button-choice"],
        trial_duration: 500,
      },
    ]);

    expect(getHTML()).toContain(
      '<div id="jspsych-html-button-response-stimulus">this is html</div>'
    );

    jest.advanceTimersByTime(500);
    await expectFinished();
  });

  it("should end trial when button is clicked", async () => {
    const { getHTML, expectFinished, displayElement } = await startTimeline([
      {
        type: htmlButtonResponse,
        stimulus: "this is html",
        choices: ["button-choice"],
        response_ends_trial: true,
      },
    ]);

    expect(getHTML()).toContain(
      '<div id="jspsych-html-button-response-stimulus">this is html</div>'
    );

    await clickTarget(displayElement.querySelector('[data-choice="0"]'));
    await expectFinished();
  });

  test("class should have responded when button is clicked", async () => {
    const { getHTML, displayElement } = await startTimeline([
      {
        type: htmlButtonResponse,
        stimulus: "this is html",
        choices: ["button-choice"],
        response_ends_trial: false,
      },
    ]);

    expect(getHTML()).toContain(
      '<div id="jspsych-html-button-response-stimulus">this is html</div>'
    );

    await clickTarget(displayElement.querySelector('[data-choice="0"]'));
    expect(
      displayElement.querySelector("#jspsych-html-button-response-stimulus").classList
    ).toContain("responded");
  });

  test("buttons should be disabled first and then enabled after enable_button_after is set", async () => {
    const { getHTML } = await startTimeline([
      {
        type: htmlButtonResponse,
        stimulus: "this is html",
        choices: ["button-choice"],
        enable_button_after: 500,
      },
    ]);

    const btns = document.querySelectorAll("div#jspsych-html-button-response-btngroup button");
    expect(btns.length).toBeGreaterThan(0);

    for (let i = 0; i < btns.length; i++) {
      expect(btns[i].getAttribute("disabled")).toBe("disabled");
    }

    jest.advanceTimersByTime(500);

    for (let i = 0; i < btns.length; i++) {
      expect(btns[i].hasAttribute("disabled")).toBe(false);
    }
  });
});

describe("html-button-response simulation", () => {
  test("data mode works", async () => {
    const ENABLE_BUTTON_AFTER = 2000;

    const timeline = [
      {
        type: htmlButtonResponse,
        stimulus: "foo",
        choices: ["a", "b", "c"],
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
        type: htmlButtonResponse,
        stimulus: "foo",
        choices: ["a", "b", "c"],
        enable_button_after: ENABLE_BUTTON_AFTER,
      },
    ];

    const { expectFinished, expectRunning, getHTML, getData } = await simulateTimeline(
      timeline,
      "visual"
    );

    await expectRunning();

    expect(getHTML()).toContain("foo");

    jest.runAllTimers();

    await expectFinished();

    const response = getData().values()[0].response;

    expect(getData().values()[0].rt).toBeGreaterThan(ENABLE_BUTTON_AFTER);
    expect(response).toBeGreaterThanOrEqual(0);
    expect(response).toBeLessThanOrEqual(2);
  });
});
