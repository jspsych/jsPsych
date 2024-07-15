import { flushPromises } from "@jspsych/test-utils";
import { JsPsych, JsPsychPlugin, TrialType } from "jspsych";

import { ParameterInfos } from "../src/modules/plugins";
import { SimulationMode, SimulationOptions, TrialResult } from "../src/timeline";
import { PromiseWrapper } from "../src/timeline/util";

export const testPluginInfo = <const>{
  name: "test",
  version: "0.0.1",
  parameters: {},
  data: {},
};

class TestPlugin implements JsPsychPlugin<typeof testPluginInfo> {
  static info = testPluginInfo;

  static setParameterInfos(parameters: ParameterInfos) {
    TestPlugin.info = { ...testPluginInfo, parameters };
  }

  static resetPluginInfo() {
    TestPlugin.info = testPluginInfo;
  }

  static defaultTrialResult: Record<string, any> = { my: "result" };

  private static finishTrialMode: "immediate" | "manual" = "immediate";

  /**
   * Disables immediate finishing of the `trial` method of all `TestPlugin` instances. Instead, any
   * running trial can be finished by invoking `TestPlugin.finishTrial()`.
   */
  static setManualFinishTrialMode() {
    TestPlugin.finishTrialMode = "manual";
  }

  /**
   * Makes the `trial` method of all instances of `TestPlugin` finish immediately and allows to
   * manually finish the trial by invoking `TestPlugin.finishTrial()` instead.
   */
  static setImmediateFinishTrialMode() {
    TestPlugin.finishTrialMode = "immediate";
  }

  private static trialPromise = new PromiseWrapper<Record<string, any>>();

  /**
   * Resolves the promise returned by `trial()` with the provided `result` or
   * `TestPlugin.defaultTrialResult` if no `result` object was passed.
   **/
  static async finishTrial(result?: Record<string, any>) {
    TestPlugin.trialPromise.resolve(result ?? TestPlugin.defaultTrialResult);
    await flushPromises();
  }

  static defaultTrialImplementation(
    display_element: HTMLElement,
    trial: TrialType<typeof testPluginInfo>,
    on_load: () => void
  ): void | Promise<TrialResult | void> {
    on_load();
    if (TestPlugin.finishTrialMode === "immediate") {
      return Promise.resolve(TestPlugin.defaultTrialResult);
    }
    return TestPlugin.trialPromise.get();
  }

  public static trial = TestPlugin.defaultTrialImplementation;

  static defaultSimulateImplementation(
    trial: TrialType<typeof testPluginInfo>,
    simulation_mode: SimulationMode,
    simulation_options: SimulationOptions,
    on_load?: () => void
  ): void | Promise<void | TrialResult> {
    return TestPlugin.defaultTrialImplementation(document.createElement("div"), trial, on_load);
  }

  public static simulate = TestPlugin.defaultSimulateImplementation;

  /** Resets all static properties including function implementations */
  static reset() {
    TestPlugin.defaultTrialResult = { my: "result" };
    TestPlugin.trial = TestPlugin.defaultTrialImplementation;
    TestPlugin.simulate = TestPlugin.defaultSimulateImplementation;
    TestPlugin.resetPluginInfo();
    TestPlugin.setImmediateFinishTrialMode();
  }

  constructor(private jsPsych: JsPsych) {}

  trial = jest.fn(TestPlugin.trial);
  simulate = jest.fn(TestPlugin.simulate);
}

export default TestPlugin;
