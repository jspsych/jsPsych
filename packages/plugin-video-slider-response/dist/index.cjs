'use strict';

var jspsych = require('jspsych');

var version = "2.1.1";

const info = {
  name: "video-slider-response",
  version,
  parameters: {
    /** An array of file paths to the video. You can specify multiple formats of the same video (e.g., .mp4, .ogg, .webm)
     * to maximize the [cross-browser compatibility](https://developer.mozilla.org/en-US/docs/Web/HTML/Supported_media_formats).
     * Usually .mp4 is a safe cross-browser option. The plugin does not reliably support .mov files. The player will use
     * the first source file in the array that is compatible with the browser, so specify the files in order of preference.
     */
    stimulus: {
      type: jspsych.ParameterType.VIDEO,
      default: void 0,
      array: true
    },
    /** This string can contain HTML markup. Any content here will be displayed below the stimulus. The intention is that
     * it can be used to provide a reminder about the action the participant is supposed to take (e.g., which key to press).
     */
    prompt: {
      type: jspsych.ParameterType.HTML_STRING,
      default: null
    },
    /** The width of the video display in pixels. If `null`, the video will take the original video's dimensions, 
     * or properly scaled with the aspect ratio if the height is also specified.
     */
    width: {
      type: jspsych.ParameterType.INT,
      default: null
    },
    /** The height of the video display in pixels. If `null`, the video will take the original video's dimensions,
     * or properly scaled with the aspect ratio if the width is also specified.
     */
    height: {
      type: jspsych.ParameterType.INT,
      default: null
    },
    /** If true, the video will begin playing as soon as it has loaded. */
    autoplay: {
      type: jspsych.ParameterType.BOOL,
      default: true
    },
    /** If true, controls for the video player will be available to the participant. They will be able to pause the
     * video or move the playback to any point in the video.
     */
    controls: {
      type: jspsych.ParameterType.BOOL,
      default: false
    },
    /** Time to start the clip. If null (default), video will start at the beginning of the file. */
    start: {
      type: jspsych.ParameterType.FLOAT,
      default: null
    },
    /** Time to stop the clip. If null (default), video will stop at the end of the file. */
    stop: {
      type: jspsych.ParameterType.FLOAT,
      default: null
    },
    /** The playback rate of the video. 1 is normal, <1 is slower, >1 is faster. */
    rate: {
      type: jspsych.ParameterType.FLOAT,
      default: 1
    },
    /** Sets the minimum value of the slider. */
    min: {
      type: jspsych.ParameterType.INT,
      default: 0
    },
    /** Sets the maximum value of the slider. */
    max: {
      type: jspsych.ParameterType.INT,
      default: 100
    },
    /** Sets the starting value of the slider. */
    slider_start: {
      type: jspsych.ParameterType.INT,
      default: 50
    },
    /** Sets the step of the slider. This is the smallest amount by which the slider can change. */
    step: {
      type: jspsych.ParameterType.INT,
      default: 1
    },
    /**
     * Labels displayed at equidistant locations on the slider. For example, two labels will be placed at the ends
     * of the slider. Three labels would place two at the ends and one in the middle. Four will place two at the
     * ends, and the other two will be at 33% and 67% of the slider width.
     */
    labels: {
      type: jspsych.ParameterType.HTML_STRING,
      default: [],
      array: true
    },
    /** Set the width of the slider in pixels. If left null, then the width will be equal to the widest element in
     * the display.
     */
    slider_width: {
      type: jspsych.ParameterType.INT,
      default: null
    },
    /** Label of the button to end the trial. */
    button_label: {
      type: jspsych.ParameterType.STRING,
      default: "Continue"
    },
    /** If true, the participant must move the slider before clicking the continue button. */
    require_movement: {
      type: jspsych.ParameterType.BOOL,
      default: false
    },
    /** If true, the trial will end immediately after the video finishes playing. */
    trial_ends_after_video: {
      type: jspsych.ParameterType.BOOL,
      default: false
    },
    /** How long to wait for the participant to make a response before ending the trial in milliseconds. If the
     * participant fails to make a response before this timer is reached, the participant's response will be
     * recorded as null for the trial and the trial will end. If the value of this parameter is null, then the
     * trial will wait for a response indefinitely.
     */
    trial_duration: {
      type: jspsych.ParameterType.INT,
      default: null
    },
    /** If true, then the trial will end whenever the participant makes a response (assuming they make their response
     * before the cutoff specified by the `trial_duration` parameter). If false, then the trial will continue until
     * the value for `trial_duration` is reached. You can set this parameter to `false` to force the participant
     * to view a stimulus for a fixed amount of time, even if they respond before the time is complete.
     */
    response_ends_trial: {
      type: jspsych.ParameterType.BOOL,
      default: true
    },
    /**
     * If true, then responses are allowed while the video is playing. If false, then the video must finish playing
     * before the slider is enabled and the trial can end via the next button click. Once the video has played all
     * the way through, the slider is enabled and a response is allowed (including while the video is being re-played
     * via on-screen playback controls).
     */
    response_allowed_while_playing: {
      type: jspsych.ParameterType.BOOL,
      default: true
    }
  },
  data: {
    /** The numeric value of the slider. */
    response: {
      type: jspsych.ParameterType.INT
    },
    /** The response time in milliseconds for the participant to make a response. The time is measured from when the stimulus first appears on the screen until the participant's response. */
    rt: {
      type: jspsych.ParameterType.INT
    },
    /** The `stimulus` array. This will be encoded as a JSON string when data is saved using the `.json()` or `.csv()` functions.  */
    stimulus: {
      type: jspsych.ParameterType.STRING,
      array: true
    },
    /** The starting value of the slider. */
    slider_start: {
      type: jspsych.ParameterType.INT
    },
    /** The start time of the video clip. */
    start: {
      type: jspsych.ParameterType.FLOAT
    }
  },
  // prettier-ignore
  citations: {
    "apa": "de Leeuw, J. R., Gilbert, R. A., & Luchterhandt, B. (2023). jsPsych: Enabling an Open-Source Collaborative Ecosystem of Behavioral Experiments. Journal of Open Source Software, 8(85), 5351. https://doi.org/10.21105/joss.05351 ",
    "bibtex": '@article{Leeuw2023jsPsych, 	author = {de Leeuw, Joshua R. and Gilbert, Rebecca A. and Luchterhandt, Bj{\\" o}rn}, 	journal = {Journal of Open Source Software}, 	doi = {10.21105/joss.05351}, 	issn = {2475-9066}, 	number = {85}, 	year = {2023}, 	month = {may 11}, 	pages = {5351}, 	publisher = {Open Journals}, 	title = {jsPsych: Enabling an {Open}-{Source} {Collaborative} {Ecosystem} of {Behavioral} {Experiments}}, 	url = {https://joss.theoj.org/papers/10.21105/joss.05351}, 	volume = {8}, }  '
  }
};
class VideoSliderResponsePlugin {
  constructor(jsPsych) {
    this.jsPsych = jsPsych;
  }
  static {
    this.info = info;
  }
  trial(display_element, trial) {
    var half_thumb_width = 7.5;
    var video_html = '<video id="jspsych-video-slider-response-stimulus-video"';
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
            "Warning: video-slider-response plugin does not reliably support .mov files."
          );
        }
        video_html += '<source src="' + file_name + '" type="video/' + type + '">';
      }
    }
    video_html += "</video>";
    var html = '<div id="jspsych-video-slider-response-wrapper" style="margin: 100px 0px;">';
    html += '<div id="jspsych-video-slider-response-stimulus">' + video_html + "</div>";
    html += '<div class="jspsych-video-slider-response-container" style="position:relative; margin: 0 auto 3em auto; width:';
    if (trial.slider_width !== null) {
      html += trial.slider_width + "px;";
    } else {
      html += "auto;";
    }
    html += '">';
    html += '<input type="range" class="jspsych-slider" value="' + trial.slider_start + '" min="' + trial.min + '" max="' + trial.max + '" step="' + trial.step + '" id="jspsych-video-slider-response-response"';
    if (!trial.response_allowed_while_playing) {
      html += " disabled";
    }
    html += "></input><div>";
    for (var j = 0; j < trial.labels.length; j++) {
      var label_width_perc = 100 / (trial.labels.length - 1);
      var percent_of_range = j * (100 / (trial.labels.length - 1));
      var percent_dist_from_center = (percent_of_range - 50) / 50 * 100;
      var offset = percent_dist_from_center * half_thumb_width / 100;
      html += '<div style="border: 1px solid transparent; display: inline-block; position: absolute; left:calc(' + percent_of_range + "% - (" + label_width_perc + "% / 2) - " + offset + "px); text-align: center; width: " + label_width_perc + '%;">';
      html += '<span style="text-align: center; font-size: 80%;">' + trial.labels[j] + "</span>";
      html += "</div>";
    }
    html += "</div>";
    html += "</div>";
    html += "</div>";
    if (trial.prompt !== null) {
      html += "<div>" + trial.prompt + "</div>";
    }
    var next_disabled_attribute = "";
    if (trial.require_movement || !trial.response_allowed_while_playing) {
      next_disabled_attribute = "disabled";
    }
    html += '<button id="jspsych-video-slider-response-next" class="jspsych-btn" ' + next_disabled_attribute + ">" + trial.button_label + "</button>";
    display_element.innerHTML = html;
    var video_element = display_element.querySelector(
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
          video_element.pause();
          if (trial.trial_ends_after_video && !stopped) {
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
        display_element.querySelector(
          "#jspsych-video-slider-response-next"
        ).disabled = false;
      };
      display_element.querySelector("#jspsych-video-slider-response-response").addEventListener("mousedown", enable_button);
      display_element.querySelector("#jspsych-video-slider-response-response").addEventListener("touchstart", enable_button);
      display_element.querySelector("#jspsych-video-slider-response-response").addEventListener("change", enable_button);
    }
    var startTime = performance.now();
    var response = {
      rt: null,
      response: null
    };
    const end_trial = () => {
      display_element.querySelector("#jspsych-video-slider-response-stimulus-video").pause();
      display_element.querySelector(
        "#jspsych-video-slider-response-stimulus-video"
      ).onended = () => {
      };
      var trial_data = {
        rt: response.rt,
        stimulus: trial.stimulus,
        start: trial.start,
        slider_start: trial.slider_start,
        response: response.response
      };
      this.jsPsych.finishTrial(trial_data);
    };
    display_element.querySelector("#jspsych-video-slider-response-next").addEventListener("click", () => {
      var endTime = performance.now();
      response.rt = Math.round(endTime - startTime);
      response.response = display_element.querySelector(
        "#jspsych-video-slider-response-response"
      ).valueAsNumber;
      if (trial.response_ends_trial) {
        end_trial();
      } else {
        display_element.querySelector(
          "#jspsych-video-slider-response-next"
        ).disabled = true;
      }
    });
    function enable_slider() {
      document.querySelector("#jspsych-video-slider-response-response").disabled = false;
      if (!trial.require_movement) {
        document.querySelector("#jspsych-video-slider-response-next").disabled = false;
      }
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
  create_simulation_data(trial, simulation_options) {
    const default_data = {
      stimulus: trial.stimulus,
      slider_start: trial.slider_start,
      response: this.jsPsych.randomization.randomInt(trial.min, trial.max),
      rt: this.jsPsych.randomization.sampleExGaussian(500, 50, 1 / 150, true),
      start: trial.start
    };
    const data = this.jsPsych.pluginAPI.mergeSimulationData(default_data, simulation_options);
    this.jsPsych.pluginAPI.ensureSimulationDataConsistency(trial, data);
    return data;
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
        const el = display_element.querySelector("input[type='range']");
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

module.exports = VideoSliderResponsePlugin;
//# sourceMappingURL=index.cjs.map
