import { JsPsych, JsPsychPlugin, ParameterType, TrialType } from "jspsych";

const info = <const>{
  name: "survey-multi-choice",
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
        /** Array of multiple choice options for this question. */
        options: {
          type: ParameterType.STRING,
          pretty_name: "Options",
          array: true,
          default: undefined,
        },
        /** Whether or not a response to this question must be given in order to continue. */
        required: {
          type: ParameterType.BOOL,
          pretty_name: "Required",
          default: false,
        },
        /** If true, then the question will be centered and options will be displayed horizontally. */
        horizontal: {
          type: ParameterType.BOOL,
          pretty_name: "Horizontal",
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
 * **survey-multi-choice**
 *
 * jsPsych plugin for presenting multiple choice survey questions
 *
 * @author Shane Martin
 * @see {@link https://www.jspsych.org/plugins/jspsych-survey-multi-choice/ survey-multi-choice plugin documentation on jspsych.org}
 */
class SurveyMultiChoicePlugin implements JsPsychPlugin<Info> {
  static info = info;

  constructor(private jsPsych: JsPsych) {}

  trial(display_element: HTMLElement, trial: TrialType<Info>) {
    var plugin_id_name = "jspsych-survey-multi-choice";

    var html = "";

    // inject CSS for trial
    html += '<style id="jspsych-survey-multi-choice-css">';
    html +=
      ".jspsych-survey-multi-choice-question { margin-top: 2em; margin-bottom: 2em; text-align: left; }" +
      ".jspsych-survey-multi-choice-text span.required {color: darkred;}" +
      ".jspsych-survey-multi-choice-horizontal .jspsych-survey-multi-choice-text {  text-align: center;}" +
      ".jspsych-survey-multi-choice-option { line-height: 2; }" +
      ".jspsych-survey-multi-choice-horizontal .jspsych-survey-multi-choice-option {  display: inline-block;  margin-left: 1em;  margin-right: 1em;  vertical-align: top;}" +
      "label.jspsych-survey-multi-choice-text input[type='radio'] {margin-right: 1em;}";
    html += "</style>";

    // show preamble text
    if (trial.preamble !== null) {
      html +=
        '<div id="jspsych-survey-multi-choice-preamble" class="jspsych-survey-multi-choice-preamble">' +
        trial.preamble +
        "</div>";
    }

    // form element
    if (trial.autocomplete) {
      html += '<form id="jspsych-survey-multi-choice-form">';
    } else {
      html += '<form id="jspsych-survey-multi-choice-form" autocomplete="off">';
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

    // add multiple-choice questions
    for (var i = 0; i < trial.questions.length; i++) {
      // get question based on question_order
      var question = trial.questions[question_order[i]];
      var question_id = question_order[i];

      // create question container
      var question_classes = ["jspsych-survey-multi-choice-question"];
      if (question.horizontal) {
        question_classes.push("jspsych-survey-multi-choice-horizontal");
      }

      html +=
        '<div id="jspsych-survey-multi-choice-' +
        question_id +
        '" class="' +
        question_classes.join(" ") +
        '"  data-name="' +
        question.name +
        '">';

      // add question text
      html += '<p class="jspsych-survey-multi-choice-text survey-multi-choice">' + question.prompt;
      if (question.required) {
        html += "<span class='required'>*</span>";
      }
      html += "</p>";

      // create option radio buttons
      for (var j = 0; j < question.options.length; j++) {
        // add label and question text
        var option_id_name = "jspsych-survey-multi-choice-option-" + question_id + "-" + j;
        var input_name = "jspsych-survey-multi-choice-response-" + question_id;
        var input_id = "jspsych-survey-multi-choice-response-" + question_id + "-" + j;

        var required_attr = question.required ? "required" : "";

        // add radio button container
        html += '<div id="' + option_id_name + '" class="jspsych-survey-multi-choice-option">';
        html += '<label class="jspsych-survey-multi-choice-text" for="' + input_id + '">';
        html +=
          '<input type="radio" name="' +
          input_name +
          '" id="' +
          input_id +
          '" value="' +
          question.options[j] +
          '" ' +
          required_attr +
          "></input>";
        html += question.options[j] + "</label>";
        html += "</div>";
      }

      html += "</div>";
    }

    // add submit button
    html +=
      '<input type="submit" id="' +
      plugin_id_name +
      '-next" class="' +
      plugin_id_name +
      ' jspsych-btn"' +
      (trial.button_label ? ' value="' + trial.button_label + '"' : "") +
      "></input>";
    html += "</form>";

    // render
    display_element.innerHTML = html;

    document.querySelector("form").addEventListener("submit", (event) => {
      event.preventDefault();
      // measure response time
      var endTime = performance.now();
      var response_time = Math.round(endTime - startTime);

      // create object to hold responses
      var question_data = {};
      for (var i = 0; i < trial.questions.length; i++) {
        var match = display_element.querySelector("#jspsych-survey-multi-choice-" + i);
        var id = "Q" + i;
        var val: String;
        if (match.querySelector("input[type=radio]:checked") !== null) {
          val = match.querySelector<HTMLInputElement>("input[type=radio]:checked").value;
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
      const name = q.name ? q.name : `Q${trial.questions.indexOf(q)}`;
      question_data[name] = this.jsPsych.randomization.sampleWithoutReplacement(q.options, 1)[0];
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

    const answers = Object.entries(data.response);
    for (let i = 0; i < answers.length; i++) {
      this.jsPsych.pluginAPI.clickTarget(
        display_element.querySelector(
          `#jspsych-survey-multi-choice-response-${i}-${trial.questions[i].options.indexOf(
            answers[i][1]
          )}`
        ),
        ((data.rt - 1000) / answers.length) * (i + 1)
      );
    }

    this.jsPsych.pluginAPI.clickTarget(
      display_element.querySelector("#jspsych-survey-multi-choice-next"),
      data.rt
    );
  }
}

export default SurveyMultiChoicePlugin;
