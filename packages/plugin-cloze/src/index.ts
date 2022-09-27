import { JsPsych, JsPsychPlugin, ParameterType, TrialType } from "jspsych";

const info = <const>{
  name: "cloze",
  parameters: {
    /** The cloze text to be displayed. Blanks are indicated by %% signs and automatically replaced by input fields. If there is a correct answer you want the system to check against, it must be typed between the two percentage signs (i.e. %solution%). */
    text: {
      type: ParameterType.HTML_STRING,
      pretty_name: "Cloze text",
      default: undefined,
    },
    /** Text of the button participants have to press for finishing the cloze test. */
    button_text: {
      type: ParameterType.STRING,
      pretty_name: "Button text",
      default: "OK",
    },
    /** Boolean value indicating if the answers given by participants should be compared against a correct solution given in the text (between % signs) after the button was clicked. */
    check_answers: {
      type: ParameterType.BOOL,
      pretty_name: "Check answers",
      default: false,
    },
    /** Boolean value indicating if the participant may leave answers blank. */
    allow_blanks: {
      type: ParameterType.BOOL,
      pretty_name: "Allow blanks",
      default: true,
    },
    /** Function called if either the check_answers is set to TRUE or the allow_blanks is set to FALSE and there is a discrepancy between the set answers and the answers provide or if all input fields aren't filled out, respectively. */
    mistake_fn: {
      type: ParameterType.FUNCTION,
      pretty_name: "Mistake function",
      default: () => { },
    },
  },
};

type Info = typeof info;

/**
 * **cloze**
 *
 * jsPsych plugin for displaying a cloze test and checking participants answers against a correct solution
 *
 * @author Philipp Sprengholz
 * @see {@link https://www.jspsych.org/plugins/jspsych-cloze/ cloze plugin documentation on jspsych.org}
 */
class ClozePlugin implements JsPsychPlugin<Info> {
  static info = info;

  constructor(private jsPsych: JsPsych) { }

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

        display_element.innerHTML = "";
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
