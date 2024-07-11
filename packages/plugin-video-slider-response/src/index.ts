import { JsPsych, JsPsychPlugin, ParameterType, TrialType } from "jspsych";

import { version } from "../package.json";

const info = <const>{
  name: "video-slider-response",
  version: version,
  parameters: {
    /** An array of file paths to the video. You can specify multiple formats of the same video (e.g., .mp4, .ogg, .webm)
     * to maximize the [cross-browser compatibility](https://developer.mozilla.org/en-US/docs/Web/HTML/Supported_media_formats).
     * Usually .mp4 is a safe cross-browser option. The plugin does not reliably support .mov files. The player will use
     * the first source file in the array that is compatible with the browser, so specify the files in order of preference.
     */
    stimulus: {
      type: ParameterType.VIDEO,
      default: undefined,
      array: true,
    },
    /** This string can contain HTML markup. Any content here will be displayed below the stimulus. The intention is that
     * it can be used to provide a reminder about the action the participant is supposed to take (e.g., which key to press).
     */
    prompt: {
      type: ParameterType.HTML_STRING,
      default: null,
    },
    /** The width of the video in pixels. */
    width: {
      type: ParameterType.INT,
      default: "",
    },
    /** The height of the video display in pixels. */
    height: {
      type: ParameterType.INT,
      default: "",
    },
    /** If true, the video will begin playing as soon as it has loaded. */
    autoplay: {
      type: ParameterType.BOOL,
      default: true,
    },
    /** If true, controls for the video player will be available to the participant. They will be able to pause the
     * video or move the playback to any point in the video.
     */
    controls: {
      type: ParameterType.BOOL,
      default: false,
    },
    /** Time to start the clip. If null (default), video will start at the beginning of the file. */
    start: {
      type: ParameterType.FLOAT,
      default: null,
    },
    /** Time to stop the clip. If null (default), video will stop at the end of the file. */
    stop: {
      type: ParameterType.FLOAT,
      default: null,
    },
    /** The playback rate of the video. 1 is normal, <1 is slower, >1 is faster. */
    rate: {
      type: ParameterType.FLOAT,
      default: 1,
    },
    /** Sets the minimum value of the slider. */
    min: {
      type: ParameterType.INT,
      default: 0,
    },
    /** Sets the maximum value of the slider. */
    max: {
      type: ParameterType.INT,
      default: 100,
    },
    /** Sets the starting value of the slider. */
    slider_start: {
      type: ParameterType.INT,
      default: 50,
    },
    /** Sets the step of the slider. This is the smallest amount by which the slider can change. */
    step: {
      type: ParameterType.INT,
      default: 1,
    },
    /**
     * Labels displayed at equidistant locations on the slider. For example, two labels will be placed at the ends
     * of the slider. Three labels would place two at the ends and one in the middle. Four will place two at the
     * ends, and the other two will be at 33% and 67% of the slider width.
     */
    labels: {
      type: ParameterType.HTML_STRING,
      default: [],
      array: true,
    },
    /** Set the width of the slider in pixels. If left null, then the width will be equal to the widest element in
     * the display.
     */
    slider_width: {
      type: ParameterType.INT,
      default: null,
    },
    /** Label of the button to end the trial. */
    button_label: {
      type: ParameterType.STRING,
      default: "Continue",
    },
    /** If true, the participant must move the slider before clicking the continue button. */
    require_movement: {
      type: ParameterType.BOOL,
      default: false,
    },
    /** If true, the trial will end immediately after the video finishes playing. */
    trial_ends_after_video: {
      type: ParameterType.BOOL,
      default: false,
    },
    /** How long to wait for the participant to make a response before ending the trial in milliseconds. If the
     * participant fails to make a response before this timer is reached, the participant's response will be
     * recorded as null for the trial and the trial will end. If the value of this parameter is null, then the
     * trial will wait for a response indefinitely.
     */
    trial_duration: {
      type: ParameterType.INT,
      default: null,
    },
    /** If true, then the trial will end whenever the participant makes a response (assuming they make their response
     * before the cutoff specified by the `trial_duration` parameter). If false, then the trial will continue until
     * the value for `trial_duration` is reached. You can set this parameter to `false` to force the participant
     * to view a stimulus for a fixed amount of time, even if they respond before the time is complete.
     */
    response_ends_trial: {
      type: ParameterType.BOOL,
      default: true,
    },
    /**
     * If true, then responses are allowed while the video is playing. If false, then the video must finish playing
     * before the slider is enabled and the trial can end via the next button click. Once the video has played all
     * the way through, the slider is enabled and a response is allowed (including while the video is being re-played
     * via on-screen playback controls).
     */
    response_allowed_while_playing: {
      type: ParameterType.BOOL,
      default: true,
    },
  },
  data: {
    /** The numeric value of the slider. */
    response: {
      type: ParameterType.INT,
    },
    /** The response time in milliseconds for the participant to make a response. The time is measured from when the stimulus first appears on the screen until the participant's response. */
    rt: {
      type: ParameterType.INT,
    },
    /** The `stimulus` array. This will be encoded as a JSON string when data is saved using the `.json()` or `.csv()` functions.  */
    stimulus: {
      type: ParameterType.STRING,
      array: true,
    },
    /** The starting value of the slider. */
    slider_start: {
      type: ParameterType.INT,
    },
    /** The start time of the video clip. */
    start: {
      type: ParameterType.FLOAT,
    },
  },
};

