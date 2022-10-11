import { flushPromises } from "@jspsych/test-utils";
import { JsPsych, JsPsychPlugin, TrialType } from "jspsych";

import { ParameterInfos } from "../src/modules/plugins";
import { PromiseWrapper } from "../src/timeline/util";

export const testPluginInfo = <const>{
  name: "test",
  parameters: {},
};

class TestPlugin implements JsPsychPlugin<typeof testPluginInfo> {
  static info = testPluginInfo;

  static setParameterInfos(parameters: ParameterInfos) {
    TestPlugin.info = { ...testPluginInfo, parameters };
  }

  static resetPluginInfo() {
    TestPlugin.info = testPluginInfo;
  }

  private static defaultTrialResult: Record<string, any> = { my: "result" };

  static setDefaultTrialResult(defaultTrialResult = { my: "result" }) {
    TestPlugin.defaultTrialResult = defaultTrialResult;
  }

  private static finishTrialMode: "immediate" | "manual" = "immediate";

  /**
   * Disables immediate finishing of the `trial` method of all `TestPlugin` instances. Instead, any
   * running trial can be finished by invoking `TestPlugin.finishTrial()`.
   */
  static setManualFinishTrialMode() {
    TestPlugin.finishTrialMode = "manual";
  }

  /**
   * Makes the `trial` method of all instances of `TestPlugin` finish immediately and allows to manually finish the trial by
   * invoking `TestPlugin.finishTrial()` instead.
   */
  static setImmediateFinishTrialMode() {
    TestPlugin.finishTrialMode = "immediate";
  }

  private static trialPromise = new PromiseWrapper<Record<string, any>>();

  /**
   * Resolves the promise returned by `jsPsych.finishTrial()` with the provided `result` object or
   * `{ my: "result" }` if no `result` object was provided.
   **/
  static async finishTrial(result?: Record<string, any>) {
    TestPlugin.trialPromise.resolve(result ?? TestPlugin.defaultTrialResult);
    await flushPromises();
  }

  /** Resets all static properties including the `trial` function mock */
  static reset() {
    TestPlugin.prototype.trial
      .mockReset()
      .mockImplementation(TestPlugin.prototype.defaultTrialImplementation);
    this.resetPluginInfo();
    this.setDefaultTrialResult();
    this.setImmediateFinishTrialMode();
  }

  constructor(private jsPsych: JsPsych) {}

  // For convenience, `trial` is set to a `jest.fn` below using `TestPlugin.prototype` and
  // `defaultTrialImplementation`
  trial: jest.Mock<Promise<Record<string, any> | void> | void>;

  defaultTrialImplementation(
    display_element: HTMLElement,
    trial: TrialType<typeof testPluginInfo>,
    on_load: () => void
  ) {
    on_load();
    if (TestPlugin.finishTrialMode === "immediate") {
      return Promise.resolve(TestPlugin.defaultTrialResult);
    }
    return TestPlugin.trialPromise.get();
  }

  // simulate(
  //   trial: TrialType<typeof testPluginInfo>,
  //   simulation_mode,
  //   simulation_options: any,
  //   on_load: () => void
  // ) {
  // }
}

TestPlugin.prototype.trial = jest.fn(TestPlugin.prototype.defaultTrialImplementation);

export default TestPlugin;
