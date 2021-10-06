import { startTimeline } from "@jspsych/test-utils";

import survey from ".";

describe("survey plugin", () => {
  test("", async () => {
    const { displayElement, expectRunning, getData } = await startTimeline([
      {
        type: survey,
      },
    ]);

    await expectRunning();
  });
});
