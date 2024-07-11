import { JsPsych, JsPsychPlugin, ParameterType, TrialType } from "jspsych";

import { version } from "../package.json";

const info = <const>{
  name: "image-slider-response",
  version: version,
  parameters: {
    /** The path to the image file to be displayed. */
    stimulus: {
      type: ParameterType.IMAGE,
      default: undefined,
    },
    /** Set the height of the image in pixels. If left null (no value specified), then the image will display at its natural height. */
    stimulus_height: {
      type: ParameterType.INT,
      default: null,
    },
    /** Set the width of the image in pixels. If left null (no value specified), then the image will display at its natural width. */
    stimulus_width: {
      type: ParameterType.INT,
      default: null,
    },
    /** If setting *only* the width or *only* the height and this parameter is true, then the other dimension will be scaled
     * to maintain the image's aspect ratio. */
    maintain_aspect_ratio: {
      type: ParameterType.BOOL,
      default: true,
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
    /** Sets the step of the slider. */
    step: {
      type: ParameterType.INT,
      default: 1,
    },
    /** abels displayed at equidistant locations on the slider. For example, two labels will be placed at the ends of the slider.
     * Three labels would place two at the ends and one in the middle. Four will place two at the ends, and the other two will
     * be at 33% and 67% of the slider width. */
    labels: {
      type: ParameterType.STRING,
      default: [],
      array: true,
    },
    /** Set the width of the slider in pixels. If left null, then the width will be equal to the widest element in the display. */
    slider_width: {
      type: ParameterType.INT,
      default: null,
    },
    /** Label of the button to advance/submit. */
    button_label: {
      type: ParameterType.STRING,
      default: "Continue",
      array: false,
    },
    /** If true, the participant must move the slider before clicking the continue button. */
    require_movement: {
      type: ParameterType.BOOL,
      default: false,
    },
    /** This string can contain HTML markup. Any content here will be displayed below the stimulus. The intention is that it can be
     * used to provide a reminder about the action the participant is supposed to take (e.g., which key to press). */
    prompt: {
      type: ParameterType.HTML_STRING,
      default: null,
    },
    /** How long to show the stimulus for in milliseconds. If the value is null, then the stimulus will be shown until the participant
     * makes a response. */
    stimulus_duration: {
      type: ParameterType.INT,
      default: null,
    },
    /** How long to wait for the participant to make a response before ending the trial in milliseconds. If the participant
     * fails to make a response before this timer is reached, the participant's response will be recorded as null for the trial
     * and the trial will end. If the value of this parameter is null, then the trial will wait for a response indefinitely. */
    trial_duration: {
      type: ParameterType.INT,
      default: null,
    },
    /** If true, then the trial will end whenever the participant makes a response (assuming they make their response
     * before the cutoff specified by the `trial_duration` parameter). If false, then the trial will continue until the
     * value for `trial_duration` is reached. You can set this parameter to `false` to force the participant to view a
     * stimulus for a fixed amount of time, even if they respond before the time is complete. */
    response_ends_trial: {
      type: ParameterType.BOOL,
      default: true,
    },
    /**
     * If true, the image will be drawn onto a canvas element. This prevents a blank screen (white flash) between
     * consecutive image trials in some browsers, like Firefox and Edge.
     * If false, the image will be shown via an img element, as in previous versions of jsPsych. If the stimulus is
     * an **animated gif**, you must set this parameter to false, because the canvas rendering method will only present static images.
     */
    render_on_canvas: {
      type: ParameterType.BOOL,
      default: true,
    },
  },
  data: {
    /** The path of the image that was displayed. */
    stimulus: {
      type: ParameterType.STRING,
    },
    /** The numeric value of the slider. */
    response: {
      type: ParameterType.INT,
    },
    /** The time in milliseconds for the participant to make a response. The time is measured from when the stimulus
     * first appears on the screen until the participant's response. */
    rt: {
      type: ParameterType.INT,
    },
    /** The starting value of the slider. */
    slider_start: {
      type: ParameterType.INT,
    },
  },
};

type Info = typeof info;

/**
 * This plugin displays and image and allows the participant to respond by dragging a slider.
 *
 * Image files can be automatically preloaded by jsPsych using the [`preload` plugin](preload.md). However, if you are
 * using timeline variables or another dynamic method to specify the image stimulus, you will need
 * to [manually preload](../overview/media-preloading.md#manual-preloading) the images.
 *
 * @author Josh de Leeuw
 * @see {@link https://www.jspsych.org/latest/plugins/image-slider-response/ image-slider-response plugin documentation on jspsych.org}
 */
class ImageSliderResponsePlugin implements JsPsychPlugin<Info> {
  static info = info;

  constructor(private jsPsych: JsPsych) {}

  trial(display_element: HTMLElement, trial: TrialType<Info>) {
    var height, width;
    var html;
    // half of the thumb width value from jspsych.css, used to adjust the label positions
    var half_thumb_width = 7.5;

    if (trial.render_on_canvas) {
      var image_drawn = false;
      // first clear the display element (because the render_on_canvas method appends to display_element instead of overwriting it with .innerHTML)
      if (display_element.hasChildNodes()) {
        // can't loop through child list because the list will be modified by .removeChild()
        while (display_element.firstChild) {
          display_element.removeChild(display_element.firstChild);
        }
      }
      // create wrapper div, canvas element and image
      var content_wrapper = document.createElement("div");
      content_wrapper.id = "jspsych-image-slider-response-wrapper";
      content_wrapper.style.margin = "100px 0px";
      var canvas = document.createElement("canvas");
      canvas.id = "jspsych-image-slider-response-stimulus";
      canvas.style.margin = "0";
      canvas.style.padding = "0";
      var ctx = canvas.getContext("2d");
      var img = new Image();
      img.onload = () => {
        // if image wasn't preloaded, then it will need to be drawn whenever it finishes loading
        if (!image_drawn) {
          getHeightWidth(); // only possible to get width/height after image loads
          ctx.drawImage(img, 0, 0, width, height);
        }
      };
      img.src = trial.stimulus;
      // get/set image height and width - this can only be done after image loads because uses image's naturalWidth/naturalHeight properties
      const getHeightWidth = () => {
        if (trial.stimulus_height !== null) {
          height = trial.stimulus_height;
          if (trial.stimulus_width == null && trial.maintain_aspect_ratio) {
            width = img.naturalWidth * (trial.stimulus_height / img.naturalHeight);
          }
        } else {
          height = img.naturalHeight;
        }
        if (trial.stimulus_width !== null) {
          width = trial.stimulus_width;
          if (trial.stimulus_height == null && trial.maintain_aspect_ratio) {
            height = img.naturalHeight * (trial.stimulus_width / img.naturalWidth);
          }
        } else if (!(trial.stimulus_height !== null && trial.maintain_aspect_ratio)) {
          // if stimulus width is null, only use the image's natural width if the width value wasn't set
          // in the if statement above, based on a specified height and maintain_aspect_ratio = true
          width = img.naturalWidth;
        }
        canvas.height = height;
        canvas.width = width;
      };
      getHeightWidth(); // call now, in case image loads immediately (is cached)
      // create container with slider and labels
      var slider_container = document.createElement("div");
      slider_container.classList.add("jspsych-image-slider-response-container");
      slider_container.style.position = "relative";
      slider_container.style.margin = "0 auto 3em auto";
      if (trial.slider_width !== null) {
        slider_container.style.width = trial.slider_width.toString() + "px";
      }
      // create html string with slider and labels, and add to slider container
      html =
        '<input type="range" class="jspsych-slider" value="' +
        trial.slider_start +
        '" min="' +
        trial.min +
        '" max="' +
        trial.max +
        '" step="' +
        trial.step +
        '" id="jspsych-image-slider-response-response"></input>';
      html += "<div>";
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
      slider_container.innerHTML = html;
      // add canvas and slider to content wrapper div
      content_wrapper.insertBefore(canvas, content_wrapper.firstElementChild);
      content_wrapper.insertBefore(slider_container, canvas.nextElementSibling);
      // add content wrapper div to screen and draw image on canvas
      display_element.insertBefore(content_wrapper, null);
      if (img.complete && Number.isFinite(width) && Number.isFinite(height)) {
        // if image has loaded and width/height have been set, then draw it now
        // (don't rely on img onload function to draw image when image is in the cache, because that causes a delay in the image presentation)
        ctx.drawImage(img, 0, 0, width, height);
        image_drawn = true;
      }
      // add prompt if there is one
      if (trial.prompt !== null) {
        display_element.insertAdjacentHTML("beforeend", trial.prompt);
      }
      // add submit button
      var submit_btn = document.createElement("button") as HTMLButtonElement;
      submit_btn.id = "jspsych-image-slider-response-next";
      submit_btn.classList.add("jspsych-btn");
      submit_btn.disabled = trial.require_movement ? true : false;
      submit_btn.innerHTML = trial.button_label;
      display_element.insertBefore(submit_btn, display_element.nextElementSibling);
    } else {
      html = '<div id="jspsych-image-slider-response-wrapper" style="margin: 100px 0px;">';
      html += '<div id="jspsych-image-slider-response-stimulus">';
      html += '<img src="' + trial.stimulus + '" style="';
      if (trial.stimulus_height !== null) {
        html += "height:" + trial.stimulus_height + "px; ";
        if (trial.stimulus_width == null && trial.maintain_aspect_ratio) {
          html += "width: auto; ";
        }
      }
      if (trial.stimulus_width !== null) {
        html += "width:" + trial.stimulus_width + "px; ";
        if (trial.stimulus_height == null && trial.maintain_aspect_ratio) {
          html += "height: auto; ";
        }
      }
      html += '"></img>';
      html += "</div>";
      html +=
        '<div class="jspsych-image-slider-response-container" style="position:relative; margin: 0 auto 3em auto; width:';
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
        '" id="jspsych-image-slider-response-response"></input>';
      html += "<div>";
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

      if (trial.prompt !== null) {
        html += trial.prompt;
      }

      // add submit button
      html +=
        '<button id="jspsych-image-slider-response-next" class="jspsych-btn" ' +
        (trial.require_movement ? "disabled" : "") +
        ">" +
        trial.button_label +
        "</button>";

      display_element.innerHTML = html;

      // set image dimensions after image has loaded (so that we have access to naturalHeight/naturalWidth)
      var img = display_element.querySelector("img") as HTMLImageElement;
      if (trial.stimulus_height !== null) {
        height = trial.stimulus_height;
        if (trial.stimulus_width == null && trial.maintain_aspect_ratio) {
          width = img.naturalWidth * (trial.stimulus_height / img.naturalHeight);
        }
      } else {
        height = img.naturalHeight;
      }
      if (trial.stimulus_width !== null) {
        width = trial.stimulus_width;
        if (trial.stimulus_height == null && trial.maintain_aspect_ratio) {
          height = img.naturalHeight * (trial.stimulus_width / img.naturalWidth);
        }
      } else if (!(trial.stimulus_height !== null && trial.maintain_aspect_ratio)) {
        // if stimulus width is null, only use the image's natural width if the width value wasn't set
        // in the if statement above, based on a specified height and maintain_aspect_ratio = true
        width = img.naturalWidth;
      }
      img.style.height = height.toString() + "px";
      img.style.width = width.toString() + "px";
    }

    var response = {
      rt: null,
      response: null,
    };

    if (trial.require_movement) {
      const enable_button = () => {
        display_element.querySelector<HTMLInputElement>(
          "#jspsych-image-slider-response-next"
        ).disabled = false;
      };

      display_element
        .querySelector("#jspsych-image-slider-response-response")
        .addEventListener("mousedown", enable_button);

      display_element
        .querySelector("#jspsych-image-slider-response-response")
        .addEventListener("touchstart", enable_button);

      display_element
        .querySelector("#jspsych-image-slider-response-response")
        .addEventListener("change", enable_button);
    }

    const end_trial = () => {
      // save data
      var trialdata = {
        rt: response.rt,
        stimulus: trial.stimulus,
        slider_start: trial.slider_start,
        response: response.response,
      };

      // next trial
      this.jsPsych.finishTrial(trialdata);
    };

    display_element
      .querySelector("#jspsych-image-slider-response-next")
      .addEventListener("click", () => {
        // measure response time
        var endTime = performance.now();
        response.rt = Math.round(endTime - startTime);
        response.response = display_element.querySelector<HTMLInputElement>(
          "#jspsych-image-slider-response-response"
        ).valueAsNumber;

        if (trial.response_ends_trial) {
          end_trial();
        } else {
          display_element.querySelector<HTMLButtonElement>(
            "#jspsych-image-slider-response-next"
          ).disabled = true;
        }
      });

    if (trial.stimulus_duration !== null) {
      this.jsPsych.pluginAPI.setTimeout(() => {
        display_element.querySelector<HTMLElement>(
          "#jspsych-image-slider-response-stimulus"
        ).style.visibility = "hidden";
      }, trial.stimulus_duration);
    }

    // end trial if trial_duration is set
    if (trial.trial_duration !== null) {
      this.jsPsych.pluginAPI.setTimeout(() => {
        end_trial();
      }, trial.trial_duration);
    }

    var startTime = performance.now();
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

    if (data.rt !== null) {
      const el = display_element.querySelector<HTMLInputElement>("input[type='range']");

      setTimeout(() => {
        this.jsPsych.pluginAPI.clickTarget(el);
        el.valueAsNumber = data.response;
      }, data.rt / 2);

      this.jsPsych.pluginAPI.clickTarget(display_element.querySelector("button"), data.rt);
    }
  }
}

export default ImageSliderResponsePlugin;
