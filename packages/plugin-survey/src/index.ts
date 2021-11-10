import { JsPsych, JsPsychPlugin, ParameterType, TrialType } from "jspsych";
import {
  QuestionCheckbox,
  QuestionComment,
  QuestionDropdown,
  QuestionMatrix,
  QuestionRadiogroup,
  QuestionRanking,
  QuestionRating,
  QuestionSelectBase,
  StylesManager,
  Survey,
  SurveyTriggerRunExpression,
} from "survey-knockout";

const info = <const>{
  name: "survey",
  parameters: {
    pages: {
      type: ParameterType.COMPLEX, // BOOL, STRING, INT, FLOAT, FUNCTION, KEY, KEYS, SELECT, HTML_STRING, IMAGE, AUDIO, VIDEO, OBJECT, COMPLEX
      default: undefined,
      pretty_name: "Pages",
      array: true,
      nested: {
        /** Question type: one of "drop-down", "html", "likert", "likert-table", "multi-choice", "multi-select", "ranking", "text" */
        type: {
          type: ParameterType.SELECT,
          pretty_name: "Type",
          default: null,
          options: [
            "drop-down",
            "html",
            "likert",
            "likert-table",
            "multi-choice",
            "multi-select",
            "ranking",
            "text",
          ], // TO DO: fix likert-table, fix ranking
        },
        /** Question prompt. */
        prompt: {
          type: ParameterType.HTML_STRING,
          pretty_name: "Prompt",
          default: null,
        },
        /** Whether or not a response to this question must be given in order to continue. For likert-table questions, this applies to all statements in the table. */
        required: {
          type: ParameterType.BOOL,
          pretty_name: "Required",
          default: false,
        },
        /** Name of the question in the trial data. If no name is given, the questions are named P0_Q0, P0_Q1, etc. Names must be unique across pages. */
        name: {
          type: ParameterType.STRING,
          pretty_name: "Question Name",
          default: "",
        },
        /**
         * Likert only: Array of objects that defines the rating scale values.
         * Each object defines a single rating option and must have a "value" property (integer or string).
         * Each object can optionally have a "text" property (string) that contains a different text label that should be displayed for the rating option.
         * If this array is not provided, then the likert_scale_min/max/stepsize values will be used to generate the scale.
         */
        likert_scale_values: {
          type: ParameterType.COMPLEX,
          pretty_name: "Likert scale values",
          default: null,
          array: true,
        },
        /** Likert only: Minimum rating scale value. */
        likert_scale_min: {
          type: ParameterType.INT,
          pretty_name: "Likert scale min",
          default: 1,
        },
        /** Likert only: Maximum rating scale value. */
        likert_scale_max: {
          type: ParameterType.INT,
          pretty_name: "Likert scale max",
          default: 5,
        },
        /** Likert only: Step size for generating rating scale values between the minimum and maximum. */
        likert_scale_stepsize: {
          type: ParameterType.INT,
          pretty_name: "Likert scale step size",
          default: 1,
        },
        /** Likert only: Text description to be shown for the minimum (first) rating option. */
        likert_scale_min_label: {
          type: ParameterType.STRING,
          pretty_name: "Likert scale min label",
          default: null,
        },
        /** Likert only: Text description to be shown for the maximum (last) rating option. */
        likert_scale_max_label: {
          type: ParameterType.STRING,
          pretty_name: "Likert scale max label",
          default: null,
        },
        /** Likert-table only: array of objects, where each object represents a single statement/question to be displayed in a table row. */
        statements: {
          type: ParameterType.COMPLEX,
          pretty_name: "Statements",
          array: true,
          default: null,
          nested: {
            /** Statement text */
            prompt: {
              type: ParameterType.STRING,
              pretty_name: "Prompt",
              default: null,
            },
            /** Identifier for the statement in the trial data. If none is given, the statements will be named "S0", "S1", etc.  */
            name: {
              type: ParameterType.STRING,
              pretty_name: "Name",
              default: null,
            },
          },
        },
        /** Likert-table only: Whether or not to randomize the order of statements (rows) in the likert table. */
        randomize_statement_order: {
          type: ParameterType.BOOL,
          pretty_name: "Randomize statement order",
          default: false,
        },
        /**
         * Drop-down only: Text to be displayed in the drop-down menu as a prompt for making a selection.
         * This text is not a valid answer, so submitting this selection will produce an error if a response is required.
         * For a blank prompt, use a space character (" ").
         */
        dropdown_select_prompt: {
          type: ParameterType.STRING,
          pretty_name: "Drop-down select prompt",
          default: "Choose...",
        },
        /** Drop-down/multi-choice/multi-select/likert-table/ranking only: Array of strings that contains the set of multiple choice options to display for the question. */
        options: {
          type: ParameterType.STRING,
          pretty_name: "Options",
          default: null,
          array: true,
        },
        /** Drop-down/multi-choice/multi-select/ranking only: re-ordering of options array */
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
        /**
         * Drop-down/multi-choice/multi-select/ranking only: Whether or not to include an additional "other" option.
         * If true, an "other" radio/checkbox option will be added on to the list multi-choice/multi-select options.
         * Selecting this option will automatically produce a textbox to allow the participant to write in a response.
         */
        add_other_option: {
          type: ParameterType.BOOL,
          pretty_name: "Add other option",
          default: false,
        },
        /** Drop-down/multi-choice/multi-select/ranking only: If add_other_option is true, then this is the text label for the "other" option. */
        other_option_text: {
          type: ParameterType.BOOL,
          pretty_name: "Other option text",
          default: "Other",
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
        /**
         * All question types except HTML: value of the correct response. If specified, the response will be compared to this value,
         * and an additional data property "correct" will store response accuracy (true or false).
         */
        correct_response: {
          // TO DO: add correct response and accuracy scoring to data
          type: ParameterType.STRING,
          pretty_name: "Correct response",
          default: null,
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
      // TO DO: add auto-complete settings
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
    /** Text to display if a required answer is not responded to. */
    required_error_text: {
      type: ParameterType.STRING,
      pretty_name: "Required error text",
      default: "Please answer the question.",
    },
    /** String to display at the end of required questions. */
    required_question_label: {
      type: ParameterType.STRING,
      pretty_name: "Required question label",
      default: "*",
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
    likert: "rating",
    "likert-table": "matrix",
    "multi-choice": "radiogroup",
    "multi-select": "checkbox",
    ranking: "ranking",
    text: "text",
    comment: "comment", // not listed in the jsPsych docs for simplicity, but needed here for validating question types
  };

  // available parameters for each question type
  private all_question_params_req = ["type", "prompt"];
  private all_question_params_opt = ["name", "required"];
  private all_question_params = [...this.all_question_params_req, ...this.all_question_params_opt];
  private dropdown_params = [
    ...this.all_question_params,
    "options",
    "option_reorder",
    "add_other_option",
    "other_option_text",
    "dropdown_select_prompt",
    "correct_response",
  ];
  private html_params = [...this.all_question_params];
  private likert_params = [
    ...this.all_question_params,
    "likert_scale_values",
    "likert_scale_min",
    "likert_scale_max",
    "likert_scale_stepsize",
    "likert_scale_min_label",
    "likert_scale_max_label",
    "correct_response",
  ];
  private likert_table_params = [
    ...this.all_question_params,
    "statements",
    "options",
    "randomize_statement_order",
    "correct_response",
  ];
  private multichoice_params = [
    ...this.all_question_params,
    "options",
    "option_reorder",
    "columns",
    "add_other_option",
    "other_option_text",
    "correct_response",
  ];
  private text_params = [
    ...this.all_question_params,
    "placeholder",
    "textbox_rows",
    "textbox_columns",
    "correct_response",
  ];

  trial(display_element: HTMLElement, trial: TrialType<Info>) {
    this.display = display_element;
    this.params = trial;
    this.survey = new Survey(); // set up survey in code: https://surveyjs.io/Documentation/Library#survey-objects
    this.applyStyles(); // applies bootstrap theme

    // add custom CSS classes to survey elements
    // https://surveyjs.io/Examples/Library/?id=survey-customcss&platform=Knockoutjs&theme=bootstrap#content-docs
    const jspsych_css = {
      root: "sv_main sv_bootstrap_css jspsych-survey-question",
      question: {
        mainRoot: "sv_qstn jspsych-survey-question",
        flowRoot: "sv_q_flow sv_qstn jspsych-survey-question",
        title: "jspsych-survey-question-prompt",
        requiredText: "sv_q_required_text jspsych-survey-required",
      },
      html: {
        root: "jspsych-survey-html",
      },
      navigationButton: "jspsych-btn jspsych-survey-btn",
      dropdown: {
        control: "jspsych-survey-dropdown",
      },
      error: {
        root: "alert alert-danger jspsych-survey-required",
      },
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

    // required question label
    this.survey.requiredText = this.params.required_question_label;

    // TO DO: add response validation
    this.survey.checkErrorsMode = "onNextPage"; // onValueChanged

    // TO DO: automatic response accuracy scoring for questions with a correctAnswer value
    // see Survey Model onIsAnswerCorrect event
    // https://surveyjs.io/Documentation/Library/?id=SurveyModel#onIsAnswerCorrect

    // pages and questions
    for (let i = 0; i < this.params.pages.length; i++) {
      const page_id = "page" + i.toString();
      const page = this.survey.addNewPage(page_id);
      if (this.params.randomize_question_order) {
        page.questionsOrder = "random"; // TO DO: save question presentation order to data
      }
      for (let j = 0; j < this.params.pages[i].length; j++) {
        const question_params = this.params.pages[i][j];
        // question type validation
        let q_type: string;
        const q_opts: readonly string[] = Object.keys(this.question_type_map);
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
        const question = page.addNewQuestion(q_type);
        question.requiredErrorText = this.params.required_error_text;
        if (typeof question_params.name !== "undefined") {
          question.name = question_params.name;
        } else {
          question.name = "P" + i.toString() + "_Q" + j.toString();
        }
        switch (q_type) {
          case "comment": // text (multiple rows)
            this.setup_text_question(question, question_params);
            break;
          case "dropdown":
            this.setup_dropdown_question(question, question_params);
            break;
          case "html":
            this.setup_html_question(question, question_params);
            break;
          case "matrix": // likert-table
            this.setup_likert_table_question(question, question_params);
            break;
          case "radiogroup": // multi-choice
            this.setup_multichoice_question(question, question_params);
            break;
          case "checkbox": // multi-select
            this.setup_multichoice_question(question, question_params);
            break;
          case "ranking": // ranking
            this.setup_multichoice_question(question, question_params);
            break;
          case "rating": // likert
            this.setup_likert_question(question, question_params);
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

    this.survey.onComplete.add((sender, options) => {
      // clear display
      this.display.innerHTML = "";
      // add default values to any questions without responses
      const all_questions = sender.getAllQuestions();
      const data_names = Object.keys(sender.data);
      all_questions.forEach((question) => {
        if (!data_names.includes(question.name)) {
          if (typeof question.defaultValue !== "undefined" && question.defaultValue !== null) {
            const quest_default = question.defaultValue;
            sender.mergeData({ [question.name]: quest_default });
          } else {
            sender.mergeData({ [question.name]: null });
          }
        }
      });
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
      const supplied_params = Object.keys(supplied);
      const invalid_params = [];
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

  private setup_dropdown_question = (question, question_params) => {
    const req = ["options"];
    const opt = [
      "option_reorder",
      "add_other_option",
      "other_option_text",
      "dropdown_select_prompt",
      "correct_response",
    ];
    this.validate_question_params(
      this.all_question_params_req.concat(req),
      this.all_question_params_opt.concat(opt),
      question_params
    );

    this.set_question_defaults(question_params, this.dropdown_params);

    question.title = question_params.prompt;
    question.isRequired = question_params.required;
    question.hasOther = question_params.add_other_option;
    question.optionsCaption = question_params.dropdown_select_prompt;
    if (question.hasOther) {
      question.otherText = question_params.other_option_text;
    }
    question.choices = question_params.options;
    if (typeof question_params.option_reorder == "undefined") {
      question.choicesOrder = info.parameters.pages.nested.option_reorder.default;
    } else {
      question.choicesOrder = question_params.option_reorder;
    }
    if (question_params.correct_response !== null) {
      question.correctAnswer = question_params.correct_response;
    }
    question.defaultValue = "";
    return question;
  };

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

  private setup_likert_question = (question, question_params) => {
    const req = [];
    const opt = [
      "likert_scale_values",
      "likert_scale_min",
      "likert_scale_max",
      "likert_scale_stepsize",
      "likert_scale_min_label",
      "likert_scale_max_label",
      "correct_response",
    ];
    this.validate_question_params(
      this.all_question_params_req.concat(req),
      this.all_question_params_opt.concat(opt),
      question_params
    );

    this.set_question_defaults(question_params, this.likert_params);

    question.title = question_params.prompt;
    question.isRequired = question_params.required;
    if (question_params.likert_scale_values !== null) {
      question.rateValues = question_params.likert_scale_values;
    } else {
      question.rateMin = question_params.likert_scale_min;
      question.rateMax = question_params.likert_scale_max;
      question.rateStep = question_params.likert_scale_stepsize;
    }
    if (question_params.likert_scale_min_label !== null) {
      question.minRateDescription = question_params.likert_scale_min_label;
    }
    if (question_params.likert_scale_min_label !== null) {
      question.maxRateDescription = question_params.likert_scale_max_label;
    }
    if (question_params.correct_response !== null) {
      question.correctAnswer = question_params.correct_response;
    }
    // TO DO: add likert default value (empty string?: question.defaultValue = "";)
    return question;
  };

  private setup_likert_table_question = (question, question_params) => {
    const req = ["options", "statements"];
    const opt = ["randomize_statement_order", "correct_response"];
    this.validate_question_params(
      this.all_question_params_req.concat(req),
      this.all_question_params_opt.concat(opt),
      question_params
    );

    this.set_question_defaults(question_params, this.likert_table_params);

    question.title = question_params.prompt;
    question.isAllRowRequired = question_params.required;
    question.columns = [];
    question_params.options.forEach((opt: string, ind: number) => {
      question.columns.push({ value: ind, text: opt });
    });
    question.rows = [];
    question_params.statements.forEach((stmt: { name: string; prompt: string }) => {
      question.rows.push({ value: stmt.name, text: stmt.prompt });
    });
    question.rowsOrder = question_params.randomize_statement_order ? "random" : "initial";
    if (question_params.correct_response !== null) {
      question.correctAnswer = question_params.correct_response;
    }
    // TO DO: add likert-table default value (empty array?: question.defaultValue = [];)
    return question;
  };

  // multi-choice, multi-select, ranking
  private setup_multichoice_question = (question, question_params) => {
    const req = ["options"];
    const opt = [
      "columns",
      "option_reorder",
      "add_other_option",
      "other_option_text",
      "correct_response",
    ];
    this.validate_question_params(
      this.all_question_params_req.concat(req),
      this.all_question_params_opt.concat(opt),
      question_params
    );

    this.set_question_defaults(question_params, this.multichoice_params);

    question.title = question_params.prompt;
    question.isRequired = question_params.required;
    question.hasOther = question_params.add_other_option;
    if (question.hasOther) {
      question.otherText = question_params.other_option_text;
    }
    question.choices = question_params.options;
    if (typeof question_params.option_reorder == "undefined") {
      question.choicesOrder = info.parameters.pages.nested.option_reorder.default;
    } else {
      question.choicesOrder = question_params.option_reorder;
    }
    question.colCount = question_params.columns;
    if (question_params.correct_response !== null) {
      question.correctAnswer = question_params.correct_response;
    }
    if (question instanceof QuestionRadiogroup) {
      question.defaultValue = "";
    } else if (question instanceof QuestionCheckbox) {
      question.defaultValue = [];
    }
    return question;
  };

  private setup_text_question = (question, question_params) => {
    const req = [];
    const opt = ["placeholder", "textbox_rows", "textbox_columns", "correct_response"];
    this.validate_question_params(
      this.all_question_params_req.concat(req),
      this.all_question_params_opt.concat(opt),
      question_params
    );

    this.set_question_defaults(question_params, this.text_params);

    question.title = question_params.prompt;
    question.isRequired = question_params.required;
    question.placeHolder = question_params.placeholder;
    if (question_params.correct_response !== null) {
      question.correctAnswer = question_params.correct_response;
    }
    if (question instanceof QuestionComment) {
      question.rows = question_params.textbox_rows;
      question.cols = question_params.textbox_columns;
    } else {
      question.size = question_params.textbox_columns;
    }
    question.defaultValue = "";
    return question;
  };
}

export default SurveyPlugin;
