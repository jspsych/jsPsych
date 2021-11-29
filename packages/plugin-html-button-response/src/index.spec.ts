import { clickTarget, simulateTimeline, startTimeline } from "@jspsych/test-utils";

import htmlButtonResponse from ".";

jest.useFakeTimers();

describe("html-button-response", () => {
  test("displays html stimulus", async () => {
    const { getHTML } = await startTimeline([
      {
        type: htmlButtonResponse,
        stimulus: "this is html",
        choices: ["button-choice"],
      },
    ]);

    expect(getHTML()).toContain(
      '<div id="jspsych-html-button-response-stimulus">this is html</div>'
    );
  });

  test("display button labels", async () => {
    const { getHTML } = await startTimeline([
      {
        type: htmlButtonResponse,
        stimulus: "this is html",
        choices: ["button-choice1", "button-choice2"],
      },
    ]);

    expect(getHTML()).toContain('<button class="jspsych-btn">button-choice1</button>');
    expect(getHTML()).toContain('<button class="jspsych-btn">button-choice2</button>');
  });

  test("display button html", async () => {
    const { getHTML } = await startTimeline([
      {
        type: htmlButtonResponse,
        stimulus: "this is html",
        choices: ["buttonChoice"],
        button_html: '<button class="jspsych-custom-button">%choice%</button>',
      },
    ]);

    expect(getHTML()).toContain('<button class="jspsych-custom-button">buttonChoice</button>');
  });

  test("display should clear after button click", async () => {
    const { getHTML, expectFinished } = await startTimeline([
      {
        type: htmlButtonResponse,
        stimulus: "this is html",
        choices: ["button-choice"],
      },
    ]);

    expect(getHTML()).toContain(
      '<div id="jspsych-html-button-response-stimulus">this is html</div>'
    );

    clickTarget(document.querySelector("#jspsych-html-button-response-button-0"));

    await expectFinished();
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

    expect(getHTML()).toContain(
      '<button class="jspsych-btn">button-choice</button></div></div><p>this is a prompt</p>'
    );
  });

  test("should hide stimulus if stimulus-duration is set", async () => {
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

  test("should end trial when trial duration is reached", async () => {
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

  test("should end trial when button is clicked", async () => {
    const { getHTML, expectFinished } = await startTimeline([
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

    clickTarget(document.querySelector("#jspsych-html-button-response-button-0"));
    await expectFinished();
  });

  test("class should have responded when button is clicked", async () => {
    const { getHTML } = await startTimeline([
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

    clickTarget(document.querySelector("#jspsych-html-button-response-button-0"));
    expect(document.querySelector("#jspsych-html-button-response-stimulus").className).toBe(
      " responded"
    );
  });
});

describe("html-button-response simulation", () => {
  test("data mode works", async () => {
    const timeline = [
      {
        type: htmlButtonResponse,
        stimulus: "foo",
        choices: ["a", "b", "c"],
      },
    ];

    const { expectFinished, getData } = await simulateTimeline(timeline);

    await expectFinished();

    const response = getData().values()[0].response;

    expect(getData().values()[0].rt).toBeGreaterThan(0);
    expect(response).toBeGreaterThanOrEqual(0);
    expect(response).toBeLessThanOrEqual(2);
  });

  test("visual mode works", async () => {
    const timeline = [
      {
        type: htmlButtonResponse,
        stimulus: "foo",
        choices: ["a", "b", "c"],
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

    expect(getData().values()[0].rt).toBeGreaterThan(0);
    expect(response).toBeGreaterThanOrEqual(0);
    expect(response).toBeLessThanOrEqual(2);
  });
});
