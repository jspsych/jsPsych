import { clickTarget, simulateTimeline, startTimeline } from "@jspsych/test-utils";

import cloze from ".";

jest.useFakeTimers();

const getInputElementById = (id: string) => document.getElementById(id) as HTMLInputElement;

describe("cloze", () => {
  test("displays cloze", async () => {
    const { getHTML } = await startTimeline([
      {
        type: cloze,
        text: "This is a %cloze% text.",
      },
    ]);

    expect(getHTML()).toContain(
      '<div class="cloze">This is a <input type="text" id="input0" value=""> text.</div>'
    );
  });

  test("displays default button text", async () => {
    const { getHTML } = await startTimeline([
      {
        type: cloze,
        text: "This is a %cloze% text.",
      },
    ]);

    expect(getHTML()).toContain(
      '<button class="jspsych-html-button-response-button" type="button" id="finish_cloze_button">OK</button>'
    );
  });

  test("displays custom button text", async () => {
    const { getHTML } = await startTimeline([
      {
        type: cloze,
        text: "This is a %cloze% text.",
        button_text: "Next",
      },
    ]);

    expect(getHTML()).toContain(
      '<button class="jspsych-html-button-response-button" type="button" id="finish_cloze_button">Next</button>'
    );
  });

  test("ends trial on button click when using default settings, i.e. answers are not checked", async () => {
    const { expectFinished } = await startTimeline([
      {
        type: cloze,
        text: "This is a %cloze% text.",
      },
    ]);

    clickTarget(document.querySelector("#finish_cloze_button"));
    await expectFinished();
  });

  test("ends trial on button click when answers are checked and correct", async () => {
    const { expectFinished } = await startTimeline([
      {
        type: cloze,
        text: "This is a %cloze% text.",
        check_answers: true,
      },
    ]);

    getInputElementById("input0").value = "cloze";
    clickTarget(document.querySelector("#finish_cloze_button"));
    await expectFinished();
  });

  test("ends trial on button click when all answers are checked for completion and are complete", async () => {
    const { expectFinished } = await startTimeline([
      {
        type: cloze,
        text: "This is a %cloze% text.",
        allow_blanks: false,
      },
    ]);

    getInputElementById("input0").value = "filler";
    clickTarget(document.querySelector("#finish_cloze_button"));
    await expectFinished();
  });

  test("does not end trial on button click when answers are checked and not correct", async () => {
    const { expectRunning } = await startTimeline([
      {
        type: cloze,
        text: "This is a %cloze% text.",
        check_answers: true,
      },
    ]);

    getInputElementById("input0").value = "some wrong answer";
    clickTarget(document.querySelector("#finish_cloze_button"));
    await expectRunning();
  });

  test("does not end trial on button click when answers are checked for completion and some are missing", async () => {
    const { expectRunning } = await startTimeline([
      {
        type: cloze,
        text: "This is a %cloze% text.",
        allow_blanks: false,
      },
    ]);

    getInputElementById("input0").value = "";
    clickTarget(document.querySelector("#finish_cloze_button"));
    await expectRunning();
  });

  test("does not call mistake function on button click when answers are checked and correct", async () => {
    const mistakeFn = jest.fn();

    await startTimeline([
      {
        type: cloze,
        text: "This is a %cloze% text.",
        check_answers: true,
        mistake_fn: mistakeFn,
      },
    ]);

    getInputElementById("input0").value = "cloze";
    clickTarget(document.querySelector("#finish_cloze_button"));
    expect(mistakeFn).not.toHaveBeenCalled();
  });

  test("does not call mistake function on button click when answers are checked for completion and are complete", async () => {
    const mistakeFn = jest.fn();

    await startTimeline([
      {
        type: cloze,
        text: "This is a %cloze% text.",
        allow_blanks: false,
        mistake_fn: mistakeFn,
      },
    ]);

    getInputElementById("input0").value = "cloze";
    clickTarget(document.querySelector("#finish_cloze_button"));
    expect(mistakeFn).not.toHaveBeenCalled();
  });

  test("calls mistake function on button click when answers are checked and not correct", async () => {
    const mistakeFn = jest.fn();

    await startTimeline([
      {
        type: cloze,
        text: "This is a %cloze% text.",
        check_answers: true,
        mistake_fn: mistakeFn,
      },
    ]);

    getInputElementById("input0").value = "some wrong answer";
    clickTarget(document.querySelector("#finish_cloze_button"));
    expect(mistakeFn).toHaveBeenCalled();
  });

  test("calls mistake function on button click when answers are checked for completion and are not complete", async () => {
    const mistakeFn = jest.fn();

    await startTimeline([
      {
        type: cloze,
        text: "This is a %cloze% text.",
        check_answers: true,
        mistake_fn: mistakeFn,
      },
    ]);

    getInputElementById("input0").value = "";
    clickTarget(document.querySelector("#finish_cloze_button"));
    expect(mistakeFn).toHaveBeenCalled();
  });

  test("response data is stored as an array", async () => {
    const { getData, getHTML } = await startTimeline([
      {
        type: cloze,
        text: "This is a %cloze% text. Here is another cloze response box %%.",
      },
    ]);

    getInputElementById("input0").value = "cloze1";
    getInputElementById("input1").value = "cloze2";
    clickTarget(document.querySelector("#finish_cloze_button"));

    const data = getData().values()[0].response;
    expect(data.length).toBe(2);
    expect(data[0]).toBe("cloze1");
    expect(data[1]).toBe("cloze2");
  });
});

describe("cloze simulation", () => {
  test("data-only mode works", async () => {
    const { getData, expectFinished } = await simulateTimeline([
      {
        type: cloze,
        text: "This is a %cloze% text. Here is another cloze response box %%.",
      },
    ]);

    await expectFinished();

    const data = getData().values()[0];
    expect(data.response[0]).toBe("cloze");
    expect(data.response[1]).not.toBe("");
  });
  test("visual mode works", async () => {
    const { getData, expectFinished, expectRunning } = await simulateTimeline(
      [
        {
          type: cloze,
          text: "This is a %cloze% text. Here is another cloze response box %%.",
        },
      ],
      "visual"
    );

    await expectRunning();

    jest.runAllTimers();

    await expectFinished();

    const data = getData().values()[0];
    expect(data.response[0]).toBe("cloze");
    expect(data.response[1]).not.toBe("");
  });
});
