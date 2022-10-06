import { JsPsych } from "../src";
import { GlobalTimelineNodeCallbacks } from "../src/timeline";

export function mockDomRelatedJsPsychMethods(jsPsychInstance: JsPsych) {
  const displayElement = document.createElement("div");
  const displayContainerElement = document.createElement("div");
  jest.spyOn(jsPsychInstance, "getDisplayElement").mockImplementation(() => displayElement);
  jest
    .spyOn(jsPsychInstance, "getDisplayContainerElement")
    .mockImplementation(() => displayContainerElement);
}

/**
 * A class to instantiate mocked `GlobalTimelineNodeCallbacks` objects that have additional
 * testing-related functions.
 */
export class GlobalCallbacks implements GlobalTimelineNodeCallbacks {
  onTrialStart = jest.fn();
  onTrialLoaded = jest.fn();
  onTrialFinished = jest.fn();

  // Test utility functions
  reset() {
    this.onTrialStart.mockReset();
    this.onTrialLoaded.mockReset();
    this.onTrialFinished.mockReset();
  }
}
