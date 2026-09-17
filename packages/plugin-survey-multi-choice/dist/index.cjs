'use strict';

var jspsych = require('jspsych');

var version = "2.2.0";

const info = {
  name: "survey-multi-choice",
  version,
  parameters: {
    /**
     * An array of objects, each object represents a question that appears on the screen. Each object contains a prompt,
     * options, required, and horizontal parameter that will be applied to the question. See examples below for further
     * clarification.`prompt`: Type string, default value is *undefined*. The string is prompt/question that will be
     * associated with a group of options (radio buttons). All questions will get presented on the same page (trial).
     * `options`: Type array, defualt value is *undefined*. An array of strings. The array contains a set of options to
     * display for an individual question.`required`: Type boolean, default value is null. The boolean value indicates
     * if a question is required('true') or not ('false'), using the HTML5 `required` attribute. If this parameter is
     * undefined, the question will be optional. `horizontal`:Type boolean, default value is false. If true, then the
     * question is centered and the options are displayed horizontally. `name`: Name of the question. Used for storing
     * data. If left undefined then default names (`Q0`, `Q1`, `...`) will be used for the questions.
     */
    questions: {
      type: jspsych.ParameterType.COMPLEX,
      array: true,
      nested: {
        /** Question prompt. */
        prompt: {
          type: jspsych.ParameterType.HTML_STRING,
          default: void 0
        },
        /** Array of multiple choice options for this question. */
        options: {
          type: jspsych.ParameterType.STRING,
          array: true,
          default: void 0
        },
        /** Whether or not a response to this question must be given in order to continue. */
        required: {
          type: jspsych.ParameterType.BOOL,
          default: false
        },
        /** If true, then the question will be centered and options will be displayed horizontally. */
        horizontal: {
          type: jspsych.ParameterType.BOOL,
          default: false
        },
        /** Name of the question in the trial data. If no name is given, the questions are named Q0, Q1, etc. */
        name: {
          type: jspsych.ParameterType.STRING,
          default: ""
        }
      }
    },
    /**
     * If true, the display order of `questions` is randomly determined at the start of the trial. In the data object,
     * `Q0` will still refer to the first question in the array, regardless of where it was presented visually.
     */
    randomize_question_order: {
      type: jspsych.ParameterType.BOOL,
      default: false
    },
    /** HTML formatted string to display at the top of the page above all the questions. */
    preamble: {
      type: jspsych.ParameterType.HTML_STRING,
      default: null
    },
    /** Label of the button. */
    button_label: {
      type: jspsych.ParameterType.STRING,
      default: "Continue"
    },
    /**
     * This determines whether or not all of the input elements on the page should allow autocomplete. Setting
     * this to true will enable autocomplete or auto-fill for the form.
     */
    autocomplete: {
      type: jspsych.ParameterType.BOOL,
      default: false
    }
  },
  data: {
    /** An object containing the response for each question. The object will have a separate key (variable) for each question, with the first question in the trial being recorded in `Q0`, the second in `Q1`, and so on. The responses are recorded as integers, representing the position selected on the likert scale for that question. If the `name` parameter is defined for the question, then the response object will use the value of `name` as the key for each question. This will be encoded as a JSON string when data is saved using the `.json()` or `.csv()` functions. */
    response: {
      type: jspsych.ParameterType.OBJECT
    },
    /** An array containing the index of the selected option for each question. Unanswered questions are recorded as -1. */
    response_index: {
      type: jspsych.ParameterType.INT,
      array: true
    },
    /** The response time in milliseconds for the participant to make a response. The time is measured from when the questions first appear on the screen until the participant's response(s) are submitted. */
    rt: {
      type: jspsych.ParameterType.INT
    },
    /** An array with the order of questions. For example `[2,0,1]` would indicate that the first question was `trial.questions[2]` (the third item in the `questions` parameter), the second question was `trial.questions[0]`, and the final question was `trial.questions[1]`. This will be encoded as a JSON string when data is saved using the `.json()` or `.csv()` functions. */
    question_order: {
      type: jspsych.ParameterType.INT,
      array: true
    }
  },
  // prettier-ignore
  citations: {
    "apa": "de Leeuw, J. R., Gilbert, R. A., & Luchterhandt, B. (2023). jsPsych: Enabling an Open-Source Collaborative Ecosystem of Behavioral Experiments. Journal of Open Source Software, 8(85), 5351. https://doi.org/10.21105/joss.05351 ",
    "bibtex": '@article{Leeuw2023jsPsych, 	author = {de Leeuw, Joshua R. and Gilbert, Rebecca A. and Luchterhandt, Bj{\\" o}rn}, 	journal = {Journal of Open Source Software}, 	doi = {10.21105/joss.05351}, 	issn = {2475-9066}, 	number = {85}, 	year = {2023}, 	month = {may 11}, 	pages = {5351}, 	publisher = {Open Journals}, 	title = {jsPsych: Enabling an {Open}-{Source} {Collaborative} {Ecosystem} of {Behavioral} {Experiments}}, 	url = {https://joss.theoj.org/papers/10.21105/joss.05351}, 	volume = {8}, }  '
  }
};
const plugin_id_name = "jspsych-survey-multi-choice";
class SurveyMultiChoicePlugin {
  constructor(jsPsych) {
    this.jsPsych = jsPsych;
  }
  static {
    this.info = info;
  }
  trial(display_element, trial) {
    const trial_form_id = `${plugin_id_name}_form`;
    var html = "";
    html += `
    <style id="${plugin_id_name}-css">
      .${plugin_id_name}-question { margin-top: 2em; margin-bottom: 2em; text-align: left; }
      .${plugin_id_name}-text span.required {color: darkred;}
      .${plugin_id_name}-horizontal .${plugin_id_name}-text {  text-align: center;}
      .${plugin_id_name}-option { line-height: 2; }
      .${plugin_id_name}-horizontal .${plugin_id_name}-option {  display: inline-block;  margin-left: 1em;  margin-right: 1em;  vertical-align: top;}
      label.${plugin_id_name}-text input[type='radio'] {margin-right: 1em;}
      </style>`;
    if (trial.preamble !== null) {
      html += `<div id="${plugin_id_name}-preamble" class="${plugin_id_name}-preamble">${trial.preamble}</div>`;
    }
    if (trial.autocomplete) {
      html += `<form id="${trial_form_id}">`;
    } else {
      html += `<form id="${trial_form_id}" autocomplete="off">`;
    }
    var question_order = [];
    for (var i = 0; i < trial.questions.length; i++) {
      question_order.push(i);
    }
    if (trial.randomize_question_order) {
      question_order = this.jsPsych.randomization.shuffle(question_order);
    }
    for (var i = 0; i < trial.questions.length; i++) {
      var question = trial.questions[question_order[i]];
      var question_id = question_order[i];
      var question_classes = [`${plugin_id_name}-question`];
      if (question.horizontal) {
        question_classes.push(`${plugin_id_name}-horizontal`);
      }
      html += `<div id="${plugin_id_name}-${question_id}" class="${question_classes.join(
        " "
      )}" data-name="${question.name}">`;
      html += `<p class="${plugin_id_name}-text survey-multi-choice">${question.prompt}`;
      if (question.required) {
        html += "<span class='required'>*</span>";
      }
      html += "</p>";
      for (var j = 0; j < question.options.length; j++) {
        var option_id_name = `${plugin_id_name}-option-${question_id}-${j}`;
        var input_name = `${plugin_id_name}-response-${question_id}`;
        var input_id = `${plugin_id_name}-response-${question_id}-${j}`;
        var required_attr = question.required ? "required" : "";
        html += `
        <div id="${option_id_name}" class="${plugin_id_name}-option">
          <label class="${plugin_id_name}-text" for="${input_id}">
            <input type="radio" name="${input_name}" id="${input_id}" value="${question.options[j]}" data-option-index="${j}" ${required_attr} />
            ${question.options[j]}
            </label>
        </div>`;
      }
      html += "</div>";
    }
    html += `<input type="submit" id="${plugin_id_name}-next" class="${plugin_id_name} jspsych-btn"${trial.button_label ? ' value="' + trial.button_label + '"' : ""} />`;
    html += "</form>";
    display_element.innerHTML = html;
    const trial_form = display_element.querySelector(`#${trial_form_id}`);
    trial_form.addEventListener("submit", (event) => {
      event.preventDefault();
      var endTime = performance.now();
      var response_time = Math.round(endTime - startTime);
      var question_data = {};
      var response_index = [];
      for (var i2 = 0; i2 < trial.questions.length; i2++) {
        var match = display_element.querySelector(`#${plugin_id_name}-${i2}`);
        var id = "Q" + i2;
        var val = "";
        var selected_index = -1;
        var checked = match.querySelector("input[type=radio]:checked");
        if (checked !== null) {
          val = checked.value;
          selected_index = Number(checked.dataset.optionIndex);
        } else {
          val = "";
        }
        var obje = {};
        var name = id;
        if (match.attributes["data-name"].value !== "") {
          name = match.attributes["data-name"].value;
        }
        obje[name] = val;
        Object.assign(question_data, obje);
        response_index.push(selected_index);
      }
      var trial_data = {
        rt: response_time,
        response: question_data,
        response_index,
        question_order
      };
      this.jsPsych.finishTrial(trial_data);
    });
    var startTime = performance.now();
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
    const question_data = {};
    const response_index = [];
    let rt = 1e3;
    for (let i = 0; i < trial.questions.length; i++) {
      const q = trial.questions[i];
      const name = q.name ? q.name : `Q${i}`;
      const option_index = this.jsPsych.randomization.randomInt(0, q.options.length - 1);
      question_data[name] = q.options[option_index];
      response_index.push(option_index);
      rt += this.jsPsych.randomization.sampleExGaussian(1500, 400, 1 / 200, true);
    }
    const default_data = {
      response: question_data,
      response_index,
      rt,
      question_order: trial.randomize_question_order ? this.jsPsych.randomization.shuffle([...Array(trial.questions.length).keys()]) : [...Array(trial.questions.length).keys()]
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
    this.trial(display_element, trial);
    load_callback();
    const answers = Object.entries(data.response);
    const response_index = Array.isArray(data.response_index) ? data.response_index : [];
    for (let i = 0; i < answers.length; i++) {
      let option_index = response_index[i];
      if (typeof option_index !== "number" || option_index < 0) {
        option_index = trial.questions[i].options.indexOf(answers[i][1]);
      }
      if (option_index < 0) {
        continue;
      }
      this.jsPsych.pluginAPI.clickTarget(
        display_element.querySelector(`#${plugin_id_name}-response-${i}-${option_index}`),
        (data.rt - 1e3) / answers.length * (i + 1)
      );
    }
    this.jsPsych.pluginAPI.clickTarget(
      display_element.querySelector(`#${plugin_id_name}-next`),
      data.rt
    );
  }
}

module.exports = SurveyMultiChoicePlugin;
//# sourceMappingURL=index.cjs.map
