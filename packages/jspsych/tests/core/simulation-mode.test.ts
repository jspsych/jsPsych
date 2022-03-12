import htmlKeyboardResponse from "@jspsych/plugin-html-keyboard-response";
import { clickTarget, pressKey, simulateTimeline } from "@jspsych/test-utils";

import { JsPsych, JsPsychPlugin, ParameterType, TrialType, initJsPsych } from "../../src";

jest.useFakeTimers();

describe("data simulation mode", () => {
  test("jsPsych.simulate() runs as drop-in replacement for jsPsych.run()", async () => {
    const timeline = [
      {
        type: htmlKeyboardResponse,
        stimulus: "foo",
      },
    ];

    const { expectFinished, getData } = await simulateTimeline(timeline);

    await expectFinished();

    expect(getData().values().length).toBe(1);
  });

  test("Can set simulation_options at the trial level", async () => {
    const timeline = [
      {
        type: htmlKeyboardResponse,
        stimulus: "foo",
        simulation_options: {
          data: {
            rt: 100,
          },
        },
      },
    ];

    const { expectFinished, getData } = await simulateTimeline(timeline);

    await expectFinished();

    expect(getData().values()[0].rt).toBe(100);
  });

  test("Simulation options can be functions that eval at runtime", async () => {
    const timeline = [
      {
        type: htmlKeyboardResponse,
        stimulus: "foo",
        simulation_options: {
          data: {
            rt: () => {
              return 100;
            },
          },
        },
      },
      {
        type: htmlKeyboardResponse,
        stimulus: "foo",
        simulation_options: {
          data: {
            rt: () => {
              return 200;
            },
          },
        },
      },
    ];

    const { expectFinished, getData } = await simulateTimeline(timeline);

    await expectFinished();

    expect(getData().values()[0].rt).toBe(100);
    expect(getData().values()[1].rt).toBe(200);
  });

  test("Simulation options can be set using default key, only applies if no trial opts set", async () => {
    const timeline = [
      {
        type: htmlKeyboardResponse,
        stimulus: "foo",
      },
      {
        type: htmlKeyboardResponse,
        stimulus: "foo",
        simulation_options: {
          data: {
            rt: 200,
          },
        },
      },
    ];

    const simulation_options = {
      default: {
        data: {
          rt: 100,
        },
      },
    };

    const { expectFinished, getData } = await simulateTimeline(
      timeline,
      "data-only",
      simulation_options
    );

    await expectFinished();

    expect(getData().values()[0].rt).toBe(100);
    expect(getData().values()[1].rt).toBe(200);
  });

  test("Simulation options can be set using string lookup", async () => {
    const timeline = [
      {
        type: htmlKeyboardResponse,
        stimulus: "foo",
      },
      {
        type: htmlKeyboardResponse,
        stimulus: "foo",
        simulation_options: "short_trial",
      },
    ];

    const simulation_options = {
      default: {
        data: {
          rt: 100,
        },
      },
      short_trial: {
        data: {
          rt: 10,
        },
      },
    };

    const { expectFinished, getData } = await simulateTimeline(
      timeline,
      "data-only",
      simulation_options
    );

    await expectFinished();

    expect(getData().values()[0].rt).toBe(100);
    expect(getData().values()[1].rt).toBe(10);
  });

  test("Simulation options can be set with timeline variables", async () => {
    const jsPsych = initJsPsych();

    const timeline = [
      {
        timeline: [
          {
            type: htmlKeyboardResponse,
            stimulus: "foo",
            simulation_options: jsPsych.timelineVariable("sim_opt"),
          },
        ],
        timeline_variables: [{ sim_opt: "short_trial" }, { sim_opt: "long_trial" }],
      },
    ];

    const simulation_options = {
      long_trial: {
        data: {
          rt: 100,
        },
      },
      short_trial: {
        data: {
          rt: 10,
        },
      },
    };

    const { expectFinished, getData } = await simulateTimeline(
      timeline,
      "data-only",
      simulation_options,
      jsPsych
    );

    await expectFinished();

    expect(getData().values()[0].rt).toBe(10);
    expect(getData().values()[1].rt).toBe(100);
  });

  test("Simulation options can be a function that evals at run time", async () => {
    const jsPsych = initJsPsych();

    const timeline = [
      {
        type: htmlKeyboardResponse,
        stimulus: "foo",
        simulation_options: () => {
          return {
            data: {
              rt: 100,
            },
          };
        },
      },
    ];

    const { expectFinished, getData } = await simulateTimeline(timeline);

    await expectFinished();

    expect(getData().values()[0].rt).toBe(100);
  });

  test("Simulation options can be a function that evals to a string at run time", async () => {
    const jsPsych = initJsPsych();

    const timeline = [
      {
        type: htmlKeyboardResponse,
        stimulus: "foo",
        simulation_options: () => {
          return "foo";
        },
      },
    ];

    const { expectFinished, getData } = await simulateTimeline(timeline, "data-only", {
      foo: {
        data: {
          rt: 100,
        },
      },
    });

    await expectFinished();

    expect(getData().values()[0].rt).toBe(100);
  });

  test("If a plugin doesn't support simulation, it runs as usual", async () => {
    class FakePlugin {
      static info = {
        name: "fake-plugin",
        parameters: {
          foo: {
            type: ParameterType.BOOL,
            default: true,
          },
        },
      };

      constructor(private jsPsych: JsPsych) {}

      trial(display_element, trial) {
        display_element.innerHTML = "<button id='end'>CLICK</button>";
        display_element.querySelector("#end").addEventListener("click", () => {
          this.jsPsych.finishTrial({ foo: trial.foo });
        });
      }
    }

    const jsPsych = initJsPsych();

    const timeline = [
      {
        type: htmlKeyboardResponse,
        stimulus: "foo",
        simulation_options: {
          data: {
            rt: 100,
          },
        },
      },
      {
        type: FakePlugin,
      },
      {
        type: htmlKeyboardResponse,
        stimulus: "foo",
        simulation_options: {
          data: {
            rt: 200,
          },
        },
      },
    ];

    const { expectFinished, expectRunning, getData, getHTML, displayElement } =
      await simulateTimeline(timeline);

    await expectRunning();

    expect(getHTML()).toContain("button");

    clickTarget(displayElement.querySelector("#end"));

    await expectFinished();

    expect(getData().values()[0].rt).toBe(100);
    expect(getData().values()[1].foo).toBe(true);
    expect(getData().values()[2].rt).toBe(200);
  });

  test("endExperiment() works in simulation mode", async () => {
    const jsPsych = initJsPsych();

    const timeline = [
      {
        type: htmlKeyboardResponse,
        stimulus: "foo",
        on_finish: () => {
          jsPsych.endExperiment("done");
        },
      },
      {
        type: htmlKeyboardResponse,
        stimulus: "bar",
      },
    ];

    const { expectFinished, getData, getHTML } = await simulateTimeline(
      timeline,
      "data-only",
      {},
      jsPsych
    );

    await expectFinished();

    expect(getHTML()).toMatch("done");
    expect(getData().count()).toBe(1);
  });

  test("Setting mode in simulation_options will control which mode is used", async () => {
    const timeline = [
      {
        type: htmlKeyboardResponse,
        stimulus: "bar",
        simulation_options: {
          mode: "data-only",
        },
      },
      {
        type: htmlKeyboardResponse,
        stimulus: "foo",
        simulation_options: {
          mode: "visual",
        },
      },
    ];

    const { expectRunning, expectFinished, getHTML } = await simulateTimeline(timeline);

    await expectRunning();

    expect(getHTML()).toContain("foo");

    jest.runAllTimers();

    await expectFinished();
  });

  test("Trial can be run normally by specifying simulate:false in simulation options", async () => {
    const timeline = [
      {
        type: htmlKeyboardResponse,
        stimulus: "bar",
      },
      {
        type: htmlKeyboardResponse,
        stimulus: "foo",
        simulation_options: {
          simulate: false,
        },
      },
    ];

    const { expectRunning, expectFinished, getHTML } = await simulateTimeline(timeline);

    await expectRunning();

    expect(getHTML()).toContain("foo");

    jest.runAllTimers();

    await expectRunning();

    pressKey("a");

    await expectFinished();
  });

  test("Simulation in data-only mode skips post_trial_gap", async () => {
    const timeline = [
      {
        type: htmlKeyboardResponse,
        stimulus: "foo",
        post_trial_gap: 1000,
      },
      {
        type: htmlKeyboardResponse,
        stimulus: "foo",
      },
    ];

    const { expectFinished, getData } = await simulateTimeline(timeline);

    await expectFinished();

    expect(getData().values().length).toBe(2);
  });
});
