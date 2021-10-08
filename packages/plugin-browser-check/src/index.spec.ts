import { pressKey, startTimeline } from "@jspsych/test-utils";

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

    expect(getHTML()).toMatch(browserCheck.info.parameters.exclusion_message.default);
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
});
