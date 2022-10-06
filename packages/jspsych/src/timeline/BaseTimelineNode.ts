import get from "lodash.get";
import has from "lodash.has";

import { JsPsych } from "../JsPsych";
import { Timeline } from "./Timeline";
import {
  GetParameterValueOptions,
  GlobalTimelineNodeCallbacks,
  TimelineDescription,
  TimelineNode,
  TimelineNodeStatus,
  TimelineVariable,
  TrialDescription,
} from ".";

export abstract class BaseTimelineNode implements TimelineNode {
  abstract readonly description: TimelineDescription | TrialDescription;
  abstract readonly index: number;

  protected abstract readonly parent?: Timeline;

  abstract run(): Promise<void>;
  abstract evaluateTimelineVariable(variable: TimelineVariable): any;

  protected status = TimelineNodeStatus.PENDING;

  constructor(
    protected readonly jsPsych: JsPsych,
    protected readonly globalCallbacks: GlobalTimelineNodeCallbacks
  ) {}

  getStatus() {
    return this.status;
  }

  getParameterValue(parameterName: string, options: GetParameterValueOptions = {}) {
    const { evaluateFunctions = true, recursive = true } = options;

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
