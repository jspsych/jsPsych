import { JsPsych, JsPsychPlugin, ParameterType, TrialType } from "jspsych";
declare const info: {
  readonly name: "survey";
  readonly parameters: {
    /**
     * A SurveyJS survey model defined in JSON.
     * See: https://surveyjs.io/form-library/documentation/design-survey/create-a-simple-survey#define-a-static-survey-model-in-json
     */
    readonly survey_json: {
      readonly type: ParameterType.STRING;
      readonly default: "{}";
      readonly pretty_name: "Survey JSON";
    };
    /**
     * A SurveyJS survey model defined as a function. The function receives an empty SurveyJS survey object as an argument.
     * See: https://surveyjs.io/form-library/documentation/design-survey/create-a-simple-survey#create-or-change-a-survey-model-dynamically
     */
    readonly survey_function: {
      readonly type: ParameterType.FUNCTION;
      readonly default: any;
      readonly pretty_name: "Survey function";
    };
    /**
     * A function that can be used to validate responses. This function is called whenever the SurveyJS onValidateQuestion event occurs.
     * See: https://surveyjs.io/form-library/documentation/data-validation#implement-custom-client-side-validation
     */
    readonly validation_function: {
      readonly type: ParameterType.FUNCTION;
      readonly default: any;
      readonly pretty_name: "Validation function";
    };
  };
};
type Info = typeof info;
/**
 * **survey**
 *
 * jsPsych plugin for presenting complex questionnaires using the SurveyJS library
 *
 * @author Becky Gilbert
 * @see {@link https://www.jspsych.org/plugins/survey/ survey plugin documentation on jspsych.org}
 */
declare class SurveyPlugin implements JsPsychPlugin<Info> {
  private jsPsych;
  static info: {
    readonly name: "survey";
    readonly parameters: {
      /**
       * A SurveyJS survey model defined in JSON.
       * See: https://surveyjs.io/form-library/documentation/design-survey/create-a-simple-survey#define-a-static-survey-model-in-json
       */
      readonly survey_json: {
        readonly type: ParameterType.STRING;
        readonly default: "{}";
        readonly pretty_name: "Survey JSON";
      };
      /**
       * A SurveyJS survey model defined as a function. The function receives an empty SurveyJS survey object as an argument.
       * See: https://surveyjs.io/form-library/documentation/design-survey/create-a-simple-survey#create-or-change-a-survey-model-dynamically
       */
      readonly survey_function: {
        readonly type: ParameterType.FUNCTION;
        readonly default: any;
        readonly pretty_name: "Survey function";
      };
      /**
       * A function that can be used to validate responses. This function is called whenever the SurveyJS onValidateQuestion event occurs.
       * See: https://surveyjs.io/form-library/documentation/data-validation#implement-custom-client-side-validation
       */
      readonly validation_function: {
        readonly type: ParameterType.FUNCTION;
        readonly default: any;
        readonly pretty_name: "Validation function";
      };
    };
  };
  private survey;
  private start_time;
  constructor(jsPsych: JsPsych);
  applyStyles(survey: any): void;
  trial(display_element: HTMLElement, trial: TrialType<Info>): void;
}
export default SurveyPlugin;
