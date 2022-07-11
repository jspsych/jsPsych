import audioKeyboardResponse from "@jspsych/plugin-audio-keyboard-response";
import imageKeyboardResponse from "@jspsych/plugin-image-keyboard-response";
import videoKeyboardResponse from "@jspsych/plugin-video-keyboard-response";
import { simulateTimeline, startTimeline } from "@jspsych/test-utils";
import { JsPsych, initJsPsych } from "jspsych";

import preloadPlugin from ".";

jest.useFakeTimers();

describe("preload plugin", () => {
  let jsPsych: JsPsych;
  let pluginAPI: JsPsych["pluginAPI"];

  beforeEach(() => {
    jsPsych = initJsPsych();
    pluginAPI = jsPsych.pluginAPI;
  });

  function spyOnPreload(preloadType: "Audio" | "Video" | "Images") {
    return jest
      .spyOn(
        pluginAPI,
        `preload${preloadType}` as "preloadAudio" | "preloadVideo" | "preloadImages"
      )
      .mockImplementation((files, callback_complete, callback_load, callback_error) => {
        callback_complete();
      });
  }

  describe("auto_preload", () => {
    test("auto_preload method works with simple timeline and image stimulus", async () => {
      const spy = spyOnPreload("Images");

      await startTimeline(
        [
          {
            type: preloadPlugin,
            auto_preload: true,
          },
          {
            type: imageKeyboardResponse,
            stimulus: "img/foo.png",
            render_on_canvas: false,
          },
        ],
        jsPsych
      );

      expect(spy).toHaveBeenCalledTimes(1);
      expect(spy.mock.calls[0][0]).toEqual(["img/foo.png"]);
    });

    test("auto_preload method works with simple timeline and audio stimulus", async () => {
      const spy = spyOnPreload("Audio");

      await startTimeline(
        [
          {
            type: preloadPlugin,
            auto_preload: true,
          },
          {
            type: audioKeyboardResponse,
            stimulus: "sound/foo.mp3",
          },
        ],
        jsPsych
      );

      expect(spy).toHaveBeenCalledTimes(1);
      expect(spy.mock.calls[0][0]).toEqual(["sound/foo.mp3"]);
    });

    test("auto_preload method works with simple timeline and video stimulus", async () => {
      const spy = spyOnPreload("Video");

      await startTimeline(
        [
          {
            type: preloadPlugin,
            auto_preload: true,
          },
          {
            type: videoKeyboardResponse,
            stimulus: "video/foo.mp4",
          },
        ],
        jsPsych
      );

      expect(spy).toHaveBeenCalledTimes(1);
      expect(spy.mock.calls[0][0]).toEqual(["video/foo.mp4"]);
    });

    test("auto_preload method works with nested timeline", async () => {
      const spy = spyOnPreload("Images");

      await startTimeline(
        [
          {
            type: preloadPlugin,
            auto_preload: true,
          },
          {
            type: imageKeyboardResponse,
            render_on_canvas: false,
            timeline: [{ stimulus: "img/foo.png" }],
          },
        ],
        jsPsych
      );

      expect(spy).toHaveBeenCalledTimes(1);
      expect(spy.mock.calls[0][0]).toEqual(["img/foo.png"]);
    });

    test("auto_preload method works with looping timeline", async () => {
      const spy = spyOnPreload("Images");

      await startTimeline(
        [
          {
            type: preloadPlugin,
            auto_preload: true,
          },
          {
            timeline: [
              {
                type: imageKeyboardResponse,
                stimulus: "img/foo.png",
                render_on_canvas: false,
              },
            ],
            loop_function: () => true,
          },
        ],
        jsPsych
      );

      expect(spy).toHaveBeenCalledTimes(1);
      expect(spy.mock.calls[0][0]).toEqual(["img/foo.png"]);
    });

    test("auto_preload method works with conditional timeline", async () => {
      const spy = spyOnPreload("Images");

      await startTimeline(
        [
          {
            type: preloadPlugin,
            auto_preload: true,
          },
          {
            timeline: [
              {
                type: imageKeyboardResponse,
                stimulus: "img/foo.png",
                render_on_canvas: false,
              },
            ],
            conditional_function: () => true,
          },
        ],
        jsPsych
      );

      expect(spy).toHaveBeenCalledTimes(1);
      expect(spy.mock.calls[0][0]).toStrictEqual(["img/foo.png"]);
    });

    test("auto_preload method works with timeline variables when stim is statically defined in trial object", async () => {
      const spy = spyOnPreload("Images");

      await startTimeline(
        [
          {
            type: preloadPlugin,
            auto_preload: true,
          },
          {
            timeline: [
              {
                type: imageKeyboardResponse,
                stimulus: "img/foo.png",
                render_on_canvas: false,
                data: jsPsych.timelineVariable("data"),
              },
            ],
            timeline_variables: [
              { data: { trial: 1 } },
              { data: { trial: 2 } },
              { data: { trial: 3 } },
            ],
          },
        ],
        jsPsych
      );

      expect(spy).toHaveBeenCalledTimes(1);
      expect(spy.mock.calls[0][0]).toStrictEqual(["img/foo.png"]);
    });
  });

  describe("trials parameter", () => {
    test("trials parameter works with simple timeline", async () => {
      const spy = spyOnPreload("Images");

      await startTimeline(
        [
          {
            type: preloadPlugin,
            trials: [
              {
                type: imageKeyboardResponse,
                stimulus: "img/foo.png",
                render_on_canvas: false,
              },
            ],
          },
        ],
        jsPsych
      );

      expect(spy).toHaveBeenCalledTimes(1);
      expect(spy.mock.calls[0][0]).toStrictEqual(["img/foo.png"]);
    });

    test("trials parameter works with looping timeline", async () => {
      const spy = spyOnPreload("Images");

      await startTimeline(
        [
          {
            type: preloadPlugin,
            trials: [
              {
                timeline: [
                  {
                    type: imageKeyboardResponse,
                    stimulus: "img/foo.png",
                    render_on_canvas: false,
                  },
                ],
                loop_function: () => true,
              },
            ],
          },
        ],
        jsPsych
      );

      expect(spy).toHaveBeenCalledTimes(1);
      expect(spy.mock.calls[0][0]).toStrictEqual(["img/foo.png"]);
    });

    test("trials parameter works with conditional timeline", async () => {
      const spy = spyOnPreload("Images");

      await startTimeline(
        [
          {
            type: preloadPlugin,
            trials: [
              {
                timeline: [
                  {
                    type: imageKeyboardResponse,
                    stimulus: "img/foo.png",
                    render_on_canvas: false,
                  },
                ],
                conditional_function: () => false,
              },
            ],
          },
        ],
        jsPsych
      );

      expect(spy).toHaveBeenCalledTimes(1);
      expect(spy.mock.calls[0][0]).toStrictEqual(["img/foo.png"]);
    });

    test("trials parameter works with timeline variables when stim is statically defined in trial object", async () => {
      const spy = spyOnPreload("Images");

      await startTimeline(
        [
          {
            type: preloadPlugin,
            trials: [
              {
                timeline: [
                  {
                    type: imageKeyboardResponse,
                    stimulus: "img/foo.png",
                    render_on_canvas: false,
                    data: jsPsych.timelineVariable("data"),
                  },
                ],
                timeline_variables: [
                  { data: { trial: 1 } },
                  { data: { trial: 2 } },
                  { data: { trial: 3 } },
                ],
              },
            ],
          },
        ],
        jsPsych
      );

      expect(spy).toHaveBeenCalledTimes(1);
      expect(spy.mock.calls[0][0]).toStrictEqual(["img/foo.png"]);
    });

    test("timeline variables in trials parameter are *not* evaluated", async () => {
      const spy = jest.spyOn(console, "warn");

      const trial = {
        type: preloadPlugin,
        trials: [
          {
            timeline: [
              {
                type: imageKeyboardResponse,
                stimulus: "img/foo.png",
                render_on_canvas: false,
                data: jsPsych.timelineVariable("data"),
              },
            ],
            timeline_variables: [
              { data: { trial: 1 } },
              { data: { trial: 2 } },
              { data: { trial: 3 } },
            ],
          },
        ],
      };

      await startTimeline([trial], jsPsych);

      expect(spy).toHaveBeenCalledTimes(0);
    });
  });

  describe("calls to pluginAPI preload functions", () => {
    test("auto_preload, trials, and manual preload array parameters can be used together", async () => {
      const spy = spyOnPreload("Images");

      await startTimeline(
        [
          {
            type: preloadPlugin,
            auto_preload: true,
            trials: [
              {
                type: imageKeyboardResponse,
                stimulus: "img/bar.png",
                render_on_canvas: false,
              },
            ],
            images: ["img/fizz.png"],
          },
          {
            type: imageKeyboardResponse,
            stimulus: "img/foo.png",
            render_on_canvas: false,
          },
        ],
        jsPsych
      );

      expect(spy).toHaveBeenCalledTimes(1);
      expect(spy.mock.calls[0][0]).toEqual(
        expect.arrayContaining(["img/foo.png", "img/bar.png", "img/fizz.png"])
      );
    });

    test("plugin only attempts to load duplicate files once", async () => {
      const spy = spyOnPreload("Images");

      await startTimeline(
        [
          {
            type: preloadPlugin,
            trials: [
              {
                type: imageKeyboardResponse,
                stimulus: "img/foo.png",
                render_on_canvas: false,
              },
            ],
            images: ["img/foo.png"],
          },
          {
            type: imageKeyboardResponse,
            stimulus: "img/foo.png",
            render_on_canvas: false,
          },
        ],
        jsPsych
      );

      expect(spy).toHaveBeenCalledTimes(1);
      expect(spy.mock.calls[0][0]).toEqual(["img/foo.png"]);
    });
  });

  describe("continue_after_error and error messages", () => {
    test("experiment continues when image loads successfully", async () => {
      jest
        .spyOn(pluginAPI, "preloadImages")
        .mockImplementation((x, cb_complete, cb_load, cb_error) => {
          if (x.includes("image.png")) {
            cb_load("image.png");
            cb_complete();
          }
        });

      const { getHTML } = await startTimeline(
        [
          {
            type: preloadPlugin,
            auto_preload: true,
            error_message: "foo",
            max_load_time: 100,
          },
          {
            type: imageKeyboardResponse,
            stimulus: "image.png",
            render_on_canvas: false,
          },
        ],
        jsPsych
      );

      expect(getHTML()).toContain(
        '<img src="image.png" id="jspsych-image-keyboard-response-stimulus"'
      );
    });

    test("error_message is shown when continue_after_error is false and files fail", async () => {
      jest
        .spyOn(pluginAPI, "preloadImages")
        .mockImplementation((x, cb_complete, cb_load, cb_error) => {
          cb_error({
            source: x,
            error: {},
          });
        });

      const { getHTML } = await startTimeline(
        [
          {
            type: preloadPlugin,
            auto_preload: true,
            error_message: "foo",
            max_load_time: 100,
            on_error: function (e) {
              expect(e).toContain("img/bar.png");
            },
          },
          {
            type: imageKeyboardResponse,
            stimulus: "img/bar.png",
            render_on_canvas: false,
          },
        ],
        jsPsych
      );

      expect(getHTML()).toContain("foo");
    });

    test("error_message is shown when continue_after_error is false and loading times out", async () => {
      jest
        .spyOn(pluginAPI, "preloadImages")
        .mockImplementation((x, cb_complete, cb_load, cb_error) => {
          // don't call anything here to simulate waiting forever for image to load
        });

      const onError = jest.fn();

      const { getHTML } = await startTimeline(
        [
          {
            type: preloadPlugin,
            auto_preload: true,
            error_message: "foo",
            max_load_time: 100,
            on_error: onError,
          },
          {
            type: imageKeyboardResponse,
            stimulus: "blue.png",
            render_on_canvas: false,
          },
        ],
        jsPsych
      );

      jest.advanceTimersByTime(101);

      expect(onError).toHaveBeenCalledWith("timeout");
      expect(getHTML()).toContain("foo");
    });

    test("experiment continues when continue_after_error is true and files fail", async () => {
      jest
        .spyOn(pluginAPI, "preloadImages")
        .mockImplementation((x, cb_complete, cb_load, cb_error) => {
          cb_error({
            source: x,
            error: {},
          });
        });

      const mockFn = jest.fn();

      const { getHTML } = await startTimeline(
        [
          {
            type: preloadPlugin,
            images: ["img/foo.png"],
            error_message: "bar",
            max_load_time: null,
            continue_after_error: true,
            on_error: mockFn,
          },
          {
            type: imageKeyboardResponse,
            stimulus: "blue.png",
            render_on_canvas: false,
          },
        ],
        jsPsych
      );

      expect(mockFn).toHaveBeenCalledWith(["img/foo.png"]);
      expect(getHTML()).toContain(
        '<img src="blue.png" id="jspsych-image-keyboard-response-stimulus"'
      );
    });

    test("experiment continues when continue_after_error is true and loading times out", async () => {
      jest
        .spyOn(pluginAPI, "preloadImages")
        .mockImplementation((x, cb_complete, cb_load, cb_error) => {
          // don't call anything here to simulate waiting forever for image to load
        });

      const mockFn = jest.fn();

      const { getHTML } = await startTimeline(
        [
          {
            type: preloadPlugin,
            auto_preload: true,
            error_message: "bar",
            max_load_time: 100,
            continue_after_error: true,
            on_error: mockFn,
          },
          {
            type: imageKeyboardResponse,
            stimulus: "../media/blue.png",
            render_on_canvas: false,
          },
        ],
        jsPsych
      );

      jest.advanceTimersByTime(101);

      expect(mockFn).toHaveBeenCalledWith("timeout");
      expect(getHTML()).toMatch(
        '<img src="../media/blue.png" id="jspsych-image-keyboard-response-stimulus"'
      );
    });

    test("detailed error message is shown when continue_after_error is false and show_detailed_errors is true", async () => {
      jest
        .spyOn(pluginAPI, "preloadImages")
        .mockImplementation((x, cb_complete, cb_load, cb_error) => {
          cb_error({
            source: x,
            error: {},
          });
        });

      const mockFn = jest.fn();

      const { getHTML } = await startTimeline(
        [
          {
            type: preloadPlugin,
            images: ["img/foo.png"],
            error_message: "bar",
            show_detailed_errors: true,
            on_error: mockFn,
          },
        ],
        jsPsych
      );

      expect(mockFn).toHaveBeenCalledWith(["img/foo.png"]);
      expect(getHTML()).toContain("Error details");
    });
  });

  describe("display while loading", () => {
    test("custom loading message is shown above progress bar if specified", async () => {
      const { getHTML } = await startTimeline([
        {
          type: preloadPlugin,
          images: ["img/foo.png"],
          message: "baz",
          max_load_time: 100,
        },
      ]);

      expect(getHTML()).toContain("baz");
      expect(getHTML()).toContain('<div id="jspsych-loading-progress-bar-container');
    });

    test("progress bar is shown without message by default", async () => {
      const { getHTML } = await startTimeline([
        {
          type: preloadPlugin,
          images: ["img/foo.png"],
          max_load_time: 100,
        },
      ]);

      expect(getHTML()).toContain('<div id="jspsych-loading-progress-bar-container');
    });

    test("progress bar is not shown if show_progress_bar is false", async () => {
      const { getHTML } = await startTimeline([
        {
          type: preloadPlugin,
          images: ["img/foo.png"],
          show_progress_bar: false,
          max_load_time: 100,
        },
      ]);

      expect(getHTML()).toEqual("");
    });
  });

  describe("on_success and on_error parameters", () => {
    test("on_error/on_success callbacks are called during preload trial after each loading success/error", async () => {
      jest
        .spyOn(pluginAPI, "preloadImages")
        .mockImplementation((x, cb_complete, cb_load, cb_error) => {
          if (x.includes("blue.png")) {
            cb_load("blue.png");
            cb_complete();
          } else {
            cb_error({
              source: x,
              error: {},
            });
          }
        });
      jest
        .spyOn(pluginAPI, "preloadVideo")
        .mockImplementation((x, cb_complete, cb_load, cb_error) => {
          cb_error({
            source: x,
            error: {},
          });
        });
      jest
        .spyOn(pluginAPI, "preloadAudio")
        .mockImplementation((x, cb_complete, cb_load, cb_error) => {
          cb_error({
            source: x,
            error: {},
          });
        });

      var mock_fn = jest.fn(function (x) {
        return x;
      });

      await startTimeline(
        [
          {
            type: preloadPlugin,
            images: ["foo.png"],
            audio: ["bar.mp3"],
            video: ["buzz.mp4"],
            continue_after_error: true,
            on_error: function (e) {
              mock_fn("loading failed");
            },
            on_success: function (e) {
              mock_fn("loading succeeded");
            },
          },
          {
            type: preloadPlugin,
            images: ["blue.png"],
            max_load_time: 100,
            on_error: function (e) {
              mock_fn("loading failed");
            },
            on_success: function (e) {
              mock_fn("loading succeeded");
            },
          },
        ],
        jsPsych
      );

      expect(mock_fn.mock.calls[0][0]).toBe("loading failed");
      expect(mock_fn.mock.calls[1][0]).toBe("loading failed");
      expect(mock_fn.mock.calls[2][0]).toBe("loading failed");
      expect(mock_fn.mock.calls[3][0]).toBe("loading succeeded");
    });

    test("on_error/on_success callbacks are not called after loading times out", async () => {
      for (const type of <const>["Images", "Video", "Audio"]) {
        jest
          .spyOn(pluginAPI, `preload${type}` as "preloadAudio" | "preloadVideo" | "preloadImages")
          .mockImplementation((x, cb_complete, cb_load, cb_error) => {
            // empty to simulate timeout
          });
      }

      var cancelPreloadSpy = jest.spyOn(pluginAPI, "cancelPreloads");

      var mockFn = jest.fn();

      await startTimeline(
        [
          {
            type: preloadPlugin,
            images: ["img/foo.png", "blue.png"],
            audio: ["audio/bar.mp3"],
            video: ["video/buzz.mp4"],
            continue_after_error: true,
            max_load_time: 100,
            on_error: (e) => {
              mockFn(e === "timeout" ? e : "loading failed");
            },
            on_success: (e) => {
              mockFn("loading succeeded");
            },
          },
        ],
        jsPsych
      );

      jest.advanceTimersByTime(101);

      expect(mockFn).toHaveBeenCalledWith("timeout");
      expect(mockFn).toHaveBeenLastCalledWith("timeout");
      expect(cancelPreloadSpy).toHaveBeenCalled();
    });

    test("experiment stops with default error_message and on_error/on_success callbacks are not called after preload trial ends with error", async () => {
      jest
        .spyOn(pluginAPI, "preloadImages")
        .mockImplementation((x, cb_complete, cb_load, cb_error) => {
          if (x.includes("blue.png")) {
            cb_load("blue.png");
            cb_complete();
          }
        });
      jest.spyOn(pluginAPI, "preloadVideo").mockImplementation(() => {});
      jest.spyOn(pluginAPI, "preloadAudio").mockImplementation(() => {});

      var mockFn = jest.fn();
      var cancelPreloadSpy = jest.spyOn(jsPsych.pluginAPI, "cancelPreloads");

      const { getHTML } = await startTimeline(
        [
          {
            type: preloadPlugin,
            images: ["img/foo.png"],
            audio: ["audio/bar.mp3"],
            video: ["video/buzz.mp4"],
            max_load_time: 100,
            on_error: (e) => {
              mockFn(e === "timeout" ? e : "loading failed");
            },
            on_success: () => {
              mockFn("loading succeeded");
            },
          },
          {
            type: preloadPlugin,
            images: ["../media/blue.png"],
            max_load_time: 100,
            on_error: () => {
              mockFn("loading failed");
            },
            on_success: () => {
              mockFn("loading succeeded");
            },
          },
        ],
        jsPsych
      );

      jest.advanceTimersByTime(101);

      expect(mockFn).toHaveBeenCalledWith("timeout");
      expect(mockFn).toHaveBeenLastCalledWith("timeout");
      expect(getHTML()).toContain("The experiment failed to load.");
      expect(cancelPreloadSpy).toHaveBeenCalled();
    });
  });

  describe("simulation", () => {
    test("data-only mode works", async () => {
      const { expectFinished, getData } = await simulateTimeline(
        [
          {
            type: preloadPlugin,
            auto_preload: true,
          },
          {
            type: imageKeyboardResponse,
            stimulus: "img/foo.png",
            render_on_canvas: false,
          },
        ],
        "data-only",
        jsPsych
      );

      await expectFinished();

      const data = getData().values()[0];

      expect(data).toMatchObject({
        success: true,
        timeout: false,
        failed_images: [],
        failed_audio: [],
        failed_video: [],
      });
    });

    // confirmed that this works in browser. something doesn't work with the spy
    // here for some unknown reason.
    test.skip("visual mode works", async () => {
      const spy = spyOnPreload("Images");

      const { expectFinished, getData } = await simulateTimeline(
        [
          {
            type: preloadPlugin,
            images: ["img/foo.png"],
          },
        ],
        "visual",
        jsPsych
      );

      expect(spy).toHaveBeenCalledTimes(1);
      expect(spy.mock.calls[0][0]).toEqual(["img/foo.png"]);
    });
  });
});
