import { clickTarget, startTimeline } from "@jspsych/test-utils";

import cloze from ".";

jest.useFakeTimers();

const getIntpuElementById = (id: string) => document.getElementById(id) as HTMLInputElement;

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

    getIntpuElementById("input0").value = "cloze";
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

    getIntpuElementById("input0").value = "some wrong answer";
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

    getIntpuElementById("input0").value = "cloze";
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

    getIntpuElementById("input0").value = "some wrong answer";
    clickTarget(document.querySelector("#finish_cloze_button"));
    expect(mistakeFn).toHaveBeenCalled();
  });

  test("response data is stored as an array", async () => {
    const { getData } = await startTimeline([
      {
        type: cloze,
        text: "This is a %cloze% text. Here is another cloze response box %%.",
      },
    ]);

    getIntpuElementById("input0").value = "cloze1";
    getIntpuElementById("input1").value = "cloze2";
    clickTarget(document.querySelector("#finish_cloze_button"));

    const data = getData().values()[0].response;
    expect(data.length).toBe(2);
    expect(data[0]).toBe("cloze1");
    expect(data[1]).toBe("cloze2");
  });
});