type Info = typeof info;

/**
 * This plugin plays a video and allows the participant to respond by dragging a slider. The stimulus can be displayed
 * until a response is given, or for a pre-determined amount of time. The trial can be ended automatically when the
 * participant responds, when the video file has finished playing, or if the participant has failed to respond within
 * a fixed length of time. You can also prevent the slider response from being made before the video has finished playing.
 *
 * Video files can be automatically preloaded by jsPsych using the [`preload` plugin](preload.md). However, if you are
 * using timeline variables or another dynamic method to specify the video stimulus, you will need to
 * [manually preload](../overview/media-preloading.md#manual-preloading) the videos. Also note that video preloading
 * is disabled when the experiment is running as a file (i.e. opened directly in the browser, rather than through a
 * server), in order to prevent CORS errors - see the section on [Running Experiments](../overview/running-experiments.md) for more information.
 *
 * @author Josh de Leeuw
 * @see {@link https://www.jspsych.org/latest/plugins/video-slider-response/ video-slider-response plugin documentation on jspsych.org}
 */
class VideoSliderResponsePlugin implements JsPsychPlugin<Info> {
  static info = info;

  constructor(private jsPsych: JsPsych) {}

  trial(display_element: HTMLElement, trial: TrialType<Info>) {
    if (!Array.isArray(trial.stimulus)) {
      throw new Error(`
        The stimulus property for the video-slider-response plugin must be an array
        of files. See https://www.jspsych.org/latest/plugins/video-slider-response/#parameters
      `);
    }

    // half of the thumb width value from jspsych.css, used to adjust the label positions
    var half_thumb_width = 7.5;

    // setup stimulus
    var video_html = '<video id="jspsych-video-slider-response-stimulus-video"';

    if (trial.width) {
      video_html += ' width="' + trial.width + '"';
    }
    if (trial.height) {
      video_html += ' height="' + trial.height + '"';
    }
    if (trial.autoplay && trial.start == null) {
      // if autoplay is true and the start time is specified, then the video will start automatically
      // via the play() method, rather than the autoplay attribute, to prevent showing the first frame
      video_html += " autoplay ";
    }
    if (trial.controls) {
      video_html += " controls ";
    }
    if (trial.start !== null) {
      // hide video element when page loads if the start time is specified,
      // to prevent the video element from showing the first frame
      video_html += ' style="visibility: hidden;"';
    }
    video_html += ">";

    var video_preload_blob = this.jsPsych.pluginAPI.getVideoBuffer(trial.stimulus[0]);
    if (!video_preload_blob) {
      for (var i = 0; i < trial.stimulus.length; i++) {
        var file_name = trial.stimulus[i];
        if (file_name.indexOf("?") > -1) {
          file_name = file_name.substring(0, file_name.indexOf("?"));
        }
        var type = file_name.substr(file_name.lastIndexOf(".") + 1);
        type = type.toLowerCase();
        if (type == "mov") {
          console.warn(
            "Warning: video-slider-response plugin does not reliably support .mov files."
          );
        }
        video_html += '<source src="' + file_name + '" type="video/' + type + '">';
      }
    }
    video_html += "</video>";

    var html = '<div id="jspsych-video-slider-response-wrapper" style="margin: 100px 0px;">';
    html += '<div id="jspsych-video-slider-response-stimulus">' + video_html + "</div>";
    html +=
      '<div class="jspsych-video-slider-response-container" style="position:relative; margin: 0 auto 3em auto; width:';
    if (trial.slider_width !== null) {
      html += trial.slider_width + "px;";
    } else {
      html += "auto;";
    }
    html += '">';
    html +=
      '<input type="range" class="jspsych-slider" value="' +
      trial.slider_start +
      '" min="' +
      trial.min +
      '" max="' +
      trial.max +
      '" step="' +
      trial.step +
      '" id="jspsych-video-slider-response-response"';
    if (!trial.response_allowed_while_playing) {
      html += " disabled";
    }
    html += "></input><div>";
    for (var j = 0; j < trial.labels.length; j++) {
      var label_width_perc = 100 / (trial.labels.length - 1);
      var percent_of_range = j * (100 / (trial.labels.length - 1));
      var percent_dist_from_center = ((percent_of_range - 50) / 50) * 100;
      var offset = (percent_dist_from_center * half_thumb_width) / 100;
      html +=
        '<div style="border: 1px solid transparent; display: inline-block; position: absolute; ' +
        "left:calc(" +
        percent_of_range +
        "% - (" +
        label_width_perc +
        "% / 2) - " +
        offset +
        "px); text-align: center; width: " +
        label_width_perc +
        '%;">';
      html += '<span style="text-align: center; font-size: 80%;">' + trial.labels[j] + "</span>";
      html += "</div>";
    }
    html += "</div>";
    html += "</div>";
    html += "</div>";

    // add prompt if there is one
    if (trial.prompt !== null) {
      html += "<div>" + trial.prompt + "</div>";
    }

    // add submit button
    var next_disabled_attribute = "";
    if (trial.require_movement || !trial.response_allowed_while_playing) {
      next_disabled_attribute = "disabled";
    }
    html +=
      '<button id="jspsych-video-slider-response-next" class="jspsych-btn" ' +
      next_disabled_attribute +
      ">" +
      trial.button_label +
      "</button>";

    display_element.innerHTML = html;

    var video_element = display_element.querySelector<HTMLVideoElement>(
      "#jspsych-video-slider-response-stimulus-video"
    );

    if (video_preload_blob) {
      video_element.src = video_preload_blob;
    }

    video_element.onended = () => {
      if (trial.trial_ends_after_video) {
        end_trial();
      } else if (!trial.response_allowed_while_playing) {
        enable_slider();
      }
    };

    video_element.playbackRate = trial.rate;

    // if video start time is specified, hide the video and set the starting time
    // before showing and playing, so that the video doesn't automatically show the first frame
    if (trial.start !== null) {
      video_element.pause();
      video_element.onseeked = () => {
        video_element.style.visibility = "visible";
        video_element.muted = false;
        if (trial.autoplay) {
          video_element.play();
        } else {
          video_element.pause();
        }
        video_element.onseeked = () => {};
      };
      video_element.onplaying = () => {
        video_element.currentTime = trial.start;
        video_element.onplaying = () => {};
      };
      // fix for iOS/MacOS browsers: videos aren't seekable until they start playing, so need to hide/mute, play,
      // change current time, then show/unmute
      video_element.muted = true;
      video_element.play();
    }

    let stopped = false;
    if (trial.stop !== null) {
      video_element.addEventListener("timeupdate", (e) => {
        var currenttime = video_element.currentTime;
        if (currenttime >= trial.stop) {
          video_element.pause();
          if (trial.trial_ends_after_video && !stopped) {
            // this is to prevent end_trial from being called twice, because the timeupdate event
            // can fire in quick succession
            stopped = true;
            end_trial();
          }

          if (!trial.response_allowed_while_playing) {
            enable_slider();
          }
        }
      });
    }

    if (trial.require_movement) {
      const enable_button = () => {
        display_element.querySelector<HTMLInputElement>(
          "#jspsych-video-slider-response-next"
        ).disabled = false;
      };

      display_element
        .querySelector("#jspsych-video-slider-response-response")
        .addEventListener("mousedown", enable_button);

      display_element
        .querySelector("#jspsych-video-slider-response-response")
        .addEventListener("touchstart", enable_button);

      display_element
        .querySelector("#jspsych-video-slider-response-response")
        .addEventListener("change", enable_button);
    }

    var startTime = performance.now();

    // store response
    var response = {
      rt: null,
      response: null,
    };

    // function to end trial when it is time
    const end_trial = () => {
      // stop the video file if it is playing
      // remove any remaining end event handlers
      display_element
        .querySelector<HTMLVideoElement>("#jspsych-video-slider-response-stimulus-video")
        .pause();
      display_element.querySelector<HTMLVideoElement>(
        "#jspsych-video-slider-response-stimulus-video"
      ).onended = () => {};

      // gather the data to store for the trial
      var trial_data = {
        rt: response.rt,
        stimulus: trial.stimulus,
        start: trial.start,
        slider_start: trial.slider_start,
        response: response.response,
      };

      // move on to the next trial
      this.jsPsych.finishTrial(trial_data);
    };

    display_element
      .querySelector("#jspsych-video-slider-response-next")
      .addEventListener("click", () => {
        // measure response time
        var endTime = performance.now();
        response.rt = Math.round(endTime - startTime);
        response.response = display_element.querySelector<HTMLInputElement>(
          "#jspsych-video-slider-response-response"
        ).valueAsNumber;

        if (trial.response_ends_trial) {
          end_trial();
        } else {
          display_element.querySelector<HTMLButtonElement>(
            "#jspsych-video-slider-response-next"
          ).disabled = true;
        }
      });

    // function to enable slider after video ends
    function enable_slider() {
      (
        document.querySelector("#jspsych-video-slider-response-response") as HTMLInputElement
      ).disabled = false;
      if (!trial.require_movement) {
        (
          document.querySelector("#jspsych-video-slider-response-next") as HTMLInputElement
        ).disabled = false;
      }
    }

    // end trial if time limit is set
    if (trial.trial_duration !== null) {
      this.jsPsych.pluginAPI.setTimeout(end_trial, trial.trial_duration);
    }
  }

