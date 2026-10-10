import { ParameterType } from 'jspsych';

var version = "2.2.0";

const info = {
  name: "cloze",
  version,
  parameters: {
    /** 
     * The cloze text to be displayed. Blanks are indicated by %% signs and automatically replaced by 
     * input fields. If there is a correct answer you want the system to check against, it must be typed
     * between the two percentage signs (i.e. % correct solution %). If you would like to input multiple
     * solutions, type a slash between each responses (i.e. %1/2/3%).
     */
    text: {
      type: ParameterType.HTML_STRING,
      default: void 0
    },
    /** Text of the button participants have to press for finishing the cloze test. */
    button_text: {
      type: ParameterType.STRING,
      default: "OK"
    },
    /** 
     * Boolean value indicating if the answers given by participants should be compared
     * against a correct solution given in `text` after the submit button was clicked. 
     * If ```true```, answers are checked and in case of differences, the ```mistake_fn``` 
     * is called. In this case, the trial does not automatically finish. If ```false```, 
     * no checks are performed and the trial ends when clicking the submit button. 
     */
    check_answers: {
      type: ParameterType.BOOL,
      default: false
    },
    /** 
     * Boolean value indicating if the answers given by participants should be checked for
     * completion after the button was clicked. If ```true```, answers are not checked for
     * completion and blank answers are allowed. The trial will then automatically finish 
     * upon the clicking the button. If ```false```, answers are checked for completion, 
     * and in case there are some fields with missing answers, the ```mistake_fn``` is called. 
     * In this case, the trial does not automatically finish. 
     */
    allow_blanks: {
      type: ParameterType.BOOL,
      default: true
    },
    /** Boolean value indicating if the solutions checker must be case sensitive. */
    case_sensitivity: {
      type: ParameterType.BOOL,
      pretty_name: "Case sensitivity",
      default: true
    },
    /** 
     * Function called if either `check_answers` is `true` or `allow_blanks` is `false` 
     * and there is a discrepancy between the set answers and the answers provided, or 
     * if all input fields aren't filled out, respectively. 
     */
    mistake_fn: {
      type: ParameterType.FUNCTION,
      default: () => {
      }
    },
    /**
     * Boolean value indicating if the first input field should be focused when the trial starts.
     * Enabled by default, but may be disabled especially if participants are using screen readers.
     */
    autofocus: {
      type: ParameterType.BOOL,
      default: true
    }
  },
  data: {
    /** Answers the participant gave. */
    response: {
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
class ClozePlugin {
  constructor(jsPsych) {
    this.jsPsych = jsPsych;
  }
  static {
    this.info = info;
  }
  trial(display_element, trial) {
    var html = '<div class="cloze">';
    var elements = trial.text.split("%");
    const solutions = this.getSolutions(trial.text, trial.case_sensitivity);
    let solution_counter = 0;
    for (var i = 0; i < elements.length; i++) {
      if (i % 2 === 0) {
        html += elements[i];
      } else {
        html += `<input type="text" id="input${solution_counter}" value="">`;
        solution_counter++;
      }
    }
    html += "</div>";
    display_element.innerHTML = html;
    const check = () => {
      var answers = [];
      var answers_correct = true;
      var answers_filled = true;
      for (var i2 = 0; i2 < solutions.length; i2++) {
        var field = document.getElementById("input" + i2);
        answers.push(
          trial.case_sensitivity ? field.value.trim() : field.value.toLowerCase().trim()
        );
        if (trial.check_answers) {
          if (!solutions[i2].includes(answers[i2])) {
            field.style.color = "red";
            answers_correct = false;
          } else {
            field.style.color = "black";
          }
        }
        if (!trial.allow_blanks) {
          if (answers[i2] === "") {
            answers_filled = false;
          }
        }
      }
      if (trial.check_answers && !answers_correct || !trial.allow_blanks && !answers_filled) {
        trial.mistake_fn();
      } else {
        var trial_data = {
          response: answers
        };
        this.jsPsych.finishTrial(trial_data);
      }
    };
    display_element.innerHTML += '<br><button class="jspsych-html-button-response-button" type="button" id="finish_cloze_button">' + trial.button_text + "</button>";
    display_element.querySelector("#finish_cloze_button").addEventListener("click", check);
    if (trial.autofocus)
      display_element.querySelector("#input0").focus();
  }
  getSolutions(text, case_sensitive) {
    const solutions = [];
    const elements = text.split("%");
    for (let i = 1; i < elements.length; i += 2) {
      solutions.push(
        case_sensitive ? elements[i].trim().split("/") : elements[i].toLowerCase().trim().split("/")
      );
    }
    return solutions;
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
    const solutions = this.getSolutions(trial.text, trial.case_sensitivity);
    const responses = [];
    for (const wordList of solutions) {
      if (wordList.includes("")) {
        var word = this.jsPsych.randomization.randomWords({ exactly: 1 });
        responses.push(word[0]);
      } else {
        responses.push(wordList[Math.floor(Math.random() * wordList.length)]);
      }
    }
    const default_data = {
      response: responses
    };
    const data = this.jsPsych.pluginAPI.mergeSimulationData(default_data, simulation_options);
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
    const inputs = display_element.querySelectorAll('input[type="text"]');
    let rt = this.jsPsych.randomization.sampleExGaussian(750, 200, 0.01, true);
    for (let i = 0; i < data.response.length; i++) {
      this.jsPsych.pluginAPI.fillTextInput(inputs[i], data.response[i], rt);
      rt += this.jsPsych.randomization.sampleExGaussian(750, 200, 0.01, true);
    }
    this.jsPsych.pluginAPI.clickTarget(display_element.querySelector("#finish_cloze_button"), rt);
  }
}

export { ClozePlugin as default };
//# sourceMappingURL=index.js.map
