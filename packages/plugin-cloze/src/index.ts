import { JsPsych, JsPsychPlugin, ParameterType, TrialType } from "jspsych";

import { version } from "../package.json";

const info = <const>{
  name: "cloze",
  version: version,
  parameters: {
    /** The cloze text to be displayed. Blanks are indicated by %% signs and automatically replaced by input fields. If there is a correct answer you want the system to check against, it must be typed between the two percentage signs (i.e. % correct solution %). */
    text: {
      type: ParameterType.HTML_STRING,
      default: undefined,
    },
    /** Text of the button participants have to press for finishing the cloze test. */
    button_text: {
      type: ParameterType.STRING,
      default: "OK",
    },
    /** Boolean value indicating if the answers given by participants should be compared against a correct solution given in the text (between % signs) after the button was clicked. If ```true```, answers are checked and in case of differences, the ```mistake_fn``` is called. In this case, the trial does not automatically finish. If ```false```, no checks are performed and the trial automatically ends when clicking the button. */
    check_answers: {
      type: ParameterType.BOOL,
      default: false,
    },
    /** Boolean value indicating if the answers given by participants should be checked for completion after the button was clicked. If ```true```, answers are not checked for completion and blank answers are allowed. The trial will then automatically finish upon the clicking the button. If ```false```, answers are checked for completion, and in case there are some fields with missing answers, the ```mistake_fn``` is called. In this case, the trial does not automatically finish. */
    allow_blanks: {
      type: ParameterType.BOOL,
      default: true,
    },
    /** Boolean value indicating if the solutions checker must be case sensitive. */
    case_sensitivity: {
      type: ParameterType.BOOL,
      pretty_name: "Case sensitivity",
      default: true,
    },
    /** Function called if either the check_answers is set to TRUE or the allow_blanks is set to FALSE and there is a discrepancy between the set answers and the answers provide or if all input fields aren't filled out, respectively. */
    mistake_fn: {
      type: ParameterType.FUNCTION,
      default: () => {},
    },
  },
  data: {
    /** Answers the partcipant gave. */
    response: {
      type: ParameterType.STRING,
      array: true,
    },
  },
};

type Info = typeof info;

/**
 * This plugin displays a text with certain words omitted. Participants are asked to replace the missing items. Responses are recorded when clicking a button. Responses can be evaluated and a function is called in case of either differences or incomplete answers, making it possible to inform participants about mistakes before proceeding.
 *
 * @author Philipp Sprengholz
 * @see {@link https://www.jspsych.org/latest/plugins/cloze/ cloze plugin documentation on jspsych.org}
 */
class ClozePlugin implements JsPsychPlugin<Info> {
  static info = info;

  constructor(private jsPsych: JsPsych) {}

  trial(display_element: HTMLElement, trial: TrialType<Info>) {
    var html = '<div class="cloze">';
    // odd elements are text, even elements are the blanks
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
      var answers: String[] = [];
      var answers_correct = true;
      var answers_filled = true;

      for (var i = 0; i < solutions.length; i++) {
        var field = document.getElementById("input" + i) as HTMLInputElement;
        answers.push(
          trial.case_sensitivity ? field.value.trim() : field.value.toLowerCase().trim()
        );

        if (trial.check_answers) {
          if (!solutions[i].includes(answers[i])) {
            field.style.color = "red";
            answers_correct = false;
          } else {
            field.style.color = "black";
          }
        }
        if (!trial.allow_blanks) {
          if (answers[i] === "") {
            answers_filled = false;
          }
        }
      }

      if ((trial.check_answers && !answers_correct) || (!trial.allow_blanks && !answers_filled)) {
        trial.mistake_fn();
      } else {
        var trial_data = {
          response: answers,
        };

        this.jsPsych.finishTrial(trial_data);
      }
    };

    display_element.innerHTML +=
      '<br><button class="jspsych-html-button-response-button" type="button" id="finish_cloze_button">' +
      trial.button_text +
      "</button>";
    display_element.querySelector("#finish_cloze_button").addEventListener("click", check);

    (display_element.querySelector("#input0") as HTMLElement).focus();
  }

  private getSolutions(text: string, case_sensitive: boolean) {
    const solutions: String[][] = [];
    const elements = text.split("%");

    for (let i = 1; i < elements.length; i += 2) {
      solutions.push(
        case_sensitive ? elements[i].trim().split("/") : elements[i].toLowerCase().trim().split("/")
      );
    }

    return solutions;
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
    const solutions = this.getSolutions(trial.text, trial.case_sensitivity);
    const responses = [];
    for (const wordList of solutions) {
      if (wordList.includes("")) {
        responses.push(this.jsPsych.randomization.randomWords({ exactly: 1 }));
      } else {
        responses.push(wordList);
      }
    }

    const default_data = {
      response: responses,
    };

    const data = this.jsPsych.pluginAPI.mergeSimulationData(default_data, simulation_options);

    //this.jsPsych.pluginAPI.ensureSimulationDataConsistency(trial, data);

    return data;
  }

  private simulate_data_only(trial: TrialType<Info>, simulation_options) {
    const data = this.create_simulation_data(trial, simulation_options);

    data.response = data.response[0];

    this.jsPsych.finishTrial(data);
  }

  private simulate_visual(trial: TrialType<Info>, simulation_options, load_callback: () => void) {
    const data = this.create_simulation_data(trial, simulation_options);

    const display_element = this.jsPsych.getDisplayElement();

    this.trial(display_element, trial);
    load_callback();

    const inputs = display_element.querySelectorAll('input[type="text"]');
    let rt = this.jsPsych.randomization.sampleExGaussian(750, 200, 0.01, true);
    for (let i = 0; i < data.response.length; i++) {
      let res = data.response[i][Math.floor(Math.random() * data.response[i].length)];

      this.jsPsych.pluginAPI.fillTextInput(inputs[i] as HTMLInputElement, res, rt);
      rt += this.jsPsych.randomization.sampleExGaussian(750, 200, 0.01, true);
    }
    this.jsPsych.pluginAPI.clickTarget(display_element.querySelector("#finish_cloze_button"), rt);
  }
}

export default ClozePlugin;
