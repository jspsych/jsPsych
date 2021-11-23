import { pressKey, simulateTimeline, startTimeline } from "@jspsych/test-utils";

import iatHtml from ".";

jest.useFakeTimers();

describe("iat-html plugin", () => {
  test("displays html by default", async () => {
    const { getHTML, expectFinished } = await startTimeline([
      {
        type: iatHtml,
        stimulus: "<p>dogs</p>",
        response_ends_trial: true,
        display_feedback: false,
        left_category_key: "f",
        right_category_key: "j",
        left_category_label: ["FRIENDLY"],
        right_category_label: ["UNFRIENDLY"],
        stim_key_association: "left",
        trial_duration: 500,
      },
    ]);

    expect(getHTML()).toContain('<p id="jspsych-iat-stim"></p><p>dogs</p><p></p>');

    pressKey("f");
    await expectFinished();
  });

  test("display should only clear when left key is pressed", async () => {
    const { getHTML, expectFinished } = await startTimeline([
      {
        type: iatHtml,
        stimulus: "<p>hello</p>",
        left_category_key: "f",
        left_category_label: ["FRIENDLY"],
        stim_key_association: "left",
        key_to_move_forward: ["f"],
      },
    ]);

    pressKey(" ");
    expect(getHTML()).toContain('<p id="jspsych-iat-stim"></p><p>hello</p><p></p>');

    pressKey("f");
    await expectFinished();
  });

  test("display should only clear when right key is pressed", async () => {
    const { getHTML, expectFinished } = await startTimeline([
      {
        type: iatHtml,
        stimulus: "<p>hello</p>",
        right_category_key: "j",
        right_category_label: ["UNFRIENDLY"],
        stim_key_association: "right",
        key_to_move_forward: ["j"],
      },
    ]);

    pressKey(" ");
    expect(getHTML()).toContain('<p id="jspsych-iat-stim"></p><p>hello</p><p></p>');

    pressKey("j");
    await expectFinished();
  });

  test("feedback display should clear when any key is pressed", async () => {
    const { getHTML, expectFinished } = await startTimeline([
      {
        type: iatHtml,
        stimulus: "<p>hello</p>",
        left_category_key: "f",
        right_category_key: "j",
        left_category_label: ["FRIENDLY"],
        right_category_label: ["UNFRIENDLY"],
        stim_key_association: "right",
        key_to_move_forward: "ALL_KEYS",
        display_feedback: true,
      },
    ]);

    pressKey("f");
    expect(getHTML()).toContain('<p id="jspsych-iat-stim" class=" responded"></p><p>hello</p>');

    pressKey(" ");
    await expectFinished();
  });

  test("feedback display should clear only when key_to_move_forward is pressed", async () => {
    const { getHTML, expectFinished } = await startTimeline([
      {
        type: iatHtml,
        stimulus: "<p>hello</p>",
        left_category_key: "f",
        right_category_key: "j",
        left_category_label: ["FRIENDLY"],
        right_category_label: ["UNFRIENDLY"],
        stim_key_association: "left",
        key_to_move_forward: ["x"],
        display_feedback: true,
      },
    ]);

    pressKey("j");
    expect(getHTML()).toContain('<p id="jspsych-iat-stim" class=" responded"></p><p>hello</p>');

    pressKey("x");
    await expectFinished();
  });

  test("labels should be with assigned key characters", async () => {
    const { getHTML, expectFinished } = await startTimeline([
      {
        type: iatHtml,
        stimulus: "<p>hello</p>",
        left_category_key: "f",
        right_category_key: "j",
        left_category_label: ["FRIENDLY"],
        right_category_label: ["UNFRIENDLY"],
        stim_key_association: "left",
      },
    ]);

    expect(getHTML()).toContain("<p>Press j for:<br> <b>UNFRIENDLY</b>");
    expect(getHTML()).toContain("<p>Press f for:<br> <b>FRIENDLY</b>");

    pressKey("f");
    await expectFinished();
  });

  test("should display wrong image when wrong key is pressed", async () => {
    const { displayElement, expectFinished } = await startTimeline([
      {
        type: iatHtml,
        stimulus: "<p>hello</p>",
        html_when_wrong: '<span style="color: red; font-size: 80px">X</span>',
        display_feedback: true,
        left_category_key: "f",
        right_category_key: "j",
        left_category_label: ["FRIENDLY"],
        right_category_label: ["UNFRIENDLY"],
        stim_key_association: "left",
        key_to_move_forward: "ALL_KEYS",
        response_ends_trial: true,
      },
    ]);

    const wrongImageContainer = displayElement.querySelector<HTMLElement>("#wrongImgContainer");

    expect(wrongImageContainer.style.visibility).toBe("hidden");

    pressKey("j");
    expect(wrongImageContainer.style.visibility).toBe("visible");

    pressKey("f");
    await expectFinished();
  });

  test("trial duration should end trial after time has elapsed; only if display_feedback is false", async () => {
    const { getHTML, expectFinished } = await startTimeline([
      {
        type: iatHtml,
        stimulus: "<p>hello</p>",
        display_feedback: false,
        response_ends_trial: false,
        trial_duration: 500,
        stim_key_association: "left",
      },
    ]);

    expect(getHTML()).toContain('<p id="jspsych-iat-stim"></p><p>hello</p>');

    jest.advanceTimersByTime(500);
    await expectFinished();
  });

  test("trial should not end when response_ends_trial is false and stimulus should get responded class", async () => {
    const { getHTML, expectRunning } = await startTimeline([
      {
        type: iatHtml,
        stimulus: "<p>hello</p>",
        response_ends_trial: false,
        display_feedback: false,
        left_category_key: "f",
        right_category_key: "j",
        left_category_label: ["FRIENDLY"],
        right_category_label: ["UNFRIENDLY"],
        stim_key_association: "left",
        trial_duration: 500,
      },
    ]);

    pressKey("f");
    expect(getHTML()).toContain('<p id="jspsych-iat-stim" class=" responded"></p><p>hello</p>');

    await expectRunning();
  });

  test("should accept functions as parameters(trial_duration in use, response ends trial false)", async () => {
    const { getHTML, displayElement, expectFinished } = await startTimeline([
      {
        type: iatHtml,
        stimulus: () => "<p>hello</p>",
        display_feedback: () => true,
        html_when_wrong: () => '<span style="color: red; font-size: 80px">X</span>',
        left_category_key: () => "e",
        right_category_key: () => "i",
        left_category_label: () => ["FRIENDLY"],
        right_category_label: () => ["UNFRIENDLY"],
        stim_key_association: () => "left",
        trial_duration: () => 1000,
        response_ends_trial: () => false,
      },
    ]);

    expect(getHTML()).toContain('<p id="jspsych-iat-stim"></p><p>hello</p><p></p>');

    jest.advanceTimersByTime(500);

    pressKey("i");
    expect(displayElement.querySelector<HTMLElement>("#wrongImgContainer").style.visibility).toBe(
      "visible"
    );

    jest.advanceTimersByTime(600);
    await expectFinished();
  });

  test("should accept functions as parameters(trial_duration is not in use)", async () => {
    const { getHTML, expectFinished } = await startTimeline([
      {
        type: iatHtml,
        stimulus: () => "<p>hello</p>",
        display_feedback: () => true,
        html_when_wrong: () => '<span style="color: red; font-size: 80px">X</span>',
        left_category_key: () => "e",
        right_category_key: () => "i",
        left_category_label: () => ["FRIENDLY"],
        right_category_label: () => ["UNFRIENDLY"],
        stim_key_association: () => "left",
        key_to_move_forward: () => "ALL_KEYS",
        trial_duration: () => 1000,
        response_ends_trial: () => true,
      },
    ]);

    expect(getHTML()).toContain('<p id="jspsych-iat-stim"></p><p>hello</p>');

    pressKey("i");
    expect(getHTML()).toContain('<p id="jspsych-iat-stim" class=" responded"></p><p>hello</p>');

    jest.advanceTimersByTime(1000);
    expect(getHTML()).toContain('<p id="jspsych-iat-stim" class=" responded"></p><p>hello</p>');

    jest.advanceTimersByTime(500);
    pressKey("e");
    await expectFinished();
  });

  test("response not required after wrong answer (tests #1898)", async () => {
    const { getHTML, expectFinished } = await startTimeline([
      {
        type: iatHtml,
        stimulus: "<p>dogs</p>",
        response_ends_trial: true,
        display_feedback: false,
        left_category_key: "f",
        right_category_key: "j",
        left_category_label: ["FRIENDLY"],
        right_category_label: ["UNFRIENDLY"],
        stim_key_association: "left",
        force_correct_key_press: false,
        trial_duration: 3000,
      },
    ]);

    expect(getHTML()).toContain('<p id="jspsych-iat-stim"></p><p>dogs</p><p></p>');
    pressKey("j");

    await expectFinished();
  });
});

describe("iat-html plugin simulation", () => {
  test("data-only mode works", async () => {
    const { getData, expectFinished } = await simulateTimeline([
      {
        type: iatHtml,
        stimulus: "<p>dogs</p>",
        response_ends_trial: true,
        display_feedback: false,
        left_category_key: "f",
        right_category_key: "j",
        left_category_label: ["FRIENDLY"],
        right_category_label: ["UNFRIENDLY"],
        stim_key_association: "left",
      },
    ]);

    await expectFinished();

    expect(getData().values()[0].rt).toBeGreaterThan(0);
  });

  test("visual mode works", async () => {
    const { getData, expectFinished, expectRunning } = await simulateTimeline(
      [
        {
          type: iatHtml,
          stimulus: "<p>dogs</p>",
          response_ends_trial: true,
          display_feedback: false,
          left_category_key: "f",
          right_category_key: "j",
          left_category_label: ["FRIENDLY"],
          right_category_label: ["UNFRIENDLY"],
          stim_key_association: "left",
          //trial_duration: 500,
        },
      ],
      "visual"
    );

    await expectRunning();

    jest.runAllTimers();

    await expectFinished();

    expect(getData().values()[0].rt).toBeGreaterThan(0);
  });
});
