import { pressKey, startTimeline } from "@jspsych/test-utils";

import browserCheck from ".";

jest.useFakeTimers();

describe("browser-check", () => {
  test("contains data on window size", async () => {
    const { expectFinished, getData } = await startTimeline([
      {
        type: browserCheck,
      },
    ]);

    console.log(getData().values()[0]);

    await expectFinished();

    expect(getData().values()[0].window_width).not.toBeUndefined();
  });
});
