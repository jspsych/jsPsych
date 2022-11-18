import get from "lodash/get.js";
import has from "lodash/has.js";
import set from "lodash/set.js";

import type { Timeline } from "./Timeline";
import {
  TimelineArray,
  TimelineDescription,
  TimelineNodeDependencies,
  TimelineNodeStatus,
  TimelineVariable,
  TrialDescription,
  TrialResult,
} from ".";

export type GetParameterValueOptions = {
  /**
   * If true, and the retrieved parameter value is a function, invoke the function and return its
   * return value (defaults to `true`)
   */
  evaluateFunctions?: boolean;

  /**
   * Whether to fall back to parent timeline node parameters (defaults to `true`)
   */
  recursive?: boolean;

  /**
   * Whether or not the requested parameter is of `ParameterType.COMPLEX` (defaults to `false`). If
   * `true`, the result of the parameter lookup will be cached by the timeline node for successive
   * lookups of nested properties or array elements.
   **/
  isComplexParameter?: boolean;

  /**
   * A function that will be invoked with the original result before evaluating parameter functions
   * and timeline variables. Whatever it returns will subsequently be used instead of the original
   * result.
   */
  replaceResult?: (originalResult: any) => any;
};

export abstract class TimelineNode {
  public abstract readonly description: TimelineDescription | TrialDescription | TimelineArray;

  /**
   * The globally unique trial index of this node. It is set when the node is run. Timeline nodes
   * have the same trial index as their first trial.
   */
  public index?: number;

  public abstract readonly parent?: Timeline;

  abstract run(): Promise<void>;

  /**
   * Returns a flat array of all currently available results of this node
   */
  abstract getResults(): TrialResult[];

  /**
   * Recursively evaluates the given timeline variable, starting at the current timeline node.
   * Returns the result, or `undefined` if the variable is neither specified in the timeline
   * description of this node, nor in the description of any parent node.
   */
  abstract evaluateTimelineVariable(variable: TimelineVariable): any;

  /**
   * Returns the most recent (child) TimelineNode. For trial nodes, this is always the trial node
   * itself since trial nodes do not have child nodes. For timeline nodes, the return value is a
   * Trial object most of the time, but it may also be a Timeline object when a timeline hasn't yet
   * instantiated its children (e.g. during initial timeline callback functions).
   */
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

  /**
   * Retrieves a parameter value from the description of this timeline node, recursively falling
   * back to the description of each parent timeline node unless `recursive` is set to `false`. If
   * the parameter...
   *
   * * is a timeline variable, evaluates the variable and returns the result.
   * * is not specified, returns `undefined`.
   * * is a function and `evaluateFunctions` is not set to `false`, invokes the function and returns
   *   its return value
   *
   * @param parameterPath The path of the respective parameter in the timeline node description. If
   * the path is an array, nested object properties or array items will be looked up.
   * @param options See {@link GetParameterValueOptions}
   */
  public getParameterValue(
    parameterPath: string | string[],
    options: GetParameterValueOptions = {}
  ): any {
    const { evaluateFunctions = true, recursive = true, replaceResult } = options;
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

    if (typeof replaceResult === "function") {
      result = replaceResult(result);
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
  public getDataParameter(): Record<string, any> | undefined {
    const data = this.getParameterValue("data", { isComplexParameter: true });

    if (typeof data !== "object") {
      return undefined;
    }

    return {
      ...Object.fromEntries(
        Object.keys(data).map((key) => [key, this.getParameterValue(["data", key])])
      ),
      ...this.parent?.getDataParameter(),
    };
  }
}
