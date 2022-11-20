import { Class } from "type-fest";

import { ParameterInfos } from "../modules/plugins";
import { JsPsychPlugin, ParameterType, PluginInfo } from "../modules/plugins";
import { deepCopy } from "../modules/utils";
import { Timeline } from "./Timeline";
import { GetParameterValueOptions, TimelineNode } from "./TimelineNode";
import { delay, isPromise, parameterPathArrayToString } from "./util";
import {
  SimulationOptions,
  TimelineNodeDependencies,
  TimelineNodeStatus,
  TimelineVariable,
  TrialDescription,
  TrialResult,
  timelineDescriptionKeys,
} from ".";

export class Trial extends TimelineNode {
  public readonly pluginClass: Class<JsPsychPlugin<any>>;
  public pluginInstance: JsPsychPlugin<any>;
  public trialObject?: TrialDescription;
  public index?: number;

  private result: TrialResult;
  private readonly pluginInfo: PluginInfo;

  constructor(
    dependencies: TimelineNodeDependencies,
    public readonly description: TrialDescription,
    public readonly parent: Timeline
  ) {
    super(dependencies);
    this.initializeParameterValueCache();

    this.trialObject = deepCopy(description);
    this.pluginClass = this.getParameterValue("type", { evaluateFunctions: false });
    this.pluginInfo = this.pluginClass["info"];
  }

  public async run() {
    this.status = TimelineNodeStatus.RUNNING;
    this.processParameters();

    this.onStart();
    this.addCssClasses();

    this.pluginInstance = this.dependencies.instantiatePlugin(this.pluginClass);

    this.result = this.processResult(await this.executeTrial());

    this.dependencies.onTrialResultAvailable(this);

    this.status = TimelineNodeStatus.COMPLETED;

    await this.onFinish();
    this.removeCssClasses();

    const gap = this.getParameterValue("post_trial_gap") ?? this.dependencies.getDefaultIti();
    if (gap !== 0 && this.dependencies.getSimulationMode() !== "data-only") {
      await delay(gap);
    }

    this.resetParameterValueCache();
  }

