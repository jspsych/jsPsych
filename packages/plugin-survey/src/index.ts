import { JsPsych, JsPsychPlugin, ParameterType, TrialType } from "jspsych";
import {
  QuestionCheckbox,
  QuestionComment,
  QuestionDropdown,
  QuestionHtml,
  QuestionMatrix,
  QuestionRadiogroup,
  QuestionRanking,
  QuestionRating,
  QuestionText,
  StylesManager,
  Survey,
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
         * Text only: Type for the HTML <input> element.
         * The `input_type` parameter must be one of "color", "date", "datetime-local", "email", "month", "number", "password", "range", "tel", "text", "time", "url", "week".
         * If the `textbox_rows` parameter is larger than 1, the `input_type` parameter will be ignored.
         * The `textbox_columns` parameter only affects questions with `input_type` "email", "password", "tel", "url", or "text".
         */
        input_type: {
          type: ParameterType.SELECT,
          pretty_name: "Input type",
          default: "text",
          options: [
            "color",
            "date",
            "datetime-local",
            "email",
            "month",
            "number",
            "password",
            "range",
            "tel",
            "text",
            "time",
            "url",
            "week",
          ],
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

// available parameters for each question type
const all_question_params_req = ["type", "prompt"];
const all_question_params_opt = ["name", "required"];
const all_question_params = [...all_question_params_req, ...all_question_params_opt];
const dropdown_params = [
  ...all_question_params,
  "options",
  "option_reorder",
  "add_other_option",
  "other_option_text",
  "dropdown_select_prompt",
  "correct_response",
];
const html_params = [...all_question_params];
const likert_params = [
  ...all_question_params,
  "likert_scale_values",
  "likert_scale_min",
  "likert_scale_max",
  "likert_scale_stepsize",
  "likert_scale_min_label",
  "likert_scale_max_label",
  "correct_response",
];
const likert_table_params = [
  ...all_question_params,
  "statements",
  "options",
  "randomize_statement_order",
  "correct_response",
];
const multichoice_params = [
  ...all_question_params,
  "options",
  "option_reorder",
  "columns",
  "add_other_option",
  "other_option_text",
  "correct_response",
];
const text_params = [
  ...all_question_params,
  "placeholder",
  "textbox_rows",
  "textbox_columns",
  "input_type",
  "correct_response",
];

const question_types = [
  "drop-down",
  "html",
  "likert",
  "likert-table",
  "multi-choice",
  "multi-select",
  "ranking",
  "text",
  "comment",
];

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
  private survey: Survey;
  private trial_data: any = {};

  constructor(private jsPsych: JsPsych) {}

  applyStyles() {
    // https://surveyjs.io/Examples/Library/?id=custom-theme
    const colors = StylesManager.ThemeColors["default"];

    colors["$background-dim"] = "#f3f3f3";
    colors["$body-background-color"] = "white";
    colors["$body-container-background-color"] = "white";
    colors["$border-color"] = "#e7e7e7";
    colors["$disable-color"] = "#dbdbdb";
    colors["$disabled-label-color"] = "rgba(64, 64, 64, 0.5)";
    colors["$disabled-slider-color"] = "#cfcfcf";
    colors["$disabled-switch-color"] = "#9f9f9f";
    colors["$error-background-color"] = "#fd6575";
    colors["$error-color"] = "#ed5565";
    colors["$foreground-disabled"] = "#161616";
    //colors['$foreground-light'] = "orange"
    colors["$header-background-color"] = "white";
    colors["$header-color"] = "#6d7072";
    colors["$inputs-background-color"] = "white";
    colors["$main-color"] = "#919191";
    colors["$main-hover-color"] = "#6b6b6b";
    colors["$progress-buttons-color"] = "#8dd9ca";
    colors["$progress-buttons-line-color"] = "#d4d4d4";
    colors["$progress-text-color"] = "#9d9d9d";
    colors["$slider-color"] = "white";
    colors["$text-color"] = "#6d7072";
    colors["$text-input-color"] = "#6d7072";

    StylesManager.applyTheme();
  }

  trial(display_element: HTMLElement, trial: TrialType<Info>) {
    this.survey = new Survey(); // set up survey in code: https://surveyjs.io/Documentation/Library#survey-objects
    this.applyStyles(); // applies bootstrap theme

    // add custom CSS classes to survey elements
    // https://surveyjs.io/Examples/Library/?id=survey-customcss&platform=Knockoutjs&theme=bootstrap#content-docs
    this.survey.css = {
      //   root: "sv_main sv_bootstrap_css jspsych-survey-question",
      //   question: {
      //     mainRoot: "sv_qstn jspsych-survey-question",
      //     flowRoot: "sv_q_flow sv_qstn jspsych-survey-question",
      //     title: "jspsych-survey-question-prompt",
      //     requiredText: "sv_q_required_text jspsych-survey-required",
      //   },
      //   html: {
      //     root: "jspsych-survey-html",
      //   },
      //   navigationButton: "jspsych-btn jspsych-survey-btn",
      //   dropdown: {
      //     control: "jspsych-survey-dropdown",
      //   },
      //   error: {
      //     root: "alert alert-danger jspsych-survey-required",
      //   },
    };

    // navigation buttons
    this.survey.pagePrevText = trial.button_label_back;
    this.survey.pageNextText = trial.button_label_next;
    this.survey.completeText = trial.button_label_finish;

    // page numbers
    this.survey.showQuestionNumbers = trial.show_question_numbers;

    // survey title
    if (trial.title !== null) {
      this.survey.title = trial.title;
    }

    // required question label
    this.survey.requiredText = trial.required_question_label;

    // TO DO: add response validation
    this.survey.checkErrorsMode = "onNextPage"; // onValueChanged

    // initialize trial data
    this.trial_data.accuracy = [];
    this.trial_data.question_order = [];

    // response scoring function
    const score_response = (sender, options) => {
      if (options.question?.correctAnswer) {
        this.trial_data.accuracy.push({
          [options.name]: options.question.correctAnswer == options.value,
        });
      }
    };

    // pages and questions
    for (const [pageIndex, questions] of trial.pages.entries()) {
      const page = this.survey.addNewPage(`page${pageIndex}`);

      if (trial.randomize_question_order) {
        page.questionsOrder = "random"; // TO DO: save question presentation order to data
      }
      for (const [questionIndex, question_params] of (questions as any[]).entries()) {
        let question_type = question_params.type;

        if (typeof question_type === "undefined") {
          throw new Error(
            'Error in survey plugin: question is missing the required "type" parameter.'
          );
        }
        if (!question_types.includes(question_type)) {
          throw new Error(`Error in survey plugin: invalid question type "${question_type}".`);
        }

        // set up question

        const setup_function = {
          "drop-down": this.setup_dropdown_question,
          html: this.setup_html_question,
          "likert-table": this.setup_likert_table_question,
          "multi-choice": this.setup_multichoice_question,
          "multi-select": this.setup_multichoice_question,
          ranking: this.setup_multichoice_question,
          likert: this.setup_likert_question,
          text: this.setup_text_question,
        }[question_type];

        const question = setup_function(
          question_params.name ?? `P${pageIndex}_Q${questionIndex}`,
          question_params
        );
        question.requiredErrorText = trial.required_error_text;
        page.addQuestion(question);
      }
    }

    // add the accuracy scoring for questions with a "correct_response" parameter value
    // TO DO: onValueChanged is not the right method to use for this because it doesn't score responses when
    // a value is not changed (i.e. no response or default/placeholder response)
    this.survey.onValueChanged.add(score_response);

    // render the survey and record start time
    this.survey.render(display_element);

    const start_time = performance.now();

    this.survey.onComplete.add((sender, options) => {
      // clear display
      display_element.innerHTML = "";
      // add default values to any questions without responses
      const all_questions = sender.getAllQuestions();
      const data_names = Object.keys(sender.data);
      for (const question of all_questions) {
        if (!data_names.includes(question.name)) {
          sender.mergeData({ [question.name]: question.defaultValue ?? null });
        }
      }

      // TO DO: restructure survey data (sender.data) here?
      // finish trial and save data
      this.jsPsych.finishTrial({
        rt: Math.round(performance.now() - start_time),
        response: sender.data,
        accuracy: this.trial_data.accuracy,
      });
    });
  }

  /**
   * Validate parameters for any question type
   *
   * @param supplied
   * @param required
   * @param optional
   * @returns
   */
  private static validate_question_params(
    supplied: Record<string, unknown>,
    required: string[],
    optional: string[]
  ) {
    required = [...all_question_params_req, ...required];
    optional = [...all_question_params_opt, ...optional];

    for (const param of required) {
      if (!supplied.hasOwnProperty(param)) {
        throw new Error(
          param === "type"
            ? 'Error in survey plugin: question is missing the required "type" parameter.'
            : `Error in survey plugin: question is missing required parameter "${param}" for question type "${supplied.type}".`
        );
      }
    }

    const invalid_params = Object.keys(supplied).filter(
      (param) => !(optional.includes(param) || required.includes(param))
    );

    if (invalid_params.length > 0) {
      console.warn(
        `Warning in survey plugin: the following question parameters have been specified but are not allowed for the question type "${supplied.type}" and will be ignored: ${invalid_params}`
      );
    }
  }

  /**
   * Set defaults for undefined question-specific parameters
   **/
  private static set_question_defaults = (
    supplied_params: Record<string, unknown>,
    available_params: string[]
  ) => {
    for (const param of available_params) {
      if (typeof supplied_params[param] === "undefined") {
        supplied_params[param] = info.parameters.pages.nested[param].default;
      }
    }
  };

  // methods for setting up different question types

  private setup_dropdown_question = (name: string, params) => {
    SurveyPlugin.validate_question_params(
      params,
      ["options"],
      [
        "option_reorder",
        "add_other_option",
        "other_option_text",
        "dropdown_select_prompt",
        "correct_response",
      ]
    );

    SurveyPlugin.set_question_defaults(params, dropdown_params);

    const question = new QuestionDropdown(name);

    question.title = params.prompt;
    question.isRequired = params.required;
    question.hasOther = params.add_other_option;
    question.optionsCaption = params.dropdown_select_prompt;
    if (question.hasOther) {
      question.otherText = params.other_option_text;
    }
    question.choices = params.options;
    if (typeof params.option_reorder === "undefined") {
      question.choicesOrder = info.parameters.pages.nested.option_reorder.default;
    } else {
      question.choicesOrder = params.option_reorder;
    }
    if (params.correct_response !== null) {
      question.correctAnswer = params.correct_response;
    }
    question.defaultValue = "";

    return question;
  };

  private setup_html_question = (name: string, params) => {
    SurveyPlugin.validate_question_params(params, [], []);
    SurveyPlugin.set_question_defaults(params, html_params);

    const question = new QuestionHtml(name);
    question.html = params.prompt;

    return question;
  };

  private setup_likert_question = (name: string, params) => {
    SurveyPlugin.validate_question_params(
      params,
      [],
      [
        "likert_scale_values",
        "likert_scale_min",
        "likert_scale_max",
        "likert_scale_stepsize",
        "likert_scale_min_label",
        "likert_scale_max_label",
        "correct_response",
      ]
    );

    SurveyPlugin.set_question_defaults(params, likert_params);

    const question = new QuestionRating(name);

    question.title = params.prompt;
    question.isRequired = params.required;
    if (params.likert_scale_values !== null) {
      question.rateValues = params.likert_scale_values;
    } else {
      question.rateMin = params.likert_scale_min;
      question.rateMax = params.likert_scale_max;
      question.rateStep = params.likert_scale_stepsize;
    }
    if (params.likert_scale_min_label !== null) {
      question.minRateDescription = params.likert_scale_min_label;
    }
    if (params.likert_scale_min_label !== null) {
      question.maxRateDescription = params.likert_scale_max_label;
    }
    if (params.correct_response !== null) {
      question.correctAnswer = params.correct_response;
    }
    // TO DO: add likert default value (empty string?: question.defaultValue = "";)

    return question;
  };

  private setup_likert_table_question = (name: string, params) => {
    SurveyPlugin.validate_question_params(
      params,
      ["options", "statements"],
      ["randomize_statement_order", "correct_response"]
    );

    SurveyPlugin.set_question_defaults(params, likert_table_params);

    const question = new QuestionMatrix(name);

    question.title = params.prompt;
    question.isAllRowRequired = params.required;
    question.columns = params.options.map((opt: string, ind: number) => ({
      value: ind,
      text: opt,
    }));
    question.rows = params.statements.map((stmt: { name: string; prompt: string }) => ({
      value: stmt.name,
      text: stmt.prompt,
    }));
    question.rowsOrder = params.randomize_statement_order ? "random" : "initial";
    if (params.correct_response !== null) {
      question.correctAnswer = params.correct_response;
    }
    // TO DO: add likert-table default value (empty array?: question.defaultValue = [];)

    return question;
  };

  // multi-choice, multi-select, ranking
  private setup_multichoice_question = (name: string, params) => {
    SurveyPlugin.validate_question_params(
      params,
      ["options"],
      ["columns", "option_reorder", "add_other_option", "other_option_text", "correct_response"]
    );

    SurveyPlugin.set_question_defaults(params, multichoice_params);

    let question: QuestionRadiogroup | QuestionCheckbox | QuestionRanking;
    switch (params.type) {
      case "multi-choice":
        question = new QuestionRadiogroup(name);
        question.defaultValue = "";
        break;

      case "multi-select":
        question = new QuestionCheckbox(name);
        question.defaultValue = [];
        break;

      case "ranking":
        question = new QuestionRanking(name);
        break;
    }

    question.title = params.prompt;
    question.isRequired = params.required;
    question.hasOther = params.add_other_option;
    if (question.hasOther) {
      question.otherText = params.other_option_text;
    }
    question.choices = params.options;
    if (typeof params.option_reorder === "undefined") {
      question.choicesOrder = info.parameters.pages.nested.option_reorder.default;
    } else {
      question.choicesOrder = params.option_reorder;
    }
    question.colCount = params.columns;
    if (params.correct_response !== null) {
      question.correctAnswer = params.correct_response;
    }

    if (question instanceof QuestionRanking) {
      // Hack to initialize `question.dragDropRankingChoices` which is only done by the
      // `endLoadingFromJson()` method
      question.endLoadingFromJson();
    }

    return question;
  };

  // text or comment
  private setup_text_question = (name: string, params) => {
    SurveyPlugin.validate_question_params(
      params,
      [],
      ["placeholder", "textbox_rows", "textbox_columns", "input_type", "correct_response"]
    );

    SurveyPlugin.set_question_defaults(params, text_params);

    const question = params.textbox_rows > 1 ? new QuestionComment(name) : new QuestionText(name);

    question.title = params.prompt;
    question.isRequired = params.required;
    question.placeHolder = params.placeholder;
    if (params.correct_response !== null) {
      question.correctAnswer = params.correct_response;
    }
    if (question instanceof QuestionComment) {
      question.rows = params.textbox_rows;
      question.cols = params.textbox_columns;
    } else {
      question.size = params.textbox_columns;
      question.inputType = params.input_type;
    }
    question.defaultValue = "";

    return question;
  };
}

export default SurveyPlugin;
