import autoBind from "auto-bind";
import { JsPsych, JsPsychPlugin, ParameterType, TrialType } from "jspsych";

import { AudioPlayerInterface } from "../../jspsych/src/modules/plugin-api/AudioPlayer";

const info = <const>{
  name: "audio-button-response",
  parameters: {
    /** The audio to be played. */
    stimulus: {
      type: ParameterType.AUDIO,
      pretty_name: "Stimulus",
      default: undefined,
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
    /** Any content here will be displayed below the stimulus. */
    prompt: {
      type: ParameterType.HTML_STRING,
      pretty_name: "Prompt",
      default: null,
    },
    /** The maximum duration to wait for a response. */
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
    /** If true, the trial will end when user makes a response. */
    response_ends_trial: {
      type: ParameterType.BOOL,
      pretty_name: "Response ends trial",
      default: true,
    },
    /** If true, then the trial will end as soon as the audio file finishes playing. */
    trial_ends_after_audio: {
      type: ParameterType.BOOL,
      pretty_name: "Trial ends after audio",
      default: false,
    },
    /**
     * If true, then responses are allowed while the audio is playing.
     * If false, then the audio must finish playing before a response is accepted.
     */
    response_allowed_while_playing: {
      type: ParameterType.BOOL,
      pretty_name: "Response allowed while playing",
      default: true,
    },
  },
};

type Info = typeof info;

/**
 * **audio-button-response**
 *
 * jsPsych plugin for playing an audio file and getting a button response
 *
 * @author Kristin Diep
 * @see {@link https://www.jspsych.org/plugins/jspsych-audio-button-response/ audio-button-response plugin documentation on jspsych.org}
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
    // hold the .resolve() function from the Promise that ends the trial
    this.trial_complete;
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

    // record start time
    this.startTime = performance.now();

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

    if (!trial.response_allowed_while_playing) {
      this.disable_buttons();
    }

    // end trial if time limit is set
    if (trial.trial_duration !== null) {
      this.jsPsych.pluginAPI.setTimeout(() => {
        this.end_trial();
      }, trial.trial_duration);
    }

    on_load();

    this.audio.play();

    return new Promise((resolve) => {
      this.trial_complete = resolve;
    });
  }

  private disable_buttons = () => {
    for (const button of this.buttonElements) {
      button.setAttribute("disabled", "disabled");
    }
  };

  private enable_buttons = () => {
    for (const button of this.buttonElements) {
      button.removeAttribute("disabled");
    }
  };

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
    // kill any remaining setTimeout handlers
    this.jsPsych.pluginAPI.clearAllTimeouts();

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

    // clear the display
    this.display.innerHTML = "";

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
