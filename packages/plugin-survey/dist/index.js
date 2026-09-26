import 'survey-js-ui';
import { ParameterType } from 'jspsych';
import { Model } from 'survey-core';

var version = "4.0.0";

const info = {
  name: "survey",
  version,
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
      default: {}
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
      default: null
    },
    /**
     * A function that can be used to validate responses. This function is called whenever the SurveyJS `onValidateQuestion`
     * event occurs. (Note: it is also possible to add this function to the survey using the `survey_function` parameter -
     * we've just added it as a parameter for convenience).
     */
    validation_function: {
      type: ParameterType.FUNCTION,
      default: null
    },
    /**
     * The minimum width of the survey container. This is applied as a CSS `min-width` property to the survey container element.
     * Note that the width of the survey can also be controlled using SurveyJS parameters within the `survey_json` object (e.g., `widthMode`, `width`, `fitToContainer`).
     */
    min_width: {
      type: ParameterType.STRING,
      default: "min(100vw, 800px)"
    }
  },
  data: {
    /** An object containing the response to each question. The object will have a separate key (identifier) for each question. If the `name` parameter is defined for the question (recommended), then the response object will use the value of `name` as the key for each question. If any questions do not have a name parameter, their keys will named automatically, with the first unnamed question recorded as `question1`, the second as `question2`, and so on. The response type will depend on the question type. This will be encoded as a JSON string when data is saved using the `.json()` or `.csv()` functions. */
    response: {
      type: ParameterType.OBJECT
    },
    /** The response time in milliseconds for the participant to make a response. The time is measured from when the questions first appear on the screen until the participant's response(s) are submitted. */
    rt: {
      type: ParameterType.INT
    }
  },
  // prettier-ignore
  citations: {
    "apa": "de Leeuw, J. R., Gilbert, R. A., & Luchterhandt, B. (2023). jsPsych: Enabling an Open-Source Collaborative Ecosystem of Behavioral Experiments. Journal of Open Source Software, 8(85), 5351. https://doi.org/10.21105/joss.05351 ",
    "bibtex": '@article{Leeuw2023jsPsych, 	author = {de Leeuw, Joshua R. and Gilbert, Rebecca A. and Luchterhandt, Bj{\\" o}rn}, 	journal = {Journal of Open Source Software}, 	doi = {10.21105/joss.05351}, 	issn = {2475-9066}, 	number = {85}, 	year = {2023}, 	month = {may 11}, 	pages = {5351}, 	publisher = {Open Journals}, 	title = {jsPsych: Enabling an {Open}-{Source} {Collaborative} {Ecosystem} of {Behavioral} {Experiments}}, 	url = {https://joss.theoj.org/papers/10.21105/joss.05351}, 	volume = {8}, }  '
  }
};
class SurveyPlugin {
  constructor(jsPsych) {
    this.jsPsych = jsPsych;
    this.jsPsych = jsPsych;
  }
  static {
    this.info = info;
  }
  applyStyles(survey) {
    survey.applyTheme({
      cssVariables: {
        "--sjs-general-backcolor": "rgba(255, 255, 255, 1)",
        "--sjs-general-backcolor-dim": "rgba(255, 255, 255, 1)",
        // panel background color
        "--sjs-general-backcolor-dim-light": "rgba(249, 249, 249, 1)",
        // input element background, including single next or previous buttons
        "--sjs-general-forecolor": "rgba(0, 0, 0, 0.91)",
        "--sjs-general-forecolor-light": "rgba(0, 0, 0, 0.45)",
        "--sjs-general-dim-forecolor": "rgba(0, 0, 0, 0.91)",
        "--sjs-general-dim-forecolor-light": "rgba(0, 0, 0, 0.45)",
        "--sjs-primary-backcolor": "#474747",
        // title, selected input border, next/submit button background, previous button text color
        "--sjs-primary-backcolor-light": "rgba(0, 0, 0, 0.1)",
        "--sjs-primary-backcolor-dark": "#000000",
        // next/submit button hover backgound
        "--sjs-primary-forecolor": "rgba(255, 255, 255, 1)",
        // next/submit button text color
        "--sjs-primary-forecolor-light": "rgba(255, 255, 255, 0.25)",
        // all shadow and border variables below affect the question/panel borders
        "--sjs-shadow-small": "0px 0px 0px 1px rgba(0, 0, 0, 0.15)",
        "--sjs-shadow-small-reset": "0px 0px 0px 0px rgba(0, 0, 0, 0.15)",
        "--sjs-shadow-medium": "0px 0px 0px 1px rgba(0, 0, 0, 0.1)",
        "--sjs-shadow-large": "0px 8px 16px 0px rgba(0, 0, 0, 0.05)",
        "--sjs-shadow-inner-reset": "0px 0px 0px 0px rgba(0, 0, 0, 0.15)",
        "--sjs-border-light": "rgba(0, 0, 0, 0.15)",
        "--sjs-border-default": "rgba(0, 0, 0, 0.15)",
        "--sjs-border-inside": " rgba(0, 0, 0, 0.16)"
      },
      themeName: "plain",
      colorPalette: "light",
      isPanelless: false
    });
  }
  createSurveyContainer(parent, minWidth) {
    const container = document.createElement("div");
    container.classList.add("jspsych-survey-container");
    container.style.textAlign = "initial";
    container.style.minWidth = minWidth;
    parent.appendChild(container);
    return container;
  }
  trial(display_element, trial) {
    if (JSON.stringify(trial.survey_json) === "{}" && trial.survey_function === null) {
      console.error(
        "Survey plugin warning: you must define the survey using a non-empty JSON object and/or a survey function."
      );
    }
    this.survey = new Model(trial.survey_json);
    if (trial.survey_function !== null) {
      trial.survey_function(this.survey);
    }
    this.applyStyles(this.survey);
    if (trial.validation_function) {
      this.survey.onValidateQuestion.add(trial.validation_function);
    }
    this.survey.onComplete.add((sender, options) => {
      const all_questions = sender.getAllQuestions();
      const data_names = Object.keys(sender.data);
      for (const question of all_questions) {
        if (!data_names.includes(question.name)) {
          sender.mergeData({ [question.name]: question.defaultValue ?? null });
        }
      }
      this.jsPsych.finishTrial({
        rt: Math.round(performance.now() - this.start_time),
        response: sender.data
      });
    });
    const survey_container = this.createSurveyContainer(display_element, trial.min_width);
    this.survey.render(survey_container);
    this.start_time = performance.now();
  }
}

export { SurveyPlugin as default };
//# sourceMappingURL=index.js.map
