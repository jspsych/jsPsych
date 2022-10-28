import { Class } from "type-fest";

import { JsPsych, JsPsychPlugin } from "../src";
import { TimelineNodeDependencies, TrialResult } from "../src/timeline";
import { PromiseWrapper } from "../src/timeline/util";

jest.mock("../src/JsPsych");

/**
 * A class to instantiate mocked `TimelineNodeDependencies` objects that have additional
 * testing-related functions.
 */
export class TimelineNodeDependenciesMock implements TimelineNodeDependencies {
  onTrialStart = jest.fn();
  onTrialResultAvailable = jest.fn();
  onTrialFinished = jest.fn();

  runOnStartExtensionCallbacks = jest.fn();
  runOnLoadExtensionCallbacks = jest.fn();
  runOnFinishExtensionCallbacks: jest.Mock<Promise<Record<string, any>>>;

  instantiatePlugin: jest.Mock<JsPsychPlugin<any>>;
  getDisplayElement: jest.Mock<HTMLElement>;
  getDefaultIti: jest.Mock<number>;

  finishTrialPromise: PromiseWrapper<TrialResult>;
  jsPsych: JsPsych; // So we have something for plugins in `instantiatePlugin`

  constructor() {
    this.initializeProperties();
  }

  private displayElement: HTMLDivElement;

  private initializeProperties() {
    this.runOnFinishExtensionCallbacks = jest.fn().mockResolvedValue({});
    this.instantiatePlugin = jest.fn(
      (pluginClass: Class<JsPsychPlugin<any>>) => new pluginClass(this.jsPsych)
    );
    this.getDisplayElement = jest.fn(() => this.displayElement);
    this.getDefaultIti = jest.fn(() => 0);

    this.finishTrialPromise = new PromiseWrapper<TrialResult>();
    this.jsPsych = new JsPsych();

    this.displayElement = document.createElement("div");
  }

  // Test utility functions
  reset() {
    this.initializeProperties();

    for (const mock of [
      this.onTrialStart,
      this.onTrialResultAvailable,
      this.onTrialFinished,
      this.runOnStartExtensionCallbacks,
      this.runOnLoadExtensionCallbacks,
    ]) {
      mock.mockReset();
    }
  }
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
