import { ParameterType } from "../../src";
import { MediaAPI } from "../../src/modules/plugin-api/MediaAPI";

describe("getAutoPreloadList()", () => {
  it("works for a single trial", () => {
    const preloads = new MediaAPI(false).getAutoPreloadList([
      {
        type: {
          info: {
            name: "my-plugin",
            parameters: {
              one: { type: ParameterType.IMAGE },
              two: { type: ParameterType.VIDEO },
              three: { type: ParameterType.AUDIO },
              four: { type: ParameterType.IMAGE, preload: true },
              five: { type: ParameterType.IMAGE, preload: false },
              six: {
                type: ParameterType.STRING,
                // This is illegal! But it should still not do anything
                preload: true,
              },
              seven: {},
            },
          },
        },
        one: "i1",
        two: ["v1", ["v2", "v3"]], // arrays should be flattened
        // three is undefined, should not be a problem
        four: [null, false, 10], // non-string values should be ignored
        five: "i2", // ignored: preload=false
        six: "six", // ignored: ParameterType.STRING
      },
    ]);

    expect(preloads).toEqual({
      images: ["i1"],
      audio: [],
      video: ["v1", "v2", "v3"],
    });
  });

  it("works for a nested timeline", () => {
    const preloads = new MediaAPI(false).getAutoPreloadList([
      {
        timeline: [
          {
            type: {
              info: {
                name: "plugin1",
                parameters: { one: { type: ParameterType.STRING } },
              },
            },
            one: "plugin1-one",
          },
          {
            type: {
              info: {
                name: "plugin2",
                parameters: { one: { type: ParameterType.AUDIO } },
              },
            },
            one: "plugin2-one",
          },
          {
            type: {
              info: {
                name: "plugin3",
                parameters: {
                  one: { type: ParameterType.VIDEO },
                  two: { type: ParameterType.IMAGE },
                },
              },
            },
            timeline: [
              { one: "plugin3-one", two: "plugin3-two" },
              {
                type: {
                  info: {
                    name: "plugin4",
                    parameters: {
                      one: { type: ParameterType.VIDEO },
                      two: { type: ParameterType.STRING },
                    },
                  },
                },
                one: "plugin4-one",
                two: "plugin4-two",
              },
            ],
          },
        ],
      },
    ]);

    expect(preloads).toEqual({
      images: ["plugin3-two"],
      audio: ["plugin2-one"],
      video: ["plugin3-one", "plugin4-one"],
    });
  });

  it("ignores trials with a function type", () => {
    const preloads = new MediaAPI(false).getAutoPreloadList([
      {
        type: () => ({ info: { name: "my-dynamic-trial-type" } }),
      },
    ]);

    expect(preloads).toEqual({
      images: [],
      audio: [],
      video: [],
    });
  });
});