  private async executeTrial() {
    const trialPromise = this.dependencies.finishTrialPromise.get();

    /** Used as a way to figure out if `finishTrial()` has ben called without awaiting `trialPromise` */
    let hasTrialPromiseBeenResolved = false;
    trialPromise.then(() => {
      hasTrialPromiseBeenResolved = true;
    });

    const trialReturnValue = this.invokeTrialMethod();

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

  private invokeTrialMethod(): void | Promise<void | TrialResult> {
    const globalSimulationMode = this.dependencies.getSimulationMode();

    if (globalSimulationMode && typeof this.pluginInstance.simulate === "function") {
      const simulationOptions = this.getSimulationOptions();

      if (simulationOptions.simulate !== false) {
        return this.pluginInstance.simulate(
          this.trialObject,
          simulationOptions.mode ?? globalSimulationMode,
          simulationOptions,
          this.onLoad
        );
      }
    }

    return this.pluginInstance.trial(
      this.dependencies.getDisplayElement(),
      this.trialObject,
      this.onLoad
    );
  }

  /**
   * Add the CSS classes from the `css_classes` parameter to the display element
   */
  private addCssClasses() {
    const classes: string | string[] = this.getParameterValue("css_classes");
    const classList = this.dependencies.getDisplayElement().classList;
    if (typeof classes === "string") {
      classList.add(classes);
    } else if (Array.isArray(classes)) {
      classList.add(...classes);
    }
  }

  /**
   * Removes the provided css classes from the display element
   */
  private removeCssClasses() {
    const classes = this.getParameterValue("css_classes");
    if (classes) {
      this.dependencies
        .getDisplayElement()
        .classList.remove(...(typeof classes === "string" ? [classes] : classes));
    }
  }

  private processResult(result: TrialResult | void) {
    if (!result) {
      result = {};
    }

    for (const [parameterName, shouldParameterBeIncluded] of Object.entries(
      this.getParameterValue("save_trial_parameters") ?? {}
    )) {
      if (this.pluginInfo.parameters[parameterName]) {
        if (shouldParameterBeIncluded && !Object.hasOwn(result, parameterName)) {
          let parameterValue = this.trialObject[parameterName];
          if (typeof parameterValue === "function") {
            parameterValue = parameterValue.toString();
          }
          result[parameterName] = parameterValue;
        } else if (!shouldParameterBeIncluded && Object.hasOwn(result, parameterName)) {
          delete result[parameterName];
        }
      } else {
        console.warn(
          `Non-existent parameter "${parameterName}" specified in save_trial_parameters.`
        );
      }
    }

    result = {
      ...this.getDataParameter(),
      ...result,
      trial_type: this.pluginInfo.name,
      trial_index: this.index,
    };

    // Add timeline variables to the result according to the `save_timeline_variables` parameter
    const saveTimelineVariables = this.getParameterValue("save_timeline_variables");
    if (saveTimelineVariables === true) {
      result.timeline_variables = { ...this.parent.getAllTimelineVariables() };
    } else if (Array.isArray(saveTimelineVariables)) {
      result.timeline_variables = Object.fromEntries(
        Object.entries(this.parent.getAllTimelineVariables()).filter(([key, _]) =>
          saveTimelineVariables.includes(key)
        )
      );
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
    this.dependencies.runOnStartExtensionCallbacks(this.getParameterValue("extensions"));
  }

  private onLoad = () => {
    this.runParameterCallback("on_load");
    this.dependencies.runOnLoadExtensionCallbacks(this.getParameterValue("extensions"));
  };

  private async onFinish() {
    const extensionResults = await this.dependencies.runOnFinishExtensionCallbacks(
      this.getParameterValue("extensions")
    );
    Object.assign(this.result, extensionResults);

    this.runParameterCallback("on_finish", this.getResult());

    this.dependencies.onTrialFinished(this);
  }

  public evaluateTimelineVariable(variable: TimelineVariable) {
    // Timeline variable values are specified at the timeline level, not at the trial level, hence
    // deferring to the parent timeline here
    return this.parent?.evaluateTimelineVariable(variable);
  }

  public getParameterValue(
    parameterPath: string | string[],
    options: GetParameterValueOptions = {}
  ) {
    // Disable recursion for timeline description keys
    if (
      timelineDescriptionKeys.includes(
        typeof parameterPath === "string" ? parameterPath : parameterPath[0]
      )
    ) {
      options.recursive = false;
    }
    return super.getParameterValue(parameterPath, options);
  }

  /**
   * Retrieves and evaluates the `simulation_options` parameter, considering nested properties and
   * global simulation options.
   */
  public getSimulationOptions() {
    const simulationOptions: SimulationOptions = deepCopy(
      this.getParameterValue("simulation_options", {
        replaceResult: (result) => {
          if (typeof result === "undefined") {
            return deepCopy(this.dependencies.getGlobalSimulationOptions().default);
          }

          // Evaluate parameter functions and timeline variables beforehand since they might return
          // a string that we can use in the next step
          if (typeof result === "function") {
            result = result();
          }
          if (result instanceof TimelineVariable) {
            result = this.evaluateTimelineVariable(result);
          }

          if (typeof result === "string") {
            // Look up the global simulation options by their key
            const globalSimulationOptions = this.dependencies.getGlobalSimulationOptions();
            return globalSimulationOptions[result] ?? globalSimulationOptions["default"];
          }

          return result;
        },
      })
    );

    if (typeof simulationOptions === "undefined") {
      return {};
    }

    simulationOptions.mode = this.getParameterValue(["simulation_options", "mode"]);
    simulationOptions.simulate = this.getParameterValue(["simulation_options", "simulate"]);
    simulationOptions.data = this.getParameterValue(["simulation_options", "data"]);

    if (typeof simulationOptions.data === "object") {
      simulationOptions.data = Object.fromEntries(
        Object.keys(simulationOptions.data).map((key) => [
          key,
          this.getParameterValue(["simulation_options", "data", key]),
        ])
      );
    }

    return simulationOptions;
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
            parameterValue = parameterValue.map((_, arrayIndex) => {
              const arrayElementPath = [...parameterPath, arrayIndex.toString()];
              const arrayElementValue = this.getParameterValue(arrayElementPath);
              assignParameterValues(arrayElementValue, parameterConfig.nested, arrayElementPath);
              return arrayElementValue;
            });
          } else {
            // ...for the nested object
            assignParameterValues(parameterValue, parameterConfig.nested, parameterPath);
          }
        }

        parameterObject[parameterName] = parameterValue;
      }
    };

    const trialObject = deepCopy(this.description);
    assignParameterValues(trialObject, this.pluginInfo.parameters);
    this.trialObject = trialObject;
  }

  public getLatestNode() {
    return this;
  }
}
