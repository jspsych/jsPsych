'use strict';

var jspsych = require('jspsych');

var version = "2.1.1";

const info = {
  name: "video-keyboard-response",
  version,
  parameters: {
    /** Array of the video file(s) to play. Video can be provided in multiple file formats for better cross-browser support. */
    stimulus: {
      type: jspsych.ParameterType.VIDEO,
      pretty_name: "Video",
      default: void 0,
      array: true
    },
    /** Array containing the key(s) the subject is allowed to press to respond to the stimulus. */
    choices: {
      type: jspsych.ParameterType.KEYS,
      pretty_name: "Choices",
      default: "ALL_KEYS"
    },
    /** Any content here will be displayed below the stimulus. */
    prompt: {
      type: jspsych.ParameterType.HTML_STRING,
      pretty_name: "Prompt",
      default: null
    },
    /** The width of the video display in pixels. If `null`, the video will take the original video's dimensions, 
     * or properly scaled with the aspect ratio if the height is also specified.
     */
    width: {
      type: jspsych.ParameterType.INT,
      pretty_name: "Width",
      default: ""
    },
    /** The height of the video display in pixels. If `null`, the video will take the original video's dimensions,
     * or properly scaled with the aspect ratio if the width is also specified.
     */
    height: {
      type: jspsych.ParameterType.INT,
      pretty_name: "Height",
      default: ""
    },
    /** If true, the video will begin playing as soon as it has loaded. */
    autoplay: {
      type: jspsych.ParameterType.BOOL,
      pretty_name: "Autoplay",
      default: true
    },
    /** If true, the subject will be able to pause the video or move the playback to any point in the video. */
    controls: {
      type: jspsych.ParameterType.BOOL,
      pretty_name: "Controls",
      default: false
    },
    /** Time to start the clip. If null (default), video will start at the beginning of the file. */
    start: {
      type: jspsych.ParameterType.FLOAT,
      pretty_name: "Start",
      default: null
    },
    /** Time to stop the clip. If null (default), video will stop at the end of the file. */
    stop: {
      type: jspsych.ParameterType.FLOAT,
      pretty_name: "Stop",
      default: null
    },
    /** The playback rate of the video. 1 is normal, <1 is slower, >1 is faster. */
    rate: {
      type: jspsych.ParameterType.FLOAT,
      pretty_name: "Rate",
      default: 1
    },
    /** If true, the trial will end immediately after the video finishes playing. */
    trial_ends_after_video: {
      type: jspsych.ParameterType.BOOL,
      pretty_name: "End trial after video finishes",
      default: false
    },
    /** How long to show trial before it ends. */
    trial_duration: {
      type: jspsych.ParameterType.INT,
      pretty_name: "Trial duration",
      default: null
    },
    /** If true, the trial will end when subject makes a response. */
    response_ends_trial: {
      type: jspsych.ParameterType.BOOL,
      pretty_name: "Response ends trial",
      default: true
    },
    /** If true, then responses are allowed while the video is playing. If false, then the video must finish playing before a response is accepted. */
    response_allowed_while_playing: {
      type: jspsych.ParameterType.BOOL,
      pretty_name: "Response allowed while playing",
      default: true
    }
  },
  data: {
    /** Indicates which key the participant pressed. */
    response: {
      type: jspsych.ParameterType.STRING
    },
    /** The response time in milliseconds for the participant to make a response. The time is measured from when the
     * stimulus first appears on the screen until the participant's response.
     */
    rt: {
      type: jspsych.ParameterType.INT
    },
    /** The `stimulus` array. This will be encoded as a JSON string when data is saved using the `.json()` or `.csv()` functions. */
    stimulus: {
      type: jspsych.ParameterType.STRING,
      array: true
    }
  },
  // prettier-ignore
  citations: {
    "apa": "de Leeuw, J. R., Gilbert, R. A., & Luchterhandt, B. (2023). jsPsych: Enabling an Open-Source Collaborative Ecosystem of Behavioral Experiments. Journal of Open Source Software, 8(85), 5351. https://doi.org/10.21105/joss.05351 ",
    "bibtex": '@article{Leeuw2023jsPsych, 	author = {de Leeuw, Joshua R. and Gilbert, Rebecca A. and Luchterhandt, Bj{\\" o}rn}, 	journal = {Journal of Open Source Software}, 	doi = {10.21105/joss.05351}, 	issn = {2475-9066}, 	number = {85}, 	year = {2023}, 	month = {may 11}, 	pages = {5351}, 	publisher = {Open Journals}, 	title = {jsPsych: Enabling an {Open}-{Source} {Collaborative} {Ecosystem} of {Behavioral} {Experiments}}, 	url = {https://joss.theoj.org/papers/10.21105/joss.05351}, 	volume = {8}, }  '
  }
};
class VideoKeyboardResponsePlugin {
  constructor(jsPsych) {
    this.jsPsych = jsPsych;
  }
  static {
    this.info = info;
  }
  trial(display_element, trial) {
    var video_html = "<div>";
    video_html += '<video id="jspsych-video-keyboard-response-stimulus"';
    if (trial.width) {
      video_html += ' width="' + trial.width + '"';
    }
    if (trial.height) {
      video_html += ' height="' + trial.height + '"';
    }
    if (trial.autoplay && trial.start == null) {
      video_html += " autoplay ";
    }
    if (trial.controls) {
      video_html += " controls ";
    }
    if (trial.start !== null) {
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
            "Warning: video-keyboard-response plugin does not reliably support .mov files."
          );
        }
        video_html += '<source src="' + file_name + '" type="video/' + type + '">';
      }
    }
    video_html += "</video>";
    video_html += "</div>";
    if (trial.prompt !== null) {
      video_html += trial.prompt;
    }
    display_element.innerHTML = video_html;
    var video_element = display_element.querySelector(
      "#jspsych-video-keyboard-response-stimulus"
    );
    if (video_preload_blob) {
      video_element.src = video_preload_blob;
    }
    video_element.onended = () => {
      if (trial.trial_ends_after_video) {
        end_trial();
      }
      if (trial.response_allowed_while_playing == false && !trial.trial_ends_after_video) {
        this.jsPsych.pluginAPI.getKeyboardResponse({
          callback_function: after_response,
          valid_responses: trial.choices,
          rt_method: "performance",
          persist: false,
          allow_held_key: false
        });
      }
    };
    video_element.playbackRate = trial.rate;
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
        video_element.onseeked = () => {
        };
      };
      video_element.onplaying = () => {
        video_element.currentTime = trial.start;
        video_element.onplaying = () => {
        };
      };
      video_element.muted = true;
      video_element.play();
    }
    let stopped = false;
    if (trial.stop !== null) {
      video_element.addEventListener("timeupdate", (e) => {
        var currenttime = video_element.currentTime;
        if (currenttime >= trial.stop) {
          if (!trial.response_allowed_while_playing) {
            this.jsPsych.pluginAPI.getKeyboardResponse({
              callback_function: after_response,
              valid_responses: trial.choices,
              rt_method: "performance",
              persist: false,
              allow_held_key: false
            });
          }
          video_element.pause();
          if (trial.trial_ends_after_video && !stopped) {
            stopped = true;
            end_trial();
          }
        }
      });
    }
    var response = {
      rt: null,
      key: null
    };
    const end_trial = () => {
      this.jsPsych.pluginAPI.cancelAllKeyboardResponses();
      display_element.querySelector("#jspsych-video-keyboard-response-stimulus").pause();
      display_element.querySelector(
        "#jspsych-video-keyboard-response-stimulus"
      ).onended = () => {
      };
      var trial_data = {
        rt: response.rt,
        stimulus: trial.stimulus,
        response: response.key
      };
      this.jsPsych.finishTrial(trial_data);
    };
    var after_response = (info2) => {
      display_element.querySelector("#jspsych-video-keyboard-response-stimulus").className += " responded";
      if (response.key == null) {
        response = info2;
      }
      if (trial.response_ends_trial) {
        end_trial();
      }
    };
    if (trial.choices != "NO_KEYS" && trial.response_allowed_while_playing) {
      this.jsPsych.pluginAPI.getKeyboardResponse({
        callback_function: after_response,
        valid_responses: trial.choices,
        rt_method: "performance",
        persist: false,
        allow_held_key: false
      });
    }
    if (trial.trial_duration !== null) {
      this.jsPsych.pluginAPI.setTimeout(end_trial, trial.trial_duration);
    }
  }
  simulate(trial, simulation_mode, simulation_options, load_callback) {
    if (simulation_mode == "data-only") {
      load_callback();
      this.simulate_data_only(trial, simulation_options);
    }
    if (simulation_mode == "visual") {
      this.simulate_visual(trial, simulation_options, load_callback);
    }
  }
  simulate_data_only(trial, simulation_options) {
    const data = this.create_simulation_data(trial, simulation_options);
    this.jsPsych.finishTrial(data);
  }
  simulate_visual(trial, simulation_options, load_callback) {
    const data = this.create_simulation_data(trial, simulation_options);
    const display_element = this.jsPsych.getDisplayElement();
    this.trial(display_element, trial);
    load_callback();
    const video_element = display_element.querySelector(
      "#jspsych-video-button-response-stimulus"
    );
    const respond = () => {
      if (data.rt !== null) {
        this.jsPsych.pluginAPI.pressKey(data.response, data.rt);
      }
    };
    if (!trial.response_allowed_while_playing) {
      video_element.addEventListener("ended", respond);
    } else {
      respond();
    }
  }
  create_simulation_data(trial, simulation_options) {
    const default_data = {
      stimulus: trial.stimulus,
      rt: this.jsPsych.randomization.sampleExGaussian(500, 50, 1 / 150, true),
      response: this.jsPsych.pluginAPI.getValidKey(trial.choices)
    };
    const data = this.jsPsych.pluginAPI.mergeSimulationData(default_data, simulation_options);
    this.jsPsych.pluginAPI.ensureSimulationDataConsistency(trial, data);
    return data;
  }
}

module.exports = VideoKeyboardResponsePlugin;
//# sourceMappingURL=index.cjs.map
