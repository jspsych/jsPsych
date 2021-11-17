import { clickTarget, pressKey, simulateTimeline, startTimeline } from "@jspsych/test-utils";

import browserCheck from ".";

jest.useFakeTimers();

describe("browser-check", () => {
  test("contains data on window size", async () => {
    jest
      .spyOn(navigator, "userAgent", "get")
      .mockReturnValue(
        "Mozilla/5.0 (Linux; Android 4.0.4; Galaxy Nexus Build/IMM76B) AppleWebKit/535.19 (KHTML, like Gecko) Chrome/18.0.1025.133 Mobile Safari/535.19"
      );

    const { expectFinished, getData } = await startTimeline([
      {
        type: browserCheck,
        skip_features: ["vsync_rate"],
      },
    ]);

    await expectFinished();

    expect(getData().values()[0].width).not.toBeUndefined();
    expect(getData().values()[0].height).not.toBeUndefined();
  });

  test("contains browser data from userAgent", async () => {
    jest
      .spyOn(navigator, "userAgent", "get")
      .mockReturnValue(
        "Mozilla/5.0 (Linux; Android 4.0.4; Galaxy Nexus Build/IMM76B) AppleWebKit/535.19 (KHTML, like Gecko) Chrome/18.0.1025.133 Mobile Safari/535.19"
      );

    const { expectFinished, getData } = await startTimeline([
      {
        type: browserCheck,
        skip_features: ["vsync_rate"],
      },
    ]);

    await expectFinished();

    expect(getData().values()[0].browser).toBe("chrome");
    expect(getData().values()[0].browser_version).toBe("18.0.1025");
  });

  test("contains OS data", async () => {
    jest
      .spyOn(navigator, "userAgent", "get")
      .mockReturnValue(
        "Mozilla/5.0 (Linux; Android 4.0.4; Galaxy Nexus Build/IMM76B) AppleWebKit/535.19 (KHTML, like Gecko) Chrome/18.0.1025.133 Mobile Safari/535.19"
      );

    const { expectFinished, getData } = await startTimeline([
      {
        type: browserCheck,
        skip_features: ["vsync_rate"],
      },
    ]);

    await expectFinished();

    expect(getData().values()[0].os).toBe("Android OS");
  });

  test("exclusion message displayed if inclusion_function is false", async () => {
    jest
      .spyOn(navigator, "userAgent", "get")
      .mockReturnValue(
        "Mozilla/5.0 (Linux; Android 4.0.4; Galaxy Nexus Build/IMM76B) AppleWebKit/535.19 (KHTML, like Gecko) Chrome/18.0.1025.133 Mobile Safari/535.19"
      );

    const { expectFinished, getHTML } = await startTimeline([
      {
        type: browserCheck,
        skip_features: ["vsync_rate"],
        inclusion_function: (data) => {
          return false;
        },
      },
    ]);

    await expectFinished();

    expect(getHTML()).toMatch(browserCheck.info.parameters.exclusion_message.default());
  });

  test("inclusion_function gets data from checks", async () => {
    jest
      .spyOn(navigator, "userAgent", "get")
      .mockReturnValue(
        "Mozilla/5.0 (Linux; Android 4.0.4; Galaxy Nexus Build/IMM76B) AppleWebKit/535.19 (KHTML, like Gecko) Chrome/18.0.1025.133 Mobile Safari/535.19"
      );

    const { expectFinished, getHTML } = await startTimeline([
      {
        type: browserCheck,
        skip_features: ["vsync_rate"],
        inclusion_function: (data) => {
          expect(data.browser).toBe("chrome");
          return true;
        },
      },
    ]);

    await expectFinished();
  });

  test("resize message is displayed when allowed", async () => {
    jest
      .spyOn(navigator, "userAgent", "get")
      .mockReturnValue(
        "Mozilla/5.0 (Linux; Android 4.0.4; Galaxy Nexus Build/IMM76B) AppleWebKit/535.19 (KHTML, like Gecko) Chrome/18.0.1025.133 Mobile Safari/535.19"
      );

    const { expectFinished, getHTML, displayElement } = await startTimeline([
      {
        type: browserCheck,
        skip_features: ["vsync_rate"],
        minimum_width: 1200,
        minimum_height: 1000,
      },
    ]);

    expect(getHTML()).toMatch("1200");
    expect(getHTML()).toMatch("1000");

    clickTarget(displayElement.querySelector("button"));

    jest.runAllTimers();

    await expectFinished();
  });

  test("can change button text on interactive resize", async () => {
    jest
      .spyOn(navigator, "userAgent", "get")
      .mockReturnValue(
        "Mozilla/5.0 (Linux; Android 4.0.4; Galaxy Nexus Build/IMM76B) AppleWebKit/535.19 (KHTML, like Gecko) Chrome/18.0.1025.133 Mobile Safari/535.19"
      );

    const { expectFinished, getHTML, displayElement } = await startTimeline([
      {
        type: browserCheck,
        skip_features: ["vsync_rate"],
        minimum_width: 1200,
        minimum_height: 1000,
        resize_fail_button_text: "foo",
      },
    ]);

    expect(displayElement.querySelector("button").innerHTML).toMatch("foo");

    clickTarget(displayElement.querySelector("button"));

    jest.runAllTimers();

    await expectFinished();
  });

  test("resizing to meet minimum vals will finish trial", async () => {
    jest
      .spyOn(navigator, "userAgent", "get")
      .mockReturnValue(
        "Mozilla/5.0 (Linux; Android 4.0.4; Galaxy Nexus Build/IMM76B) AppleWebKit/535.19 (KHTML, like Gecko) Chrome/18.0.1025.133 Mobile Safari/535.19"
      );

    const { expectFinished, expectRunning, getData } = await startTimeline([
      {
        type: browserCheck,
        skip_features: ["vsync_rate"],
        minimum_width: 1200,
        minimum_height: 1000,
        resize_fail_button_text: "foo",
      },
    ]);

    await expectRunning();

    // @ts-ignore jsdom window innerWidth is settable
    window.innerWidth = 2000;
    // @ts-ignore jsdom window innerHeight is settable
    window.innerHeight = 2000;

    jest.runAllTimers();

    await expectFinished();

    expect(getData().values()[0].width).toBe(2000);
    expect(getData().values()[0].height).toBe(2000);
  });

  test("vsync rate", async () => {
    jest
      .spyOn(navigator, "userAgent", "get")
      .mockReturnValue(
        "Mozilla/5.0 (Linux; Android 4.0.4; Galaxy Nexus Build/IMM76B) AppleWebKit/535.19 (KHTML, like Gecko) Chrome/18.0.1025.133 Mobile Safari/535.19"
      );

    const { expectFinished, expectRunning, getData } = await startTimeline([
      {
        type: browserCheck,
        features: ["vsync_rate"],
      },
    ]);

    // this will simulate the requestAnimationFrame() calls that are needed for vsync_rate.
    // each one will fake execute 16ms after the previous.
    jest.runAllTimers();

    await expectFinished();

    expect(getData().values()[0].vsync_rate).toBe(1000 / 16);
  });
});

