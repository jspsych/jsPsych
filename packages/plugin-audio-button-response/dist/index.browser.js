var jsPsychAudioButtonResponse = (function (jspsych) {
	'use strict';

	function getDefaultExportFromCjs (x) {
		return x && x.__esModule && Object.prototype.hasOwnProperty.call(x, 'default') ? x['default'] : x;
	}

	// Gets all non-builtin properties up the prototype chain
	const getAllProperties = object => {
		const properties = new Set();

		do {
			for (const key of Reflect.ownKeys(object)) {
				properties.add([object, key]);
			}
		} while ((object = Reflect.getPrototypeOf(object)) && object !== Object.prototype);

		return properties;
	};

	var autoBind = (self, {include, exclude} = {}) => {
		const filter = key => {
			const match = pattern => typeof pattern === 'string' ? key === pattern : pattern.test(key);

			if (include) {
				return include.some(match);
			}

			if (exclude) {
				return !exclude.some(match);
			}

			return true;
		};

		for (const [object, key] of getAllProperties(self.constructor.prototype)) {
			if (key === 'constructor' || !filter(key)) {
				continue;
			}

			const descriptor = Reflect.getOwnPropertyDescriptor(object, key);
			if (descriptor && typeof descriptor.value === 'function') {
				self[key] = self[key].bind(self);
			}
		}

		return self;
	};

	var autoBind$1 = /*@__PURE__*/getDefaultExportFromCjs(autoBind);

	var version = "2.1.1";

	const info = {
	  name: "audio-button-response",
	  version,
	  parameters: {
	    /** Path to audio file to be played. */
	    stimulus: {
	      type: jspsych.ParameterType.AUDIO,
	      default: void 0
	    },
	    /** Labels for the buttons. Each different string in the array will generate a different button.  */
	    choices: {
	      type: jspsych.ParameterType.STRING,
	      default: void 0,
	      array: true
	    },
	    /**
	     * A function that generates the HTML for each button in the `choices` array. The function gets the string
	     * and index of the item in the `choices` array and should return valid HTML. If you want to use different
	     * markup for each button, you can do that by using a conditional on either parameter. The default parameter
	     * returns a button element with the text label of the choice.
	     */
	    button_html: {
	      type: jspsych.ParameterType.FUNCTION,
	      default: function(choice, choice_index) {
	        return `<button class="jspsych-btn">${choice}</button>`;
	      }
	    },
	    /** This string can contain HTML markup. Any content here will be displayed below the stimulus. The intention
	     *  is that it can be used to provide a reminder about the action the participant is supposed to take
	     * (e.g., which key to press). */
	    prompt: {
	      type: jspsych.ParameterType.HTML_STRING,
	      default: null
	    },
	    /** How long to wait for the participant to make a response before ending the trial in milliseconds. If the
	     * participant fails to make a response before this timer is reached, the participant's response will be
	     * recorded as null for the trial and the trial will end. If the value of this parameter is null, the trial
	     * will wait for a response indefinitely */
	    trial_duration: {
	      type: jspsych.ParameterType.INT,
	      default: null
	    },
	    /** Setting to `'grid'` will make the container element have the CSS property `display: grid` and enable the
	     * use of `grid_rows` and `grid_columns`. Setting to `'flex'` will make the container element have the CSS
	     * property `display: flex`. You can customize how the buttons are laid out by adding inline CSS in the `button_html` parameter.
	     */
	    button_layout: {
	      type: jspsych.ParameterType.STRING,
	      default: "grid"
	    },
	    /** The number of rows in the button grid. Only applicable when `button_layout` is set to `'grid'`. If null, the
	     * number of rows will be determined automatically based on the number of buttons and the number of columns.
	     */
	    grid_rows: {
	      type: jspsych.ParameterType.INT,
	      default: 1
	    },
	    /** The number of columns in the button grid. Only applicable when `button_layout` is set to `'grid'`.
	     * If null, the number of columns will be determined automatically based on the number of buttons and the
	     * number of rows.
	     */
	    grid_columns: {
	      type: jspsych.ParameterType.INT,
	      default: null
	    },
	    /** If true, then the trial will end whenever the participant makes a response (assuming they make their
	     * response before the cutoff specified by the `trial_duration` parameter). If false, then the trial will
	     * continue until the value for `trial_duration` is reached. You can set this parameter to `false` to force
	     * the participant to listen to the stimulus for a fixed amount of time, even if they respond before the time is complete. */
	    response_ends_trial: {
	      type: jspsych.ParameterType.BOOL,
	      default: true
	    },
	    /** If true, then the trial will end as soon as the audio file finishes playing.  */
	    trial_ends_after_audio: {
	      type: jspsych.ParameterType.BOOL,
	      default: false
	    },
	    /**
	     * If true, then responses are allowed while the audio is playing. If false, then the audio must finish
	     * playing before the button choices are enabled and a response is accepted. Once the audio has played
	     * all the way through, the buttons are enabled and a response is allowed (including while the audio is
	     * being re-played via on-screen playback controls).
	     */
	    response_allowed_while_playing: {
	      type: jspsych.ParameterType.BOOL,
	      default: true
	    },
	    /** How long the button will delay enabling in milliseconds. If `response_allowed_while_playing` is `true`,
	     * the timer will start immediately. If it is `false`, the timer will start at the end of the audio. */
	    enable_button_after: {
	      type: jspsych.ParameterType.INT,
	      default: 0
	    }
	  },
	  data: {
	    /** The path of the audio file that was played. */
	    stimulus: {
	      type: jspsych.ParameterType.STRING
	    },
	    /** The response time in milliseconds for the participant to make a response. The time is measured from
	     * when the stimulus first began playing until the participant's response.*/
	    rt: {
	      type: jspsych.ParameterType.INT
	    },
	    /** Indicates which button the participant pressed. The first button in the `choices` array is 0, the second is 1, and so on. */
	    response: {
	      type: jspsych.ParameterType.INT
	    }
	  },
	  // prettier-ignore
	  citations: {
	    "apa": "de Leeuw, J. R., Gilbert, R. A., & Luchterhandt, B. (2023). jsPsych: Enabling an Open-Source Collaborative Ecosystem of Behavioral Experiments. Journal of Open Source Software, 8(85), 5351. https://doi.org/10.21105/joss.05351 ",
	    "bibtex": '@article{Leeuw2023jsPsych, 	author = {de Leeuw, Joshua R. and Gilbert, Rebecca A. and Luchterhandt, Bj{\\" o}rn}, 	journal = {Journal of Open Source Software}, 	doi = {10.21105/joss.05351}, 	issn = {2475-9066}, 	number = {85}, 	year = {2023}, 	month = {may 11}, 	pages = {5351}, 	publisher = {Open Journals}, 	title = {jsPsych: Enabling an {Open}-{Source} {Collaborative} {Ecosystem} of {Behavioral} {Experiments}}, 	url = {https://joss.theoj.org/papers/10.21105/joss.05351}, 	volume = {8}, }  '
	  }
	};
	class AudioButtonResponsePlugin {
	  constructor(jsPsych) {
	    this.jsPsych = jsPsych;
	    this.buttonElements = [];
	    this.response = { rt: null, button: null };
	    this.disable_buttons = () => {
	      for (const button of this.buttonElements) {
	        button.setAttribute("disabled", "disabled");
	      }
	    };
	    this.enable_buttons_without_delay = () => {
	      for (const button of this.buttonElements) {
	        button.removeAttribute("disabled");
	      }
	    };
	    this.enable_buttons_with_delay = (delay) => {
	      this.jsPsych.pluginAPI.setTimeout(this.enable_buttons_without_delay, delay);
	    };
	    // function to handle responses by the subject
	    this.after_response = (choice) => {
	      var endTime = performance.now();
	      var rt = Math.round(endTime - this.startTime);
	      if (this.context !== null) {
	        endTime = this.context.currentTime;
	        rt = Math.round((endTime - this.startTime) * 1e3);
	      }
	      this.response.button = parseInt(choice);
	      this.response.rt = rt;
	      this.disable_buttons();
	      if (this.params.response_ends_trial) {
	        this.end_trial();
	      }
	    };
	    // method to end trial when it is time
	    this.end_trial = () => {
	      this.audio.removeEventListener("ended", this.end_trial);
	      this.audio.removeEventListener("ended", this.enable_buttons);
	      this.audio.stop();
	      var trial_data = {
	        rt: this.response.rt,
	        stimulus: this.params.stimulus,
	        response: this.response.button
	      };
	      this.trial_complete(trial_data);
	    };
	    autoBind$1(this);
	  }
	  static {
	    this.info = info;
	  }
	  async trial(display_element, trial, on_load) {
	    this.params = trial;
	    this.display = display_element;
	    this.context = this.jsPsych.pluginAPI.audioContext();
	    this.audio = await this.jsPsych.pluginAPI.getAudioPlayer(trial.stimulus);
	    if (trial.trial_ends_after_audio) {
	      this.audio.addEventListener("ended", this.end_trial);
	    }
	    if (!trial.response_allowed_while_playing && !trial.trial_ends_after_audio) {
	      this.audio.addEventListener("ended", this.enable_buttons);
	    }
	    const buttonGroupElement = document.createElement("div");
	    buttonGroupElement.id = "jspsych-audio-button-response-btngroup";
	    if (trial.button_layout === "grid") {
	      buttonGroupElement.classList.add("jspsych-btn-group-grid");
	      if (trial.grid_rows === null && trial.grid_columns === null) {
	        throw new Error(
	          "You cannot set `grid_rows` to `null` without providing a value for `grid_columns`."
	        );
	      }
	      const n_cols = trial.grid_columns === null ? Math.ceil(trial.choices.length / trial.grid_rows) : trial.grid_columns;
	      const n_rows = trial.grid_rows === null ? Math.ceil(trial.choices.length / trial.grid_columns) : trial.grid_rows;
	      buttonGroupElement.style.gridTemplateColumns = `repeat(${n_cols}, 1fr)`;
	      buttonGroupElement.style.gridTemplateRows = `repeat(${n_rows}, 1fr)`;
	    } else if (trial.button_layout === "flex") {
	      buttonGroupElement.classList.add("jspsych-btn-group-flex");
	    }
	    for (const [choiceIndex, choice] of trial.choices.entries()) {
	      buttonGroupElement.insertAdjacentHTML("beforeend", trial.button_html(choice, choiceIndex));
	      const buttonElement = buttonGroupElement.lastChild;
	      buttonElement.dataset.choice = choiceIndex.toString();
	      buttonElement.addEventListener("click", () => {
	        this.after_response(choiceIndex);
	      });
	      this.buttonElements.push(buttonElement);
	    }
	    display_element.appendChild(buttonGroupElement);
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
	    if (trial.trial_duration !== null) {
	      this.jsPsych.pluginAPI.setTimeout(() => {
	        this.end_trial();
	      }, trial.trial_duration);
	    }
	    on_load();
	    this.startTime = performance.now();
	    if (this.context !== null) {
	      this.startTime = this.context.currentTime;
	    }
	    this.audio.play();
	    return new Promise((resolve) => {
	      this.trial_complete = resolve;
	    });
	  }
	  enable_buttons() {
	    if (this.params.enable_button_after > 0) {
	      this.enable_buttons_with_delay(this.params.enable_button_after);
	    } else {
	      this.enable_buttons_without_delay();
	    }
	  }
	  async simulate(trial, simulation_mode, simulation_options, load_callback) {
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
	      rt: this.jsPsych.randomization.sampleExGaussian(500, 50, 1 / 150, true) + trial.enable_button_after,
	      response: this.jsPsych.randomization.randomInt(0, trial.choices.length - 1)
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

	return AudioButtonResponsePlugin;

})(jsPsychModule);
//# sourceMappingURL=https://unpkg.com/@jspsych/plugin-audio-button-response@2.1.1/dist/index.browser.js.map
