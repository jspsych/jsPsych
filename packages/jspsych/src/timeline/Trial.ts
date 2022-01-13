import { JsPsych, JsPsychPlugin, ParameterType, PluginInfo, TrialType } from "jspsych";
import { ParameterInfos } from "src/modules/plugins";

import { deepCopy } from "../modules/utils";
import { BaseTimelineNode } from "./BaseTimelineNode";
import { Timeline } from "./Timeline";
import {
  GetParameterValueOptions,
  TimelineVariable,
  TrialDescription,
  TrialResult,
  isPromise,
  trialDescriptionKeys,
} from ".";

export class Trial extends BaseTimelineNode {
  private result: TrialResult;

  public pluginInstance: JsPsychPlugin<any>;
  public readonly trialObject: TrialDescription;

  constructor(
    jsPsych: JsPsych,
    public readonly description: TrialDescription,
    protected readonly parent: Timeline
  ) {
    super(jsPsych);
    this.trialObject = deepCopy(description);
  }

  public async run() {
    this.processParameters();
    this.onStart();

    this.pluginInstance = new this.description.type(this.jsPsych);

    let trialPromise = this.jsPsych._trialPromise;

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

    this.result = { ...this.trialObject.data, ...result };

    this.onFinish();
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

  public getParameterValue(parameterName: string, options?: GetParameterValueOptions) {
    if (trialDescriptionKeys.includes(parameterName)) {
      return;
    }
    return super.getParameterValue(parameterName, options);
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
    const pluginInfo: PluginInfo = this.description.type["info"];

    // Set parameters according to the plugin info object
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
              `You must specify a value for the "${parameterPath}" parameter in the "${pluginInfo.name}" plugin.`
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

    assignParameterValues(this.trialObject, pluginInfo.parameters);
  }
}
