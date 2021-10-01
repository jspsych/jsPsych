import { startTimeline } from "@jspsych/test-utils";

import callFunction from ".";

describe("call-function plugin", () => {
  test("calls function", async () => {
    const { getData, expectFinished } = await startTimeline([
      {
        type: callFunction,
        func: () => 1,
      },
    ]);

    await expectFinished();
    expect(getData().values()[0].value).toBe(1);
  });

  test("async function works", async () => {
    const { getData, expectFinished } = await startTimeline([
      {
        type: callFunction,
        async: true,
        func: (done) => {
          done(10);
        },
      },
    ]);

    await expectFinished();
    expect(getData().values()[0].value).toBe(10);
  });
});
