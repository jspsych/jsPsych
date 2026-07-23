import {
  flushPromises,
  keyDown,
  keyUp,
  pressKey,
  simulateTimeline,
  startTimeline,
} from "@jspsych/test-utils";

import htmlKeyboardResponse from ".";

jest.useFakeTimers();

describe("html-keyboard-response", () => {
  test("displays html stimulus", async () => {
    const { getHTML, expectFinished } = await startTimeline([
      {
        type: htmlKeyboardResponse,
        stimulus: "this is html",
      },
    ]);

    expect(getHTML()).toBe('<div id="jspsych-html-keyboard-response-stimulus">this is html</div>');
    await pressKey("a");
    await expectFinished();
  });

  test("display clears after key press", async () => {
    const { getHTML, expectFinished } = await startTimeline([
      {
        type: htmlKeyboardResponse,
        stimulus: "this is html",
        choices: ["f", "j"],
      },
    ]);
    expect(getHTML()).toContain(
      '<div id="jspsych-html-keyboard-response-stimulus">this is html</div>'
    );

    await pressKey("f");
    expect(getHTML()).toBe("");
    await expectFinished();
  });

  test("prompt should append html below stimulus", async () => {
    const { getHTML, expectFinished } = await startTimeline([
      {
        type: htmlKeyboardResponse,
        stimulus: "this is html",
        choices: ["f", "j"],
        prompt: '<div id="foo">this is a prompt</div>',
      },
    ]);

    expect(getHTML()).toContain(
      '<div id="jspsych-html-keyboard-response-stimulus">this is html</div><div id="foo">this is a prompt</div>'
    );

    await pressKey("f");
    await expectFinished();
  });

  test("should hide stimulus if stimulus-duration is set", async () => {
    const { displayElement, expectFinished } = await startTimeline([
      {
        type: htmlKeyboardResponse,
        stimulus: "this is html",
        choices: ["f", "j"],
        stimulus_duration: 500,
      },
    ]);

    expect(
      displayElement.querySelector<HTMLElement>("#jspsych-html-keyboard-response-stimulus").style
        .visibility
    ).toMatch("");

    jest.advanceTimersByTime(500);

    expect(
      displayElement.querySelector<HTMLElement>("#jspsych-html-keyboard-response-stimulus").style
        .visibility
    ).toBe("hidden");

    await pressKey("f");
    await expectFinished();
  });

  test("should end trial when trial duration is reached", async () => {
    const { getHTML, expectFinished } = await startTimeline([
      {
        type: htmlKeyboardResponse,
        stimulus: "this is html",
        choices: ["f", "j"],
        trial_duration: 500,
      },
    ]);

    expect(getHTML()).toBe('<div id="jspsych-html-keyboard-response-stimulus">this is html</div>');
    jest.advanceTimersByTime(500);
    await expectFinished();
  });

  test("should end trial when key press", async () => {
    const { getHTML, expectFinished } = await startTimeline([
      {
        type: htmlKeyboardResponse,
        stimulus: "this is html",
        choices: ["f", "j"],
        response_ends_trial: true,
      },
    ]);

    expect(getHTML()).toContain(
      '<div id="jspsych-html-keyboard-response-stimulus">this is html</div>'
    );

    await pressKey("f");
    await expectFinished();
  });

  test("class should say responded when key is pressed", async () => {
    const { getHTML, expectRunning, displayElement } = await startTimeline([
      {
        type: htmlKeyboardResponse,
        stimulus: "this is html",
        choices: ["f", "j"],
        response_ends_trial: false,
      },
    ]);

    expect(getHTML()).toContain(
      '<div id="jspsych-html-keyboard-response-stimulus">this is html</div>'
    );

    await pressKey("f");

    expect(displayElement.querySelector("#jspsych-html-keyboard-response-stimulus").className).toBe(
      " responded"
    );

    await expectRunning();
  });
});

describe("html-keyboard-response wait_for_key_release", () => {
  test("does not end the trial until the key is released and records the hold duration", async () => {
    const { getData, expectRunning, expectFinished } = await startTimeline([
      {
        type: htmlKeyboardResponse,
        stimulus: "this is html",
        choices: ["a"],
        wait_for_key_release: true,
      },
    ]);

    jest.advanceTimersByTime(100);
    await keyDown("a");

    // the trial should still be running because the key has not been released
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
        type: htmlKeyboardResponse,
        stimulus: "this is html",
        choices: ["a"],
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
        type: htmlKeyboardResponse,
        stimulus: "this is html",
        choices: ["a"],
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
        type: htmlKeyboardResponse,
        stimulus: "this is html",
        choices: ["a"],
      },
    ]);

    await keyDown("a");
    await expectFinished();

    expect(getData().values()[0].rt_key_duration).toBe(null);
  });

  test("a key held past trial_duration does not contaminate the next trial", async () => {
    const { getData, expectRunning, expectFinished } = await startTimeline([
      {
        type: htmlKeyboardResponse,
        stimulus: "trial 1",
        choices: ["a"],
        wait_for_key_release: true,
        trial_duration: 1000,
      },
      {
        type: htmlKeyboardResponse,
        stimulus: "trial 2",
        choices: ["a"],
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

describe("html-keyboard-response simulation", () => {
  test("data mode works", async () => {
    const timeline = [
      {
        type: htmlKeyboardResponse,
        stimulus: "foo",
      },
    ];

    const { expectFinished, getData } = await simulateTimeline(timeline);

    await expectFinished();

    expect(getData().values()[0].rt).toBeGreaterThan(0);
    expect(typeof getData().values()[0].response).toBe("string");
  });

  test("visual mode works", async () => {
    const timeline = [
      {
        type: htmlKeyboardResponse,
        stimulus: "foo",
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

    expect(getData().values()[0].rt).toBeGreaterThan(0);
    expect(typeof getData().values()[0].response).toBe("string");
  });
});
