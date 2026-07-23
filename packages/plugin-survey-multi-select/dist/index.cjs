'use strict';

var jspsych = require('jspsych');

var version = "2.1.0";

const info = {
  name: "survey-multi-select",
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
        /** Array of multiple select options for this question. */
        options: {
          type: jspsych.ParameterType.STRING,
          array: true,
          default: void 0
        },
        /** If true, then the question will be centered and options will be displayed horizontally. */
        horizontal: {
          type: jspsych.ParameterType.BOOL,
          default: false
        },
        /** Whether or not a response to this question must be given in order to continue. */
        required: {
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
     * If true, the display order of `questions` is randomly determined at the start of the trial. In the data
     * object, `Q0` will still refer to the first question in the array, regardless of where it was presented
     * visually.
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
    /** Label of the button to submit responses. */
    button_label: {
      type: jspsych.ParameterType.STRING,
      default: "Continue"
    },
    /** 'You must choose at least one response for this question' | Message to display if required response is not given. */
    required_message: {
      type: jspsych.ParameterType.STRING,
      default: "You must choose at least one response for this question"
    },
    /** This determines whether or not all of the input elements on the page should allow autocomplete.
     * Setting this to true will enable autocomplete or auto-fill for the form. */
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
class SurveyMultiSelectPlugin {
  constructor(jsPsych) {
    this.jsPsych = jsPsych;
  }
  static {
    this.info = info;
  }
  trial(display_element, trial) {
    var plugin_id_name = "jspsych-survey-multi-select";
    var plugin_id_selector = "#" + plugin_id_name;
    const _join = (...args) => args.join("-");
    var cssstr = ".jspsych-survey-multi-select-question { margin-top: 2em; margin-bottom: 2em; text-align: left; }.jspsych-survey-multi-select-text span.required {color: darkred;}.jspsych-survey-multi-select-horizontal .jspsych-survey-multi-select-text {  text-align: center;}.jspsych-survey-multi-select-option { line-height: 2; }.jspsych-survey-multi-select-horizontal .jspsych-survey-multi-select-option {  display: inline-block;  margin-left: 1em;  margin-right: 1em;  vertical-align: top;}label.jspsych-survey-multi-select-text input[type='checkbox'] {margin-right: 1em;}";
    display_element.innerHTML = '<style id="jspsych-survey-multi-select-css">' + cssstr + "</style>";
    var trial_form_id = _join(plugin_id_name, "form");
    display_element.innerHTML += '<form id="' + trial_form_id + '"></form>';
    var trial_form = display_element.querySelector("#" + trial_form_id);
    if (!trial.autocomplete) {
      trial_form.setAttribute("autocomplete", "off");
    }
    var preamble_id_name = _join(plugin_id_name, "preamble");
    if (trial.preamble !== null) {
      trial_form.innerHTML += '<div id="' + preamble_id_name + '" class="' + preamble_id_name + '">' + trial.preamble + "</div>";
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
      var question_classes = [_join(plugin_id_name, "question")];
      if (question.horizontal) {
        question_classes.push(_join(plugin_id_name, "horizontal"));
      }
      trial_form.innerHTML += '<div id="' + _join(plugin_id_name, question_id) + '" data-name="' + question.name + '" class="' + question_classes.join(" ") + '"></div>';
      var question_selector = _join(plugin_id_selector, question_id);
      display_element.querySelector(question_selector).innerHTML += '<p id="survey-question" class="' + plugin_id_name + '-text survey-multi-select">' + question.prompt + "</p>";
      for (var j = 0; j < question.options.length; j++) {
        var option_id_name = _join(plugin_id_name, "option", question_id, j);
        display_element.querySelector(question_selector).innerHTML += '<div id="' + option_id_name + '" class="' + _join(plugin_id_name, "option") + '"></div>';
        var form = document.getElementById(option_id_name);
        var input_name = _join(plugin_id_name, "response", question_id);
        var input_id = _join(plugin_id_name, "response", question_id, j);
        var label = document.createElement("label");
        label.setAttribute("class", plugin_id_name + "-text");
        label.innerHTML = question.options[j];
        label.setAttribute("for", input_id);
        var input = document.createElement("input");
        input.setAttribute("type", "checkbox");
        input.setAttribute("name", input_name);
        input.setAttribute("id", input_id);
        input.setAttribute("value", question.options[j]);
        form.appendChild(label);
        label.insertBefore(input, label.firstChild);
      }
    }
    trial_form.innerHTML += '<div class="fail-message"></div>';
    trial_form.innerHTML += '<button id="' + plugin_id_name + '-next" class="' + plugin_id_name + ' jspsych-btn">' + trial.button_label + "</button>";
    display_element.querySelector("#jspsych-survey-multi-select-next").addEventListener("click", () => {
      for (var i2 = 0; i2 < trial.questions.length; i2++) {
        if (trial.questions[i2].required) {
          if (display_element.querySelector(
            "#jspsych-survey-multi-select-" + i2 + " input:checked"
          ) == null) {
            display_element.querySelector("#jspsych-survey-multi-select-" + i2 + " input").setCustomValidity(trial.required_message);
          } else {
            display_element.querySelector("#jspsych-survey-multi-select-" + i2 + " input").setCustomValidity("");
          }
        }
      }
      trial_form.reportValidity();
    });
    trial_form.addEventListener("submit", (event) => {
      event.preventDefault();
      var endTime = performance.now();
      var response_time = Math.round(endTime - startTime);
      var question_data = {};
      for (var index = 0; index < trial.questions.length; index++) {
        var match = display_element.querySelector("#jspsych-survey-multi-select-" + index);
        var val = [];
        var inputboxes = match.querySelectorAll("input[type=checkbox]:checked");
        for (var j2 = 0; j2 < inputboxes.length; j2++) {
          var currentChecked = inputboxes[j2];
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
        if (val.length == 0) ;
      }
      var trial_data = {
        rt: response_time,
        response: question_data,
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
    let rt = 1e3;
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
    for (let i = 0; i < answers.length; i++) {
      for (const a of answers[i][1]) {
        this.jsPsych.pluginAPI.clickTarget(
          display_element.querySelector(
            `#jspsych-survey-multi-select-response-${i}-${trial.questions[i].options.indexOf(a)}`
          ),
          (data.rt - 1e3) / answers.length * (i + 1)
        );
      }
    }
    this.jsPsych.pluginAPI.clickTarget(
      display_element.querySelector("#jspsych-survey-multi-select-next"),
      data.rt
    );
  }
}

module.exports = SurveyMultiSelectPlugin;
//# sourceMappingURL=index.cjs.map
