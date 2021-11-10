import { pressKey, simulateTimeline, startTimeline } from "@jspsych/test-utils";

import animation from ".";

jest.useFakeTimers();

describe("animation plugin", () => {
  test("no delay before first frame (#1885)", async () => {
    const { getHTML, expectFinished } = await startTimeline([
      {
        type: animation,
        stimuli: ["img/face_1.jpg", "img/face_2.jpg"],
        render_on_canvas: false,
      },
    ]);

    expect(getHTML()).toBe('<img src="img/face_1.jpg" id="jspsych-animation-image">');
    jest.advanceTimersByTime(250);
    expect(getHTML()).toBe('<img src="img/face_2.jpg" id="jspsych-animation-image">');
    jest.advanceTimersByTime(250);

    await expectFinished();
  });
});

describe("animation simulation", () => {
  test("data mode works", async () => {
    const timeline = [
      {
        type: animation,
        stimuli: ["1.png", "2.png", "3.png", "4.png"],
        sequence_reps: 3,
        render_on_canvas: false,
      },
    ];

    const { expectFinished, getData } = await simulateTimeline(timeline);

    await expectFinished();

    const data = getData().values()[0];

    expect(data.animation_sequence.length).toBe(12);
    expect(data.response).not.toBeUndefined();
  });

  test("visual mode works", async () => {
    const timeline = [
      {
        type: animation,
        stimuli: ["1.png", "2.png", "3.png", "4.png"],
        sequence_reps: 3,
        frame_time: 50,
        frame_isi: 50,
        render_on_canvas: false,
      },
    ];

    const { expectFinished, expectRunning, getHTML, getData, displayElement } =
      await simulateTimeline(timeline, "visual");

    await expectRunning();

    expect(getHTML()).toContain("1.png");
    jest.advanceTimersByTime(50);
    expect(displayElement.querySelector("img").style.visibility).toBe("hidden");
    jest.advanceTimersByTime(50);
    expect(getHTML()).toContain("2.png");

    jest.runAllTimers();

    await expectFinished();

    const data = getData().values()[0];

    expect(data.animation_sequence.length).toBe(24);
    expect(data.response).not.toBeUndefined();
  });
});
