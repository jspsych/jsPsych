import htmlKeyboardResponse from "@jspsych/plugin-html-keyboard-response";
import reconstruction from "@jspsych/plugin-reconstruction";
import surveyText from "@jspsych/plugin-survey-text";
import { clickTarget, pressKey, startTimeline } from "@jspsych/test-utils";

describe("Trial parameters in the data", () => {
  test("Can be added by specifying the parameter with a value of true in save_trial_parameters", async () => {
    const { getData } = await startTimeline([
      {
        type: htmlKeyboardResponse,
        stimulus: "<p>foo</p>",
        save_trial_parameters: {
          choices: true,
          trial_duration: true,
        },
      },
    ]);

    pressKey(" ");

    const data = getData().values()[0];
    expect(data.choices).not.toBeUndefined();
    expect(data.trial_duration).not.toBeUndefined();
  });

  test("Can be removed by specifying the parameter with a value of false in save_trial_parameters", async () => {
    const { getData } = await startTimeline([
      {
        type: htmlKeyboardResponse,
        stimulus: "<p>foo</p>",
        save_trial_parameters: {
          stimulus: false,
        },
      },
    ]);

    pressKey(" ");

    const data = getData().values()[0];
    expect(data.stimulus).toBeUndefined();
  });

  test("For compatibility with data access functions, internal_node_id and trial_index cannot be removed", async () => {
    const { getData } = await startTimeline([
      {
        type: htmlKeyboardResponse,
        stimulus: "<p>foo</p>",
        save_trial_parameters: {
          internal_node_id: false,
          trial_index: false,
        },
      },
    ]);

    pressKey(" ");

    const data = getData().values()[0];
    expect(data.internal_node_id).not.toBeUndefined();
    expect(data.trial_index).not.toBeUndefined();
  });

  test("Invalid parameter names throw a warning in the console", async () => {
    const spy = jest.spyOn(console, "warn").mockImplementation();

    await startTimeline([
      {
        type: htmlKeyboardResponse,
        stimulus: "<p>foo</p>",
        save_trial_parameters: {
          foo: true,
          bar: false,
        },
      },
    ]);

    pressKey(" ");

    expect(spy).toHaveBeenCalled();
    spy.mockRestore();
  });

  test("Arrayed objects work with save_trial_parameters ", async () => {
    const questions = [{ prompt: "foo" }, { prompt: "bar" }];

    const { getData } = await startTimeline([
      {
        type: surveyText,
        questions,
        save_trial_parameters: {
          questions: true,
        },
      },
    ]);

    clickTarget(document.querySelector("#jspsych-survey-text-next"));

    const data = getData().values()[0];
    expect(data.questions[0].prompt).toBe(questions[0].prompt);
    expect(data.questions[1].prompt).toBe(questions[1].prompt);
  });

  test("Function-based parameters are stored as string representations ", async () => {
    const sample_function = (param) => {
      const size = 50 + Math.floor(param * 250);
      const html =
        '<div style="display: block; margin: auto; height: 300px;">' +
        '<div style="display: block; margin: auto; background-color: #000000; ' +
        "width: " +
        size +
        "px; height: " +
        size +
        'px;"></div></div>';
      return html;
    };

    const { getData } = await startTimeline([
      {
        type: reconstruction,
        stim_function: sample_function,
        starting_value: 0.25,
        save_trial_parameters: {
          stim_function: true,
        },
      },
    ]);

    clickTarget(document.querySelector("button"));

    expect(getData().values()[0].stim_function).toBe(sample_function.toString());
  });

  test("Dynamic parameters record their evaluated value", async () => {
    const { getData } = await startTimeline([
      {
        type: htmlKeyboardResponse,
        stimulus: "<p>foo</p>",
        trial_duration: () => 1000,
        save_trial_parameters: {
          trial_duration: true,
        },
      },
    ]);

    pressKey(" ");

    expect(getData().values()[0].trial_duration).toBe(1000);
  });
});
