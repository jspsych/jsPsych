import htmlKeyboardResponse from "@jspsych/plugin-html-keyboard-response";
import { simulateTimeline } from "@jspsych/test-utils";

import { JsPsych, JsPsychPlugin, ParameterType, TrialType, initJsPsych } from "../../src";

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
});
