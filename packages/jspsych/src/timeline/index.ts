import { JsPsychExtension } from "src/modules/extensions";
import { Class } from "type-fest";

import { JsPsychPlugin, PluginInfo } from "../modules/plugins";
import { Trial } from "./Trial";
import { PromiseWrapper } from "./util";

export class TimelineVariable {
  constructor(public readonly name: string) {}
}

export type Parameter<T> = T | (() => T) | TimelineVariable;

export type TrialExtensionsConfiguration = Array<{
  type: Class<JsPsychExtension>;
  params?: Record<string, any>;
}>;

export interface TrialDescription extends Record<string, any> {
  type: Parameter<Class<JsPsychPlugin<any>>>;

  /** https://www.jspsych.org/latest/overview/plugins/#the-post_trial_gap-iti-parameter */
  post_trial_gap?: Parameter<number>;

  /** https://www.jspsych.org/7.3/overview/plugins/#the-save_trial_parameters-parameter */
  save_trial_parameters?: Parameter<Record<string, boolean>>;

  /** https://www.jspsych.org/latest/overview/style/#using-the-css_classes-trial-parameter */
  css_classes?: Parameter<string | string[]>;

  /** https://www.jspsych.org/latest/overview/simulation/#controlling-simulation-mode-with-simulation_options */
  simulation_options?: Parameter<any>;

  /** https://www.jspsych.org/7.3/overview/extensions/ */
  extensions?: Parameter<TrialExtensionsConfiguration>;

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

export type TimelineArray = Array<TimelineDescription | TrialDescription | TimelineArray>;

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
  description: TrialDescription | TimelineDescription | TimelineArray
): description is TimelineDescription | TimelineArray {
  return Boolean((description as TimelineDescription).timeline) || Array.isArray(description);
}

export enum TimelineNodeStatus {
  PENDING,
  RUNNING,
  PAUSED,
  COMPLETED,
  ABORTED,
}

/**
 * Functions and options needed by `TimelineNode`s, provided by the `JsPsych` instance. This
 * approach allows to keep the public `JsPsych` API slim and decouples the `JsPsych` and timeline
 * node classes, simplifying unit testing.
 */
export interface TimelineNodeDependencies {
  /**
   * Called at the start of a trial, prior to invoking the plugin's trial method.
   */
  onTrialStart: (trial: Trial) => void;

  /**
   * Called when a trial's result data is available, before invoking `onTrialFinished()`.
   */
  onTrialResultAvailable: (trial: Trial) => void;

  /**
   * Called after a trial has finished.
   */
  onTrialFinished: (trial: Trial) => void;

  /**
   * Invoke `on_start` extension callbacks according to `extensionsConfiguration`
   */
  runOnStartExtensionCallbacks(extensionsConfiguration: TrialExtensionsConfiguration): void;

  /**
   * Invoke `on_load` extension callbacks according to `extensionsConfiguration`
   */
  runOnLoadExtensionCallbacks(extensionsConfiguration: TrialExtensionsConfiguration): void;

  /**
   * Invoke `on_finish` extension callbacks according to `extensionsConfiguration` and return a
   * joint extensions result object
   */
  runOnFinishExtensionCallbacks(
    extensionsConfiguration: TrialExtensionsConfiguration
  ): Promise<Record<string, any>>;

  /**
   * Given a plugin class, create a new instance of it and return it.
   */
  instantiatePlugin: <Info extends PluginInfo>(
    pluginClass: Class<JsPsychPlugin<Info>>
  ) => JsPsychPlugin<Info>;

  /**
   * Return JsPsych's display element so it can be provided to plugins
   */
  getDisplayElement: () => HTMLElement;

  /**
   * Return the default inter-trial interval as provided to `initJsPsych()`
   */
  getDefaultIti: () => number;

  /**
   * A `PromiseWrapper` whose promise is resolved with result data whenever `jsPsych.finishTrial()`
   * is called.
   */
  finishTrialPromise: PromiseWrapper<TrialResult | void>;
}

export type TrialResult = Record<string, any>;
export type TrialResults = Array<Record<string, any>>;
