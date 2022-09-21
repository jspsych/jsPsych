import { JsPsych, JsPsychPlugin, ParameterType, PluginInfo } from "jspsych";
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
  private cssClasses?: string[];

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

    this.jsPsych.focusDisplayContainerElement();
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
      this.jsPsych.getDisplayElement(),
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

  /**
   * Add the CSS classes from the trial's `css_classes` parameter to the display element.
   */
  private addCssClasses() {
    const classes = this.getParameterValue("css_classes");
    if (classes) {
      if (Array.isArray(classes)) {
        this.cssClasses = classes;
      } else if (typeof classes === "string") {
        this.cssClasses = [classes];
      }
      this.jsPsych.addCssClasses(this.cssClasses);
    }
  }

  /**
   * Remove the CSS classes added by `addCssClasses` (if any).
   */
  private removeCssClasses() {
    if (this.cssClasses) {
      this.jsPsych.removeCssClasses(this.cssClasses);
    }
  }

  private onStart() {
    const callback = this.getParameterValue("on_start", { evaluateFunctions: false });
    if (callback) {
      callback(this.trialObject);
    }
  }

  private onLoad = () => {
    const callback = this.getParameterValue("on_load", { evaluateFunctions: false });
    if (callback) {
      callback();
    }
  };

  private onFinish() {
    const callback = this.getParameterValue("on_finish", { evaluateFunctions: false });
    if (callback) {
      callback(this.getResult());
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

        if (parameterConfig.array && !Array.isArray(parameterValue)) {
          throw new Error(
            `A non-array value (\`${parameterValue}\`) was provided for the array parameter "${parameterPath}" in the "${this.pluginInfo.name}" plugin. Please make sure that "${parameterPath}" is an array.`
          );
        }

        if (parameterConfig.type === ParameterType.COMPLEX && parameterConfig.nested) {
          // Assign parameter values according to the `nested` schema
          if (parameterConfig.array) {
            // ...for each nested array element
            for (const [arrayIndex, arrayElement] of parameterValue.entries()) {
              assignParameterValues(
                arrayElement,
                parameterConfig.nested,
                `${parameterPath}[${arrayIndex}].`
              );
            }
          } else {
            // ...for the nested object
            assignParameterValues(parameterValue, parameterConfig.nested, parameterPath + ".");
          }
        }

        parameterObject[parameterName] = parameterValue;
      }
    };

    assignParameterValues(this.trialObject, this.pluginInfo.parameters);
  }
}
