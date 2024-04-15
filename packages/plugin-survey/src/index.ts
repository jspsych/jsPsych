// import SurveyJS dependencies: survey-core and survey-jquery (UI theme): https://surveyjs.io/documentation/surveyjs-architecture#surveyjs-packages
import $ from "jquery";
import { JsPsych, JsPsychPlugin, ParameterType, TrialType } from "jspsych";
import { StylesManager } from "survey-core";
// TO DO: decide whether to apply this theme or remove it
import { PlainLightPanelless } from "survey-core/themes/plain-light-panelless";
import * as SurveyJS from "survey-jquery";

const info = <const>{
  name: "survey",
  parameters: {
    /**
     * A SurveyJS survey model defined in JSON.
     * See: https://surveyjs.io/form-library/documentation/design-survey/create-a-simple-survey#define-a-static-survey-model-in-json
     */
    survey_json: {
      type: ParameterType.STRING,
      default: "{}",
      pretty_name: "Survey JSON",
    },
    /**
     * A SurveyJS survey model defined as a function. The function receives an empty SurveyJS survey object as an argument.
     * See: https://surveyjs.io/form-library/documentation/design-survey/create-a-simple-survey#create-or-change-a-survey-model-dynamically
     */
    survey_function: {
      type: ParameterType.FUNCTION,
      default: null,
      pretty_name: "Survey function",
    },
    /**
     * A function that can be used to validate responses. This function is called whenever the SurveyJS onValidateQuestion event occurs.
     * See: https://surveyjs.io/form-library/documentation/data-validation#implement-custom-client-side-validation
     */
    validation_function: {
      type: ParameterType.FUNCTION,
      default: null,
      pretty_name: "Validation function",
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
  },
  page: {
    root: "jspsych-page",
  },
  footer: "jspsych-footer",
  navigation: {
    complete: "jspsych-nav-complete",
  },
};

/**
 * **survey**
 *
 * jsPsych plugin for presenting complex questionnaires using the SurveyJS library
 *
 * @author Becky Gilbert
 * @see {@link https://www.jspsych.org/plugins/survey/ survey plugin documentation on jspsych.org}
 */
class SurveyPlugin implements JsPsychPlugin<Info> {
  static info = info;
  private survey: $.Survey;
  private start_time: number;

  constructor(private jsPsych: JsPsych) {
    this.jsPsych = jsPsych;
  }

  applyStyles(survey) {
    // TO DO: this method of applying custom styles is deprecated, but I'm
    // saving this here for reference while we make decisions about default style

    // const colors = StylesManager.ThemeColors["default"];

    // colors["$background-dim"] = "#f3f3f3";
    // colors["$body-background-color"] = "white";
    // colors["$body-container-background-color"] = "white";
    // colors["$border-color"] = "#e7e7e7";
    // colors["$disable-color"] = "#dbdbdb";
    // colors["$disabled-label-color"] = "rgba(64, 64, 64, 0.5)";
    // colors["$disabled-slider-color"] = "#cfcfcf";
    // colors["$disabled-switch-color"] = "#9f9f9f";
    // colors["$error-background-color"] = "#fd6575";
    // colors["$error-color"] = "#ed5565";
    // colors["$foreground-disabled"] = "#161616";
    // //colors['$foreground-light'] = "orange"
    // colors["$header-background-color"] = "white";
    // colors["$header-color"] = "#6d7072";
    // colors["$inputs-background-color"] = "white";
    // colors["$main-color"] = "#919191";
    // colors["$main-hover-color"] = "#6b6b6b";
    // colors["$progress-buttons-color"] = "#8dd9ca";
    // colors["$progress-buttons-line-color"] = "#d4d4d4";
    // colors["$progress-text-color"] = "#9d9d9d";
    // colors["$slider-color"] = "white";
    // colors["$text-color"] = "#6d7072";
    // colors["$text-input-color"] = "#6d7072";

    // StylesManager.applyTheme();

    // Updated method for creating custom themes
    // https://surveyjs.io/form-library/documentation/manage-default-themes-and-styles#create-a-custom-theme

    //colors["$border-color"] = "#e7e7e7";

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
        "--sjs-shadow-inner": "0px 0px 0px 1px rgba(0, 0, 0, 0.15)",
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
    if (trial.survey_json === "{}" && trial.survey_function === null) {
      console.warn(
        "Survey plugin: you must define the survey using a non-empty JSON object and/or a survey function."
      );
    }
    this.survey = new SurveyJS.Model(trial.survey_json);

    if (trial.survey_function !== null) {
      trial.survey_function(this.survey);
    }

    //this.survey.applyTheme(PlainLightPanelless); // TO DO: can we apply this theme and still customize some values?
    this.applyStyles(this.survey); // customize colors

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
      display_element.innerHTML = "";
      $(".jspsych-content-wrapper").css("display", "flex");

      // finish trial and save data
      this.jsPsych.finishTrial({
        rt: Math.round(performance.now() - this.start_time),
        response: sender.data,
      });
    });

    // remove flex display from jspsych-content-wrapper to get formatting to work
    $(".jspsych-content-wrapper").css("display", "block");

    $(display_element).Survey({ model: this.survey });

    this.start_time = performance.now();
  }
}

export default SurveyPlugin;
