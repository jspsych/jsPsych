import { Class } from "type-fest";

import { JsPsych, JsPsychPlugin } from "../src";
import { TimelineNodeDependencies, TrialResult } from "../src/timeline";
import { PromiseWrapper } from "../src/timeline/util";

jest.mock("../src/JsPsych");

/**
 * A class to instantiate mock `TimelineNodeDependencies` objects
 */
export class TimelineNodeDependenciesMock implements TimelineNodeDependencies {
  private jsPsych = new JsPsych(); // So we have something for plugins in `instantiatePlugin`
  private displayElement = document.createElement("div");

  onTrialStart = jest.fn();
  onTrialResultAvailable = jest.fn();
  onTrialFinished = jest.fn();

  runOnStartExtensionCallbacks = jest.fn();
  runOnLoadExtensionCallbacks = jest.fn();
  runOnFinishExtensionCallbacks = jest.fn<
    ReturnType<TimelineNodeDependencies["runOnFinishExtensionCallbacks"]>,
    any
  >(async () => ({}));

  getSimulationMode = jest.fn<ReturnType<TimelineNodeDependencies["getSimulationMode"]>, any>();
  getGlobalSimulationOptions = jest.fn<
    ReturnType<TimelineNodeDependencies["getGlobalSimulationOptions"]>,
    any
  >(() => ({}));

  instantiatePlugin = jest.fn(
    (pluginClass: Class<JsPsychPlugin<any>>) => new pluginClass(this.jsPsych)
  );

  getDisplayElement = jest.fn(() => this.displayElement);
  getDefaultIti = jest.fn(() => 0);

  finishTrialPromise = new PromiseWrapper<TrialResult>();

  clearAllTimeouts = jest.fn();
}

/**
 * Returns utilities for capturing the result of a provided `snapshotFunction` with a callback
 * function and store its result in a `snapshots` object, keyed by an arbitrary name.
 */
export function createSnapshotUtils<SnapshotValueType>(snapshotFunction: () => SnapshotValueType) {
  const snapshots: Record<string, SnapshotValueType> = {};
  const createSnapshotCallback = (snapshotName: string) => () => {
    snapshots[snapshotName] = snapshotFunction();
  };

  return { snapshots, createSnapshotCallback };
}

/**
 * Returns utilities for saving the invocation order of callback functions.
 */
export function createInvocationOrderUtils() {
  const invocations: string[] = [];
  const createInvocationOrderCallback = (callbackName: string) => () => {
    invocations.push(callbackName);
  };

  return { invocations, createInvocationOrderCallback };
}
