import { JsPsych, JsPsychPlugin, ParameterType, TrialType } from "jspsych";

export const testPluginInfo = <const>{
  name: "test",
  parameters: {},
};

class TestPlugin implements JsPsychPlugin<typeof testPluginInfo> {
  static info = testPluginInfo;

  constructor(private jsPsych: JsPsych) {}

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
