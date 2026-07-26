import { flushPromises, keyDown, keyUp, pressKey, startTimeline } from "@jspsych/test-utils";

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

describe("image-keyboard-response wait_for_key_release", () => {
  test("does not end the trial until the key is released and records the hold duration", async () => {
    const { getData, expectRunning, expectFinished } = await startTimeline([
      {
        type: imageKeyboardResponse,
        stimulus: "../media/blue.png",
        choices: ["a"],
        render_on_canvas: false,
        wait_for_key_release: true,
      },
    ]);

    jest.advanceTimersByTime(100);
    await keyDown("a");

    await expectRunning();

    jest.advanceTimersByTime(250);
    await keyUp("a");

    await expectFinished();

    expect(getData().values()[0].rt).toBe(100);
    expect(getData().values()[0].rt_key_duration).toBe(250);
  });

  test("records the hold duration when the trial ends by duration", async () => {
    const { getData, expectFinished } = await startTimeline([
      {
        type: imageKeyboardResponse,
        stimulus: "../media/blue.png",
        choices: ["a"],
        render_on_canvas: false,
        wait_for_key_release: true,
        response_ends_trial: false,
        trial_duration: 1000,
      },
    ]);

    await keyDown("a");
    jest.advanceTimersByTime(250);
    await keyUp("a");

    jest.advanceTimersByTime(750);
    await expectFinished();

    expect(getData().values()[0].rt_key_duration).toBe(250);
  });

  test("records a null response when the trial ends while the key is still held", async () => {
    const { getData, expectFinished } = await startTimeline([
      {
        type: imageKeyboardResponse,
        stimulus: "../media/blue.png",
        choices: ["a"],
        render_on_canvas: false,
        wait_for_key_release: true,
        response_ends_trial: false,
        trial_duration: 1000,
      },
    ]);

    await keyDown("a");
    jest.advanceTimersByTime(1000);
    await expectFinished();

    expect(getData().values()[0].response).toBe(null);
    expect(getData().values()[0].rt).toBe(null);
    expect(getData().values()[0].rt_key_duration).toBe(null);

    await keyUp("a");
  });

  test("rt_key_duration is null on default trials (wait_for_key_release false)", async () => {
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

    expect(getData().values()[0].rt_key_duration).toBe(null);
  });

  test("a key held past trial_duration does not contaminate the next trial", async () => {
    const { getData, expectRunning, expectFinished } = await startTimeline([
      {
        type: imageKeyboardResponse,
        stimulus: "../media/blue.png",
        choices: ["a"],
        render_on_canvas: false,
        wait_for_key_release: true,
        trial_duration: 1000,
      },
      {
        type: imageKeyboardResponse,
        stimulus: "../media/blue.png",
        choices: ["a"],
        render_on_canvas: false,
        wait_for_key_release: true,
      },
    ]);

    // trial 1: press and hold the key, then let the trial time out
    await keyDown("a");
    jest.advanceTimersByTime(1000);
    await flushPromises();

    // trial 1 ended by duration with no response because the key was never released
    expect(getData().values()[0].response).toBe(null);
    expect(getData().values()[0].rt).toBe(null);
    expect(getData().values()[0].rt_key_duration).toBe(null);

    // trial 2 is now running with the key still held; a key-repeat must not register
    await keyDown("a");
    await expectRunning();

    // releasing the held-over key must not register a response in trial 2
    await keyUp("a");
    await expectRunning();

    // a fresh press/release cycle in trial 2 works normally
    jest.advanceTimersByTime(200);
    await keyDown("a");
    jest.advanceTimersByTime(125);
    await keyUp("a");

    await expectFinished();

    expect(getData().values()[1].response).toBe("a");
    expect(getData().values()[1].rt).toBe(200);
    expect(getData().values()[1].rt_key_duration).toBe(125);
  });
});
