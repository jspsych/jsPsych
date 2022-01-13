import { JsPsych, initJsPsych } from "jspsych";
import { mocked } from "ts-jest/utils";

import TestPlugin from "../../tests/TestPlugin";
import { ParameterInfos, ParameterType } from "../modules/plugins";
import { Timeline } from "./Timeline";
import { Trial } from "./Trial";
import { TimelineVariable, TrialDescription } from ".";

jest.mock("../../tests/TestPlugin");
jest.mock("./Timeline");
const TestPluginMock = mocked(TestPlugin, true);

const setTestPluginParameters = (parameters: ParameterInfos) => {
  // @ts-expect-error info is declared as readonly
  TestPlugin.info.parameters = parameters;
};

describe("Trial", () => {
  let jsPsych: JsPsych;
  let timeline: Timeline;

  beforeEach(() => {
    jsPsych = initJsPsych();
    TestPluginMock.mockReset();
    TestPluginMock.prototype.trial.mockImplementation(() => {
      jsPsych.finishTrial({ my: "result" });
    });
    setTestPluginParameters({});

    timeline = new Timeline(jsPsych, { timeline: [] });
  });

  const createTrial = (description: TrialDescription) => new Trial(jsPsych, description, timeline);

  describe("run()", () => {
    it("instantiates the corresponding plugin", async () => {
      const trial = new Trial(jsPsych, { type: TestPlugin }, timeline);

      await trial.run();

      expect(trial.pluginInstance).toBeInstanceOf(TestPlugin);
    });

    it("invokes the `on_start` callback", async () => {
      const onStartCallback = jest.fn();
      const description = { type: TestPlugin, on_start: onStartCallback };
      const trial = createTrial(description);
      await trial.run();

      expect(onStartCallback).toHaveBeenCalledTimes(1);
      expect(onStartCallback).toHaveBeenCalledWith(description);
    });

    it("properly invokes the plugin's `trial` method", async () => {
      const trial = createTrial({ type: TestPlugin });
      await trial.run();

      expect(trial.pluginInstance.trial).toHaveBeenCalledTimes(1);
      expect(trial.pluginInstance.trial).toHaveBeenCalledWith(
        expect.any(HTMLElement),
        { type: TestPlugin },
        expect.any(Function)
      );
    });

    it("accepts changes to the trial description made by the `on_start` callback", async () => {
      const onStartCallback = jest.fn();
      const description = { type: TestPlugin, on_start: onStartCallback };

      onStartCallback.mockImplementation((trial) => {
        // We should have a writeable copy here, not the original trial description:
        expect(trial).not.toBe(description);
        trial.stimulus = "changed";
      });

      const trial = createTrial(description);
      await trial.run();

      expect(trial.pluginInstance.trial).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({ stimulus: "changed" }),
        expect.anything()
      );
    });

    describe("if `trial` returns a promise", () => {
      beforeEach(() => {
        TestPluginMock.prototype.trial.mockImplementation(
          async (display_element, trial, on_load) => {
            on_load();
            return { promised: "result" };
          }
        );
      });

      it("doesn't invoke the `on_load` callback ", async () => {
        const onLoadCallback = jest.fn();
        const trial = createTrial({ type: TestPlugin, on_load: onLoadCallback });

        await trial.run();

        expect(onLoadCallback).toHaveBeenCalledTimes(1);
      });

      it("picks up the result data from the promise", async () => {
        const trial = createTrial({ type: TestPlugin });
        await trial.run();
        expect(trial.resultData).toEqual({ promised: "result" });
      });
    });

    describe("if `trial` returns no promise", () => {
      it("invokes the `on_load` callback", async () => {
        const onLoadCallback = jest.fn();
        const trial = createTrial({ type: TestPlugin, on_load: onLoadCallback });
        await trial.run();

        expect(onLoadCallback).toHaveBeenCalledTimes(1);
      });

      it("picks up the result data from the `finishTrial()` function", async () => {
        const trial = createTrial({ type: TestPlugin });

        await trial.run();
        expect(trial.resultData).toEqual({ my: "result" });
      });
    });

    it("invokes the `on_finish` callback with the result data", async () => {
      const onFinishCallback = jest.fn();
      const trial = createTrial({ type: TestPlugin, on_finish: onFinishCallback });
      await trial.run();

      expect(onFinishCallback).toHaveBeenCalledTimes(1);
      expect(onFinishCallback).toHaveBeenCalledWith({ my: "result" });
    });

    describe("with a plugin parameter specification", () => {
      const functionDefaultValue = () => {};
      beforeEach(() => {
        setTestPluginParameters({
          string: { type: ParameterType.STRING, default: null },
          requiredString: { type: ParameterType.STRING },
          stringArray: { type: ParameterType.STRING, default: [], array: true },
          function: { type: ParameterType.FUNCTION, default: functionDefaultValue },
          complex: { type: ParameterType.COMPLEX, default: {} },
          requiredComplexNested: {
            type: ParameterType.COMPLEX,
            nested: {
              child: { type: ParameterType.STRING, default: "I'm nested." },
              requiredChild: { type: ParameterType.STRING },
            },
          },
        });
      });

      it("resolves missing parameter values from parent timeline and sets default values", async () => {
        mocked(timeline).getParameterValue.mockImplementation((parameterName) =>
          parameterName === "requiredString" ? "foo" : undefined
        );
        const trial = createTrial({
          type: TestPlugin,
          requiredComplexNested: { requiredChild: "bar" },
        });

        await trial.run();

        // `requiredString` should have been resolved from the parent timeline
        expect(trial.pluginInstance.trial).toHaveBeenCalledWith(
          expect.anything(),
          {
            type: TestPlugin,
            string: null,
            requiredString: "foo",
            stringArray: [],
            function: functionDefaultValue,
            complex: {},
            requiredComplexNested: { child: "I'm nested.", requiredChild: "bar" },
          },
          expect.anything()
        );
      });

      it("errors on missing required parameters", async () => {
        await expect(
          createTrial({
            type: TestPlugin,
            requiredComplexNested: { requiredChild: "bar" },
          }).run()
        ).rejects.toEqual(expect.any(Error));

        await expect(
          createTrial({
            type: TestPlugin,
            requiredString: "foo",
          }).run()
        ).rejects.toEqual(expect.any(Error));

        await expect(
          createTrial({
            type: TestPlugin,
            requiredString: "foo",
            requiredComplexNested: {},
          }).run()
        ).rejects.toEqual(expect.any(Error));
      });

      it("evaluates parameter functions", async () => {
        const functionParameter = () => "invalid";
        const trial = createTrial({
          type: TestPlugin,
          function: functionParameter,
          requiredString: () => "foo",
          requiredComplexNested: { requiredChild: () => "bar" },
        });

        await trial.run();

        expect(trial.pluginInstance.trial).toHaveBeenCalledWith(
          expect.anything(),
          expect.objectContaining({
            function: functionParameter,
            requiredString: "foo",
            requiredComplexNested: expect.objectContaining({ requiredChild: "bar" }),
          }),
          expect.anything()
        );
      });

      it("evaluates timeline variables, including those returned from parameter functions", async () => {
        mocked(timeline).evaluateTimelineVariable.mockImplementation((variable: TimelineVariable) =>
          variable.name === "x" ? "foo" : undefined
        );

        const trial = createTrial({
          type: TestPlugin,
          requiredString: new TimelineVariable("x"),
          requiredComplexNested: { requiredChild: () => new TimelineVariable("x") },
        });

        await trial.run();

        // The `x` timeline variables should have been replaced with `foo`
        expect(trial.pluginInstance.trial).toHaveBeenCalledWith(
          expect.anything(),
          expect.objectContaining({
            requiredString: "foo",
            requiredComplexNested: expect.objectContaining({ requiredChild: "foo" }),
          }),
          expect.anything()
        );
      });
    });
  });

  describe("evaluateTimelineVariable()", () => {
    it("defers to the parent node", () => {
      const timeline = new Timeline(jsPsych, { timeline: [] });
      mocked(timeline).evaluateTimelineVariable.mockReturnValue(1);

      const trial = new Trial(jsPsych, { type: TestPlugin }, timeline);

      const variable = new TimelineVariable("x");
      expect(trial.evaluateTimelineVariable(variable)).toBe(1);
      expect(timeline.evaluateTimelineVariable).toHaveBeenCalledWith(variable);
    });
  });

  describe("getParameterValue()", () => {
    // Note: The BaseTimelineNode `getParameterValue()` implementation is tested in the unit tests
    // of the `Timeline` class

    it("ignores builtin trial parameters", async () => {
      const trial = new Trial(
        jsPsych,
        {
          type: TestPlugin,
          post_trial_gap: 0,
          css_classes: "",
          simulation_options: {},
          on_start: jest.fn(),
          on_load: jest.fn(),
          on_finish: jest.fn(),
        },
        timeline
      );

      expect(trial.getParameterValue("type")).toBeUndefined();
      expect(trial.getParameterValue("post_trial_gap")).toBeUndefined();
      expect(trial.getParameterValue("css_classes")).toBeUndefined();
      expect(trial.getParameterValue("simulation_options")).toBeUndefined();
      expect(trial.getParameterValue("on_start")).toBeUndefined();
      expect(trial.getParameterValue("on_load")).toBeUndefined();
      expect(trial.getParameterValue("on_finish")).toBeUndefined();
    });
  });
});
