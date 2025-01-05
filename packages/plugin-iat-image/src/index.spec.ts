import { pressKey, simulateTimeline, startTimeline } from "@jspsych/test-utils";

import iatImage from ".";

jest.useFakeTimers();

describe("iat-image plugin", () => {
  test("displays image by default", async () => {
    const { getHTML, expectFinished } = await startTimeline([
      {
        type: iatImage,
        stimulus: "../media/blue.png",
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

    expect(getHTML()).toContain("blue.png");

    await pressKey("f");
    await expectFinished();
  });

  test("display should only clear when left key is pressed", async () => {
    const { getHTML, expectFinished } = await startTimeline([
      {
        type: iatImage,
        stimulus: "../media/blue.png",
        left_category_key: "f",
        left_category_label: ["FRIENDLY"],
        stim_key_association: "left",
        key_to_move_forward: ["f"],
      },
    ]);

    await pressKey("j");
    expect(getHTML()).toContain('<img src="../media/blue.png" id="jspsych-iat-stim">');

    await pressKey("f");
    await expectFinished();
  });

  test("display should only clear when right key is pressed", async () => {
    const { getHTML, expectFinished } = await startTimeline([
      {
        type: iatImage,
        stimulus: "../media/blue.png",
        right_category_key: "j",
        right_category_label: ["UNFRIENDLY"],
        stim_key_association: "right",
        key_to_move_forward: ["j"],
      },
    ]);

    await pressKey("f");
    expect(getHTML()).toContain('<img src="../media/blue.png" id="jspsych-iat-stim">');

    await pressKey("j");
    await expectFinished();
  });

  test("display should clear when any key is pressed", async () => {
    const { getHTML, expectFinished } = await startTimeline([
      {
        type: iatImage,
        stimulus: "../media/blue.png",
        left_category_key: "f",
        right_category_key: "j",
        left_category_label: ["FRIENDLY"],
        right_category_label: ["UNFRIENDLY"],
        stim_key_association: "right",
        key_to_move_forward: "ALL_KEYS",
        display_feedback: true,
      },
    ]);

    await pressKey("f");
    expect(getHTML()).toContain(
      '<img src="../media/blue.png" id="jspsych-iat-stim" class=" responded">'
    );

    await pressKey("a");
    await expectFinished();
  });

  test("display should clear only when key_to_move_forward is pressed", async () => {
    const { getHTML, expectFinished } = await startTimeline([
      {
        type: iatImage,
        stimulus: "../media/blue.png",
        left_category_key: "f",
        right_category_key: "j",
        left_category_label: ["FRIENDLY"],
        right_category_label: ["UNFRIENDLY"],
        stim_key_association: "left",
        display_feedback: true,
        key_to_move_forward: ["x"],
      },
    ]);

    await pressKey("j");
    expect(getHTML()).toContain(
      '<img src="../media/blue.png" id="jspsych-iat-stim" class=" responded">'
    );

    await pressKey("x");
    await expectFinished();
  });

  test("labels should be with assigned key characters", async () => {
    const { getHTML, expectFinished } = await startTimeline([
      {
        type: iatImage,
        stimulus: "../media/blue.png",
        left_category_key: "f",
        right_category_key: "j",
        left_category_label: ["FRIENDLY"],
        right_category_label: ["UNFRIENDLY"],
        stim_key_association: "left",
      },
    ]);

    expect(getHTML()).toContain("<p>Press j for:<br> <b>UNFRIENDLY</b>");
    expect(getHTML()).toContain("<p>Press f for:<br> <b>FRIENDLY</b>");

    await pressKey("f");
    await expectFinished();
  });

  test("should display wrong image when wrong key is pressed", async () => {
    const { getHTML, expectFinished, displayElement } = await startTimeline([
      {
        type: iatImage,
        stimulus: "../media/blue.png",
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
    await pressKey("j");
    expect(wrongImageContainer.style.visibility).toBe("visible");

    await pressKey("a");
    await expectFinished();
  });

  test("trial_duration should end trial after time has elapsed; only if display_feedback is false", async () => {
    const { getHTML, expectFinished } = await startTimeline([
      {
        type: iatImage,
        stimulus: "../media/blue.png",
        display_feedback: false,
        response_ends_trial: false,
        stim_key_association: "left",
        trial_duration: 500,
      },
    ]);

    expect(getHTML()).toContain('<img src="../media/blue.png" id="jspsych-iat-stim">');

    jest.advanceTimersByTime(500);
    await expectFinished();
  });

  test("trial should not end when response_ends_trial is false and stimulus should get responded class", async () => {
    const { getHTML, expectRunning } = await startTimeline([
      {
        type: iatImage,
        stimulus: "../media/blue.png",
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

    await pressKey("f");
    expect(getHTML()).toContain(
      '<img src="../media/blue.png" id="jspsych-iat-stim" class=" responded">'
    );

    await expectRunning();
  });

  test("should accept functions as parameters(trial_duration in use, response ends trial false)", async () => {
    const { getHTML, expectFinished, displayElement } = await startTimeline([
      {
        type: iatImage,
        stimulus: function () {
          return "../media/blue.png";
        },
        display_feedback: function () {
          return true;
        },
        html_when_wrong: function () {
          return '<span style="color: red; font-size: 80px">X</span>';
        },
        left_category_key: function () {
          return "e";
        },
        right_category_key: function () {
          return "i";
        },
        left_category_label: function () {
          return ["FRIENDLY"];
        },
        right_category_label: function () {
          return ["UNFRIENDLY"];
        },
        stim_key_association: function () {
          return "left";
        },
        trial_duration: function () {
          return 1000;
        },
        response_ends_trial: function () {
          return false;
        },
      },
    ]);

    expect(getHTML()).toContain('<img src="../media/blue.png" id="jspsych-iat-stim">');

    jest.advanceTimersByTime(500);

    await pressKey("i");
    expect(displayElement.querySelector<HTMLElement>("#wrongImgContainer").style.visibility).toBe(
      "visible"
    );

    jest.advanceTimersByTime(600);

    await expectFinished();
  });

  test("should accept functions as parameters(trial_duration is not in use)", async () => {
    const { getHTML, expectFinished } = await startTimeline([
      {
        type: iatImage,
        stimulus: function () {
          return "../media/blue.png";
        },
        display_feedback: function () {
          return true;
        },
        html_when_wrong: function () {
          return '<span style="color: red; font-size: 80px">X</span>';
        },
        left_category_key: function () {
          return "e";
        },
        right_category_key: function () {
          return "i";
        },
        left_category_label: function () {
          return ["FRIENDLY"];
        },
        right_category_label: function () {
          return ["UNFRIENDLY"];
        },
        stim_key_association: function () {
          return "left";
        },
        key_to_move_forward: function () {
          return "ALL_KEYS";
        },
        trial_duration: function () {
          return 1000;
        },
        response_ends_trial: function () {
          return true;
        },
      },
    ]);

    expect(getHTML()).toContain('<img src="../media/blue.png" id="jspsych-iat-stim">');

    await pressKey("i");
    expect(getHTML()).toContain(
      '<img src="../media/blue.png" id="jspsych-iat-stim" class=" responded">'
    );

    jest.advanceTimersByTime(1000);

    expect(getHTML()).toContain(
      '<img src="../media/blue.png" id="jspsych-iat-stim" class=" responded">'
    );

    jest.advanceTimersByTime(500);

    await pressKey("a");
    await expectFinished();
  });

  test("response not required after wrong answer (tests #1898)", async () => {
    const { getHTML, expectFinished } = await startTimeline([
      {
        type: iatImage,
        stimulus: "../media/blue.png",
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

    expect(getHTML()).toContain("blue.png");
    await pressKey("j");

    await expectFinished();
  });
});

describe("iat-image plugin simulation", () => {
  test("data-only mode works", async () => {
    const { getData, expectFinished } = await simulateTimeline([
      {
        type: iatImage,
        stimulus: "dog.png",
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
          type: iatImage,
          stimulus: "dog.png",
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
