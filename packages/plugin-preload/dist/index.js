import { ParameterType } from 'jspsych';

var version = "2.1.0";

const info = {
  name: "preload",
  version,
  parameters: {
    /** If `true`, the plugin will preload any files that can be automatically preloaded based on the main experiment
     * timeline that is passed to `jsPsych.run`. If `false`, any file(s) to be preloaded should be specified by passing
     * a timeline array to the `trials` parameter and/or an array of file paths to the `images`, `audio`, and/or `video`
     * parameters. Setting this parameter to `false` is useful when you plan to preload your files in smaller batches
     * throughout the experiment. */
    auto_preload: {
      type: ParameterType.BOOL,
      default: false
    },
    /** An array containing one or more jsPsych trial or timeline objects. This parameter is useful when you want to
     * automatically preload stimuli files from a specific subset of the experiment. See [Creating an Experiment:
     * The Timeline](../overview/timeline.md) for information on constructing timelines. */
    trials: {
      type: ParameterType.TIMELINE,
      default: []
    },
    /**
     * Array with one or more image files to load. This parameter is often used in cases where media files cannot
     * be automatically preloaded based on the timeline, e.g. because the media files are passed into an image plugin/parameter with
     * timeline variables or dynamic parameters, or because the image is embedded in an HTML string.
     */
    images: {
      type: ParameterType.STRING,
      default: [],
      array: true
    },
    /**
     * Array with one or more audio files to load. This parameter is often used in cases where media files cannot
     * be automatically preloaded based on the timeline, e.g. because the media files are passed into an audio plugin/parameter with
     * timeline variables or dynamic parameters, or because the audio is embedded in an HTML string.
     */
    audio: {
      type: ParameterType.STRING,
      default: [],
      array: true
    },
    /**
     * Array with one or more video files to load. This parameter is often used in cases where media files cannot
     * be automatically preloaded based on the timeline, e.g. because the media files are passed into a video plugin/parameter with
     * timeline variables or dynamic parameters, or because the video is embedded in an HTML string.
     */
    video: {
      type: ParameterType.STRING,
      default: [],
      array: true
    },
    /** HTML-formatted message to show above the progress bar while the files are loading. If `null`, then no message is shown. */
    message: {
      type: ParameterType.HTML_STRING,
      default: null
    },
    /** If `true`, a progress bar will be shown while the files are loading. If `false`, no progress bar is shown. */
    show_progress_bar: {
      type: ParameterType.BOOL,
      default: true
    },
    /**
     * Whether or not to continue with the experiment if a loading error occurs. If false, then if a loading error occurs,
     * the error_message will be shown on the page and the trial will not end. If true, then if if a loading error occurs, the trial will end
     * and preloading failure will be logged in the trial data.
     */
    continue_after_error: {
      type: ParameterType.BOOL,
      default: false
    },
    /** HTML-formatted message to be shown on the page after loading fails or times out. Only applies when `continue_after_error` is `false`.*/
    error_message: {
      type: ParameterType.HTML_STRING,
      default: "The experiment failed to load."
    },
    /**
     * Whether or not to show a detailed error message on the page. If true, then detailed error messages will be shown on the
     * page for all files that failed to load, along with the general error_message. This parameter is only relevant when continue_after_error is false.
     */
    show_detailed_errors: {
      type: ParameterType.BOOL,
      default: false
    },
    /**
     * The maximum amount of time that the plugin should wait before stopping the preload and either ending the trial
     * (if continue_after_error is true) or stopping the experiment with an error message (if continue_after_error is false).
     * If null, the plugin will wait indefintely for the files to load.
     */
    max_load_time: {
      type: ParameterType.INT,
      default: null
    },
    /** Function to be called after a file fails to load. The function takes the file name as its only argument. */
    on_error: {
      type: ParameterType.FUNCTION,
      default: null
    },
    /** Function to be called after a file loads successfully. The function takes the file name as its only argument. */
    on_success: {
      type: ParameterType.FUNCTION,
      default: null
    }
  },
  data: {
    /**  If `true`, then all files loaded successfully within the `max_load_time`. If `false`, then one or
     * more file requests returned a failure and/or the file loading did not complete within the `max_load_time` duration.*/
    success: {
      type: ParameterType.BOOL
    },
    /** If `true`, then the files did not finish loading within the `max_load_time` duration.
     * If `false`, then the file loading did not timeout. Note that when the preload trial does not timeout
     * (`timeout: false`), it is still possible for loading to fail (`success: false`). This happens if
     * one or more files fails to load and all file requests trigger either a success or failure event before
     * the `max_load_time` duration. */
    timeout: {
      type: ParameterType.BOOL
    },
    /** One or more image file paths that produced a loading failure before the trial ended. */
    failed_images: {
      type: ParameterType.STRING,
      array: true
    },
    /** One or more audio file paths that produced a loading failure before the trial ended. */
    failed_audio: {
      type: ParameterType.STRING,
      array: true
    },
    /** One or more video file paths that produced a loading failure before the trial ended. */
    failed_video: {
      type: ParameterType.STRING,
      array: true
    }
  },
  // prettier-ignore
  citations: {
    "apa": "de Leeuw, J. R., Gilbert, R. A., & Luchterhandt, B. (2023). jsPsych: Enabling an Open-Source Collaborative Ecosystem of Behavioral Experiments. Journal of Open Source Software, 8(85), 5351. https://doi.org/10.21105/joss.05351 ",
    "bibtex": '@article{Leeuw2023jsPsych, 	author = {de Leeuw, Joshua R. and Gilbert, Rebecca A. and Luchterhandt, Bj{\\" o}rn}, 	journal = {Journal of Open Source Software}, 	doi = {10.21105/joss.05351}, 	issn = {2475-9066}, 	number = {85}, 	year = {2023}, 	month = {may 11}, 	pages = {5351}, 	publisher = {Open Journals}, 	title = {jsPsych: Enabling an {Open}-{Source} {Collaborative} {Ecosystem} of {Behavioral} {Experiments}}, 	url = {https://joss.theoj.org/papers/10.21105/joss.05351}, 	volume = {8}, }  '
  }
};
class PreloadPlugin {
  constructor(jsPsych) {
    this.jsPsych = jsPsych;
  }
  static {
    this.info = info;
  }
  trial(display_element, trial) {
    var success = null;
    var timeout = false;
    var failed_images = [];
    var failed_audio = [];
    var failed_video = [];
    var detailed_errors = [];
    var in_safe_mode = this.jsPsych.getSafeModeStatus();
    var images = [];
    var audio = [];
    var video = [];
    if (trial.auto_preload) {
      var experiment_timeline = this.jsPsych.getTimeline();
      var auto_preload = this.jsPsych.pluginAPI.getAutoPreloadList(experiment_timeline);
      images = images.concat(auto_preload.images);
      audio = audio.concat(auto_preload.audio);
      video = video.concat(auto_preload.video);
    }
    if (trial.trials.length > 0) {
      var trial_preloads = this.jsPsych.pluginAPI.getAutoPreloadList(trial.trials);
      images = images.concat(trial_preloads.images);
      audio = audio.concat(trial_preloads.audio);
      video = video.concat(trial_preloads.video);
    }
    images = images.concat(trial.images);
    audio = audio.concat(trial.audio);
    video = video.concat(trial.video);
    images = this.jsPsych.utils.unique(images.flat());
    audio = this.jsPsych.utils.unique(audio.flat());
    video = this.jsPsych.utils.unique(video.flat());
    if (in_safe_mode) {
      video = [];
    }
    var html = "";
    if (trial.message !== null) {
      html += trial.message;
    }
    if (trial.show_progress_bar) {
      html += `
            <div id='jspsych-loading-progress-bar-container' style='height: 10px; width: 300px; background-color: #ddd; margin: auto;'>
              <div id='jspsych-loading-progress-bar' style='height: 10px; width: 0%; background-color: #777;'></div>
            </div>`;
    }
    display_element.innerHTML = html;
    const update_loading_progress_bar = () => {
      loaded++;
      if (trial.show_progress_bar) {
        var percent_loaded = loaded / total_n * 100;
        var preload_progress_bar = display_element.querySelector(
          "#jspsych-loading-progress-bar"
        );
        if (preload_progress_bar !== null) {
          preload_progress_bar.style.width = percent_loaded + "%";
        }
      }
    };
    const on_success = () => {
      if (typeof timeout !== "undefined" && timeout === false) {
        this.jsPsych.pluginAPI.clearAllTimeouts();
        this.jsPsych.pluginAPI.cancelPreloads();
        success = true;
        end_trial();
      }
    };
    const on_timeout = () => {
      this.jsPsych.pluginAPI.cancelPreloads();
      if (typeof success !== "undefined" && (success === false || success === null)) {
        timeout = true;
        if (loaded_success < total_n) {
          success = false;
        }
        after_error("timeout");
        detailed_errors.push(
          "<p><strong>Loading timed out.</strong><br>Consider compressing your stimuli files, loading your files in smaller batches,<br>and/or increasing the <i>max_load_time</i> parameter.</p>"
        );
        if (trial.continue_after_error) {
          end_trial();
        } else {
          stop_with_error_message();
        }
      }
    };
    const stop_with_error_message = () => {
      this.jsPsych.pluginAPI.clearAllTimeouts();
      this.jsPsych.pluginAPI.cancelPreloads();
      display_element.innerHTML = trial.error_message;
      if (trial.show_detailed_errors) {
        display_element.innerHTML += "<p><strong>Error details:</strong></p>";
        detailed_errors.forEach((e) => {
          display_element.innerHTML += e;
        });
      }
    };
    const end_trial = () => {
      var trial_data = {
        success,
        timeout,
        failed_images,
        failed_audio,
        failed_video
      };
      this.jsPsych.finishTrial(trial_data);
    };
    if (trial.max_load_time !== null) {
      this.jsPsych.pluginAPI.setTimeout(on_timeout, trial.max_load_time);
    }
    var total_n = images.length + audio.length + video.length;
    var loaded = 0;
    var loaded_success = 0;
    if (total_n == 0) {
      on_success();
    } else {
      const load_video = (cb) => {
        this.jsPsych.pluginAPI.preloadVideo(video, cb, file_loading_success, file_loading_error);
      };
      const load_audio = (cb) => {
        this.jsPsych.pluginAPI.preloadAudio(audio, cb, file_loading_success, file_loading_error);
      };
      const load_images = (cb) => {
        this.jsPsych.pluginAPI.preloadImages(images, cb, file_loading_success, file_loading_error);
      };
      if (video.length > 0) {
        load_video(() => {
        });
      }
      if (audio.length > 0) {
        load_audio(() => {
        });
      }
      if (images.length > 0) {
        load_images(() => {
        });
      }
    }
    function file_loading_error(e) {
      update_loading_progress_bar();
      if (success == null) {
        success = false;
      }
      var source = "unknown file";
      if (e.source) {
        source = e.source;
      }
      if (e.error && e.error.path && e.error.path.length > 0) {
        if (e.error.path[0].localName == "img") {
          failed_images.push(source);
        } else if (e.error.path[0].localName == "audio") {
          failed_audio.push(source);
        } else if (e.error.path[0].localName == "video") {
          failed_video.push(source);
        }
      }
      var err_msg = "<p><strong>Error loading file: " + source + "</strong><br>";
      if (e.error.statusText) {
        err_msg += "File request response status: " + e.error.statusText + "<br>";
      }
      if (e.error == "404") {
        err_msg += "404 - file not found.<br>";
      }
      if (typeof e.error.loaded !== "undefined" && e.error.loaded !== null && e.error.loaded !== 0) {
        err_msg += e.error.loaded + " bytes transferred.";
      } else {
        err_msg += "File did not begin loading. Check that file path is correct and reachable by the browser,<br>and that loading is not blocked by cross-origin resource sharing (CORS) errors.";
      }
      err_msg += "</p>";
      detailed_errors.push(err_msg);
      after_error(source);
      if (loaded == total_n) {
        if (trial.continue_after_error) {
          end_trial();
        } else {
          stop_with_error_message();
        }
      }
    }
    function file_loading_success(source) {
      update_loading_progress_bar();
      after_success(source);
      loaded_success++;
      if (loaded_success == total_n) {
        on_success();
      } else if (loaded == total_n) {
        if (trial.continue_after_error) {
          end_trial();
        } else {
          stop_with_error_message();
        }
      }
    }
    function after_error(source) {
      if (trial.on_error !== null) {
        trial.on_error(source);
      }
    }
    function after_success(source) {
      if (trial.on_success !== null) {
        trial.on_success(source);
      }
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
      success: true,
      timeout: false,
      failed_images: [],
      failed_audio: [],
      failed_video: []
    };
    const data = this.jsPsych.pluginAPI.mergeSimulationData(default_data, simulation_options);
    return data;
  }
  simulate_data_only(trial, simulation_options) {
    const data = this.create_simulation_data(trial, simulation_options);
    this.jsPsych.finishTrial(data);
  }
  simulate_visual(trial, simulation_options, load_callback) {
    const display_element = this.jsPsych.getDisplayElement();
    this.trial(display_element, trial);
    load_callback();
  }
}

export { PreloadPlugin as default };
//# sourceMappingURL=index.js.map
