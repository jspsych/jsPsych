import { JsPsych, JsPsychPlugin, ParameterType, PluginInfo, TrialType } from "jspsych";
import { ParameterInfos } from "src/modules/plugins";

import { deepCopy } from "../modules/utils";
import { BaseTimelineNode } from "./BaseTimelineNode";
import { Timeline } from "./Timeline";
import { delay } from "./util";
import { TimelineNodeStatus, TimelineVariable, TrialDescription, TrialResult, isPromise } from ".";

export class Trial extends BaseTimelineNode {
  public pluginInstance: JsPsychPlugin<any>;
  public readonly trialObject: TrialDescription;

  private result: TrialResult;
  private readonly pluginInfo: PluginInfo;

  constructor(
    jsPsych: JsPsych,
    public readonly description: TrialDescription,
    protected readonly parent: Timeline,
    public readonly index: number
  ) {
    super(jsPsych);
    this.trialObject = deepCopy(description);
    this.pluginInfo = this.description.type["info"];
  }

  public async run() {
    this.status = TimelineNodeStatus.RUNNING;
    this.processParameters();

    this.focusContainerElement();
    this.addCssClasses();

    this.onStart();

    this.pluginInstance = new this.description.type(this.jsPsych);

    const result = await this.executeTrial();

    this.result = this.jsPsych.data.write({
      ...this.trialObject.data,
      ...result,
      trial_type: this.pluginInfo.name,
      trial_index: this.index,
    });

    this.onFinish();

    const gap =
      this.getParameterValue("post_trial_gap") ?? this.jsPsych.getInitSettings().default_iti;
    if (gap !== 0) {
      await delay(gap);
    }

    this.removeCssClasses();
    this.status = TimelineNodeStatus.COMPLETED;
  }

  private async executeTrial() {
    let trialPromise = this.jsPsych.finishTrialPromise.get();

    /** Used as a way to figure out if `finishTrial()` has ben called without awaiting `trialPromise` */
    let hasTrialPromiseBeenResolved = false;
    trialPromise.then(() => {
      hasTrialPromiseBeenResolved = true;
    });

    const trialReturnValue = this.pluginInstance.trial(
      this.jsPsych.getDisplayElement() ?? document.createElement("div"), // TODO Remove this hack once getDisplayElement() returns something
      this.trialObject,
      this.onLoad
    );

    // Wait until the trial has completed and grab result data
    let result: TrialResult;
    if (isPromise(trialReturnValue)) {
      result = await Promise.race([trialReturnValue, trialPromise]);

      // If `finishTrial()` was called, use the result provided to it. This may happen although
      // `trialReturnValue` won the race ("run-to-completion").
      if (hasTrialPromiseBeenResolved) {
        result = await trialPromise;
      }
    } else {
      this.onLoad();
      result = await trialPromise;
    }

    return result;
  }

  private focusContainerElement() {
    //   // apply the focus to the element containing the experiment.
    //   this.DOM_container.focus();
    //   // reset the scroll on the DOM target
    //   this.DOM_target.scrollTop = 0;
  }

  private addCssClasses() {
    //   // add CSS classes to the DOM_target if they exist in trial.css_classes
    //   if (typeof trial.css_classes !== "undefined") {
    //     if (!Array.isArray(trial.css_classes) && typeof trial.css_classes === "string") {
    //       trial.css_classes = [trial.css_classes];
    //     }
    //     if (Array.isArray(trial.css_classes)) {
    //       this.DOM_target.classList.add(...trial.css_classes);
    //     }
    //   }
  }

  private removeCssClasses() {
    //   // remove any CSS classes that were added to the DOM via css_classes parameter
    //   if (
    //     typeof this.current_trial.css_classes !== "undefined" &&
    //     Array.isArray(this.current_trial.css_classes)
    //   ) {
    //     this.DOM_target.classList.remove(...this.current_trial.css_classes);
    //   }
  }

  private onStart() {
    if (this.description.on_start) {
      this.description.on_start(this.trialObject);
    }
  }

  private onLoad = () => {
    if (this.description.on_load) {
      this.description.on_load();
    }
  };

  private onFinish() {
    if (this.description.on_finish) {
      this.description.on_finish(this.getResult());
    }
  }

  public evaluateTimelineVariable(variable: TimelineVariable) {
    // Timeline variable values are specified at the timeline level, not at the trial level, so
    // deferring to the parent timeline here
    return this.parent?.evaluateTimelineVariable(variable);
  }

  /**
   * Returns the result object of this trial or `undefined` if the result is not yet known.
   */
  public getResult() {
    return this.result;
  }

  /**
   * Checks that the parameters provided in the trial description align with the plugin's info
   * object, resolves missing parameter values from the parent timeline, resolves timeline variable
   * parameters, evaluates parameter functions if the expected parameter type is not `FUNCTION`, and
   * sets default values for optional parameters.
   */
  private processParameters() {
    const assignParameterValues = (
      parameterObject: Record<string, any>,
      parameterInfos: ParameterInfos,
      path = ""
    ) => {
      for (const [parameterName, parameterConfig] of Object.entries(parameterInfos)) {
        const parameterPath = path + parameterName;

        let parameterValue = this.getParameterValue(parameterPath, {
          evaluateFunctions: parameterConfig.type !== ParameterType.FUNCTION,
        });

        if (typeof parameterValue === "undefined") {
          if (typeof parameterConfig.default === "undefined") {
            throw new Error(
              `You must specify a value for the "${parameterPath}" parameter in the "${this.pluginInfo.name}" plugin.`
            );
          } else {
            parameterValue = parameterConfig.default;
          }
        }

        if (parameterConfig.type === ParameterType.COMPLEX && parameterConfig.nested) {
          assignParameterValues(parameterValue, parameterConfig.nested, parameterPath + ".");
        }

        parameterObject[parameterName] = parameterValue;
      }
    };

    assignParameterValues(this.trialObject, this.pluginInfo.parameters);
  }
}
