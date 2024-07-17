import autoBind from "auto-bind";
import { JsPsych, JsPsychPlugin, ParameterType, TrialType } from "jspsych";

import { AudioPlayerInterface } from "../../jspsych/src/modules/plugin-api/AudioPlayer";
import { version } from "../package.json";

const info = <const>{
  name: "audio-button-response",
  version: version,
  parameters: {
    /** Path to audio file to be played. */
    stimulus: {
      type: ParameterType.AUDIO,
      default: undefined,
    },
    /** Labels for the buttons. Each different string in the array will generate a different button.  */
    choices: {
      type: ParameterType.STRING,
      default: undefined,
      array: true,
    },
    /**
     * A function that generates the HTML for each button in the `choices` array. The function gets the string
     * and index of the item in the `choices` array and should return valid HTML. If you want to use different
     * markup for each button, you can do that by using a conditional on either parameter. The default parameter
     * returns a button element with the text label of the choice.
     */
    button_html: {
      type: ParameterType.FUNCTION,
      default: function (choice: string, choice_index: number) {
        return `<button class="jspsych-btn">${choice}</button>`;
      },
    },
    /** This string can contain HTML markup. Any content here will be displayed below the stimulus. The intention
     *  is that it can be used to provide a reminder about the action the participant is supposed to take
     * (e.g., which key to press). */
    prompt: {
      type: ParameterType.HTML_STRING,
      default: null,
    },
    /** How long to wait for the participant to make a response before ending the trial in milliseconds. If the
     * participant fails to make a response before this timer is reached, the participant's response will be
     * recorded as null for the trial and the trial will end. If the value of this parameter is null, the trial
     * will wait for a response indefinitely */
    trial_duration: {
      type: ParameterType.INT,
      default: null,
    },
    /** Setting to `'grid'` will make the container element have the CSS property `display: grid` and enable the
     * use of `grid_rows` and `grid_columns`. Setting to `'flex'` will make the container element have the CSS
     * property `display: flex`. You can customize how the buttons are laid out by adding inline CSS in the `button_html` parameter.
     */
    button_layout: {
      type: ParameterType.STRING,
      default: "grid",
    },
    /** The number of rows in the button grid. Only applicable when `button_layout` is set to `'grid'`. If null, the
     * number of rows will be determined automatically based on the number of buttons and the number of columns.
     */
    grid_rows: {
      type: ParameterType.INT,
      default: 1,
    },
    /** The number of columns in the button grid. Only applicable when `button_layout` is set to `'grid'`.
     * If null, the number of columns will be determined automatically based on the number of buttons and the
     * number of rows.
     */
    grid_columns: {
      type: ParameterType.INT,
      default: null,
    },
    /** If true, then the trial will end whenever the participant makes a response (assuming they make their
     * response before the cutoff specified by the `trial_duration` parameter). If false, then the trial will
     * continue until the value for `trial_duration` is reached. You can set this parameter to `false` to force
     * the participant to listen to the stimulus for a fixed amount of time, even if they respond before the time is complete. */
    response_ends_trial: {
      type: ParameterType.BOOL,
      default: true,
    },
    /** If true, then the trial will end as soon as the audio file finishes playing.  */
    trial_ends_after_audio: {
      type: ParameterType.BOOL,
      default: false,
    },
    /**
     * If true, then responses are allowed while the audio is playing. If false, then the audio must finish
     * playing before the button choices are enabled and a response is accepted. Once the audio has played
     * all the way through, the buttons are enabled and a response is allowed (including while the audio is
     * being re-played via on-screen playback controls).
     */
    response_allowed_while_playing: {
      type: ParameterType.BOOL,
      default: true,
    },
    /** How long the button will delay enabling in milliseconds. If `response_allowed_while_playing` is `true`,
     * the timer will start immediately. If it is `false`, the timer will start at the end of the audio. */
    enable_button_after: {
      type: ParameterType.INT,
      default: 0,
    },
  },
  data: {
    /** The response time in milliseconds for the participant to make a response. The time is measured from
     * when the stimulus first began playing until the participant's response.*/
    rt: {
      type: ParameterType.INT,
    },
    /** Indicates which button the participant pressed. The first button in the `choices` array is 0, the second is 1, and so on. */
    response: {
      type: ParameterType.INT,
    },
  },
};

type Info = typeof info;

/**
 * If the browser supports it, audio files are played using the WebAudio API. This allows for reasonably precise 
 * timing of the playback. The timing of responses generated is measured against the WebAudio specific clock, 
 * improving the measurement of response times. If the browser does not support the WebAudio API, then the audio file is 
 * played with HTML5 audio. 

 * Audio files can be automatically preloaded by jsPsych using the [`preload` plugin](preload.md). However, if 
 * you are using timeline variables or another dynamic method to specify the audio stimulus, you will need 
 * to [manually preload](../overview/media-preloading.md#manual-preloading) the audio.

 * The trial can end when the participant responds, when the audio file has finished playing, or if the participant 
 * has failed to respond within a fixed length of time. You can also prevent a button response from being made before the 
 * audio has finished playing.
 * 
 * @author Kristin Diep
 * @see {@link https://www.jspsych.org/latest/plugins/audio-button-response/ audio-button-response plugin documentation on jspsych.org}
 */
