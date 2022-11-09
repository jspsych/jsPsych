import { clickTarget, startTimeline } from "@jspsych/test-utils";

import survey from ".";

describe("survey plugin", () => {
  test("loads", async () => {
    const { displayElement, expectRunning, getData } = await startTimeline([
      {
        type: survey,
        pages: [
          [
            {
              type: "drop-down",
              prompt: "foo",
              options: ["1", "2"],
            },
          ],
        ],
      },
    ]);

    await expectRunning();
  });

  // drop-down
  test("loads drop-down question with defaults", async () => {
    const { displayElement, getHTML, expectFinished } = await startTimeline([
      {
        type: survey,
        pages: [
          [
            {
              type: "drop-down",
              prompt: "foo",
              options: ["1", "2"],
            },
          ],
        ],
      },
    ]);

    // check that label displayed
    const question = displayElement.querySelector('div[data-name="P0_Q0"]');
    expect(question).not.toBeNull();
    expect(question.querySelector("span").innerHTML).toBe("foo");

    // check that dropdown displayed
    const dropdown_menu = displayElement.getElementsByTagName("select");
    expect(dropdown_menu[0]).not.toBeNull();

    // check that finish button displayed
    const finish_button = displayElement.querySelector("input.sv_complete_btn");
    expect(finish_button).not.toBeNull();

    clickTarget(finish_button);

    await expectFinished();
  });

  // html
  test("loads html question with defaults", async () => {
    const { displayElement, expectFinished, getData } = await startTimeline([
      {
        type: survey,
        pages: [
          [
            {
              type: "html",
              prompt: "<span id='prompt'>foo</span>",
            },
          ],
        ],
      },
    ]);

    const question = displayElement.querySelector('div[data-name="P0_Q0"]');
    expect(question).not.toBeNull();
    expect(question.querySelector("#prompt").innerHTML).toBe("foo");

    const finish_button = displayElement.querySelector("input.sv_complete_btn");
    expect(finish_button).not.toBeNull();
    clickTarget(finish_button);

    await expectFinished();
  });

  // likert
  // test("loads likert question with defaults", async () => {
  //   const { displayElement, expectFinished, getData } = await startTimeline([
  //     {
  //       type: survey,
  //       pages: [[{
  //         type: 'likert', prompt: 'foo', statements: [{prompt: 's1'},{prompt: 's2'}], options: ['fizz','buzz']
  //       }]]
  //     },
  //   ]);
  // });

  // multi-choice
  test("loads multi-choice question with defaults", async () => {
    const { displayElement, expectFinished, getData } = await startTimeline([
      {
        type: survey,
        pages: [
          [
            {
              type: "multi-choice",
              prompt: "foo",
              options: ["fizz", "buzz"],
            },
          ],
        ],
      },
    ]);

    const question = displayElement.querySelector('div[data-name="P0_Q0"]');
    expect(question).not.toBeNull();
    expect(question.querySelector("span").innerHTML).toBe("foo");

    const radio_btns = displayElement.querySelectorAll("input[type='radio']");
    expect(radio_btns).not.toBeNull();
    expect(radio_btns.length).toBe(2);

    const finish_button = displayElement.querySelector("input.sv_complete_btn");
    expect(finish_button).not.toBeNull();

    clickTarget(finish_button);

    await expectFinished();
  });

  // multi-select
  test("loads multi-select question with defaults", async () => {
    const { displayElement, expectFinished, getData } = await startTimeline([
      {
        type: survey,
        pages: [
          [
            {
              type: "multi-select",
              prompt: "foo",
              options: ["fizz", "buzz"],
            },
          ],
        ],
      },
    ]);

    const question = displayElement.querySelector('div[data-name="P0_Q0"]');
    expect(question).not.toBeNull();
    expect(question.querySelector("span").innerHTML).toBe("foo");

    const checkboxes = displayElement.querySelectorAll("input[type='checkbox']");
    expect(checkboxes).not.toBeNull();
    expect(checkboxes.length).toBe(2);

    const finish_button = displayElement.querySelector("input.sv_complete_btn");
    expect(finish_button).not.toBeNull();
    clickTarget(finish_button);

    await expectFinished();
  });

  // text
  test("loads single-line text question with defaults", async () => {
    const { displayElement, expectFinished, getData } = await startTimeline([
      {
        type: survey,
        pages: [
          [
            {
              type: "text",
              prompt: "foo",
            },
          ],
        ],
      },
    ]);

    const question = displayElement.querySelector('div[data-name="P0_Q0"]');
    expect(question).not.toBeNull();
    expect(question.querySelector("span").innerHTML).toBe("foo");

    const textinput = displayElement.querySelectorAll("input");
    expect(textinput[0]).not.toBeNull();
    expect(textinput[0].type).toBe("text");
    expect(textinput[0].size).toBe(40);

    const finish_button = displayElement.querySelector("input.sv_complete_btn");
    expect(finish_button).not.toBeNull();
    clickTarget(finish_button);

    await expectFinished();
  });

  test("loads multi-line text question with defaults", async () => {
    const { displayElement, expectFinished, getData } = await startTimeline([
      {
        type: survey,
        pages: [
          [
            {
              type: "text",
              prompt: "foo",
              textbox_rows: 2,
            },
          ],
        ],
      },
    ]);

    const question = displayElement.querySelector('div[data-name="P0_Q0"]');
    expect(question).not.toBeNull();
    expect(question.querySelector("span").innerHTML).toBe("foo");

    const textarea = displayElement.querySelectorAll("textarea");
    expect(textarea[0]).not.toBeNull();
    expect(textarea[0].cols).toBe(40);
    expect(textarea[0].rows).toBe(2);

    const finish_button = displayElement.querySelector("input.sv_complete_btn");
    expect(finish_button).not.toBeNull();
    clickTarget(finish_button);

    await expectFinished();
  });

  test("loads single-line text questions of various input types", async () => {
    jest.setTimeout(40000); // default timeout of 5s is too short for this test

    const inputTypes = [
      "color",
      "date",
      "datetime-local",
      "email",
      "month",
      "number",
      "password",
      "range",
      "tel",
      "text",
      "time",
      "url",
      "week",
    ];

    for (const inputType of inputTypes) {
      const { displayElement, expectFinished, getData } = await startTimeline([
        {
          type: survey,
          pages: [
            [
              {
                type: "text",
                prompt: "foo",
                input_type: inputType,
                textbox_columns: 10,
              },
            ],
          ],
        },
      ]);

      const question = displayElement.querySelector('div[data-name="P0_Q0"]');
      expect(question).not.toBeNull();
      expect(question.querySelector("span").innerHTML).toBe("foo");

      const input = displayElement.querySelectorAll("input")[0];
      expect(input).not.toBeNull();
      expect(input.type).toEqual(inputType);
      if (["email", "password", "tel", "url", "text"].includes(inputType)) {
        // size can be specified only for text input types
        expect(input.size).toEqual(10);
      } else {
        expect(input.size).not.toEqual(10);
      }

      const finish_button = displayElement.querySelector("input.sv_complete_btn");
      expect(finish_button).not.toBeNull();
      clickTarget(finish_button);

      await expectFinished();
    }
  });

  // survey options
});
