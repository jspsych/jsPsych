import { JsPsych, JsPsychPlugin, ParameterType, TrialType } from "jspsych";
import { StylesManager, Survey } from "survey-knockout";

const info = <const>{
  name: "survey",
  parameters: {
    pages: {
      type: ParameterType.COMPLEX, // BOOL, STRING, INT, FLOAT, FUNCTION, KEY, KEYS, SELECT, HTML_STRING, IMAGE, AUDIO, VIDEO, OBJECT, COMPLEX
      default: null, //undefined,
      pretty_name: "Pages",
      array: true,
      nested: {
        /** Question type: one of "drop-down", "html", "likert", "multi-choice", "multi-select", "ranking", "rating", "text" */
        type: {
          type: ParameterType.SELECT,
          pretty_name: "Type",
          default: null, //undefined,
          options: ["html", "text"], // TO DO: other types
        },
        /** Question prompt. */
        prompt: {
          type: ParameterType.HTML_STRING,
          pretty_name: "Prompt",
          default: null, //undefined,
        },
        /** Whether or not a response to this question must be given in order to continue. */
        required: {
          type: ParameterType.BOOL, // TO DO
          pretty_name: "Required",
          default: false,
        },
        /** Name of the question in the trial data. If no name is given, the questions are named Q0, Q1, etc. */
        name: {
          type: ParameterType.STRING, // TO DO
          pretty_name: "Question Name",
          default: "",
        },
        /** Multi-choice only: Array of strings that contains the set of multiple choice options to display for the question. */
        options: {
          type: ParameterType.STRING, // TO DO
          pretty_name: "Options",
          default: null, // TO DO: how to make this undefined for certain question types?
          array: true,
        },
        /** Multi-choice only: If true, then the question is centered and the options are displayed horizontally. */
        horizontal: {
          type: ParameterType.BOOL, // TO DO
          pretty_name: "Horizontal",
          default: false,
        },
        /** Text only: Placeholder text in the response text box. */
        placeholder: {
          type: ParameterType.STRING, // TO DO
          pretty_name: "Placeholder",
          default: "",
        },
        /** Text only: The number of rows for the response text box. */
        rows: {
          type: ParameterType.INT, // TO DO
          pretty_name: "Rows",
          default: 1,
        },
        /** Text only: The number of columns for the response text box. */
        columns: {
          type: ParameterType.INT, // TO DO
          pretty_name: "Columns",
          default: 40,
        },
      },
    },
    /** If true, the order of the questions in each of the 'pages' arrays will be randomized. */
    randomize_question_order: {
      // TO DO
      type: ParameterType.BOOL,
      pretty_name: "Randomize order",
      default: false,
    },
    /** Label of the button to move forward thorugh survey pages. */
    button_label_next: {
      type: ParameterType.STRING,
      pretty_name: "Next button label",
      default: "Next",
    },
    /** Label of the button to move backward through survey pages. */
    button_label_back: {
      type: ParameterType.STRING,
      pretty_name: "Back button label",
      default: "Back",
    },
    /** Label of the button to submit responses. */
    button_label_finish: {
      type: ParameterType.STRING,
      pretty_name: "Finish button label",
      default: "Finish",
    },
    /** Setting this to true will enable browser auto-complete or auto-fill for the form. */
    autocomplete: {
      // TO DO
      type: ParameterType.BOOL,
      pretty_name: "Allow autocomplete",
      default: false,
    },
    /**
     * Whether or not to show numbers next to each question prompt. Options are:
     * "on": questions will be labelled starting with "1." on the first page, and numbering will continue across pages.
     * "onPage": questions will be labelled starting with "1.", with separate numbering on each page.
     * "off": no question numbering.
     */
    show_question_numbers: {
      type: ParameterType.SELECT,
      pretty_name: "Show question numbers",
      default: "off",
      options: ["on", "onPage", "off"],
    },
  },
};

type Info = typeof info;

/**
 * **survey**
 *
 * jsPsych plugin for presenting survey questions (questionnaires) - SurveyJS version
 *
 * @author Becky Gilbert
 * @see {@link https://www.jspsych.org/plugins/survey/ survey plugin documentation on jspsych.org}
 */
class SurveyPlugin implements JsPsychPlugin<Info> {
  static info = info;

  constructor(private jsPsych: JsPsych) {}

  applyStyles() {
    StylesManager.applyTheme("bootstrap");
    // https://surveyjs.io/Examples/Library/?id=custom-theme
  }

  // keys as strings so that the question types can have hyphens
  readonly question_type_map: { [key: string]: string } = {
    "drop-down": "dropdown",
    html: "html",
    likert: "matrix",
    "multi-choice": "radiogroup",
    "multi-select": "checkbox",
    ranking: "ranking",
    rating: "rating",
    text: "text",
  };

  trial(display_element: HTMLElement, trial: TrialType<Info>) {
    this.applyStyles();

    // apply jsPsych CSS
    // TO DO: add CSS class for question prompts etc., need a new class for this (jspsych-display-element adds other stuff that causes problems)
    // add to this object in a modular way (by question type)?
    const jspsych_css = {
      question: {
        title: "jspsych-display-element",
      },
      navigationButton: "jspsych-btn",
    };

    // https://surveyjs.io/Documentation/Library#survey-objects
    // set up in code
    const survey = new Survey();

    // navigation buttons
    survey.pagePrevText = trial.button_label_back;
    survey.pageNextText = trial.button_label_next;
    survey.completeText = trial.button_label_finish;

    // page numbers
    survey.showQuestionNumbers = trial.show_question_numbers;

    // pages and questions
    for (let i = 0; i < trial.pages.length; i++) {
      let page_id = "page" + i.toString();
      let page = survey.addNewPage(page_id);
      for (let j = 0; j < trial.pages[i].length; j++) {
        // TO DO: move question set-up to modular question-type methods
        let q_type = this.question_type_map[trial.pages[i][j].type];
        if (q_type == "text" && trial.pages[i][j].rows > 1) {
          q_type = "comment";
        }
        let question = page.addNewQuestion(q_type);
        question.name = "p" + i.toString() + "_q" + j.toString();
        if (q_type == "html") {
          question.html = trial.pages[i][j].prompt;
        } else {
          question.title = trial.pages[i][j].prompt;
        }
      }
    }

    // set up survey structure via JS object
    // var json = {
    //   pages: [
    //     {
    //       name: "page1",
    //       elements: [
    //         { type: "text", name: "question1", title: "Question 1" }
    //       ]
    //     },
    //     {
    //       name: "page2",
    //       elements: [
    //         { type: "text", name: "question2", title: "Question 2" }
    //       ]
    //     }
    //   ]
    // }
    // var survey = new Survey(json);

    // apply jsPsych-specific CSS
    survey.css = jspsych_css;

    // render the survey
    survey.render(display_element);

    const startTime = performance.now();

    // function called when survey is submitted
    survey.onComplete.add((sender) => {
      // clear display
      display_element.innerHTML = "";
      // save the data
      this.jsPsych.finishTrial({
        rt: Math.round(performance.now() - startTime),
        response: sender.data,
      });
    });
  }
}

export default SurveyPlugin;
