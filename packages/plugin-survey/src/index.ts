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
          options: ["html", "text", "multi-choice", "multi-select"], // TO DO: other types
        },
        /** Question prompt. */
        prompt: {
          type: ParameterType.HTML_STRING,
          pretty_name: "Prompt",
          default: null, // TO DO: undefined for HTML questions
        },
        /** Whether or not a response to this question must be given in order to continue. */
        required: {
          type: ParameterType.BOOL,
          pretty_name: "Required",
          default: false,
        },
        /** Name of the question in the trial data. If no name is given, the questions are named Q0, Q1, etc. */
        name: {
          type: ParameterType.STRING, // TO DO
          pretty_name: "Question Name",
          default: "",
        },
        /** Multi-choice/multi-select only: Array of strings that contains the set of multiple choice options to display for the question. */
        options: {
          type: ParameterType.STRING,
          pretty_name: "Options",
          default: null, // TO DO: undefined for multi-choice/multi-select
          array: true,
        },
        /** Multi-choice/multi-select only: re-ordering of options array */
        option_reorder: {
          type: ParameterType.SELECT,
          pretty_name: "Option reorder",
          options: ["none", "asc", "desc", "random"],
          default: "none",
        },
        /** Text only: Placeholder text in the response text box. */
        placeholder: {
          type: ParameterType.STRING,
          pretty_name: "Placeholder",
          default: "",
        },
        /** Text only: The number of rows for the response text box. */
        rows: {
          type: ParameterType.INT,
          pretty_name: "Rows",
          default: 1,
        },
        /**
         * Text: The number of columns for the response text box.
         * Multi-choice/multi-select: The number of columns
         */
        columns: {
          type: ParameterType.INT,
          pretty_name: "Columns",
          default: 40, // TO DO: different defaults for text vs multi choice/select, or use different parameter names
        },
      },
    },
    /** Whether or not to randomize the question order on each page */
    randomize_question_order: {
      type: ParameterType.BOOL,
      pretty_name: "Randomize question order",
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
    /**
     * HTML-formatted text to be shown at the top of the survey pages. This also provides a method for fixing any arbitrary text to the top of the page when
     * randomizing the question order, since HTML question types are also randomized.
     */
    title: {
      type: ParameterType.STRING,
      pretty_name: "Title",
      default: null,
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

  // map jsPsych question types onto SurveyJS question types (keys as strings so that the question types can have hyphens)
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

  // TO DO:
  // - move the setup functions outside of the trial method?
  // - add other and none options to multi-choice/select
  trial(display_element: HTMLElement, trial: TrialType<Info>) {
    this.applyStyles(); // applies bootstrap theme

    // add custom CSS classes to survey elements
    // https://surveyjs.io/Examples/Library/?id=survey-customcss&platform=Knockoutjs&theme=bootstrap#content-docs
    const jspsych_css = {
      question: {
        title: "jspsych-survey-question-prompt",
      },
      html: {
        root: "jspsych-survey-html",
      },
      navigationButton: "jspsych-btn jspsych-survey-btn",
    };

    // functions for setting up different question types
    const setup_dropdown_question = () => {};
    const setup_html_question = (question, question_params) => {
      // required: prompt
      question.html = question_params.prompt;
      return question;
    };
    const setup_likert_question = () => {};
    const setup_multichoice_question = (question, question_params) => {
      // required: options
      // optional: columns, option_reorder
      question.title = question_params.prompt;
      question.isRequired = question_params.required;
      question.choices = question_params.options;
      if (typeof question_params.option_reorder == "undefined") {
        question.choicesOrder = info.parameters.pages.nested.option_reorder.default; // TO DO: is this how to get the default value from parameter info?
      } else {
        question.choicesOrder = question_params.option_reorder;
      }
      question.colCount = question_params.columns;
      return question;
    };

    const setup_ranking_question = () => {};
    const setup_rating_question = () => {};
    const setup_text_question = (question, question_params) => {
      // optional: placeholder, rows, columns
      question.title = question_params.prompt;
      question.isRequired = question_params.required;
      question.placeHolder = question_params.placeholder;
      if (question.type == "comment") {
        question.rows = question_params.rows;
        question.cols = question_params.columns;
      } else {
        question.size = question_params.columns;
      }
      return question;
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

    // survey title
    if (trial.title !== null) {
      survey.title = trial.title;
    }

    // pages and questions
    for (let i = 0; i < trial.pages.length; i++) {
      let page_id = "page" + i.toString();
      let page = survey.addNewPage(page_id);
      if (trial.randomize_question_order) {
        page.questionsOrder = "random"; // TO DO: save question presentation order to data
      }
      for (let j = 0; j < trial.pages[i].length; j++) {
        let question_params = trial.pages[i][j];
        let q_type = this.question_type_map[question_params.type];
        if (q_type == "text" && question_params.rows > 1) {
          q_type = "comment";
        }
        let question = page.addNewQuestion(q_type);
        question.name = "p" + i.toString() + "_q" + j.toString();
        switch (q_type) {
          case "comment": // text (multiple rows)
            setup_text_question(question, question_params);
            break;
          case "dropdown":
            break;
          case "html":
            setup_html_question(question, question_params);
            break;
          case "matrix": // likert
            break;
          case "radiogroup": // multi-choice
            setup_multichoice_question(question, question_params);
            break;
          case "checkbox": // multi-select
            setup_multichoice_question(question, question_params);
            break;
          case "ranking": // ranking
            break;
          case "rating": // rating
            break;
          case "text": // text (single row)
            setup_text_question(question, question_params);
            break;
          default:
            console.error('Error in survey plugin: invalid question type "', q_type, '"');
        }
      }
    }

    // for reference: how to set up survey structure via JS object
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
