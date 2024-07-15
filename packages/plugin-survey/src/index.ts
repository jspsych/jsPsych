// import SurveyJS dependencies: survey-core and survey-knockout-ui (UI theme): https://surveyjs.io/documentation/surveyjs-architecture#surveyjs-packages
import { JsPsych, JsPsychPlugin, ParameterType, TrialType } from "jspsych";
import * as SurveyJS from "survey-knockout-ui";

import { version } from "../package.json";

const info = <const>{
  name: "survey",
  version: version,
  parameters: {
    /**
     *
     * A SurveyJS-compatible JavaScript object that defines the survey (we refer to this as the survey 'JSON'
     * for consistency with the SurveyJS documentation, but this parameter should be a JSON-compatible
     * JavaScript object rather than a string). If used with the `survey_function` parameter, the survey
     * will initially be constructed with this object and then passed to the `survey_function`. See
     * the [SurveyJS JSON documentation](https://surveyjs.io/form-library/documentation/design-survey/create-a-simple-survey#define-a-static-survey-model-in-json) for more information.
     *
     */
    survey_json: {
      type: ParameterType.OBJECT,
      default: {},
    },
    /**
     *
     * A function that receives a SurveyJS survey object as an argument. If no `survey_json` is specified, then
     * the function receives an empty survey model and must add all pages/elements to it. If a `survey_json`
     * object is provided, then this object forms the basis of the survey model that is passed into the `survey_function`.
     * See the [SurveyJS JavaScript documentation](https://surveyjs.io/form-library/documentation/design-survey/create-a-simple-survey#create-or-change-a-survey-model-dynamically) for more information.
     *
     */
    survey_function: {
      type: ParameterType.FUNCTION,
      default: null,
    },
    /**
     * A function that can be used to validate responses. This function is called whenever the SurveyJS `onValidateQuestion`
     * event occurs. (Note: it is also possible to add this function to the survey using the `survey_function` parameter -
     * we've just added it as a parameter for convenience).
     */
    validation_function: {
      type: ParameterType.FUNCTION,
      default: null,
    },
  },
  data: {
    /** An object containing the response to each question. The object will have a separate key (identifier) for each question. If the `name` parameter is defined for the question (recommended), then the response object will use the value of `name` as the key for each question. If any questions do not have a name parameter, their keys will named automatically, with the first unnamed question recorded as `question1`, the second as `question2`, and so on. The response type will depend on the question type. This will be encoded as a JSON string when data is saved using the `.json()` or `.csv()` functions. */
    response: {
      type: ParameterType.COMPLEX,
      nested: {
        identifier: {
          type: ParameterType.STRING,
        },
        response: {
          type:
            ParameterType.STRING |
            ParameterType.INT |
            ParameterType.FLOAT |
            ParameterType.BOOL |
            ParameterType.OBJECT,
        },
      },
    },
    /** The response time in milliseconds for the participant to make a response. The time is measured from when the questions first appear on the screen until the participant's response(s) are submitted. */
    rt: {
      type: ParameterType.INT,
    },
  },
};

type Info = typeof info;

// Define the mapping between custom jsPsych class names (jspsych-*) and class names provided by SurveyJS.
// See here for full list: https://github.com/surveyjs/survey-library/blob/master/src/defaultCss/defaultV2Css.ts.
// To modify the survey plugin CSS:
// (1) search for the CSS selector that you want to modify,
// (2) look it up and get the associated ID (note that some of these are nested)
// (3) if the ID isn't already listed as a key here, add it and use a new jspsych class name as the value
// (4) in survey.scss, use the jspsych class name as the selector and add/modify the rule

const jsPsychSurveyCssClassMap = {
  body: "jspsych-body",
  bodyContainer: "jspsych-body-container",
  question: {
    content: "jspsych-question-content",
    mainRoot: "jspsych-question-root",
  },
  page: {
    root: "jspsych-page",
  },
  footer: "jspsych-footer",
  navigation: {
    complete: "jspsych-nav-complete",
  },
  rowMultiple: "jspsych-row-multiple",
};

/**
 * SurveyJS version: 1.9.138
 *
 * This plugin is a wrapper for the [**SurveyJS form library**](https://surveyjs.io/form-library/documentation/overview). It displays survey-style questions across one or more pages. You can mix different question types on the same page, and participants can navigate back and forth through multiple survey pages without losing responses. SurveyJS provides a large number of built-in question types, response validation options, conditional display options, special response options ("None", "Select all", "Other"), and other useful features for building complex surveys. See the [Building Surveys in jsPsych](../overview/building-surveys.md) page for a more detailed list of all options and features.
 *
 * With SurveyJS, surveys can be defined using a JavaScript/JSON object, a JavaScript function, or a combination of both. The jsPsych `survey` plugin provides parameters that accept these methods of constructing a SurveyJS survey, and passes them into SurveyJS. The fact that this plugin just acts as a wrapper means you can take advantage of all of the SurveyJS features, and copy/paste directly from SurveyJS examples into the plugin's `survey_json` parameter (for JSON object configuration) or `survey_function` parameter (for JavaScript code).
 *
 * This page contains the plugin's reference information and examples. The [Building Surveys in jsPsych](../overview/building-surveys.md) page contains a more detailed guide for using this plugin.
 *
 * For the most comprehensive guides on survey configuration and features, please see the [SurveyJS form library documentation](https://surveyjs.io/form-library/documentation/overview) and [examples](https://surveyjs.io/form-library/examples/overview).
 *
 * !!! warning "Limitations"
 *
 *     The jsPsych `survey` plugin is not compatible with certain jsPsych and SurveyJS features. Specifically:
 *
 *     - **It is not always well-suited for use with jsPsych's [timeline variables](../overview/timeline.md#timeline-variables) feature.** This is because the timeline variables array must store the entire `survey_json` object for each trial, rather than just the parameters that change across trials, which are nested within the `survey_json` object. We offer some alternative methods for dynamically constructing questions/trials in [this section](../overview/building-surveys.md#defining-survey-trialsquestions-programmatically) of the Building Surveys in jsPsych documentation page.
 *     - **It does not support the SurveyJS "[complete page](https://surveyjs.io/form-library/documentation/design-survey/create-a-multi-page-survey#complete-page)" parameter.** This is a parameter for HTML formatted content that should appear after the participant clicks the 'submit' button. Instead of using this parameter, you should create another jsPsych trial that comes after the survey trial to serve the same purpose.
 *     - **It does not support the SurveyJS question's `correctAnswer` property**, which is used for SurveyJS quizzes and automatic response scoring. SurveyJS does not store this value or the response score in the data - instead this is only used to display scores on the survey's 'complete page'. Since the complete page is not supported, this 'correctAnswer' property also does not work as intended in the jsPsych plugin.
 *
 *
 * @author Becky Gilbert
 * @see {@link https://www.jspsych.org/latest/plugins/survey/ survey plugin documentation on jspsych.org}
 */
