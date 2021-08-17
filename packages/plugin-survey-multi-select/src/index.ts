import { JsPsych, JsPsychPlugin, TrialType, parameterType } from "jspsych";

const info = <const>{
  name: "survey-multi-select",
  parameters: {
    /* Array containing one or more objects with parameters for the question(s) that should be shown on the page. */
    questions: {
      type: parameterType.COMPLEX,
      array: true,
      pretty_name: "Questions",
      nested: {
        /* Question prompt. */
        prompt: {
          type: parameterType.STRING,
          pretty_name: "Prompt",
          default: undefined
        },
        /* Array of multiple select options for this question. */
        options: {
          type: parameterType.STRING,
          pretty_name: "Options",
          array: true,
          default: undefined
        },
        /* If true, then the question will be centered and options will be displayed horizontally. */
        horizontal: {
          type: parameterType.BOOL,
          pretty_name: "Horizontal",
          default: false
        },
        /* Whether or not a response to this question must be given in order to continue. */
        required: {
          type: parameterType.BOOL,
          pretty_name: "Required",
          default: false
        },
        /* Name of the question in the trial data. If no name is given, the questions are named Q0, Q1, etc. */
        name: {
          type: parameterType.STRING,
          pretty_name: "Question Name",
          default: ""
        }
      }
    },
    /* If true, the order of the questions in the 'questions' array will be randomized. */
    randomize_question_order: {
      type: parameterType.BOOL,
      pretty_name: "Randomize Question Order",
      default: false
    },
    /* HTML-formatted string to display at top of the page above all of the questions. */
    preamble: {
      type: parameterType.STRING,
      pretty_name: "Preamble",
      default: null
    },
    /* Label of the button to submit responses. */
    button_label: {
      type: parameterType.STRING,
      pretty_name: "Button label",
      default: "Continue",
      description: "Label of the button.",
    },
    /* Message that will be displayed if one or more required questions is not answered. */
    required_message: {
      type: parameterType.STRING,
      pretty_name: "Required message",
      default: "You must choose at least one response for this question"
    },
    /* Setting this to true will enable browser auto-complete or auto-fill for the form. */
    autocomplete: {
      type: parameterType.BOOL,
      pretty_name: "Allow autocomplete",
      default: false
    }
  }
};

type Info = typeof info;

/**
 * jspsych-survey-multi-select
 * a jspsych plugin for multiple choice survey questions
 *
 * documentation: docs.jspsych.org
 *
 */
class SurveyMultiSelectPlugin implements JsPsychPlugin<Info> {
  static info = info;

  constructor(private jsPsych: JsPsych) {};

  trial(display_element: HTMLElement, trial: TrialType<Info>) {
    var plugin_id_name = "jspsych-survey-multi-select";
    var plugin_id_selector = "#" + plugin_id_name;
    const _join = function (...args: Array<string | number>) {
      return args.join("-");
    };

    // inject CSS for trial
    var cssstr =
      ".jspsych-survey-multi-select-question { margin-top: 2em; margin-bottom: 2em; text-align: left; }" +
      ".jspsych-survey-multi-select-text span.required {color: darkred;}" +
      ".jspsych-survey-multi-select-horizontal .jspsych-survey-multi-select-text {  text-align: center;}" +
      ".jspsych-survey-multi-select-option { line-height: 2; }" +
      ".jspsych-survey-multi-select-horizontal .jspsych-survey-multi-select-option {  display: inline-block;  margin-left: 1em;  margin-right: 1em;  vertical-align: top;}" +
      "label.jspsych-survey-multi-select-text input[type='checkbox'] {margin-right: 1em;}";
    display_element.innerHTML = '<style id="jspsych-survey-multi-select-css">' + cssstr + "</style>";

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
      .addEventListener("click", function () {
        for (var i = 0; i < trial.questions.length; i++) {
          if (trial.questions[i].required) {
            if (
              display_element.querySelector("#jspsych-survey-multi-select-" + i + " input:checked") ==
              null
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
      var response_time = endTime - startTime;

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
  };
}

export default SurveyMultiSelectPlugin;
