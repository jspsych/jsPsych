import { JsPsych, JsPsychPlugin, ParameterType, TrialType } from "jspsych";

const info = <const>{
  name: "video-button-response",
  parameters: {
    /** Array of the video file(s) to play. Video can be provided in multiple file formats for better cross-browser support. */
    stimulus: {
      type: ParameterType.VIDEO,
      pretty_name: "Video",
      default: undefined,
      array: true,
    },
    /** Array containing the label(s) for the button(s). */
    choices: {
      type: ParameterType.STRING,
      pretty_name: "Choices",
      default: undefined,
      array: true,
    },
    /**
     * A function that, given a choice and its index, returns the HTML string of that choice's
     * button.
     */
    button_html: {
      type: ParameterType.FUNCTION,
      pretty_name: "Button HTML",
      default: function (choice: string, choice_index: number) {
        return `<button class="jspsych-btn">${choice}</button>`;
      },
    },
    /** Any content here will be displayed below the buttons. */
    prompt: {
      type: ParameterType.HTML_STRING,
      pretty_name: "Prompt",
      default: null,
    },
    /** The width of the video in pixels. */
    width: {
      type: ParameterType.INT,
      pretty_name: "Width",
      default: "",
    },
    /** The height of the video display in pixels. */
    height: {
      type: ParameterType.INT,
      pretty_name: "Height",
      default: "",
    },
    /** If true, the video will begin playing as soon as it has loaded. */
    autoplay: {
      type: ParameterType.BOOL,
      pretty_name: "Autoplay",
      default: true,
    },
    /** If true, the subject will be able to pause the video or move the playback to any point in the video. */
    controls: {
      type: ParameterType.BOOL,
      pretty_name: "Controls",
      default: false,
    },
    /** Time to start the clip. If null (default), video will start at the beginning of the file. */
    start: {
      type: ParameterType.FLOAT,
      pretty_name: "Start",
      default: null,
    },
    /** Time to stop the clip. If null (default), video will stop at the end of the file. */
    stop: {
      type: ParameterType.FLOAT,
      pretty_name: "Stop",
      default: null,
    },
    /** The playback rate of the video. 1 is normal, <1 is slower, >1 is faster. */
    rate: {
      type: ParameterType.FLOAT,
      pretty_name: "Rate",
      default: 1,
    },
    /** If true, the trial will end immediately after the video finishes playing. */
    trial_ends_after_video: {
      type: ParameterType.BOOL,
      pretty_name: "End trial after video finishes",
      default: false,
    },
    /** How long to show trial before it ends. */
    trial_duration: {
      type: ParameterType.INT,
      pretty_name: "Trial duration",
      default: null,
    },
    /** The CSS layout for the buttons. Options: 'flex' or 'grid'. */
    button_layout: {
      type: ParameterType.STRING,
      pretty_name: "Button layout",
      default: "grid",
    },
    /** The number of grid rows when `button_layout` is "grid".
     * Setting to `null` will infer the number of rows based on the
     * number of columns and buttons.
     */
    grid_rows: {
      type: ParameterType.INT,
      pretty_name: "Grid rows",
      default: 1,
    },
    /** The number of grid columns when `button_layout` is "grid".
     * Setting to `null` (default value) will infer the number of columns
     * based on the number of rows and buttons. */
    grid_columns: {
      type: ParameterType.INT,
      pretty_name: "Grid columns",
      default: null,
    },
    /** If true, the trial will end when subject makes a response. */
    response_ends_trial: {
      type: ParameterType.BOOL,
      pretty_name: "Response ends trial",
      default: true,
    },
    /** If true, then responses are allowed while the video is playing. If false, then the video must finish playing before a response is accepted. */
    response_allowed_while_playing: {
      type: ParameterType.BOOL,
      pretty_name: "Response allowed while playing",
      default: true,
    },
  },
};

type Info = typeof info;

/**
 * **video-button-response**
 *
 * jsPsych plugin for playing a video file and getting a button response
 *
 * @author Josh de Leeuw
 * @see {@link https://www.jspsych.org/plugins/jspsych-video-button-response/ video-button-response plugin documentation on jspsych.org}
 */
class VideoButtonResponsePlugin implements JsPsychPlugin<Info> {
  static info = info;

  constructor(private jsPsych: JsPsych) {}

  trial(display_element: HTMLElement, trial: TrialType<Info>) {
    display_element.innerHTML = "";

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
            enable_buttons();
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

    if (trial.response_allowed_while_playing) {
      enable_buttons();
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
      // kill any remaining setTimeout handlers
      this.jsPsych.pluginAPI.clearAllTimeouts();

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

      // clear the display
      display_element.innerHTML = "";

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
      rt: this.jsPsych.randomization.sampleExGaussian(500, 50, 1 / 150, true),
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
