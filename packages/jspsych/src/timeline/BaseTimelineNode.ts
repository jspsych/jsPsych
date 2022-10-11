import get from "lodash.get";
import has from "lodash.has";

import { Timeline } from "./Timeline";
import {
  GetParameterValueOptions,
  TimelineDescription,
  TimelineNode,
  TimelineNodeDependencies,
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

  constructor(protected readonly dependencies: TimelineNodeDependencies) {}

  getStatus() {
    return this.status;
  }

  getParameterValue(parameterPath: string | string[], options: GetParameterValueOptions = {}) {
    const {
      parameterObject = this.description,
      evaluateFunctions = true,
      recursive = true,
    } = options;

    let result: any;
    if (has(parameterObject, parameterPath)) {
      result = get(parameterObject, parameterPath);
    } else if (recursive && this.parent) {
      result = this.parent.getParameterValue(parameterPath, options);
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
