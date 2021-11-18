import { JsPsych, JsPsychPlugin, ParameterType, TrialType } from "jspsych";

const info = <const>{
  name: "survey-likert",
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
        /** Array of likert labels to display for this question. */
        labels: {
          type: ParameterType.STRING,
          array: true,
          pretty_name: "Labels",
          default: undefined,
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
    /** Width of the likert scales in pixels. */
    scale_width: {
      type: ParameterType.INT,
      pretty_name: "Scale width",
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
 * **survey-likert**
 *
 * jsPsych plugin for gathering responses to questions on a likert scale
 *
 * @author Josh de Leeuw
 * @see {@link https://www.jspsych.org/plugins/jspsych-survey-likert/ survey-likert plugin documentation on jspsych.org}
 */
class SurveyLikertPlugin implements JsPsychPlugin<Info> {
  static info = info;

  constructor(private jsPsych: JsPsych) {}

  trial(display_element: HTMLElement, trial: TrialType<Info>) {
    if (trial.scale_width !== null) {
      var w = trial.scale_width + "px";
    } else {
      var w = "100%";
    }

    var html = "";
    // inject CSS for trial
    html += '<style id="jspsych-survey-likert-css">';
    html +=
      ".jspsych-survey-likert-statement { display:block; font-size: 16px; padding-top: 40px; margin-bottom:10px; }" +
      ".jspsych-survey-likert-opts { list-style:none; width:" +
      w +
      "; margin:auto; padding:0 0 35px; display:block; font-size: 14px; line-height:1.1em; }" +
      ".jspsych-survey-likert-opt-label { line-height: 1.1em; color: #444; }" +
      ".jspsych-survey-likert-opts:before { content: ''; position:relative; top:11px; /*left:9.5%;*/ display:block; background-color:#efefef; height:4px; width:100%; }" +
      ".jspsych-survey-likert-opts:last-of-type { border-bottom: 0; }" +
      ".jspsych-survey-likert-opts li { display:inline-block; /*width:19%;*/ text-align:center; vertical-align: top; }" +
      ".jspsych-survey-likert-opts li input[type=radio] { display:block; position:relative; top:0; left:50%; margin-left:-6px; }";
    html += "</style>";

    // show preamble text
    if (trial.preamble !== null) {
      html +=
        '<div id="jspsych-survey-likert-preamble" class="jspsych-survey-likert-preamble">' +
        trial.preamble +
        "</div>";
    }

    if (trial.autocomplete) {
      html += '<form id="jspsych-survey-likert-form">';
    } else {
      html += '<form id="jspsych-survey-likert-form" autocomplete="off">';
    }

    // add likert scale questions ///
    // generate question order. this is randomized here as opposed to randomizing the order of trial.questions
    // so that the data are always associated with the same question regardless of order
    var question_order = [];
    for (var i = 0; i < trial.questions.length; i++) {
      question_order.push(i);
    }
    if (trial.randomize_question_order) {
      question_order = this.jsPsych.randomization.shuffle(question_order);
    }

    for (var i = 0; i < trial.questions.length; i++) {
      var question = trial.questions[question_order[i]];
      // add question
      html += '<label class="jspsych-survey-likert-statement">' + question.prompt + "</label>";
      // add options
      var width = 100 / question.labels.length;
      var options_string =
        '<ul class="jspsych-survey-likert-opts" data-name="' +
        question.name +
        '" data-radio-group="Q' +
        question_order[i] +
        '">';
      for (var j = 0; j < question.labels.length; j++) {
        options_string +=
          '<li style="width:' +
          width +
          '%"><label class="jspsych-survey-likert-opt-label"><input type="radio" name="Q' +
          question_order[i] +
          '" value="' +
          j +
          '"';
        if (question.required) {
          options_string += " required";
        }
        options_string += ">" + question.labels[j] + "</label></li>";
      }
      options_string += "</ul>";
      html += options_string;
    }

    // add submit button
    html +=
      '<input type="submit" id="jspsych-survey-likert-next" class="jspsych-survey-likert jspsych-btn" value="' +
      trial.button_label +
      '"></input>';

    html += "</form>";

    display_element.innerHTML = html;

    display_element.querySelector("#jspsych-survey-likert-form").addEventListener("submit", (e) => {
      e.preventDefault();
      // measure response time
      var endTime = performance.now();
      var response_time = Math.round(endTime - startTime);

      // create object to hold responses
      var question_data = {};
      var matches = display_element.querySelectorAll<HTMLFormElement>(
        "#jspsych-survey-likert-form .jspsych-survey-likert-opts"
      );
      for (var index = 0; index < matches.length; index++) {
        var id = matches[index].dataset["radioGroup"];
        var el = display_element.querySelector<HTMLInputElement>(
          'input[name="' + id + '"]:checked'
        );
        if (el === null) {
          var response: string | number = "";
        } else {
          var response: string | number = parseInt(el.value);
        }
        var obje = {};
        if (matches[index].attributes["data-name"].value !== "") {
          var name = matches[index].attributes["data-name"].value;
        } else {
          var name = id;
        }
        obje[name] = response;
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
      question_data[name] = this.jsPsych.randomization.randomInt(0, q.labels.length - 1);
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
          `input[type="radio"][name="${answers[i][0]}"][value="${answers[i][1]}"]`
        ),
        ((data.rt - 1000) / answers.length) * (i + 1)
      );
    }

    this.jsPsych.pluginAPI.clickTarget(
      display_element.querySelector("#jspsych-survey-likert-next"),
      data.rt
    );
  }
}

export default SurveyLikertPlugin;
