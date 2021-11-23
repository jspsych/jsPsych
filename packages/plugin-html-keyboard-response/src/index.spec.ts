import { pressKey, simulateTimeline, startTimeline } from "@jspsych/test-utils";

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
    pressKey("a");
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

    pressKey("f");
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

    pressKey("f");
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

    pressKey("f");
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

    pressKey("f");
    await expectFinished();
  });

  test("class should say responded when key is pressed", async () => {
    const { getHTML, expectRunning } = await startTimeline([
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

    pressKey("f");

    expect(document.querySelector("#jspsych-html-keyboard-response-stimulus").className).toBe(
      " responded"
    );

    await expectRunning();
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
