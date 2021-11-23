import { clickTarget, simulateTimeline, startTimeline } from "@jspsych/test-utils";

import maxdiff from ".";

jest.useFakeTimers();

describe("maxdiff plugin", () => {
  test("returns appropriate response with randomization", async () => {
    const { getData, expectFinished } = await startTimeline([
      {
        type: maxdiff,
        alternatives: ["a", "b", "c", "d"],
        labels: ["Most", "Least"],
        randomize_alternative_order: true,
      },
    ]);

    document.querySelector<HTMLInputElement>('input[data-name="0"][name="left"]').checked = true;
    document.querySelector<HTMLInputElement>('input[data-name="1"][name="right"]').checked = true;

    clickTarget(document.querySelector("#jspsych-maxdiff-next"));
    await expectFinished();

    expect(getData().values()[0].response).toEqual({ left: "a", right: "b" });
  });
});

describe("maxdiff plugin simulation", () => {
  test("data-only mode works", async () => {
    const { getData, expectFinished } = await simulateTimeline([
      {
        type: maxdiff,
        alternatives: ["a", "b", "c", "d"],
        labels: ["Most", "Least"],
        required: true,
      },
    ]);

    await expectFinished();

    expect(getData().values()[0].response.left).not.toBeNull();
    expect(getData().values()[0].response.right).not.toBeNull();
  });

  test("visual mode works", async () => {
    const { getData, expectFinished, expectRunning } = await simulateTimeline(
      [
        {
          type: maxdiff,
          alternatives: ["a", "b", "c", "d"],
          labels: ["Most", "Least"],
          required: true,
        },
      ],
      "visual"
    );

    await expectRunning();

    jest.runAllTimers();

    await expectFinished();

    expect(getData().values()[0].response.left).not.toBeNull();
    expect(getData().values()[0].response.right).not.toBeNull();
  });
});
