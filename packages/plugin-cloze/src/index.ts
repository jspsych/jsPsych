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
    /** Function called if ```check_answers``` is set to ```true``` and there is a difference between the participant's answers and the correct solution provided in the text, or if ```allow_blanks``` is set to ```false``` and there is at least one field with a blank answer. */
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
    const solutions = this.getSolutions(trial.text);

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
        answers.push(field.value.trim());

        if (trial.check_answers) {
          if (answers[i] !== solutions[i]) {
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
  }

  private getSolutions(text: string) {
    const solutions = [];
    const elements = text.split("%");
    for (let i = 0; i < elements.length; i++) {
      if (i % 2 == 1) {
        solutions.push(elements[i].trim());
      }
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
    const solutions = this.getSolutions(trial.text);
    const responses = [];
    for (const word of solutions) {
      if (word == "") {
        responses.push(this.jsPsych.randomization.randomWords({ exactly: 1 }));
      } else {
        responses.push(word);
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
      this.jsPsych.pluginAPI.fillTextInput(inputs[i] as HTMLInputElement, data.response[i], rt);
      rt += this.jsPsych.randomization.sampleExGaussian(750, 200, 0.01, true);
    }
    this.jsPsych.pluginAPI.clickTarget(display_element.querySelector("#finish_cloze_button"), rt);
  }
}

export default ClozePlugin;
