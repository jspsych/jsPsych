import { clickTarget, startTimeline } from "@jspsych/test-utils";

import imageButtonResponse from ".";

jest.useFakeTimers();

describe("image-button-response", () => {
  test("displays image stimulus", async () => {
    const { getHTML } = await startTimeline([
      {
        type: imageButtonResponse,
        stimulus: "../media/blue.png",
        choices: ["button-choice"],
        render_on_canvas: false,
      },
    ]);

    expect(getHTML()).toContain('<img src="../media/blue.png"');
  });

  test("display button labels", async () => {
    const { getHTML } = await startTimeline([
      {
        type: imageButtonResponse,
        stimulus: "../media/blue.png",
        choices: ["button-choice1", "button-choice2"],
        render_on_canvas: false,
      },
    ]);

    expect(getHTML()).toContain('<button class="jspsych-btn">button-choice1</button>');
    expect(getHTML()).toContain('<button class="jspsych-btn">button-choice2</button>');
  });

  test("display button html", async () => {
    const { getHTML } = await startTimeline([
      {
        type: imageButtonResponse,
        stimulus: "../media/blue.png",
        choices: ["buttonChoice"],
        button_html: '<button class="jspsych-custom-button">%choice%</button>',
        render_on_canvas: false,
      },
    ]);

    expect(getHTML()).toContain('<button class="jspsych-custom-button">buttonChoice</button>');
  });

  test("display should clear after button click", async () => {
    const { getHTML, expectFinished } = await startTimeline([
      {
        type: imageButtonResponse,
        stimulus: "../media/blue.png",
        choices: ["button-choice"],
        render_on_canvas: false,
      },
    ]);

    expect(getHTML()).toContain(
      '<img src="../media/blue.png" id="jspsych-image-button-response-stimulus"'
    );

    clickTarget(document.querySelector("#jspsych-image-button-response-button-0"));
    await expectFinished();
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

    expect(getHTML()).toContain(
      '<button class="jspsych-btn">button-choice</button></div></div><p>This is a prompt</p>'
    );
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
    expect(stimulusElement.style.visibility).toContain("");
    jest.advanceTimersByTime(500);
    expect(stimulusElement.style.visibility).toContain("hidden");
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
    const { getHTML, expectFinished } = await startTimeline([
      {
        type: imageButtonResponse,
        stimulus: "../media/blue.png",
        choices: ["button-choice"],
        response_ends_trial: true,
        render_on_canvas: false,
      },
    ]);

    expect(getHTML()).toContain(
      '<img src="../media/blue.png" id="jspsych-image-button-response-stimulus"'
    );

    clickTarget(document.querySelector("#jspsych-image-button-response-button-0"));
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
});
