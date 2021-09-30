import { pressKey, startTimeline } from "@jspsych/test-utils";

import instructions from ".";

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

    pressKey("a");
    expect(getHTML()).toContain("page 2");

    pressKey("a");
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

    pressKey("a");
    expect(getHTML()).toContain("page 2");

    pressKey("ArrowLeft");
    expect(getHTML()).toContain("page 2");

    pressKey("a");
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

    pressKey("a");
    pressKey("a");

    await expectFinished();

    var data = getData().values()[0].view_history;
    expect(data[0].page_index).toEqual(0);
    expect(data[1].page_index).toEqual(1);
  });
});
