import { pressKey, startTimeline } from "@jspsych/test-utils";

import imageKeyboardResponse from ".";

jest.useFakeTimers();

describe("image-keyboard-response", () => {
  test("displays image stimulus", async () => {
    const { getHTML, expectFinished } = await startTimeline([
      {
        type: imageKeyboardResponse,
        stimulus: "../media/blue.png",
        render_on_canvas: false,
      },
    ]);

    expect(getHTML()).toContain(
      '<img src="../media/blue.png" id="jspsych-image-keyboard-response-stimulus"'
    );

    pressKey("a");
    await expectFinished();
  });

  test("display clears after key press", async () => {
    const { getHTML, expectFinished } = await startTimeline([
      {
        type: imageKeyboardResponse,
        stimulus: "../media/blue.png",
        choices: ["f", "j"],
        render_on_canvas: false,
      },
    ]);

    expect(getHTML()).toContain(
      '<img src="../media/blue.png" id="jspsych-image-keyboard-response-stimulus"'
    );

    pressKey("f");
    await expectFinished();
  });

  test("prompt should append html", async () => {
    const { getHTML, expectFinished } = await startTimeline([
      {
        type: imageKeyboardResponse,
        stimulus: "../media/blue.png",
        choices: ["f", "j"],
        prompt: '<div id="foo">this is a prompt</div>',
        render_on_canvas: false,
      },
    ]);

    expect(getHTML()).toContain('<div id="foo">this is a prompt</div>');
    pressKey("f");
    await expectFinished();
  });

  test("should hide stimulus if stimulus-duration is set", async () => {
    const { displayElement, expectFinished } = await startTimeline([
      {
        type: imageKeyboardResponse,
        stimulus: "../media/blue.png",
        choices: ["f", "j"],
        stimulus_duration: 500,
        render_on_canvas: false,
      },
    ]);

    const stimulusElement = displayElement.querySelector<HTMLElement>(
      "#jspsych-image-keyboard-response-stimulus"
    );

    expect(stimulusElement.style.visibility).toContain("");

    jest.advanceTimersByTime(500);
    expect(stimulusElement.style.visibility).toContain("hidden");

    pressKey("f");
    await expectFinished();
  });

  test("should end trial when trial duration is reached", async () => {
    const { getHTML, expectFinished } = await startTimeline([
      {
        type: imageKeyboardResponse,
        stimulus: "../media/blue.png",
        choices: ["f", "j"],
        trial_duration: 500,
        render_on_canvas: false,
      },
    ]);

    expect(getHTML()).toContain(
      '<img src="../media/blue.png" id="jspsych-image-keyboard-response-stimulus"'
    );
    jest.advanceTimersByTime(500);
    await expectFinished();
  });

  test("should end trial when key is pressed", async () => {
    const { getHTML, expectFinished } = await startTimeline([
      {
        type: imageKeyboardResponse,
        stimulus: "../media/blue.png",
        choices: ["f", "j"],
        response_ends_trial: true,
        render_on_canvas: false,
      },
    ]);

    expect(getHTML()).toContain(
      '<img src="../media/blue.png" id="jspsych-image-keyboard-response-stimulus"'
    );

    pressKey("f");
    await expectFinished();
  });

  test("should show console warning when trial duration is null and response ends trial is false", async () => {
    const spy = jest.spyOn(console, "warn").mockImplementation(() => {});

    const { getHTML } = await startTimeline([
      {
        type: imageKeyboardResponse,
        stimulus: "../media/blue.png",
        choices: ["f", "j"],
        response_ends_trial: false,
        trial_duration: null,
        render_on_canvas: false,
      },
    ]);

    expect(spy).toHaveBeenCalled();
    spy.mockRestore();
  });
});
