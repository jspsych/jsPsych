import { clickTarget, pressKey, simulateTimeline, startTimeline } from "@jspsych/test-utils";
import { enableFetchMocks } from "jest-fetch-mock";

import externalHtml from ".";

jest.useFakeTimers();

beforeAll(() => {
  enableFetchMocks();
  // @ts-ignore mockResponse isn't showing up on fetch. not sure how to fix. runs OK.
  fetch.mockResponse(`<p>This is external HTML</p><button id="finished">Click</button>`);
});

describe("external-html", () => {
  test("displays external html", async () => {
    const { displayElement, getHTML, expectFinished, expectRunning } = await startTimeline([
      {
        type: externalHtml,
        url: "loadme.html",
        cont_btn: "finished",
      },
    ]);

    await expectRunning();

    expect(getHTML()).toMatch("This is external HTML");
    clickTarget(displayElement.querySelector("#finished"));

    await expectFinished();
  });
});

describe("external-html simulation", () => {
  test("data-only mode works", async () => {
    const { getData, expectFinished, expectRunning } = await simulateTimeline([
      {
        type: externalHtml,
        url: "loadme.html",
        cont_btn: "finished",
      },
    ]);

    await expectFinished();

    const data = getData().values()[0];

    expect(data.rt).toBeGreaterThan(0);
    expect(data.url).toBe("loadme.html");
  });

  test("visual mode works", async () => {
    const { getData, expectFinished, expectRunning } = await simulateTimeline(
      [
        {
          type: externalHtml,
          url: "loadme.html",
          cont_btn: "finished",
        },
      ],
      "visual"
    );

    await expectRunning();

    jest.runAllTimers();

    await expectFinished();

    const data = getData().values()[0];

    expect(data.rt).toBeGreaterThan(0);
    expect(data.url).toBe("loadme.html");
  });
});
