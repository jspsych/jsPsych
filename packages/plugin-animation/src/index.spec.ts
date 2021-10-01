import { startTimeline } from "@jspsych/test-utils";

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
