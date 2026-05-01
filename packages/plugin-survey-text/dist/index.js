import { ParameterType } from 'jspsych';

var version = "2.1.0";

const info = {
  name: "survey-text",
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
      type: ParameterType.COMPLEX,
      array: true,
      default: void 0,
      nested: {
        /** Question prompt. */
        prompt: {
          type: ParameterType.HTML_STRING,
          default: void 0
        },
        /** Placeholder text in the response text box. */
        placeholder: {
          type: ParameterType.STRING,
          default: ""
        },
        /** The number of rows for the response text box. */
        rows: {
          type: ParameterType.INT,
          default: 1
        },
        /** The number of columns for the response text box. */
        columns: {
          type: ParameterType.INT,
          default: 40
        },
        /** Whether or not a response to this question must be given in order to continue. */
        required: {
          type: ParameterType.BOOL,
          default: false
        },
        /** Name of the question in the trial data. If no name is given, the questions are named Q0, Q1, etc. */
        name: {
          type: ParameterType.STRING,
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
      type: ParameterType.BOOL,
      default: false
    },
    /** HTML formatted string to display at the top of the page above all the questions. */
    preamble: {
      type: ParameterType.HTML_STRING,
      default: null
    },
    /** Label of the button to submit responses. */
    button_label: {
      type: ParameterType.STRING,
      default: "Continue"
    },
    /** Setting this to true will enable browser auto-complete or auto-fill for the form. */
    autocomplete: {
      type: ParameterType.BOOL,
      default: false
    }
  },
  data: {
    /** An object containing the response for each question. The object will have a separate key (variable) for each question, with the first question in the trial being recorded in `Q0`, the second in `Q1`, and so on. The responses are recorded as integers, representing the position selected on the likert scale for that question. If the `name` parameter is defined for the question, then the response object will use the value of `name` as the key for each question. This will be encoded as a JSON string when data is saved using the `.json()` or `.csv()` functions. */
    response: {
      type: ParameterType.OBJECT
    },
    /** The response time in milliseconds for the participant to make a response. The time is measured from when the questions first appear on the screen until the participant's response(s) are submitted. */
    rt: {
      type: ParameterType.INT
    },
    /** An array with the order of questions. For example `[2,0,1]` would indicate that the first question was `trial.questions[2]` (the third item in the `questions` parameter), the second question was `trial.questions[0]`, and the final question was `trial.questions[1]`. This will be encoded as a JSON string when data is saved using the `.json()` or `.csv()` functions. */
    question_order: {
      type: ParameterType.INT,
      array: true
    }
  },
  // prettier-ignore
  citations: {
    "apa": "de Leeuw, J. R., Gilbert, R. A., & Luchterhandt, B. (2023). jsPsych: Enabling an Open-Source Collaborative Ecosystem of Behavioral Experiments. Journal of Open Source Software, 8(85), 5351. https://doi.org/10.21105/joss.05351 ",
    "bibtex": '@article{Leeuw2023jsPsych, 	author = {de Leeuw, Joshua R. and Gilbert, Rebecca A. and Luchterhandt, Bj{\\" o}rn}, 	journal = {Journal of Open Source Software}, 	doi = {10.21105/joss.05351}, 	issn = {2475-9066}, 	number = {85}, 	year = {2023}, 	month = {may 11}, 	pages = {5351}, 	publisher = {Open Journals}, 	title = {jsPsych: Enabling an {Open}-{Source} {Collaborative} {Ecosystem} of {Behavioral} {Experiments}}, 	url = {https://joss.theoj.org/papers/10.21105/joss.05351}, 	volume = {8}, }  '
  }
};
class SurveyTextPlugin {
  constructor(jsPsych) {
    this.jsPsych = jsPsych;
  }
  static {
    this.info = info;
  }
  trial(display_element, trial) {
    for (var i = 0; i < trial.questions.length; i++) {
      if (typeof trial.questions[i].rows == "undefined") {
        trial.questions[i].rows = 1;
      }
    }
    for (var i = 0; i < trial.questions.length; i++) {
      if (typeof trial.questions[i].columns == "undefined") {
        trial.questions[i].columns = 40;
      }
    }
    for (var i = 0; i < trial.questions.length; i++) {
      if (typeof trial.questions[i].value == "undefined") {
        trial.questions[i].value = "";
      }
    }
    var html = "";
    if (trial.preamble !== null) {
      html += '<div id="jspsych-survey-text-preamble" class="jspsych-survey-text-preamble">' + trial.preamble + "</div>";
    }
    if (trial.autocomplete) {
      html += '<form id="jspsych-survey-text-form">';
    } else {
      html += '<form id="jspsych-survey-text-form" autocomplete="off">';
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
      var question_index = question_order[i];
      html += '<div id="jspsych-survey-text-' + question_index + '" class="jspsych-survey-text-question" style="margin: 2em 0em;">';
      html += '<p class="jspsych-survey-text">' + question.prompt + "</p>";
      var autofocus = i == 0 ? "autofocus" : "";
      var req = question.required ? "required" : "";
      if (question.rows == 1) {
        html += '<input type="text" id="input-' + question_index + '"  name="#jspsych-survey-text-response-' + question_index + '" data-name="' + question.name + '" size="' + question.columns + '" ' + autofocus + " " + req + ' placeholder="' + question.placeholder + '"></input>';
      } else {
        html += '<textarea id="input-' + question_index + '" name="#jspsych-survey-text-response-' + question_index + '" data-name="' + question.name + '" cols="' + question.columns + '" rows="' + question.rows + '" ' + autofocus + " " + req + ' placeholder="' + question.placeholder + '"></textarea>';
      }
      html += "</div>";
    }
    html += '<input type="submit" id="jspsych-survey-text-next" class="jspsych-btn jspsych-survey-text" value="' + trial.button_label + '"></input>';
    html += "</form>";
    display_element.innerHTML = html;
    display_element.querySelector("#input-" + question_order[0]).focus();
    display_element.querySelector("#jspsych-survey-text-form").addEventListener("submit", (e) => {
      e.preventDefault();
      var endTime = performance.now();
      var response_time = Math.round(endTime - startTime);
      var question_data = {};
      for (var index = 0; index < trial.questions.length; index++) {
        var id = "Q" + index;
        var q_element = document.querySelector("#jspsych-survey-text-" + index).querySelector("textarea, input");
        var val = q_element.value;
        var name = q_element.attributes["data-name"].value;
        if (name == "") {
          name = id;
        }
        var obje = {};
        obje[name] = val;
        Object.assign(question_data, obje);
      }
      var trialdata = {
        rt: response_time,
        response: question_data
      };
      this.jsPsych.finishTrial(trialdata);
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
      const name = q.name ? q.name : `Q${trial.questions.indexOf(q)}`;
      const ans_words = q.rows == 1 ? this.jsPsych.randomization.sampleExponential(0.25) : this.jsPsych.randomization.randomInt(1, 10) * q.rows;
      question_data[name] = this.jsPsych.randomization.randomWords({
        exactly: ans_words,
        join: " "
      });
      rt += this.jsPsych.randomization.sampleExGaussian(2e3, 400, 4e-3, true);
    }
    const default_data = {
      response: question_data,
      rt
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
    const answers = Object.entries(data.response).map((x) => {
      return x[1];
    });
    for (let i = 0; i < answers.length; i++) {
      this.jsPsych.pluginAPI.fillTextInput(
        display_element.querySelector(`#input-${i}`),
        answers[i],
        (data.rt - 1e3) / answers.length * (i + 1)
      );
    }
    this.jsPsych.pluginAPI.clickTarget(
      display_element.querySelector("#jspsych-survey-text-next"),
      data.rt
    );
  }
}

export { SurveyTextPlugin as default };
//# sourceMappingURL=index.js.map
