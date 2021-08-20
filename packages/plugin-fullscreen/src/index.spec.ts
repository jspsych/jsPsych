import { startTimeline } from "jspsych/tests/utils";

import fullscreen from ".";

describe("fullscreen plugin", () => {
  beforeEach(() => {
    document.documentElement.requestFullscreen = jest
      .fn<Promise<void>, any[]>()
      .mockResolvedValue();
  });

  test("launches fullscreen mode by default", async () => {
    await startTimeline([
      {
        type: fullscreen,
        delay_after: 0,
      },
      {
        type: "html-keyboard-response",
        stimulus: "fullscreen",
      },
    ]);

    expect(document.documentElement.requestFullscreen).not.toHaveBeenCalled();
    document.querySelector("#jspsych-fullscreen-btn").dispatchEvent(new MouseEvent("click", {}));
    expect(document.documentElement.requestFullscreen).toHaveBeenCalled();
  });
});
