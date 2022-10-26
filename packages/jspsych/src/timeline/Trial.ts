import get from "lodash.get";
import set from "lodash.set";
import { ParameterInfos } from "src/modules/plugins";
import { Class } from "type-fest";

import { JsPsychPlugin, ParameterType, PluginInfo } from "../";
import { deepCopy } from "../modules/utils";
import { BaseTimelineNode } from "./BaseTimelineNode";
import { Timeline } from "./Timeline";
import { delay, parameterPathArrayToString } from "./util";
import {
  GetParameterValueOptions,
  TimelineNode,
  TimelineNodeDependencies,
  TimelineNodeStatus,
  TimelineVariable,
  TrialDescription,
  TrialResult,
  isPromise,
} from ".";

export class Trial extends BaseTimelineNode {
  public readonly pluginClass: Class<JsPsychPlugin<any>>;
  public pluginInstance: JsPsychPlugin<any>;
  public readonly trialObject: TrialDescription;
  public index?: number;

  private result: TrialResult;
  private readonly pluginInfo: PluginInfo;

  constructor(
    dependencies: TimelineNodeDependencies,
    public readonly description: TrialDescription,
    public readonly parent: Timeline
  ) {
    super(dependencies);
    this.trialObject = deepCopy(description);
    this.pluginClass = this.getParameterValue("type", { evaluateFunctions: false });
    this.pluginInfo = this.pluginClass["info"];
  }

  public async run() {
    this.status = TimelineNodeStatus.RUNNING;
    this.processParameters();

    this.onStart();

    this.pluginInstance = this.dependencies.instantiatePlugin(this.pluginClass);

    const result = await this.executeTrial();
    this.result = {
      ...this.getDataParameter(),
      ...result,
      trial_type: this.pluginInfo.name,
      trial_index: this.index,
    };

    this.dependencies.onTrialResultAvailable(this);

    this.status = TimelineNodeStatus.COMPLETED;

    this.onFinish();

    const gap = this.getParameterValue("post_trial_gap") ?? this.dependencies.getDefaultIti();
    if (gap !== 0) {
      await delay(gap);
    }
  }

  private async executeTrial() {
    const trialPromise = this.dependencies.finishTrialPromise.get();

    /** Used as a way to figure out if `finishTrial()` has ben called without awaiting `trialPromise` */
    let hasTrialPromiseBeenResolved = false;
    trialPromise.then(() => {
      hasTrialPromiseBeenResolved = true;
    });

    const trialReturnValue = this.pluginInstance.trial(
      this.dependencies.getDisplayElement(),
      this.trialObject,
      this.onLoad
    );

    // Wait until the trial has completed and grab result data
    let result: TrialResult | void;
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
   * Runs a callback function retrieved from a parameter value and returns its result.
   *
   * @param parameterName The name of the parameter to retrieve the callback function from.
   * @param callbackParameters The parameters (if any) to be passed to the callback function
   */
  private runParameterCallback(parameterName: string, ...callbackParameters: unknown[]) {
    const callback = this.getParameterValue(parameterName, { evaluateFunctions: false });
    if (callback) {
      return callback(...callbackParameters);
    }
  }

  private onStart() {
    this.dependencies.onTrialStart(this);
    this.runParameterCallback("on_start", this.trialObject);
  }

  private onLoad = () => {
    this.dependencies.onTrialLoaded(this);
    this.runParameterCallback("on_load");
  };

  private onFinish() {
    this.runParameterCallback("on_finish", this.getResult());
    this.dependencies.onTrialFinished(this);
  }

  public evaluateTimelineVariable(variable: TimelineVariable) {
    // Timeline variable values are specified at the timeline level, not at the trial level, hence
    // deferring to the parent timeline here
    return this.parent?.evaluateTimelineVariable(variable);
  }

  /**
   * Returns the result object of this trial or `undefined` if the result is not yet known.
   */
  public getResult() {
    return this.result;
  }

  public getResults() {
    return this.result ? [this.result] : [];
  }

  private parameterValueCache: Record<string, any> = {};
  getParameterValue(
    parameterPath: string | string[],
    options?: GetParameterValueOptions & {
      /**
       * Whether or not the requested parameter is of `ParameterType.COMPLEX` (defaults to `false`).
       * If `true`, the result of the parameter lookup will be cached by the `Trial` node for
       * successive lookups of nested properties or array elements.
       **/
      isComplexParameter?: boolean;
    }
  ) {
    let parameterObject: Record<string, any> | undefined;
    if (Array.isArray(parameterPath) && parameterPath.length > 1) {
      // Lookup of a nested parameter: Let's query the cache for the parent parameter
      const parentParameterPath = parameterPath.slice(0, parameterPath.length - 1);
      if (get(this.parameterValueCache, parentParameterPath)) {
        // Parent parameter found in cache, let's use the cache for the child parameter lookup
        parameterObject = this.parameterValueCache;
      }
    }

    const result = super.getParameterValue(parameterPath, { parameterObject, ...options });
    if (options?.isComplexParameter) {
      set(this.parameterValueCache, parameterPath, result);
    }
    return result;
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
      parentParameterPath: string[] = []
    ) => {
      for (const [parameterName, parameterConfig] of Object.entries(parameterInfos)) {
        const parameterPath = [...parentParameterPath, parameterName];

        let parameterValue = this.getParameterValue(parameterPath, {
          evaluateFunctions: parameterConfig.type !== ParameterType.FUNCTION,
          isComplexParameter: parameterConfig.type === ParameterType.COMPLEX,
        });

        if (typeof parameterValue === "undefined") {
          if (typeof parameterConfig.default === "undefined") {
            throw new Error(
              `You must specify a value for the "${parameterPathArrayToString(
                parameterPath
              )}" parameter in the "${this.pluginInfo.name}" plugin.`
            );
          } else {
            parameterValue = parameterConfig.default;
          }
        }

        if (parameterConfig.array && !Array.isArray(parameterValue)) {
          const parameterPathString = parameterPathArrayToString(parameterPath);
          throw new Error(
            `A non-array value (\`${parameterValue}\`) was provided for the array parameter "${parameterPathString}" in the "${this.pluginInfo.name}" plugin. Please make sure that "${parameterPathString}" is an array.`
          );
        }

        if (parameterConfig.type === ParameterType.COMPLEX && parameterConfig.nested) {
          // Assign parameter values according to the `nested` schema
          if (parameterConfig.array) {
            // ...for each nested array element
            for (const arrayIndex of parameterValue.keys()) {
              const arrayElementPath = [...parameterPath, arrayIndex.toString()];
              const arrayElementValue = this.getParameterValue(arrayElementPath, {
                isComplexParameter: true,
              });
              assignParameterValues(arrayElementValue, parameterConfig.nested, arrayElementPath);
            }
          } else {
            // ...for the nested object
            assignParameterValues(parameterValue, parameterConfig.nested, parameterPath);
          }
        }

        parameterObject[parameterName] = parameterValue;
      }
    };

    assignParameterValues(this.trialObject, this.pluginInfo.parameters);
  }

  /**
   * Retrieves and evaluates the `data` parameter. It is different from other parameters in that
   * it's properties may be functions that have to be evaluated.
   */
  private getDataParameter() {
    const data = this.getParameterValue("data", { isComplexParameter: true });

    if (typeof data === "object") {
      return Object.fromEntries(
        Object.keys(data).map((key) => [key, this.getParameterValue(["data", key])])
      );
    }

    return data;
  }

  public getLatestNode() {
    return this;
  }
}