  simulate(
    trial: TrialType<Info>,
    simulation_mode,
    simulation_options: any,
    load_callback: () => void
  ) {
    if (simulation_mode == "data-only") {
      load_callback();
      this.simulate_data_only(trial, simulation_options);
    }
    if (simulation_mode == "visual") {
      this.simulate_visual(trial, simulation_options, load_callback);
    }
  }

  private create_simulation_data(trial: TrialType<Info>, simulation_options) {
    const default_data = {
      stimulus: trial.stimulus,
      slider_start: trial.slider_start,
      response: this.jsPsych.randomization.randomInt(trial.min, trial.max),
      rt: this.jsPsych.randomization.sampleExGaussian(500, 50, 1 / 150, true),
      start: trial.start,
    };

    const data = this.jsPsych.pluginAPI.mergeSimulationData(default_data, simulation_options);

    this.jsPsych.pluginAPI.ensureSimulationDataConsistency(trial, data);

    return data;
  }

  private simulate_data_only(trial: TrialType<Info>, simulation_options) {
    const data = this.create_simulation_data(trial, simulation_options);

    this.jsPsych.finishTrial(data);
  }

  private simulate_visual(trial: TrialType<Info>, simulation_options, load_callback: () => void) {
    const data = this.create_simulation_data(trial, simulation_options);

    const display_element = this.jsPsych.getDisplayElement();

    this.trial(display_element, trial);
    load_callback();

    const video_element = display_element.querySelector<HTMLVideoElement>(
      "#jspsych-video-button-response-stimulus"
    );

    const respond = () => {
      if (data.rt !== null) {
        const el = display_element.querySelector<HTMLInputElement>("input[type='range']");

        setTimeout(() => {
          this.jsPsych.pluginAPI.clickTarget(el);
          el.valueAsNumber = data.response;
        }, data.rt / 2);

        this.jsPsych.pluginAPI.clickTarget(display_element.querySelector("button"), data.rt);
      }
    };

    if (!trial.response_allowed_while_playing) {
      video_element.addEventListener("ended", respond);
    } else {
      respond();
    }
  }
}

export default VideoSliderResponsePlugin;
