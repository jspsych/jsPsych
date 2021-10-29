import { JsPsych, JsPsychPlugin, ParameterType, TrialType } from "jspsych";
import { QuestionComment, StylesManager, Survey } from "survey-knockout";
import { require } from "yargs";

const info = <const>{
  name: "survey",
  parameters: {
    pages: {
      type: ParameterType.COMPLEX, // BOOL, STRING, INT, FLOAT, FUNCTION, KEY, KEYS, SELECT, HTML_STRING, IMAGE, AUDIO, VIDEO, OBJECT, COMPLEX
      default: undefined,
      pretty_name: "Pages",
      array: true,
      nested: {
        /** Question type: one of "drop-down", "html", "likert", "multi-choice", "multi-select", "ranking", "rating", "text" */
        type: {
          type: ParameterType.SELECT,
          pretty_name: "Type",
          default: null,
          options: ["html", "text", "multi-choice", "multi-select"], // TO DO: other types
        },
        /** Question prompt. */
        prompt: {
          type: ParameterType.HTML_STRING,
          pretty_name: "Prompt",
          default: null,
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
          default: null,
          array: true,
        },
        /** Multi-choice/multi-select only: re-ordering of options array */
        option_reorder: {
          type: ParameterType.SELECT,
          pretty_name: "Option reorder",
          options: ["none", "asc", "desc", "random"],
          default: "none",
        },
        /**
         * Multi-choice/multi-select only: The number of columns that should be used for displaying the options.
         * If 1 (default), the choices will be displayed in a single column (vertically).
         * If 0, choices will be displayed in a single row (horizontally).
         * Any value greater than 1 can be used to display options in multiple columns.
         */
        columns: {
          type: ParameterType.INT,
          pretty_name: "Columns",
          default: 1,
        },
        /** Text only: Placeholder text in the response text box. */
        placeholder: {
          type: ParameterType.STRING,
          pretty_name: "Placeholder",
          default: "",
        },
        /** Text only: The number of rows (height) for the response text box. */
        textbox_rows: {
          type: ParameterType.INT,
          pretty_name: "Textbox rows",
          default: 1,
        },
        /** Text only: The number of columns (width) for the response text box. */
        textbox_columns: {
          type: ParameterType.INT,
          pretty_name: "Textbox columns",
          default: 40,
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
  private display: HTMLElement;
  private params: TrialType<Info>;
  private start_time: number;
  private survey;

  constructor(private jsPsych: JsPsych) {}

  applyStyles() {
    StylesManager.applyTheme("bootstrap");
    // https://surveyjs.io/Examples/Library/?id=custom-theme
  }

  // map jsPsych question types onto SurveyJS question types
  readonly question_type_map: { [key: string]: string } = {
    "drop-down": "dropdown",
    html: "html",
    likert: "matrix",
    "multi-choice": "radiogroup",
    "multi-select": "checkbox",
    ranking: "ranking",
    rating: "rating",
    text: "text",
    comment: "comment", // not listed in the jsPsych docs for simplicity, but needed here for validating question types
  };

  // available parameters for each question type
  private all_question_params_req = ["type", "prompt"];
  private all_question_params_opt = ["name", "required"];
  private all_question_params = this.all_question_params_req.concat(this.all_question_params_opt);
  private drowdown_params = this.all_question_params.concat([]);
  private html_params = this.all_question_params.concat([]);
  private likert_params = this.all_question_params.concat([]);
  private multichoice_params = this.all_question_params.concat([
    "options",
    "option_reorder",
    "columns",
  ]);
  private multiselect_params = this.all_question_params.concat([
    "options",
    "option_reorder",
    "columns",
  ]);
  private ranking_params = this.all_question_params.concat([]);
  private rating_params = this.all_question_params.concat([]);
  private text_params = this.all_question_params.concat([
    "placeholder",
    "textbox_rows",
    "textbox_columns",
  ]);

  // TO DO:
  // - add other and none options to multi-choice/select
  trial(display_element: HTMLElement, trial: TrialType<Info>) {
    this.display = display_element;
    this.params = trial;
    this.survey = new Survey(); // set up survey in code: https://surveyjs.io/Documentation/Library#survey-objects
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

    // navigation buttons
    this.survey.pagePrevText = this.params.button_label_back;
    this.survey.pageNextText = this.params.button_label_next;
    this.survey.completeText = this.params.button_label_finish;

    // page numbers
    this.survey.showQuestionNumbers = this.params.show_question_numbers;

    // survey title
    if (this.params.title !== null) {
      this.survey.title = this.params.title;
    }

    // pages and questions
    for (let i = 0; i < this.params.pages.length; i++) {
      let page_id = "page" + i.toString();
      let page = this.survey.addNewPage(page_id);
      if (this.params.randomize_question_order) {
        page.questionsOrder = "random"; // TO DO: save question presentation order to data
      }
      for (let j = 0; j < this.params.pages[i].length; j++) {
        let question_params = this.params.pages[i][j];
        // question type validation
        let q_type: string;
        let q_opts: readonly string[] = Object.keys(this.question_type_map);
        if (typeof question_params.type == "undefined") {
          throw new Error(
            'Error in survey plugin: question is missing the required "type" parameter.'
          );
        } else if (!q_opts.includes(question_params.type)) {
          throw new Error(
            'Error in survey plugin: invalid question type "' + question_params.type + '".'
          );
        } else {
          q_type = this.question_type_map[question_params.type];
        }
        if (q_type == "text" && question_params.textbox_rows > 1) {
          q_type = "comment";
        }
        // set up question
        let question = page.addNewQuestion(q_type);
        question.name = "p" + i.toString() + "_q" + j.toString();
        switch (q_type) {
          case "comment": // text (multiple rows)
            this.setup_text_question(question, question_params);
            break;
          case "dropdown":
            break;
          case "html":
            this.setup_html_question(question, question_params);
            break;
          case "matrix": // likert
            break;
          case "radiogroup": // multi-choice
            this.setup_multichoice_question(question, question_params);
            break;
          case "checkbox": // multi-select
            this.setup_multichoice_question(question, question_params);
            break;
          case "ranking": // ranking
            break;
          case "rating": // rating
            break;
          case "text": // text (single row)
            this.setup_text_question(question, question_params);
            break;
        }
      }
    }

    // apply jsPsych-specific CSS
    this.survey.css = jspsych_css;

    // render the survey and record start time
    this.survey.render(this.display);

    this.start_time = performance.now();

    this.survey.onComplete.add((sender) => {
      // clear display
      this.display.innerHTML = "";
      // save the data
      // TO DO: save empty responses to data
      this.jsPsych.finishTrial({
        rt: Math.round(performance.now() - this.start_time),
        response: sender.data,
      });
    });
  }

  // method for validating parameters for each question type
  private validate_question_params = (
    required: string[],
    optional: string[],
    supplied: { [key: string]: unknown }
  ) => {
    let valid = true;
    if (required.length > 0) {
      required.forEach((param) => {
        if (!supplied.hasOwnProperty(param)) {
          valid = false;
          if (param == "type") {
            throw new Error(
              'Error in survey plugin: question is missing the required "type" parameter.'
            );
          } else {
            throw new Error(
              'Error in survey plugin: question is missing required parameter "' +
                param +
                '" for question type "' +
                supplied.type +
                '".'
            );
          }
        }
      });
    }
    if (optional.length > 0) {
      let supplied_params = Object.keys(supplied);
      let invalid_params = [];
      supplied_params.forEach((param: string) => {
        if (!(optional.includes(param) || required.includes(param))) {
          invalid_params.push(param);
        }
      });
      if (invalid_params.length > 0) {
        console.warn(
          'Warning in survey plugin: the following question parameters have been specified but are not allowed for the question type "' +
            supplied.type +
            '" and will be ignored: ' +
            invalid_params
        );
      }
    }
    if (valid) {
      return true;
    } else {
      return false;
    }
  };

  // method for setting defaults for undefined question-specific parameters
  private set_question_defaults = (
    supplied_params: { [key: string]: unknown },
    available_params: string[]
  ) => {
    available_params.forEach((param) => {
      if (typeof supplied_params[param] === "undefined") {
        supplied_params[param] = info.parameters.pages.nested[param].default;
      }
    });
    return supplied_params;
  };

  // methods for setting up different question types
  private setup_dropdown_question = () => {};

  private setup_html_question = (question, question_params) => {
    const req = [];
    const opt = [];
    this.validate_question_params(
      this.all_question_params_req.concat(req),
      this.all_question_params_opt.concat(opt),
      question_params
    );

    this.set_question_defaults(question_params, this.html_params);

    question.html = question_params.prompt;
    return question;
  };

  private setup_likert_question = () => {};

  private setup_multichoice_question = (question, question_params) => {
    const req = ["options"];
    const opt = ["columns", "option_reorder"];
    this.validate_question_params(
      this.all_question_params_req.concat(req),
      this.all_question_params_opt.concat(opt),
      question_params
    );

    this.set_question_defaults(question_params, this.multichoice_params);

    question.title = question_params.prompt;
    question.isRequired = question_params.required;
    question.choices = question_params.options;
    if (typeof question_params.option_reorder == "undefined") {
      question.choicesOrder = info.parameters.pages.nested.option_reorder.default;
    } else {
      question.choicesOrder = question_params.option_reorder;
    }
    question.colCount = question_params.columns;
    return question;
  };

  private setup_ranking_question = () => {};

  private setup_rating_question = () => {};

  private setup_text_question = (question, question_params) => {
    const req = [];
    const opt = ["placeholder", "textbox_rows", "textbox_columns"];
    this.validate_question_params(
      this.all_question_params_req.concat(req),
      this.all_question_params_opt.concat(opt),
      question_params
    );

    this.set_question_defaults(question_params, this.text_params);

    question.title = question_params.prompt;
    question.isRequired = question_params.required;
    question.placeHolder = question_params.placeholder;
    if (question instanceof QuestionComment) {
      question.rows = question_params.textbox_rows;
      question.cols = question_params.textbox_columns;
    } else {
      question.size = question_params.textbox_columns;
    }
    return question;
  };
}

export default SurveyPlugin;
