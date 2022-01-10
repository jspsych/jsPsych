import { JsPsych, JsPsychPlugin, ParameterType, TrialType } from "jspsych";

export const testPluginInfo = <const>{
  name: "test",
  parameters: {
    stimulus: {
      type: ParameterType.STRING,
      pretty_name: "Stimulus",
      default: undefined,
    },
  },
};

class TestPlugin implements JsPsychPlugin<typeof testPluginInfo> {
  static info = testPluginInfo;
  static currentInstance: TestPlugin;
  static trialFunctionSpy: jest.SpyInstance<void, [HTMLElement, TrialType<typeof testPluginInfo>]>;

  constructor(private jsPsych: JsPsych) {
    TestPlugin.currentInstance = this;
  }

  trial(
    display_element: HTMLElement,
    trial: TrialType<typeof testPluginInfo>,
    on_load: () => void
  ): void | Promise<any> {
    this.jsPsych.finishTrial({ my: "result" });
  }

  // simulate(
  //   trial: TrialType<typeof testPluginInfo>,
  //   simulation_mode,
  //   simulation_options: any,
  //   on_load: () => void
  // ) {
  // }
}

export default TestPlugin;