describe("browser-check simulation", () => {
  test("data-only mode works", async () => {
    jest
      .spyOn(navigator, "userAgent", "get")
      .mockReturnValue(
        "Mozilla/5.0 (Linux; Android 4.0.4; Galaxy Nexus Build/IMM76B) AppleWebKit/535.19 (KHTML, like Gecko) Chrome/18.0.1025.133 Mobile Safari/535.19"
      );

    const { expectFinished, getData } = await simulateTimeline([
      {
        type: browserCheck,
      },
    ]);

    await expectFinished();
  });

  test("visual mode works", async () => {
    jest
      .spyOn(navigator, "userAgent", "get")
      .mockReturnValue(
        "Mozilla/5.0 (Linux; Android 4.0.4; Galaxy Nexus Build/IMM76B) AppleWebKit/535.19 (KHTML, like Gecko) Chrome/18.0.1025.133 Mobile Safari/535.19"
      );

    const { expectFinished, getData } = await simulateTimeline(
      [
        {
          type: browserCheck,
        },
      ],
      "visual"
    );

    await expectFinished();
  });

  test("visual mode works when window too small", async () => {
    jest
      .spyOn(navigator, "userAgent", "get")
      .mockReturnValue(
        "Mozilla/5.0 (Linux; Android 4.0.4; Galaxy Nexus Build/IMM76B) AppleWebKit/535.19 (KHTML, like Gecko) Chrome/18.0.1025.133 Mobile Safari/535.19"
      );

    const { expectFinished, expectRunning, getData, getHTML } = await simulateTimeline(
      [
        {
          type: browserCheck,
          minimum_width: 3000,
          exclusion_message: () => {
            return "foo";
          },
        },
      ],
      "visual"
    );

    await expectRunning();

    jest.advanceTimersByTime(3000);

    await expectFinished();

    expect(getHTML()).toMatch("foo");
  });
});
