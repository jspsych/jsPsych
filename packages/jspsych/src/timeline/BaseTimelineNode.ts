import get from "lodash.get";
import has from "lodash.has";

import { JsPsych } from "../JsPsych";
import { Timeline } from "./Timeline";
import {
  GetParameterValueOptions,
  TimelineDescription,
  TimelineNode,
  TimelineVariable,
  TrialDescription,
} from ".";

export abstract class BaseTimelineNode implements TimelineNode {
  abstract readonly description: TimelineDescription | TrialDescription;
  protected abstract readonly parent?: Timeline;

  constructor(protected readonly jsPsych: JsPsych) {}

  abstract run(): Promise<void>;
  abstract evaluateTimelineVariable(variable: TimelineVariable): any;

  getParameterValue(parameterName: string, options: GetParameterValueOptions = {}) {
    const { evaluateFunctions = false, recursive = true } = options;

    let result: any;
    if (has(this.description, parameterName)) {
      result = get(this.description, parameterName);
    } else if (recursive && this.parent) {
      result = this.parent.getParameterValue(parameterName, options);
    }

    if (typeof result === "function" && evaluateFunctions) {
      result = result();
    }
    if (result instanceof TimelineVariable) {
      result = this.evaluateTimelineVariable(result);
    }

    return result;
  }
}
