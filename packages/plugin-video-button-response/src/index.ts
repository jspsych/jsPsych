import { JsPsych, JsPsychPlugin, ParameterType, TrialType } from "jspsych";

import { version } from "../package.json";

const info = <const>{
  name: "video-button-response",
  version: version,
  parameters: {
    /**
     * An array of file paths to the video. You can specify multiple formats of the same video (e.g., .mp4, .ogg, .webm)
     * to maximize the [cross-browser compatibility](https://developer.mozilla.org/en-US/docs/Web/HTML/Supported_media_formats).
     * Usually .mp4 is a safe cross-browser option. The plugin does not reliably support .mov files. The player will use the
     * first source file in the array that is compatible with the browser, so specify the files in order of preference.
     */
    stimulus: {
      type: ParameterType.VIDEO,
      default: undefined,
      array: true,
    },
    /**
     * Labels for the buttons. Each different string in the array will generate a different button.
     */
    choices: {
      type: ParameterType.STRING,
      default: undefined,
      array: true,
    },
    /**
     *  A function that generates the HTML for each button in the `choices` array. The function gets the string and index
     * of the item in the `choices` array and should return valid HTML. If you want to use different markup for each
     * button, you can do that by using a conditional on either parameter. The default parameter returns a button element
     * with the text label of the choice.
     */
    button_html: {
      type: ParameterType.FUNCTION,
      default: function (choice: string, choice_index: number) {
        return `<button class="jspsych-btn">${choice}</button>`;
      },
    },
    /** This string can contain HTML markup. Any content here will be displayed below the stimulus. The intention is
     * that it can be used to provide a reminder about the action the participant is supposed to take (e.g., which
     * key to press).
     */
    prompt: {
      type: ParameterType.HTML_STRING,
      default: null,
    },
    /** The width of the video display in pixels. If `null`, the video will take the original video's dimensions, 
     * or properly scaled with the aspect ratio if the height is also specified.
     */
    width: {
      type: ParameterType.INT,
      default: null,
    },
    /** The height of the video display in pixels. If `null`, the video will take the original video's dimensions,
     * or properly scaled with the aspect ratio if the width is also specified.
     */
    height: {
      type: ParameterType.INT,
      default: null,
    },
    /** If true, the video will begin playing as soon as it has loaded. */
    autoplay: {
      type: ParameterType.BOOL,
      pretty_name: "Autoplay",
      default: true,
    },
    /** If true, controls for the video player will be available to the participant. They will be able to pause
     * the video or move the playback to any point in the video.
     */
    controls: {
      type: ParameterType.BOOL,
      default: false,
    },
    /** Time to start the clip. If `null` (default), video will start at the beginning of the file. */
    start: {
      type: ParameterType.FLOAT,
      default: null,
    },
    /** Time to stop the clip. If `null` (default), video will stop at the end of the file. */
    stop: {
      type: ParameterType.FLOAT,
      default: null,
    },
    /** The playback rate of the video. 1 is normal, <1 is slower, >1 is faster. */
    rate: {
      type: ParameterType.FLOAT,
      default: 1,
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
    /** Setting to `'grid'` will make the container element have the CSS property `display: grid` and enable the
     * use of `grid_rows` and `grid_columns`. Setting to `'flex'` will make the container element have the CSS
     * property `display: flex`. You can customize how the buttons are laid out by adding inline CSS in the
     * `button_html` parameter.
     */
    button_layout: {
      type: ParameterType.STRING,
      default: "grid",
    },
    /**
     * The number of rows in the button grid. Only applicable when `button_layout` is set to `'grid'`. If null,
     * the number of rows will be determined automatically based on the number of buttons and the number of columns.
     */
    grid_rows: {
      type: ParameterType.INT,
      default: 1,
    },
    /** The number of grid columns when `button_layout` is "grid".
     * Setting to `null` (default value) will infer the number of columns
     * based on the number of rows and buttons. */
    grid_columns: {
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
    /** If true, then responses are allowed while the video is playing. If false, then the video must finish
     * playing before the button choices are enabled and a response is accepted. Once the video has played
     * all the way through, the buttons are enabled and a response is allowed (including while the video is
     * being re-played via on-screen playback controls).
     */
    response_allowed_while_playing: {
      type: ParameterType.BOOL,
      default: true,
    },
    /** How long the button will delay enabling in milliseconds. If `response_allowed_while_playing` is `true`,
     * the timer will start immediately. If it is `false`, the timer will start at the end of the video.
     */
    enable_button_after: {
      type: ParameterType.INT,
      default: 0,
    },
  },
  data: {
    /** Indicates which button the participant pressed. The first button in the `choices` array is 0, the second is 1, and so on.  */
    response: {
      type: ParameterType.INT,
    },
    /** The response time in milliseconds for the participant to make a response. The time is measured from when the stimulus first appears on the screen until the participant's response. */
    rt: {
      type: ParameterType.INT,
    },
    /** The `stimulus` array. This will be encoded as a JSON string when data is saved using the `.json()` or `.csv()` functions. */
    stimulus: {
      type: ParameterType.STRING,
      array: true,
    },
  },
  // prettier-ignore
  citations: '__CITATIONS__',
};

type Info = typeof info;

/**
 * This plugin plays a video and records responses generated by button click. The stimulus can be displayed until a response is given,
 * or for a pre-determined amount of time. The trial can be ended automatically when the participant responds, when the video file has
 * finished playing, or if the participant has failed to respond within a fixed length of time. You can also prevent a button response
 * from being made before the video has finished playing. The button itself can be customized using HTML formatting.
 *
 * Video files can be automatically preloaded by jsPsych using the [`preload` plugin](preload.md). However, if you are using
 * timeline variables or another dynamic method to specify the video stimulus, you will need to
 * [manually preload](../overview/media-preloading.md#manual-preloading) the videos.
 * Also note that video preloading is disabled when the experiment is running as a file (i.e. opened directly in the browser,
 * rather than through a server), in order to prevent CORS errors - see the section on [Running Experiments](../overview/running-experiments.md) for more information.
 *
 * @author Josh de Leeuw
 * @see {@link https://www.jspsych.org/latest/plugins/video-button-response/ video-button-response plugin documentation on jspsych.org}
 */
class VideoButtonResponsePlugin implements JsPsychPlugin<Info> {
  static info = info;

  constructor(private jsPsych: JsPsych) {}

  trial(display_element: HTMLElement, trial: TrialType<Info>) {
    // Setup stimulus
    const stimulusWrapper = document.createElement("div");
    display_element.appendChild(stimulusWrapper);

    const videoElement = document.createElement("video");
    stimulusWrapper.appendChild(videoElement);
    videoElement.id = "jspsych-video-button-response-stimulus";

    if (trial.width) {
      videoElement.width = trial.width;
    }
    if (trial.height) {
      videoElement.height = trial.height;
    }

    videoElement.controls = trial.controls;

    // if autoplay is true and the start time is specified, then the video will start automatically
    // via the play() method, rather than the autoplay attribute, to prevent showing the first frame
    videoElement.autoplay = trial.autoplay && trial.start == null;

    if (trial.start !== null) {
      // hide video element when page loads if the start time is specified,
      // to prevent the video element from showing the first frame
      videoElement.style.visibility = "hidden";
    }

    const videoPreloadBlob = this.jsPsych.pluginAPI.getVideoBuffer(trial.stimulus[0]);
    if (!videoPreloadBlob) {
      for (let filename of trial.stimulus) {
        if (filename.indexOf("?") > -1) {
          filename = filename.substring(0, filename.indexOf("?"));
        }
        const type = filename.substring(filename.lastIndexOf(".") + 1).toLowerCase();
        if (type === "mov") {
          console.warn(
            "Warning: video-button-response plugin does not reliably support .mov files."
          );
        }

        const sourceElement = document.createElement("source");
        sourceElement.src = filename;
        sourceElement.type = "video/" + type;
        videoElement.appendChild(sourceElement);
      }
    }

    // Display buttons
    const buttonGroupElement = document.createElement("div");
    buttonGroupElement.id = "jspsych-video-button-response-btngroup";
    if (trial.button_layout === "grid") {
      buttonGroupElement.classList.add("jspsych-btn-group-grid");
      if (trial.grid_rows === null && trial.grid_columns === null) {
        throw new Error(
          "You cannot set `grid_rows` to `null` without providing a value for `grid_columns`."
        );
      }
      const n_cols =
        trial.grid_columns === null
          ? Math.ceil(trial.choices.length / trial.grid_rows)
          : trial.grid_columns;
      const n_rows =
        trial.grid_rows === null
          ? Math.ceil(trial.choices.length / trial.grid_columns)
          : trial.grid_rows;
      buttonGroupElement.style.gridTemplateColumns = `repeat(${n_cols}, 1fr)`;
      buttonGroupElement.style.gridTemplateRows = `repeat(${n_rows}, 1fr)`;
    } else if (trial.button_layout === "flex") {
      buttonGroupElement.classList.add("jspsych-btn-group-flex");
    }

    for (const [choiceIndex, choice] of trial.choices.entries()) {
      buttonGroupElement.insertAdjacentHTML("beforeend", trial.button_html(choice, choiceIndex));
      const buttonElement = buttonGroupElement.lastChild as HTMLElement;
      buttonElement.dataset.choice = choiceIndex.toString();
      buttonElement.addEventListener("click", () => {
        after_response(choiceIndex);
      });
    }

    display_element.appendChild(buttonGroupElement);

    // Show prompt if there is one
    if (trial.prompt !== null) {
      display_element.insertAdjacentHTML("beforeend", trial.prompt);
    }

    var start_time = performance.now();

    if (videoPreloadBlob) {
      videoElement.src = videoPreloadBlob;
    }

    videoElement.onended = () => {
      if (trial.trial_ends_after_video) {
        end_trial();
      } else if (!trial.response_allowed_while_playing) {
        enable_buttons();
      }
    };

    videoElement.playbackRate = trial.rate;

    // if video start time is specified, hide the video and set the starting time
    // before showing and playing, so that the video doesn't automatically show the first frame
    if (trial.start !== null) {
      videoElement.pause();
      videoElement.onseeked = () => {
        videoElement.style.visibility = "visible";
        videoElement.muted = false;
        if (trial.autoplay) {
          videoElement.play();
        } else {
          videoElement.pause();
        }
        videoElement.onseeked = () => {};
      };
      videoElement.onplaying = () => {
        videoElement.currentTime = trial.start;
        videoElement.onplaying = () => {};
      };
      // fix for iOS/MacOS browsers: videos aren't seekable until they start playing, so need to hide/mute, play,
      // change current time, then show/unmute
      videoElement.muted = true;
      videoElement.play();
    }

    let stopped = false;
    if (trial.stop !== null) {
      videoElement.addEventListener("timeupdate", (e) => {
        if (videoElement.currentTime >= trial.stop) {
          if (!trial.response_allowed_while_playing) {
            if (trial.enable_button_after > 0) {
              enable_buttons_delayed(trial.enable_button_after);
            } else {
              enable_buttons();
            }
          }
          videoElement.pause();
          if (trial.trial_ends_after_video && !stopped) {
            // this is to prevent end_trial from being called twice, because the timeupdate event
            // can fire in quick succession
            stopped = true;
            end_trial();
          }
        }
      });
    }

    const enable_buttons_delayed = (delay: number) => {
      this.jsPsych.pluginAPI.setTimeout(enable_buttons, delay);
    };

    if (trial.response_allowed_while_playing) {
      disable_buttons();
      if (trial.enable_button_after > 0) {
        enable_buttons_delayed(trial.enable_button_after);
      } else {
        enable_buttons();
      }
    } else {
      disable_buttons();
    }

    // store response
    var response = {
      rt: null,
      button: null,
    };

    // function to end trial when it is time
    const end_trial = () => {
      // stop the video file if it is playing
      // remove any remaining end event handlers
      videoElement.pause();
      videoElement.onended = () => {};

      // gather the data to store for the trial
      const trial_data = {
        rt: response.rt,
        stimulus: trial.stimulus,
        response: response.button,
      };

      // move on to the next trial
      this.jsPsych.finishTrial(trial_data);
    };

    // function to handle responses by the subject
    function after_response(choice: number) {
      // measure rt
      var end_time = performance.now();
      var rt = Math.round(end_time - start_time);
      response.button = choice;
      response.rt = rt;

      // after a valid response, the stimulus will have the CSS class 'responded'
      // which can be used to provide visual feedback that a response was recorded
      videoElement.classList.add("responded");

      // disable all the buttons after a response
      disable_buttons();

      if (trial.response_ends_trial) {
        end_trial();
      }
    }

    function disable_buttons() {
      for (const button of buttonGroupElement.children) {
        button.setAttribute("disabled", "disabled");
      }
    }

    function enable_buttons() {
      for (const button of buttonGroupElement.children) {
        button.removeAttribute("disabled");
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
      rt:
        this.jsPsych.randomization.sampleExGaussian(500, 50, 1 / 150, true) +
        trial.enable_button_after,
      response: this.jsPsych.randomization.randomInt(0, trial.choices.length - 1),
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
        this.jsPsych.pluginAPI.clickTarget(
          display_element.querySelector(
            `#jspsych-video-button-response-btngroup [data-choice="${data.response}"]`
          ),
          data.rt
        );
      }
    };

    if (!trial.response_allowed_while_playing) {
      video_element.addEventListener("ended", respond);
    } else {
      respond();
    }
  }
}

export default VideoButtonResponsePlugin;
