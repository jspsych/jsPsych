import { Class } from "type-fest";

import { JsPsych, JsPsychPlugin } from "../src";
import { TimelineNodeDependencies, TrialResult } from "../src/timeline";
import { PromiseWrapper } from "../src/timeline/util";

jest.mock("../src/JsPsych");

/**
 * A class to instantiate mocked `TimelineNodeDependencies` objects that have additional
 * testing-related functions.
 */
export class MockTimelineNodeDependencies implements TimelineNodeDependencies {
  onTrialStart = jest.fn();
  onTrialLoaded = jest.fn();
  onTrialFinished = jest.fn();

  instantiatePlugin = jest.fn(
    (pluginClass: Class<JsPsychPlugin<any>>) => new pluginClass(this.jsPsych)
  );

  defaultIti: number;
  displayElement: HTMLDivElement;
  finishTrialPromise: PromiseWrapper<TrialResult>;
  jsPsych: JsPsych; // So we have something for plugins in `instantiatePlugin`

  constructor() {
    this.initializeProperties();
  }

  private initializeProperties() {
    this.defaultIti = 0;
    this.displayElement = document.createElement("div");
    this.finishTrialPromise = new PromiseWrapper<TrialResult>();
    this.jsPsych = new JsPsych();
  }

  // Test utility functions
  reset() {
    this.onTrialStart.mockReset();
    this.onTrialLoaded.mockReset();
    this.onTrialFinished.mockReset();
    this.instantiatePlugin.mockClear();
    this.initializeProperties();
  }
}
