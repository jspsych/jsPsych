import get from "lodash.get";
import has from "lodash.has";
import set from "lodash.set";

import { Timeline } from "./Timeline";
import {
  GetParameterValueOptions,
  TimelineDescription,
  TimelineNode,
  TimelineNodeDependencies,
  TimelineNodeStatus,
  TimelineVariable,
  TrialDescription,
  TrialResult,
} from ".";

export abstract class BaseTimelineNode implements TimelineNode {
  public abstract readonly description: TimelineDescription | TrialDescription;
  public index?: number;

  public abstract readonly parent?: Timeline;

  abstract run(): Promise<void>;
  abstract getResults(): TrialResult[];
  abstract evaluateTimelineVariable(variable: TimelineVariable): any;
  abstract getLatestNode(): TimelineNode;

  protected status = TimelineNodeStatus.PENDING;

  constructor(protected readonly dependencies: TimelineNodeDependencies) {}

  getStatus() {
    return this.status;
  }

  private parameterValueCache: Record<string, any> = {};

  /**
   * Resets all cached parameter values in this timeline node and all of its parents. This is
   * necessary to re-evaluate function parameters and timeline variables at each new trial.
   */
  protected resetParameterValueCache() {
    this.parameterValueCache = {};
    this.parent?.resetParameterValueCache();
  }

  getParameterValue(parameterPath: string | string[], options: GetParameterValueOptions = {}) {
    const { evaluateFunctions = true, recursive = true } = options;
    let parameterObject: Record<string, any> = this.description;

    if (Array.isArray(parameterPath) && parameterPath.length > 1) {
      // Lookup of a nested parameter: Let's query the cache for the parent parameter
      const parentParameterPath = parameterPath.slice(0, parameterPath.length - 1);
      if (get(this.parameterValueCache, parentParameterPath)) {
        // Parent parameter found in cache, let's use the cache for the child parameter lookup
        parameterObject = this.parameterValueCache;
      }
    }

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

    // Cache the result if the parameter is complex
    if (options?.isComplexParameter) {
      set(this.parameterValueCache, parameterPath, result);
    }
    return result;
  }

  /**
   * Retrieves and evaluates the `data` parameter. It is different from other parameters in that
   * it's properties may be functions that have to be evaluated, and parent nodes' data parameter
   * properties are merged into the result.
   */
  public getDataParameter() {
    const data = this.getParameterValue("data", { isComplexParameter: true });

    if (typeof data !== "object") {
      return data;
    }

    return {
      ...Object.fromEntries(
        Object.keys(data).map((key) => [key, this.getParameterValue(["data", key])])
      ),
      ...this.parent?.getDataParameter(),
    };
  }
}
