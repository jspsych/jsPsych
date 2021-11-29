import { JsPsych, JsPsychPlugin, ParameterType, TrialType } from "jspsych";

const info = <const>{
  name: "survey-multi-select",
  parameters: {
    /** Array containing one or more objects with parameters for the question(s) that should be shown on the page. */
    questions: {
      type: ParameterType.COMPLEX,
      array: true,
      pretty_name: "Questions",
      nested: {
        /** Question prompt. */
        prompt: {
          type: ParameterType.HTML_STRING,
          pretty_name: "Prompt",
          default: undefined,
        },
        /** Array of multiple select options for this question. */
        options: {
          type: ParameterType.STRING,
          pretty_name: "Options",
          array: true,
          default: undefined,
        },
        /** If true, then the question will be centered and options will be displayed horizontally. */
        horizontal: {
          type: ParameterType.BOOL,
          pretty_name: "Horizontal",
          default: false,
        },
        /** Whether or not a response to this question must be given in order to continue. */
        required: {
          type: ParameterType.BOOL,
          pretty_name: "Required",
          default: false,
        },
        /** Name of the question in the trial data. If no name is given, the questions are named Q0, Q1, etc. */
        name: {
          type: ParameterType.STRING,
          pretty_name: "Question Name",
          default: "",
        },
      },
    },
    /** If true, the order of the questions in the 'questions' array will be randomized. */
    randomize_question_order: {
      type: ParameterType.BOOL,
      pretty_name: "Randomize Question Order",
      default: false,
    },
    /** HTML-formatted string to display at top of the page above all of the questions. */
    preamble: {
      type: ParameterType.HTML_STRING,
      pretty_name: "Preamble",
      default: null,
    },
    /** Label of the button to submit responses. */
    button_label: {
      type: ParameterType.STRING,
      pretty_name: "Button label",
      default: "Continue",
    },
    /** Message that will be displayed if one or more required questions is not answered. */
    required_message: {
      type: ParameterType.STRING,
      pretty_name: "Required message",
      default: "You must choose at least one response for this question",
    },
    /** Setting this to true will enable browser auto-complete or auto-fill for the form. */
    autocomplete: {
      type: ParameterType.BOOL,
      pretty_name: "Allow autocomplete",
      default: false,
    },
  },
};

type Info = typeof info;

/**
 * **survey-multi-select**
 *
 * jsPsych plugin for presenting multiple choice survey questions with the ability to respond with more than one option
 *
 * @see {@link https://www.jspsych.org/plugins/jspsych-survey-multi-select/ survey-multi-select plugin documentation on jspsych.org}
 */
class SurveyMultiSelectPlugin implements JsPsychPlugin<Info> {
  static info = info;

  constructor(private jsPsych: JsPsych) {}

