import { Class } from "type-fest";

import { JsPsychPlugin } from "../modules/plugins";

export function isPromise(value: any): value is Promise<any> {
  return value && typeof value["then"] === "function";
}

export class TimelineVariable {
  constructor(public readonly name: string) {}
}

export interface TrialDescription extends Record<string, any> {
  type: Class<JsPsychPlugin<any>>;

  /** https://www.jspsych.org/latest/overview/plugins/#the-post_trial_gap-iti-parameter */
  post_trial_gap?: number;

  /** https://www.jspsych.org/latest/overview/style/#using-the-css_classes-trial-parameter */
  css_classes?: string;

  /** https://www.jspsych.org/latest/overview/simulation/#controlling-simulation-mode-with-simulation_options */
  simulation_options?: any;

  // Events

  /** https://www.jspsych.org/latest/overview/events/#on_start-trial */
  on_start?: (trial: any) => void;

  /** https://www.jspsych.org/latest/overview/events/#on_load */
  on_load?: () => void;

  /** https://www.jspsych.org/latest/overview/events/#on_finish-trial */
  on_finish?: (data: any) => void;
}

/** https://www.jspsych.org/latest/overview/timeline/#sampling-methods */
export type SampleOptions =
  | { type: "with-replacement"; size: number; weights?: number[] }
  | { type: "without-replacement"; size: number }
  | { type: "fixed-repetitions"; size: number }
  | { type: "alternate-groups"; groups: number[][]; randomize_group_order?: boolean }
  | { type: "custom"; fn: (ids: number[]) => number[] };

export type TimelineArray = Array<TimelineDescription | TrialDescription>;

export interface TimelineDescription extends Record<string, any> {
  timeline: TimelineArray;
  timeline_variables?: Record<string, any>[];

  // Control flow

  /** https://www.jspsych.org/latest/overview/timeline/#repeating-a-set-of-trials */
  repetitions?: number;

  /** https://www.jspsych.org/latest/overview/timeline/#looping-timelines */
  loop_function?: (data: any) => boolean;

  /** https://www.jspsych.org/latest/overview/timeline/#conditional-timelines */
  conditional_function?: () => boolean;

  // Randomization

  /** https://www.jspsych.org/latest/overview/timeline/#random-orders-of-trials */
  randomize_order?: boolean;

  /** https://www.jspsych.org/latest/overview/timeline/#sampling-methods */
  sample?: SampleOptions;

  // Events

  /** https://www.jspsych.org/latest/overview/events/#on_timeline_start */
  on_timeline_start?: () => void;

  /** https://www.jspsych.org/latest/overview/events/#on_timeline_finish */
  on_timeline_finish?: () => void;
}

export const timelineDescriptionKeys = [
  "timeline",
  "timeline_variables",
  "repetitions",
  "loop_function",
  "conditional_function",
  "randomize_order",
  "sample",
  "on_timeline_start",
  "on_timeline_finish",
];

export function isTrialDescription(
  description: TrialDescription | TimelineDescription
): description is TrialDescription {
  return !isTimelineDescription(description);
}

export function isTimelineDescription(
  description: TrialDescription | TimelineDescription
): description is TimelineDescription {
  return Boolean((description as TimelineDescription).timeline);
}

export enum TimelineNodeStatus {
  PENDING,
  RUNNING,
  PAUSED,
  COMPLETED,
  ABORTED,
}

export type GetParameterValueOptions = { evaluateFunctions?: boolean; recursive?: boolean };

export interface TimelineNode {
  readonly description: TimelineDescription | TrialDescription;
  readonly index: number;

  run(): Promise<void>;
  getStatus(): TimelineNodeStatus;

  /**
   * Recursively evaluates the given timeline variable, starting at the current timeline node.
   * Returns the result, or `undefined` if the variable is neither specified in the timeline
   * description of this node, nor in the description of any parent node.
   */
  evaluateTimelineVariable(variable: TimelineVariable): any;

  /**
   * Retrieves a parameter value from the description of this timeline node, recursively falling
   * back to the description of each parent timeline node if `recursive` is not set to `false`. If
   * the parameter...
   *
   * * is a timeline variable, evaluates the variable and returns the result.
   * * is not specified, returns `undefined`.
   * * is a function and `evaluateFunctions` is not set to `false`, invokes the function and returns
   *   its return value
   *
   * `parameterName` may include dots to signal nested object properties.
   */
  getParameterValue(parameterName: string, options?: GetParameterValueOptions): any;
}

export type TrialResult = Record<string, any>;
export type TrialResults = Array<Record<string, any>>;
