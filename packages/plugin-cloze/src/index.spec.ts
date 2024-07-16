import { clickTarget, flushPromises, simulateTimeline, startTimeline } from "@jspsych/test-utils";

import cloze from ".";

jest.useFakeTimers();

const getInputElementById = (id: string) => document.getElementById(id) as HTMLInputElement;

const clickFinishButton = () => clickTarget(document.querySelector("#finish_cloze_button"));

describe("cloze", () => {
  test("displays cloze", async () => {
    const { getHTML, expectFinished } = await startTimeline([
      {
        type: cloze,
        text: "This is a %cloze% text.",
      },
    ]);

    expect(getHTML()).toContain(
      '<div class="cloze">This is a <input type="text" id="input0" value=""> text.</div>'
    );

    await clickFinishButton();
    await expectFinished();
  });

  test("displays default button text", async () => {
    const { getHTML, expectFinished } = await startTimeline([
      {
        type: cloze,
        text: "This is a %cloze% text.",
      },
    ]);

    expect(getHTML()).toContain(
      '<button class="jspsych-html-button-response-button" type="button" id="finish_cloze_button">OK</button>'
    );

    await clickFinishButton();
    await expectFinished();
  });

  test("displays custom button text", async () => {
    const { getHTML, expectFinished } = await startTimeline([
      {
        type: cloze,
        text: "This is a %cloze% text.",
        button_text: "Next",
      },
    ]);

    expect(getHTML()).toContain(
      '<button class="jspsych-html-button-response-button" type="button" id="finish_cloze_button">Next</button>'
    );

    await clickFinishButton();
    await expectFinished();
  });

  test("ends trial on button click when using default settings, i.e. answers are not checked", async () => {
    const { expectFinished } = await startTimeline([
      {
        type: cloze,
        text: "This is a %cloze% text.",
      },
    ]);

    await clickFinishButton();
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
    await clickFinishButton();
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
    await clickFinishButton();
    await expectFinished();
  });

  test("does not end trial on button click when answers are checked and not correct or missing", async () => {
    const { expectRunning, expectFinished } = await startTimeline([
      {
        type: cloze,
        text: "This is a %cloze% text.",
        check_answers: true,
      },
    ]);

    getInputElementById("input0").value = "some wrong answer";
    await clickFinishButton();
    await expectRunning();

    getInputElementById("input0").value = "";
    await clickFinishButton();
    await expectRunning();

    getInputElementById("input0").value = "cloze";
    await clickFinishButton();
    await expectFinished();
  });

  test("does not call mistake function on button click when answers are checked and correct", async () => {
    const mistakeFn = jest.fn();

    const { expectFinished } = await startTimeline([
      {
        type: cloze,
        text: "This is a %cloze% text.",
        check_answers: true,
        mistake_fn: mistakeFn,
      },
    ]);

    getInputElementById("input0").value = "cloze";
    await clickFinishButton();
    expect(mistakeFn).not.toHaveBeenCalled();

    await expectFinished();
  });

  test("does not call mistake function on button click when answers are checked for completion and are complete", async () => {
    const mistakeFn = jest.fn();

    const { expectFinished } = await startTimeline([
      {
        type: cloze,
        text: "This is a %cloze% text.",
        allow_blanks: false,
        mistake_fn: mistakeFn,
      },
    ]);

    getInputElementById("input0").value = "cloze";
    await clickFinishButton();
    expect(mistakeFn).not.toHaveBeenCalled();

    await expectFinished();
  });

  test("calls mistake function on button click when answers are checked and not correct or missing", async () => {
    const mistakeFn = jest.fn();

    const { expectFinished } = await startTimeline([
      {
        type: cloze,
        text: "This is a %cloze% text.",
        check_answers: true,
        mistake_fn: mistakeFn,
      },
    ]);

    getInputElementById("input0").value = "some wrong answer";
    await clickFinishButton();
    expect(mistakeFn).toHaveBeenCalled();

    mistakeFn.mockReset();

    getInputElementById("input0").value = "";
    await clickFinishButton();
    expect(mistakeFn).toHaveBeenCalled();

    getInputElementById("input0").value = "cloze";
    await clickFinishButton();
    await expectFinished();
  });

  test("response data is stored as an array", async () => {
    const { getData, expectFinished } = await startTimeline([
      {
        type: cloze,
        text: "This is a %cloze% text. Here is another cloze response box %%.",
      },
    ]);

    getInputElementById("input0").value = "cloze1";
    getInputElementById("input1").value = "cloze2";
    await clickFinishButton();
    await expectFinished();

    const data = getData().values()[0].response;
    expect(data).toEqual(["cloze1", "cloze2"]);
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

    const response = getData().values()[0].response;
    expect(response[0]).toBe("cloze");
    expect(response[1]).not.toBe("");
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

    const response = getData().values()[0].response;
    expect(response[0]).toBe("cloze");
    expect(response[1]).not.toBe("");
  });
});