class SurveyPlugin implements JsPsychPlugin<Info> {
  static info = info;
  private survey: SurveyJS.Survey;
  private start_time: number;

  constructor(private jsPsych: JsPsych) {
    this.jsPsych = jsPsych;
  }

  private applyStyles(survey) {
    // https://surveyjs.io/form-library/documentation/manage-default-themes-and-styles#create-a-custom-theme

    survey.applyTheme({
      cssVariables: {
        "--sjs-general-backcolor": "rgba(255, 255, 255, 1)",
        "--sjs-general-backcolor-dim": "rgba(255, 255, 255, 1)", // panel background color
        "--sjs-general-backcolor-dim-light": "rgba(249, 249, 249, 1)", // input element background, including single next or previous buttons
        "--sjs-general-forecolor": "rgba(0, 0, 0, 0.91)",
        "--sjs-general-forecolor-light": "rgba(0, 0, 0, 0.45)",
        "--sjs-general-dim-forecolor": "rgba(0, 0, 0, 0.91)",
        "--sjs-general-dim-forecolor-light": "rgba(0, 0, 0, 0.45)",
        "--sjs-primary-backcolor": "#474747", // title, selected input border, next/submit button background, previous button text color
        "--sjs-primary-backcolor-light": "rgba(0, 0, 0, 0.1)",
        "--sjs-primary-backcolor-dark": "#000000", // next/submit button hover backgound
        "--sjs-primary-forecolor": "rgba(255, 255, 255, 1)", // next/submit button text color
        "--sjs-primary-forecolor-light": "rgba(255, 255, 255, 0.25)",
        // all shadow and border variables below affect the question/panel borders
        "--sjs-shadow-small": "0px 0px 0px 1px rgba(0, 0, 0, 0.15)",
        "--sjs-shadow-small-reset": "0px 0px 0px 0px rgba(0, 0, 0, 0.15)",
        "--sjs-shadow-medium": "0px 0px 0px 1px rgba(0, 0, 0, 0.1)",
        "--sjs-shadow-large": "0px 8px 16px 0px rgba(0, 0, 0, 0.05)",
        "--sjs-shadow-inner-reset": "0px 0px 0px 0px rgba(0, 0, 0, 0.15)",
        "--sjs-border-light": "rgba(0, 0, 0, 0.15)",
        "--sjs-border-default": "rgba(0, 0, 0, 0.15)",
        "--sjs-border-inside": " rgba(0, 0, 0, 0.16)",
      },
      themeName: "plain",
      colorPalette: "light",
      isPanelless: false,
    });
  }

  trial(display_element: HTMLElement, trial: TrialType<Info>) {
    // check for empty JSON and no survey function
    if (JSON.stringify(trial.survey_json) === "{}" && trial.survey_function === null) {
      console.error(
        "Survey plugin warning: you must define the survey using a non-empty JSON object and/or a survey function."
      );
    }
    this.survey = new SurveyJS.Survey(trial.survey_json);

    if (trial.survey_function !== null) {
      trial.survey_function(this.survey);
    }

    // apply our custom theme
    this.applyStyles(this.survey);

    // apply our custom CSS class names
    this.survey.css = jsPsychSurveyCssClassMap;

    if (trial.validation_function) {
      this.survey.onValidateQuestion.add(trial.validation_function);
    }

    this.survey.onComplete.add((sender, options) => {
      // add default values to any questions without responses
      const all_questions = sender.getAllQuestions();
      const data_names = Object.keys(sender.data);
      for (const question of all_questions) {
        if (!data_names.includes(question.name)) {
          sender.mergeData({ [question.name]: question.defaultValue ?? null });
        }
      }

      // clear display and reset flex on jspsych-content-wrapper
      document.querySelector<HTMLElement>(".jspsych-content-wrapper").style.display = "flex";

      // finish trial and save data
      this.jsPsych.finishTrial({
        rt: Math.round(performance.now() - this.start_time),
        response: sender.data,
      });
    });

    // remove flex display from jspsych-content-wrapper to get formatting to work
    document.querySelector<HTMLElement>(".jspsych-content-wrapper").style.display = "block";

    this.survey.render(display_element);

    this.start_time = performance.now();
  }
}

export default SurveyPlugin;
