import { JsPsych, JsPsychPlugin, ParameterType, TrialType } from "jspsych";
import { StylesManager, Survey } from "survey-knockout";

const info = <const>{
  name: "survey",
  parameters: {},
};

type Info = typeof info;

/**
 * **survey**
 *
 *
 *
 * @author
 * @see {@link https://www.jspsych.org/plugins/survey/ survey plugin documentation on jspsych.org}
 */
class SurveyPlugin implements JsPsychPlugin<Info> {
  static info = info;

  constructor(private jsPsych: JsPsych) {}

  applyStyles() {
    StylesManager.applyTheme("bootstrap");
    // https://surveyjs.io/Examples/Library/?id=custom-theme
  }

  trial(display_element: HTMLElement, trial: TrialType<Info>) {
    this.applyStyles();

    // https://surveyjs.io/Documentation/Library#survey-objects
    const survey = new Survey();

    const page = survey.addNewPage("page1");
    const question = page.addNewQuestion("text");
    question.name = "q1";
    question.title = "Question 1";

    survey.render(display_element);
    const startTime = performance.now();

    survey.onComplete.add((sender) => {
      // display_element.innerHTML = "";
      this.jsPsych.finishTrial({
        rt: Math.round(performance.now() - startTime),
        response: sender.data,
      });
    });
  }
}

export default SurveyPlugin;
