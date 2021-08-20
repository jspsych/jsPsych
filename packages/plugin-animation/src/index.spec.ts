import { startTimeline } from "jspsych/tests/utils";

import animation from ".";

jest.useFakeTimers();

describe("animation plugin", () => {
  test("displays stimuli", async () => {
    const { getHTML, expectFinished } = await startTimeline([
      {
        type: animation,
        stimuli: ["img/face_1.jpg", "img/face_2.jpg"],
        render_on_canvas: false,
      },
    ]);

    // TODO (bjoluc) Is it intended to wait before showing the first frame?
    jest.advanceTimersByTime(250);

    expect(getHTML()).toBe('<img src="img/face_1.jpg" id="jspsych-animation-image">');
    jest.advanceTimersByTime(250);
    expect(getHTML()).toBe('<img src="img/face_2.jpg" id="jspsych-animation-image">');
    jest.advanceTimersByTime(250);

    await expectFinished();
  });
});
