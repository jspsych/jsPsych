// import cloze from "@jspsych/plugin-cloze";
import htmlKeyboardResponse from "@jspsych/plugin-html-keyboard-response";

import { JsPsych, JsPsychPlugin, TrialType, parameterType } from "../../src";
import { clickTarget, pressKey, startTimeline } from "../utils";

// import surveyMultiChoice from "@jspsych/plugin-survey-multi-choice";
// import surveyText from "@jspsych/plugin-survey-text";

describe("standard use of function as parameter", () => {
  test("function value is used as parameter", async () => {
    const { getHTML } = await startTimeline([
      {
        type: htmlKeyboardResponse,
        stimulus: () => "foo",
      },
    ]);

    expect(getHTML()).toMatch("foo");
    pressKey("a");
  });

  test.skip("parameters can be protected from early evaluation using jsPsych.plugins.parameterType.FUNCTION", async () => {
    var mock = jest.fn();

    await startTimeline([
      {
        // @ts-ignore TODO enable this test once the plugin is a class
        type: cloze,
        text: "%foo%",
        check_answers: true,
        mistake_fn: mock,
      },
    ]);

    expect(mock).not.toHaveBeenCalled();
    clickTarget(document.querySelector("#finish_cloze_button"));
    expect(mock).toHaveBeenCalledTimes(1);
  });
});

describe("data as function", () => {
  test("entire data object can be function", async () => {
    const { getData } = await startTimeline([
      {
        type: htmlKeyboardResponse,
        stimulus: "foo",
        data: () => ({ x: 1 }),
      },
    ]);

    pressKey("a");
    expect(getData().values()[0].x).toBe(1);
  });

  test("single parameter of data object can be function", async () => {
    const { getData } = await startTimeline([
      {
        type: htmlKeyboardResponse,
        stimulus: "foo",
        data: {
          x: () => 1,
        },
      },
    ]);

    pressKey("a");
    expect(getData().values()[0].x).toBe(1);
  });
});

describe("nested parameters as functions", () => {
  test.skip("entire parameter can be a function", async () => {
    const { displayElement, expectFinished } = await startTimeline([
      {
        // @ts-ignore TODO enable this test once the plugin is a class
        type: surveyText,
        questions: () => [{ prompt: "How old are you?" }, { prompt: "Where were you born?" }],
      },
    ]);

    expect(displayElement.querySelectorAll("p.jspsych-survey-text").length).toBe(2);
    clickTarget(document.querySelector("#jspsych-survey-text-next"));
    await expectFinished();
  });

  test.skip("nested parameter can be a function", async () => {
    const { expectFinished } = await startTimeline([
      {
        // @ts-ignore TODO enable this test once the plugin is a class
        type: surveyText,
        questions: [
          {
            prompt: () => {
              return "foo";
            },
          },
          { prompt: "bar" },
        ],
      },
    ]);

    expect(document.querySelector("#jspsych-survey-text-0 p.jspsych-survey-text").innerHTML).toBe(
      "foo"
    );
    expect(document.querySelector("#jspsych-survey-text-1 p.jspsych-survey-text").innerHTML).toBe(
      "bar"
    );
    clickTarget(document.querySelector("#jspsych-survey-text-next"));
    await expectFinished();
  });

  test.skip("multiple nested parameters can be functions", async () => {
    const { expectFinished } = await startTimeline([
      {
        // @ts-ignore TODO enable this test once the plugin is a class
        type: surveyMultiChoice,
        questions: [
          {
            prompt: () => {
              return "foo";
            },
            options: () => {
              return ["buzz", "fizz"];
            },
          },
          {
            prompt: "bar",
            options: () => {
              return ["one", "two"];
            },
          },
        ],
      },
    ]);

    expect(document.querySelector("#jspsych-survey-multi-choice-0").innerHTML).toMatch("foo");
    expect(document.querySelector("#jspsych-survey-multi-choice-0").innerHTML).toMatch("buzz");
    expect(document.querySelector("#jspsych-survey-multi-choice-1").innerHTML).toMatch("bar");
    expect(document.querySelector("#jspsych-survey-multi-choice-1").innerHTML).toMatch("one");
    clickTarget(document.querySelector("#jspsych-survey-multi-choice-next"));
    await expectFinished();
  });

  test("nested parameters can be protected from early evaluation using jsPsych.plugins.parameterType.FUNCTION", async () => {
    // currently no plugins that use this feature (Jan. 2021), so here's a simple placeholder plugin.

    const info = <const>{
      name: "function-test-plugin",
      parameters: {
        foo: {
          type: parameterType.COMPLEX,
          default: null,
          nested: {
            not_protected: {
              type: parameterType.STRING,
              default: null,
            },
            protected: {
              type: parameterType.FUNCTION,
              default: null,
            },
          },
        },
      },
    };

    class FunctionTestPlugin implements JsPsychPlugin<typeof info> {
      static info = info;

      constructor(private jsPsych: JsPsych) {}

      trial(display_element: HTMLElement, trial: TrialType<typeof info>) {
        this.jsPsych.finishTrial({
          not_protected: trial.foo[0].not_protected,
          protected: trial.foo[0].protected,
        });
      }
    }

    const { getData } = await startTimeline([
      {
        type: FunctionTestPlugin,
        foo: [
          {
            not_protected: () => {
              return "x";
            },
            protected: () => {
              return "y";
            },
          },
        ],
      },
    ]);

    const data = getData().values()[0];
    expect(data.not_protected).toBe("x");
    expect(data.protected).not.toBe("y");
    expect(data.protected()).toBe("y");
  });
});
