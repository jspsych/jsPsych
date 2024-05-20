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
    /** The HTML for creating button. Can create own style. Use the "%choice%" string to indicate where the label from the choices parameter should be inserted. */
    button_html: {
      type: ParameterType.HTML_STRING,
      pretty_name: "Button HTML",
      default: '<button class="jspsych-btn">%choice%</button>',
      array: true,
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
    /** The vertical margin of the button. */
    margin_vertical: {
      type: ParameterType.STRING,
      pretty_name: "Margin vertical",
      default: "0px",
    },
    /** The horizontal margin of the button. */
    margin_horizontal: {
      type: ParameterType.STRING,
      pretty_name: "Margin horizontal",
      default: "8px",
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
    /** The delay of enabling button */
    enable_button_after: {
      type: ParameterType.INT,
      pretty_name: "Enable button after",
      default: 0,
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
    if (!Array.isArray(trial.stimulus)) {
      throw new Error(`
        The stimulus property for the video-button-response plugin must be an array
        of files. See https://www.jspsych.org/latest/plugins/video-button-response/#parameters
      `);
    }

    // setup stimulus
    var video_html = "<div>";
    video_html += '<video id="jspsych-video-button-response-stimulus"';

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
            "Warning: video-button-response plugin does not reliably support .mov files."
          );
        }
        video_html += '<source src="' + file_name + '" type="video/' + type + '">';
      }
    }
    video_html += "</video>";
    video_html += "</div>";

    //display buttons
    var buttons = [];
    if (Array.isArray(trial.button_html)) {
      if (trial.button_html.length == trial.choices.length) {
        buttons = trial.button_html;
      } else {
        console.error(
          "Error in video-button-response plugin. The length of the button_html array does not equal the length of the choices array"
        );
      }
    } else {
      for (var i = 0; i < trial.choices.length; i++) {
        buttons.push(trial.button_html);
      }
    }
    video_html += '<div id="jspsych-video-button-response-btngroup">';
    for (var i = 0; i < trial.choices.length; i++) {
      var str = buttons[i].replace(/%choice%/g, trial.choices[i]);
      video_html +=
        '<div class="jspsych-video-button-response-button" style="cursor: pointer; display: inline-block; margin:' +
        trial.margin_vertical +
        " " +
        trial.margin_horizontal +
        '" id="jspsych-video-button-response-button-' +
        i +
        '" data-choice="' +
        i +
        '">' +
        str +
        "</div>";
    }
    video_html += "</div>";

    // add prompt if there is one
    if (trial.prompt !== null) {
      video_html += trial.prompt;
    }

    display_element.innerHTML = video_html;

    var start_time = performance.now();

    var video_element = display_element.querySelector<HTMLVideoElement>(
      "#jspsych-video-button-response-stimulus"
    );

    if (video_preload_blob) {
      video_element.src = video_preload_blob;
    }

    video_element.onended = () => {
      if (trial.trial_ends_after_video) {
        end_trial();
      } else if (!trial.response_allowed_while_playing) {
        enable_buttons();
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
          if (!trial.response_allowed_while_playing) {
            if (trial.enable_button_after > 0) {
              enable_buttons_delayed(trial.enable_button_after);
            } else {
              enable_buttons();
            }
          }
          video_element.pause();
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
      if (trial.enable_button_after !== null) {
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
      // kill any remaining setTimeout handlers
      this.jsPsych.pluginAPI.clearAllTimeouts();

      // stop the video file if it is playing
      // remove any remaining end event handlers
      display_element
        .querySelector<HTMLVideoElement>("#jspsych-video-button-response-stimulus")
        .pause();
      display_element.querySelector<HTMLVideoElement>(
        "#jspsych-video-button-response-stimulus"
      ).onended = () => {};

      // gather the data to store for the trial
      var trial_data = {
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
    function after_response(choice: string) {
      // measure rt
      var end_time = performance.now();
      var rt = Math.round(end_time - start_time);
      response.button = parseInt(choice);
      response.rt = rt;

      // after a valid response, the stimulus will have the CSS class 'responded'
      // which can be used to provide visual feedback that a response was recorded
      video_element.className += " responded";

      // disable all the buttons after a response
      disable_buttons();

      if (trial.response_ends_trial) {
        end_trial();
      }
    }

    function button_response(e) {
      var choice = e.currentTarget.getAttribute("data-choice"); // don't use dataset for jsdom compatibility
      after_response(choice);
    }

    function disable_buttons() {
      var btns = document.querySelectorAll(".jspsych-video-button-response-button");
      for (var i = 0; i < btns.length; i++) {
        var btn_el = btns[i].querySelector("button");
        if (btn_el) {
          btn_el.disabled = true;
        }
        btns[i].removeEventListener("click", button_response);
      }
    }

    function enable_buttons() {
      var btns = document.querySelectorAll(".jspsych-video-button-response-button");
      for (var i = 0; i < btns.length; i++) {
        var btn_el = btns[i].querySelector("button");
        if (btn_el) {
          btn_el.disabled = false;
        }
        btns[i].addEventListener("click", button_response);
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
          display_element.querySelector(`div[data-choice="${data.response}"] button`),
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
