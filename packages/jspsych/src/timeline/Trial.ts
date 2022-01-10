import { JsPsych, JsPsychPlugin, ParameterType, PluginInfo, TrialType } from "jspsych";

import { deepCopy } from "../modules/utils";
import { Timeline } from "./Timeline";
import { TimelineNode, TimelineVariable, TrialDescription, isPromise } from ".";

export class Trial implements TimelineNode {
  resultData: Record<string, any>;

  public pluginInstance: JsPsychPlugin<any>;
  public readonly description: TrialDescription;

  constructor(
    private readonly jsPsych: JsPsych,
    description: TrialDescription,
    private readonly parent?: Timeline
  ) {
    this.description = deepCopy(description);
    // TODO perform checks on the description object
  }

  public async run() {
    this.onStart();

    this.pluginInstance = new this.description.type(this.jsPsych);

    let trialPromise = this.jsPsych._trialPromise;
    const trialReturnValue = this.pluginInstance.trial(
      this.jsPsych.getDisplayElement() ?? document.createElement("div"), // TODO Remove this hack once getDisplayElement() returns something
      this.description,
      this.onLoad
    );

    if (isPromise(trialReturnValue)) {
      trialPromise = trialReturnValue;
    } else {
      this.onLoad();
    }

    // Wait until the trial has completed and grab result data
    this.resultData = (await trialPromise) ?? {};

    this.onFinish();
  }

  private onStart() {
    if (this.description.on_start) {
      this.description.on_start(this.description);
    }
  }

  private onLoad = () => {
    if (this.description.on_load) {
      this.description.on_load();
    }
  };

  private onFinish() {
    if (this.description.on_finish) {
      this.description.on_finish(this.resultData);
    }
  }

  public evaluateTimelineVariable(variable: TimelineVariable) {
    // Timeline variable values are specified at the timeline level, not at the trial level, so
    // deferring to the parent timeline here
    return this.parent?.evaluateTimelineVariable(variable);
  }

  public getParameterValue(parameterName: string) {
    const localResult = this.description[parameterName];
    return typeof localResult === undefined
      ? this.parent.getParameterValue(parameterName)
      : localResult;
  }

  /**
   * Checks that the parameters provided in the trial description align with the plugin's info
   * object, sets default values for optional parameters, and resolves timeline variable parameters.
   */
  private initializeParameters() {
    const pluginInfo: PluginInfo = this.description.type["info"];
    for (const [parameterName, parameterConfig] of Object.entries(pluginInfo.parameters)) {
      // if (typeof trial.type.info.parameters[param].default === "undefined") {
      //   throw new Error(
      //     "You must specify a value for the " +
      //       param +
      //       " parameter in the " +
      //       trial.type.info.name +
      //       " plugin."
      //   );
      // } else {
      //   trial[param] = trial.type.info.parameters[param].default;
      // }
    }
  }
}
