import { pressKey, simulateTimeline, startTimeline } from "@jspsych/test-utils";

import instructions from ".";

jest.useFakeTimers();

describe("instructions plugin", () => {
  test("keys can be specified as strings", async () => {
    const { getHTML, expectFinished } = await startTimeline([
      {
        type: instructions,
        pages: ["page 1", "page 2"],
        key_forward: "a",
      },
    ]);

    expect(getHTML()).toContain("page 1");

    await pressKey("a");
    expect(getHTML()).toContain("page 2");

    await pressKey("a");
    await expectFinished();
  });

  test("bug issue #544 reproduce", async () => {
    const { getHTML, expectFinished } = await startTimeline([
      {
        type: instructions,
        pages: ["page 1", "page 2"],
        key_forward: "a",
        allow_backward: false,
      },
    ]);

    expect(getHTML()).toContain("page 1");

    await pressKey("a");
    expect(getHTML()).toContain("page 2");

    await pressKey("ArrowLeft");
    expect(getHTML()).toContain("page 2");

    await pressKey("a");
    await expectFinished();
  });

  test("view history data is stored as array of objects", async () => {
    const { getData, expectFinished } = await startTimeline([
      {
        type: instructions,
        pages: ["page 1", "page 2"],
        key_forward: "a",
      },
    ]);

    await pressKey("a");
    await pressKey("a");

    await expectFinished();

    var data = getData().values()[0].view_history;
    expect(data[0].page_index).toEqual(0);
    expect(data[1].page_index).toEqual(1);
  });

  test("forward and backward callback works", async () => {
    let count = [0, 0, 0, 0];
    const { expectFinished } = await startTimeline([
      {
        type: instructions,
        pages: ["page 1", "page 2", "page 3"],
        on_page_change: function (page_number: number) {
          count[page_number]++;
        },
      },
    ]);

    // Go to second page; count[1]++
    await pressKey("ArrowRight");

    // Go to first page; count[0]++
    await pressKey("ArrowLeft");

    // Go to second page; count[1]++
    await pressKey("ArrowRight");

    // Go to last page; count[2]++
    await pressKey("ArrowRight");

    // Finish trial; count[3]++
    await pressKey("ArrowRight");
    await expectFinished();

    expect(count).toEqual([1, 2, 1, 1]);
  });
});

describe("instructions plugin simulation", () => {
  test("data-only mode works", async () => {
    const { getData, expectFinished } = await simulateTimeline([
      {
        type: instructions,
        pages: ["page 1", "page 2", "page 3", "page 4", "page 5", "page 6"],
      },
    ]);

    await expectFinished();

    const data = getData().values()[0];

    expect(data.view_history.length).toBeGreaterThanOrEqual(6);
    expect(data.view_history[data.view_history.length - 1].page_index).toBe(5);
  });

  test("visual mode works", async () => {
    const { getData, expectRunning, expectFinished } = await simulateTimeline(
      [
        {
          type: instructions,
          pages: ["page 1", "page 2", "page 3", "page 4", "page 5", "page 6"],
        },
      ],
      "visual"
    );

    await expectRunning();

    jest.runAllTimers();

    await expectFinished();

    const data = getData().values()[0];

    expect(data.view_history.length).toBeGreaterThanOrEqual(6);
    expect(data.view_history[data.view_history.length - 1].page_index).toBe(5);
  });

  test("Setting RT correctly sets the total length of the trial, #2462", async () => {
    const timeline = [
      {
        type: instructions,
        pages: ["page 1", "page 2", "page 3"],
        simulation_options: {
          data: {
            rt: 4000,
          },
        },
      },
    ];

    const { getData, expectFinished } = await simulateTimeline(timeline);

    await expectFinished();

    const data = getData().values()[0];

    console.log(data.view_history);

    expect(data.rt).toBe(4000);

    let sum_view_history_rt = 0;
    for (const view of data.view_history) {
      sum_view_history_rt += view.viewing_time;
    }

    // this may not be exactly 4000 due to rounding errors

    expect(Math.abs(sum_view_history_rt - 4000)).toBeLessThan(10);
  });

  test("Setting view history correctly sets the total RT, #2462", async () => {
    const timeline = [
      {
        type: instructions,
        pages: ["page 1", "page 2", "page 3"],
        simulation_options: {
          data: {
            view_history: [
              { page_index: 0, viewing_time: 1000 },
              { page_index: 1, viewing_time: 1000 },
              { page_index: 2, viewing_time: 1000 },
            ],
          },
        },
      },
    ];

    const { getData, expectFinished } = await simulateTimeline(timeline);

    await expectFinished();

    const data = getData().values()[0];

    expect(data.rt).toBe(3000);
  });
});