  trial(display_element: HTMLElement, trial: TrialType<Info>) {
    var plugin_id_name = "jspsych-survey-multi-select";
    var plugin_id_selector = "#" + plugin_id_name;
    const _join = (...args: Array<string | number>) => args.join("-");

    // inject CSS for trial
    var cssstr =
      ".jspsych-survey-multi-select-question { margin-top: 2em; margin-bottom: 2em; text-align: left; }" +
      ".jspsych-survey-multi-select-text span.required {color: darkred;}" +
      ".jspsych-survey-multi-select-horizontal .jspsych-survey-multi-select-text {  text-align: center;}" +
      ".jspsych-survey-multi-select-option { line-height: 2; }" +
      ".jspsych-survey-multi-select-horizontal .jspsych-survey-multi-select-option {  display: inline-block;  margin-left: 1em;  margin-right: 1em;  vertical-align: top;}" +
      "label.jspsych-survey-multi-select-text input[type='checkbox'] {margin-right: 1em;}";
    display_element.innerHTML =
      '<style id="jspsych-survey-multi-select-css">' + cssstr + "</style>";

    // form element
    var trial_form_id = _join(plugin_id_name, "form");
    display_element.innerHTML += '<form id="' + trial_form_id + '"></form>';
    var trial_form = display_element.querySelector<HTMLFormElement>("#" + trial_form_id);
    if (!trial.autocomplete) {
      trial_form.setAttribute("autocomplete", "off");
    }
    // show preamble text
    var preamble_id_name = _join(plugin_id_name, "preamble");
    if (trial.preamble !== null) {
      trial_form.innerHTML +=
        '<div id="' +
        preamble_id_name +
        '" class="' +
        preamble_id_name +
        '">' +
        trial.preamble +
        "</div>";
    }
    // generate question order. this is randomized here as opposed to randomizing the order of trial.questions
    // so that the data are always associated with the same question regardless of order
    var question_order = [];
    for (var i = 0; i < trial.questions.length; i++) {
      question_order.push(i);
    }
    if (trial.randomize_question_order) {
      question_order = this.jsPsych.randomization.shuffle(question_order);
    }
    // add multiple-select questions
    for (var i = 0; i < trial.questions.length; i++) {
      var question = trial.questions[question_order[i]];
      var question_id = question_order[i];
      // create question container
      var question_classes = [_join(plugin_id_name, "question")];
      if (question.horizontal) {
        question_classes.push(_join(plugin_id_name, "horizontal"));
      }

      trial_form.innerHTML +=
        '<div id="' +
        _join(plugin_id_name, question_id) +
        '" data-name="' +
        question.name +
        '" class="' +
        question_classes.join(" ") +
        '"></div>';

      var question_selector = _join(plugin_id_selector, question_id);

      // add question text
      display_element.querySelector(question_selector).innerHTML +=
        '<p id="survey-question" class="' +
        plugin_id_name +
        '-text survey-multi-select">' +
        question.prompt +
        "</p>";

      // create option check boxes
      for (var j = 0; j < question.options.length; j++) {
        var option_id_name = _join(plugin_id_name, "option", question_id, j);

        // add check box container
        display_element.querySelector(question_selector).innerHTML +=
          '<div id="' + option_id_name + '" class="' + _join(plugin_id_name, "option") + '"></div>';

        // add label and question text
        var form = document.getElementById(option_id_name);
        var input_name = _join(plugin_id_name, "response", question_id);
        var input_id = _join(plugin_id_name, "response", question_id, j);
        var label = document.createElement("label");
        label.setAttribute("class", plugin_id_name + "-text");
        label.innerHTML = question.options[j];
        label.setAttribute("for", input_id);

        // create checkboxes
        var input = document.createElement("input");
        input.setAttribute("type", "checkbox");
        input.setAttribute("name", input_name);
        input.setAttribute("id", input_id);
        input.setAttribute("value", question.options[j]);
        form.appendChild(label);
        label.insertBefore(input, label.firstChild);
      }
    }
    // add submit button
    trial_form.innerHTML += '<div class="fail-message"></div>';
    trial_form.innerHTML +=
      '<button id="' +
      plugin_id_name +
      '-next" class="' +
      plugin_id_name +
      ' jspsych-btn">' +
      trial.button_label +
      "</button>";

    // validation check on the data first for custom validation handling
    // then submit the form
    display_element
      .querySelector("#jspsych-survey-multi-select-next")
      .addEventListener("click", () => {
        for (var i = 0; i < trial.questions.length; i++) {
          if (trial.questions[i].required) {
            if (
              display_element.querySelector(
                "#jspsych-survey-multi-select-" + i + " input:checked"
              ) == null
            ) {
              display_element
                .querySelector<HTMLInputElement>("#jspsych-survey-multi-select-" + i + " input")
                .setCustomValidity(trial.required_message);
            } else {
              display_element
                .querySelector<HTMLInputElement>("#jspsych-survey-multi-select-" + i + " input")
                .setCustomValidity("");
            }
          }
        }
        trial_form.reportValidity();
      });

    trial_form.addEventListener("submit", (event) => {
      event.preventDefault();
      // measure response time
      var endTime = performance.now();
      var response_time = Math.round(endTime - startTime);

      // create object to hold responses
      var question_data = {};
      var has_response = [];
      for (var index = 0; index < trial.questions.length; index++) {
        var match = display_element.querySelector("#jspsych-survey-multi-select-" + index);
        var val = [];
        var inputboxes = match.querySelectorAll<HTMLInputElement>("input[type=checkbox]:checked");
        for (var j = 0; j < inputboxes.length; j++) {
          var currentChecked = inputboxes[j];
          val.push(currentChecked.value);
        }
        var id = "Q" + index;
        var obje = {};
        var name = id;
        if (match.attributes["data-name"].value !== "") {
          name = match.attributes["data-name"].value;
        }
        obje[name] = val;
        Object.assign(question_data, obje);
        if (val.length == 0) {
          has_response.push(false);
        } else {
          has_response.push(true);
        }
      }

      // save data
      var trial_data = {
        rt: response_time,
        response: question_data,
        question_order: question_order,
      };
      display_element.innerHTML = "";

      // next trial
      this.jsPsych.finishTrial(trial_data);
    });

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
    const question_data = {};
    let rt = 1000;

    for (const q of trial.questions) {
      let n_answers;
      if (q.required) {
        n_answers = this.jsPsych.randomization.randomInt(1, q.options.length);
      } else {
        n_answers = this.jsPsych.randomization.randomInt(0, q.options.length);
      }
      const name = q.name ? q.name : `Q${trial.questions.indexOf(q)}`;
      const selections = this.jsPsych.randomization.sampleWithoutReplacement(q.options, n_answers);
      question_data[name] = selections;
      rt += this.jsPsych.randomization.sampleExGaussian(1500, 400, 1 / 200, true);
    }

    const default_data = {
      response: question_data,
      rt: rt,
      question_order: trial.randomize_question_order
        ? this.jsPsych.randomization.shuffle([...Array(trial.questions.length).keys()])
        : [...Array(trial.questions.length).keys()],
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

    const answers: [string, []][] = Object.entries(data.response);
    for (let i = 0; i < answers.length; i++) {
      for (const a of answers[i][1]) {
        this.jsPsych.pluginAPI.clickTarget(
          display_element.querySelector(
            `#jspsych-survey-multi-select-response-${i}-${trial.questions[i].options.indexOf(a)}`
          ),
          ((data.rt - 1000) / answers.length) * (i + 1)
        );
      }
    }

    this.jsPsych.pluginAPI.clickTarget(
      display_element.querySelector("#jspsych-survey-multi-select-next"),
      data.rt
    );
  }
}

export default SurveyMultiSelectPlugin;
