import { keyDown, keyUp, pressKey, startTimeline } from "@jspsych/test-utils";

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

    await pressKey("a");
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

    await pressKey("f");
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
    await pressKey("f");
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

    await pressKey("f");
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

    await pressKey("f");
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

describe("image-keyboard-response rt_key_duration", () => {
  test("records key hold duration when the response ends the trial", async () => {
    const { getData, expectFinished } = await startTimeline([
      {
        type: imageKeyboardResponse,
        stimulus: "../media/blue.png",
        choices: ["a"],
        render_on_canvas: false,
      },
    ]);

    await keyDown("a");
    await expectFinished();

    jest.advanceTimersByTime(250);
    await keyUp("a");

    expect(getData().values()[0].rt_key_duration).toBe(250);
  });

  test("records key hold duration when the trial ends by duration", async () => {
    const { getData, expectFinished } = await startTimeline([
      {
        type: imageKeyboardResponse,
        stimulus: "../media/blue.png",
        choices: ["a"],
        response_ends_trial: false,
        trial_duration: 1000,
        render_on_canvas: false,
      },
    ]);

    await keyDown("a");
    jest.advanceTimersByTime(250);
    await keyUp("a");

    jest.advanceTimersByTime(750);
    await expectFinished();

    expect(getData().values()[0].rt_key_duration).toBe(250);
  });

  test("rt_key_duration is null when no response is given", async () => {
    const { getData, expectFinished } = await startTimeline([
      {
        type: imageKeyboardResponse,
        stimulus: "../media/blue.png",
        choices: ["a"],
        trial_duration: 1000,
        render_on_canvas: false,
      },
    ]);

    jest.advanceTimersByTime(1000);
    await expectFinished();

    expect(getData().values()[0].rt_key_duration).toBe(null);
  });
});
