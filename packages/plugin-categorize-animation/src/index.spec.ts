import { pressKey, simulateTimeline, startTimeline } from "@jspsych/test-utils";

import categorizeAnimation from ".";

jest.useFakeTimers();

describe("categorize-animation plugin", () => {
  test("displays stimulus every 500ms", async () => {
    const { getHTML } = await startTimeline([
      {
        type: categorizeAnimation,
        stimuli: ["img/happy_face_1.jpg", "img/sad_face_1.jpg"],
        key_answer: "d",
        render_on_canvas: false,
      },
    ]);

    expect(getHTML()).toEqual(
      '<img src="img/happy_face_1.jpg" class="jspsych-categorize-animation-stimulus">'
    );
    jest.advanceTimersByTime(500);
    expect(getHTML()).toEqual(
      '<img src="img/sad_face_1.jpg" class="jspsych-categorize-animation-stimulus">'
    );
  });

  test("no delay before first image (tests #1885)", async () => {
    const { getHTML } = await startTimeline([
      {
        type: categorizeAnimation,
        stimuli: ["img/happy_face_1.jpg", "img/sad_face_1.jpg"],
        key_answer: "d",
        render_on_canvas: false,
      },
    ]);

    expect(getHTML()).toEqual(
      '<img src="img/happy_face_1.jpg" class="jspsych-categorize-animation-stimulus">'
    );
    jest.advanceTimersByTime(500);
    expect(getHTML()).toEqual(
      '<img src="img/sad_face_1.jpg" class="jspsych-categorize-animation-stimulus">'
    );
  });

  test("prompt should display after animation", async () => {
    const { getHTML } = await startTimeline([
      {
        type: categorizeAnimation,
        stimuli: ["img/happy_face_1.jpg", "img/sad_face_1.jpg"],
        key_answer: "d",
        prompt:
          "<p>Press d if the faces had different emotional expressions. Press S if the faces had the same emotional expression.</p>",
        render_on_canvas: false,
      },
    ]);

    jest.advanceTimersByTime(1000);
    expect(getHTML()).toEqual(
      "<p>Press d if the faces had different emotional expressions. Press S if the faces had the same emotional expression.</p>"
    );
  });

  test("should display correct if key_answer is pressed", async () => {
    const { getHTML } = await startTimeline([
      {
        type: categorizeAnimation,
        stimuli: ["img/happy_face_1.jpg", "img/sad_face_1.jpg"],
        key_answer: "d",
        choices: ["d", "s"],
        prompt:
          "<p>Press d if the faces had different emotional expressions. Press S if the faces had the same emotional expression.</p>",
        render_on_canvas: false,
      },
    ]);

    jest.advanceTimersByTime(1000);
    pressKey("d");
    jest.advanceTimersByTime(1000);
    expect(getHTML()).toBe("Correct.");
  });

  test("should display incorrect if different key is pressed", async () => {
    const { getHTML } = await startTimeline([
      {
        type: categorizeAnimation,
        stimuli: ["img/happy_face_1.jpg", "img/sad_face_1.jpg"],
        key_answer: "d",
        choices: ["d", "s"],
        prompt:
          "<p>Press d if the faces had different emotional expressions. Press S if the faces had the same emotional expression.</p>",
        render_on_canvas: false,
      },
    ]);

    jest.advanceTimersByTime(1000);
    pressKey("s");
    jest.advanceTimersByTime(1000);
    expect(getHTML()).toBe("Wrong.");
  });

  test("text answer should replace %ANS%", async () => {
    const { getHTML } = await startTimeline([
      {
        type: categorizeAnimation,
        stimuli: ["img/happy_face_1.jpg", "img/sad_face_3.jpg"],
        key_answer: "d",
        choices: ["d", "s"],
        text_answer: "different",
        correct_text: "<p>Correct. The faces had %ANS% expressions.</p>",
        incorrect_text: "<p>Incorrect. The faces had %ANS% expressions.</p>",
        prompt:
          "<p>Press D if the faces had different emotional expressions. Press S if the faces had the same emotional expression.</p>",
        render_on_canvas: false,
      },
    ]);

    jest.advanceTimersByTime(1000);
    pressKey("d");
    jest.advanceTimersByTime(1000);
    expect(getHTML()).toBe("<p>Correct. The faces had different expressions.</p>");
  });

  test("correct text displays when when key_answer is pressed", async () => {
    const { getHTML } = await startTimeline([
      {
        type: categorizeAnimation,
        stimuli: ["img/happy_face_1.jpg", "img/sad_face_3.jpg"],
        key_answer: "d",
        choices: ["d", "s"],
        correct_text: "<p>You pressed the correct key</p>",
        incorrect_text: "<p>Incorrect.</p>",
        prompt:
          "<p>Press D if the faces had different emotional expressions. Press S if the faces had the same emotional expression.</p>",
        render_on_canvas: false,
      },
    ]);

    jest.advanceTimersByTime(1000);
    pressKey("d");
    jest.advanceTimersByTime(1000);
    expect(getHTML()).toBe("<p>You pressed the correct key</p>");
  });

  test("incorrect text displays when not key_answer is pressed", async () => {
    const { getHTML } = await startTimeline([
      {
        type: categorizeAnimation,
        stimuli: ["img/happy_face_1.jpg", "img/sad_face_3.jpg"],
        key_answer: "d",
        choices: ["d", "s"],
        correct_text: "<p>You pressed the correct key</p>",
        incorrect_text: "<p>Incorrect. You pressed the wrong key.</p>",
        prompt:
          "<p>Press D if the faces had different emotional expressions. Press S if the faces had the same emotional expression.</p>",
        render_on_canvas: false,
      },
    ]);

    jest.advanceTimersByTime(1500);
    pressKey("s");
    jest.advanceTimersByTime(1000);
    expect(getHTML()).toBe("<p>Incorrect. You pressed the wrong key.</p>");
  });

  test("duration to display image is based on frame_time", async () => {
    const { getHTML } = await startTimeline([
      {
        type: categorizeAnimation,
        stimuli: ["img/happy_face_1.jpg", "img/sad_face_1.jpg"],
        key_answer: "d",
        choices: ["d", "s"],
        frame_time: 1000,
        correct_text: "<p>You pressed the correct key</p>",
        incorrect_text: "<p>Incorrect. You pressed the wrong key.</p>",
        prompt:
          "<p>Press D if the faces had different emotional expressions. Press S if the faces had the same emotional expression.</p>",
        render_on_canvas: false,
      },
    ]);

    expect(getHTML()).toEqual(
      '<img src="img/happy_face_1.jpg" class="jspsych-categorize-animation-stimulus">'
    );
    jest.advanceTimersByTime(500);
    expect(getHTML()).toEqual(
      '<img src="img/happy_face_1.jpg" class="jspsych-categorize-animation-stimulus">'
    );
    jest.advanceTimersByTime(500);
    expect(getHTML()).toEqual(
      '<img src="img/sad_face_1.jpg" class="jspsych-categorize-animation-stimulus">'
    );
  });

  test("sequence reps", async () => {
    const { getHTML } = await startTimeline([
      {
        type: categorizeAnimation,
        stimuli: ["img/happy_face_1.jpg", "img/sad_face_1.jpg"],
        key_answer: "d",
        choices: ["d", "s"],
        frame_time: 1000,
        sequence_reps: 2,
        correct_text: "<p>You pressed the correct key</p>",
        incorrect_text: "<p>Incorrect. You pressed the wrong key.</p>",
        prompt:
          "<p>Press D if the faces had different emotional expressions. Press S if the faces had the same emotional expression.</p>",
        render_on_canvas: false,
      },
    ]);

    for (let i = 0; i < 2; i++) {
      expect(getHTML()).toEqual(
        '<img src="img/happy_face_1.jpg" class="jspsych-categorize-animation-stimulus">'
      );
      jest.advanceTimersByTime(1000);
      expect(getHTML()).toEqual(
        '<img src="img/sad_face_1.jpg" class="jspsych-categorize-animation-stimulus">'
      );
      jest.advanceTimersByTime(1000);
    }
  });

  test("subject can response before animation is completed", async () => {
    const { getHTML } = await startTimeline([
      {
        type: categorizeAnimation,
        stimuli: ["img/happy_face_1.jpg", "img/sad_face_1.jpg"],
        key_answer: "d",
        choices: ["d", "s"],
        frame_time: 1000,
        sequence_reps: 2,
        correct_text: "<p>You pressed the correct key</p>",
        incorrect_text: "<p>Incorrect. You pressed the wrong key.</p>",
        prompt:
          "<p>Press D if the faces had different emotional expressions. Press S if the faces had the same emotional expression.</p>",
        allow_response_before_complete: true,
        render_on_canvas: false,
      },
    ]);

    jest.advanceTimersByTime(500);
    pressKey("d");
    jest.advanceTimersByTime(1000);
    expect(getHTML()).toEqual(
      '<img src="img/sad_face_1.jpg" class="jspsych-categorize-animation-stimulus"><p>You pressed the correct key</p>'
    );
  });

  test("display should clear after feeback_duration is done", async () => {
    const { getHTML, expectFinished } = await startTimeline([
      {
        type: categorizeAnimation,
        stimuli: ["img/happy_face_1.jpg", "img/sad_face_1.jpg"],
        key_answer: "d",
        choices: ["d", "s"],
        frame_time: 500,
        feeback_duration: 500,
        correct_text: "<p>You pressed the correct key</p>",
        incorrect_text: "<p>Incorrect. You pressed the wrong key.</p>",
        prompt:
          "<p>Press D if the faces had different emotional expressions. Press S if the faces had the same emotional expression.</p>",
        render_on_canvas: false,
      },
    ]);

    jest.advanceTimersByTime(1000);
    pressKey("d");
    jest.advanceTimersByTime(500);
    expect(getHTML()).toBe("<p>You pressed the correct key</p>");
    jest.advanceTimersByTime(2000);

    await expectFinished();
  });
});

describe("categorize-animation plugin simulation", () => {
  test("data-only mode works", async () => {
    const { getData, expectFinished } = await simulateTimeline([
      {
        type: categorizeAnimation,
        stimuli: ["img/happy_face_1.jpg", "img/sad_face_1.jpg"],
        frame_time: 500,
        key_answer: "d",
        render_on_canvas: false,
      },
    ]);

    await expectFinished();
    expect(getData().values()[0].rt).toBeGreaterThan(1000);
  });

  test("visual mode works", async () => {
    const { getData, expectRunning, expectFinished } = await simulateTimeline(
      [
        {
          type: categorizeAnimation,
          stimuli: ["img/happy_face_1.jpg", "img/sad_face_1.jpg"],
          frame_time: 500,
          key_answer: "d",
          render_on_canvas: false,
        },
      ],
      "visual"
    );

    await expectRunning();

    jest.runAllTimers();

    await expectFinished();

    expect(getData().values()[0].rt).toBeGreaterThan(1000);
  });
});