class AudioButtonResponsePlugin implements JsPsychPlugin<Info> {
  static info = info;
  private audio: AudioPlayerInterface;
  private params: TrialType<Info>;
  private buttonElements: HTMLElement[] = [];
  private display: HTMLElement;
  private response: { rt: number; button: number } = { rt: null, button: null };
  private context: AudioContext;
  private startTime: number;
  private trial_complete: (trial_data: { rt: number; stimulus: string; response: number }) => void;

  constructor(private jsPsych: JsPsych) {
    autoBind(this);
  }

  async trial(display_element: HTMLElement, trial: TrialType<Info>, on_load: () => void) {
    this.params = trial;
    this.display = display_element;
    // setup stimulus
    this.context = this.jsPsych.pluginAPI.audioContext();

    // load audio file
    this.audio = await this.jsPsych.pluginAPI.getAudioPlayer(trial.stimulus);

    // set up end event if trial needs it
    if (trial.trial_ends_after_audio) {
      this.audio.addEventListener("ended", this.end_trial);
    }

    // enable buttons after audio ends if necessary
    if (!trial.response_allowed_while_playing && !trial.trial_ends_after_audio) {
      this.audio.addEventListener("ended", this.enable_buttons);
    }

    // Display buttons
    const buttonGroupElement = document.createElement("div");
    buttonGroupElement.id = "jspsych-audio-button-response-btngroup";
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
        this.after_response(choiceIndex);
      });
      this.buttonElements.push(buttonElement);
    }

    display_element.appendChild(buttonGroupElement);

    // Show prompt if there is one
    if (trial.prompt !== null) {
      display_element.insertAdjacentHTML("beforeend", trial.prompt);
    }

    if (trial.response_allowed_while_playing) {
      if (trial.enable_button_after > 0) {
        this.disable_buttons();
        this.enable_buttons();
      }
    } else {
      this.disable_buttons();
    }

    // end trial if time limit is set
    if (trial.trial_duration !== null) {
      this.jsPsych.pluginAPI.setTimeout(() => {
        this.end_trial();
      }, trial.trial_duration);
    }

    on_load();

    // start time
    this.startTime = performance.now();
    if (this.context !== null) {
      this.startTime = this.context.currentTime;
    }

    // start audio
    this.audio.play();

    return new Promise((resolve) => {
      // hold the .resolve() function from the Promise that ends the trial
      this.trial_complete = resolve;
    });
  }

  private disable_buttons = () => {
    for (const button of this.buttonElements) {
      button.setAttribute("disabled", "disabled");
    }
  };

  private enable_buttons_without_delay = () => {
    for (const button of this.buttonElements) {
      button.removeAttribute("disabled");
    }
  };

  private enable_buttons_with_delay = (delay: number) => {
    this.jsPsych.pluginAPI.setTimeout(this.enable_buttons_without_delay, delay);
  };

  private enable_buttons() {
    if (this.params.enable_button_after > 0) {
      this.enable_buttons_with_delay(this.params.enable_button_after);
    } else {
      this.enable_buttons_without_delay();
    }
  }

  // function to handle responses by the subject
  private after_response = (choice) => {
    // measure rt
    var endTime = performance.now();
    var rt = Math.round(endTime - this.startTime);
    if (this.context !== null) {
      endTime = this.context.currentTime;
      rt = Math.round((endTime - this.startTime) * 1000);
    }
    this.response.button = parseInt(choice);
    this.response.rt = rt;

    // disable all the buttons after a response
    this.disable_buttons();

    if (this.params.response_ends_trial) {
      this.end_trial();
    }
  };

  // method to end trial when it is time
  private end_trial = () => {
    // stop the audio file if it is playing
    this.audio.stop();

    // remove end event listeners if they exist
    this.audio.removeEventListener("ended", this.end_trial);
    this.audio.removeEventListener("ended", this.enable_buttons);

    // gather the data to store for the trial
    var trial_data = {
      rt: this.response.rt,
      stimulus: this.params.stimulus,
      response: this.response.button,
    };

    // move on to the next trial
    this.trial_complete(trial_data);
  };

  async simulate(
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

    const respond = () => {
      if (data.rt !== null) {
        this.jsPsych.pluginAPI.clickTarget(
          display_element.querySelector(
            `#jspsych-audio-button-response-btngroup [data-choice="${data.response}"]`
          ),
          data.rt
        );
      }
    };

    this.trial(display_element, trial, () => {
      load_callback();
      if (!trial.response_allowed_while_playing) {
        this.audio.addEventListener("ended", respond);
      } else {
        respond();
      }
    });
  }
}

export default AudioButtonResponsePlugin;
