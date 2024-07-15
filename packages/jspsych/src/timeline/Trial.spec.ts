import { flushPromises } from "@jspsych/test-utils";
import { ConditionalKeys } from "type-fest";

import { TimelineNodeDependenciesMock, createInvocationOrderUtils } from "../../tests/test-utils";
import TestPlugin from "../../tests/TestPlugin";
import { JsPsychPlugin, ParameterType } from "../modules/plugins";
import { Timeline } from "./Timeline";
import { Trial } from "./Trial";
import { PromiseWrapper, parameterPathArrayToString } from "./util";
import {
  SimulationOptionsParameter,
  TimelineVariable,
  TrialDescription,
  TrialExtensionsConfiguration,
} from ".";

jest.useFakeTimers();

jest.mock("./Timeline");

describe("Trial", () => {
  let dependencies: TimelineNodeDependenciesMock;
  let timeline: Timeline;

  beforeEach(() => {
    dependencies = new TimelineNodeDependenciesMock();
    TestPlugin.reset();

    timeline = new Timeline(dependencies, { timeline: [] });
    timeline.index = 0;
  });

  const createTrial = (description: TrialDescription) => {
    const trial = new Trial(dependencies, description, timeline);
    trial.index = timeline.index;
    return trial;
  };

  describe("run()", () => {
    it("instantiates the corresponding plugin", async () => {
      const trial = createTrial({ type: TestPlugin });

      await trial.run();

      expect(trial.pluginInstance).toBeInstanceOf(TestPlugin);
    });

    it("invokes the local `on_start` and the global `onTrialStart` callback", async () => {
      const onStartCallback = jest.fn();
      const description = { type: TestPlugin, on_start: onStartCallback };
      const trial = createTrial(description);
      await trial.run();

      expect(onStartCallback).toHaveBeenCalledTimes(1);
      expect(onStartCallback).toHaveBeenCalledWith(description);
      expect(dependencies.onTrialStart).toHaveBeenCalledTimes(1);
      expect(dependencies.onTrialStart).toHaveBeenCalledWith(trial);
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
      it("doesn't automatically invoke the `on_load` callback", async () => {
        const onLoadCallback = jest.fn();
        const trial = createTrial({ type: TestPlugin, on_load: onLoadCallback });

        await trial.run();

        // TestPlugin invokes the callback for us in the `trial` method
        expect(onLoadCallback).toHaveBeenCalledTimes(1);
      });

      it("picks up the result data from the promise or the `finishTrial()` function (where the latter one takes precedence)", async () => {
        const trial1 = createTrial({ type: TestPlugin });
        await trial1.run();
        expect(trial1.getResult()).toEqual(expect.objectContaining({ my: "result" }));

        TestPlugin.trial = async (display_element, trial, on_load) => {
          on_load();
          dependencies.finishTrialPromise.resolve({ finishTrial: "result" });
          return { my: "result" };
        };

        const trial2 = createTrial({ type: TestPlugin });
        await trial2.run();
        expect(trial2.getResult()).toEqual(expect.objectContaining({ finishTrial: "result" }));
      });
    });

    describe("if `trial` returns no promise", () => {
      beforeAll(() => {
        TestPlugin.trial = () => {
          dependencies.finishTrialPromise.resolve({ my: "result" });
        };
      });

      it("invokes the local `on_load` callback", async () => {
        const onLoadCallback = jest.fn();
        const trial = createTrial({ type: TestPlugin, on_load: onLoadCallback });
        await trial.run();

        expect(onLoadCallback).toHaveBeenCalledTimes(1);
      });

      it("picks up the result data from the `finishTrial()` function", async () => {
        const trial = createTrial({ type: TestPlugin });

        await trial.run();
        expect(trial.getResult()).toEqual(expect.objectContaining({ my: "result" }));
      });
    });

    it("respects the `css_classes` trial parameter", async () => {
      const displayElement = dependencies.getDisplayElement();

      let trial = createTrial({ type: TestPlugin, css_classes: "class1" });
      expect(displayElement.classList.value).toEqual("");
      trial.run();
      expect(displayElement.classList.value).toEqual("class1");
      await TestPlugin.finishTrial();
      expect(displayElement.classList.value).toEqual("");

      trial = createTrial({ type: TestPlugin, css_classes: ["class1", "class2"] });
      expect(displayElement.classList.value).toEqual("");
      trial.run();
      expect(displayElement.classList.value).toEqual("class1 class2");
      await TestPlugin.finishTrial();
      expect(displayElement.classList.value).toEqual("");
    });

    it("invokes the local `on_finish` callback with the result data", async () => {
      const onFinishCallback = jest.fn();
      const trial = createTrial({ type: TestPlugin, on_finish: onFinishCallback });
      await trial.run();

      expect(onFinishCallback).toHaveBeenCalledTimes(1);
      expect(onFinishCallback).toHaveBeenCalledWith(expect.objectContaining({ my: "result" }));
    });

    it("awaits async `on_finish` callbacks", async () => {
      const onFinishCallbackPromise = new PromiseWrapper();
      const trial = createTrial({
        type: TestPlugin,
        on_finish: () => onFinishCallbackPromise.get(),
      });

      let hasTrialCompleted = false;
      trial.run().then(() => {
        hasTrialCompleted = true;
      });

      await flushPromises();
      expect(hasTrialCompleted).toBe(false);

      onFinishCallbackPromise.resolve();
      await flushPromises();

      expect(hasTrialCompleted).toBe(true);
    });

    it("invokes the global `onTrialResultAvailable` and `onTrialFinished` callbacks", async () => {
      const invocations: string[] = [];
      dependencies.onTrialResultAvailable.mockImplementationOnce(() => {
        invocations.push("onTrialResultAvailable");
      });
      dependencies.onTrialFinished.mockImplementationOnce(() => {
        invocations.push("onTrialFinished");
      });

      const trial = createTrial({ type: TestPlugin });
      await trial.run();

      expect(dependencies.onTrialResultAvailable).toHaveBeenCalledTimes(1);
      expect(dependencies.onTrialResultAvailable).toHaveBeenCalledWith(trial);

      expect(dependencies.onTrialFinished).toHaveBeenCalledTimes(1);
      expect(dependencies.onTrialFinished).toHaveBeenCalledWith(trial);

      expect(invocations).toEqual(["onTrialResultAvailable", "onTrialFinished"]);
    });

    it("includes result data from the `data` parameter", async () => {
      const trial = createTrial({ type: TestPlugin, data: { custom: "value" } });
      await trial.run();
      expect(trial.getResult()).toEqual(expect.objectContaining({ my: "result", custom: "value" }));
    });

    it("includes a set of trial-specific result properties", async () => {
      const trial = createTrial({ type: TestPlugin });
      await trial.run();
      expect(trial.getResult()).toEqual(
        expect.objectContaining({ trial_type: "test", trial_index: 0 })
      );
    });

    it("respects the `save_trial_parameters` parameter", async () => {
      const consoleSpy = jest.spyOn(console, "warn").mockImplementation();

      TestPlugin.setParameterInfos({
        stringParameter1: { type: ParameterType.STRING },
        stringParameter2: { type: ParameterType.STRING },
        stringParameter3: { type: ParameterType.STRING },
        stringParameter4: { type: ParameterType.STRING },
        complexArrayParameter: { type: ParameterType.COMPLEX, array: true },
        functionParameter: { type: ParameterType.FUNCTION },
      });
      TestPlugin.defaultTrialResult = {
        result: "foo",
        stringParameter2: "string",
        stringParameter3: "string",
      };
      const trial = createTrial({
        type: TestPlugin,
        stringParameter1: "string",
        stringParameter2: "string",
        stringParameter3: "string",
        stringParameter4: "string",
        functionParameter: jest.fn(),
        complexArrayParameter: [{ child: "foo" }, () => ({ child: "bar" })],

        save_trial_parameters: {
          stringParameter3: false,
          stringParameter4: true,
          functionParameter: true,
          complexArrayParameter: true,
          result: false, // Since `result` is not a parameter, this should be ignored
        },
      });
      await trial.run();
      const result = trial.getResult();

      // By default, parameters should not be added:
      expect(result).not.toHaveProperty("stringParameter1");

      // If the plugin adds them, they should not be removed either:
      expect(result).toHaveProperty("stringParameter2", "string");

      // When explicitly set to false, parameters should be removed if the plugin adds them
      expect(result).not.toHaveProperty("stringParameter3");

      // When set to true, parameters should be added
      expect(result).toHaveProperty("stringParameter4", "string");

      // Function parameters should be stringified
      expect(result).toHaveProperty("functionParameter", jest.fn().toString());

      // Non-parameter data should be left untouched and a warning should be issued
      expect(result).toHaveProperty("result", "foo");
      expect(consoleSpy).toHaveBeenCalledTimes(1);
      expect(consoleSpy).toHaveBeenCalledWith(
        'Non-existent parameter "result" specified in save_trial_parameters.'
      );
      consoleSpy.mockRestore();
    });

    it("respects the `save_timeline_variables` parameter", async () => {
      jest.mocked(timeline.getAllTimelineVariables).mockReturnValue({ a: 1, b: 2, c: 3 });

      let trial = createTrial({ type: TestPlugin });
      await trial.run();
      expect(trial.getResult().timeline_variables).toBeUndefined();

      trial = createTrial({ type: TestPlugin, save_timeline_variables: true });
      await trial.run();
      expect(trial.getResult().timeline_variables).toEqual({ a: 1, b: 2, c: 3 });

      trial = createTrial({ type: TestPlugin, save_timeline_variables: ["a", "d"] });
      await trial.run();
      expect(trial.getResult().timeline_variables).toEqual({ a: 1 });
    });

    describe("with a plugin parameter specification", () => {
      const functionDefaultValue = () => {};
      beforeEach(() => {
        TestPlugin.setParameterInfos({
          string: { type: ParameterType.STRING, default: null },
          requiredString: { type: ParameterType.STRING },
          stringArray: { type: ParameterType.STRING, default: [], array: true },
          function: { type: ParameterType.FUNCTION, default: functionDefaultValue },
          complex: {
            type: ParameterType.COMPLEX,
            default: { requiredChild: "default" },
            nested: {
              requiredChild: { type: ParameterType.STRING },
            },
          },
          requiredComplexNested: {
            type: ParameterType.COMPLEX,
            nested: {
              child: { type: ParameterType.STRING, default: "I'm nested." },
              requiredChild: { type: ParameterType.STRING },
            },
          },
          requiredComplexNestedArray: {
            type: ParameterType.COMPLEX,
            array: true,
            nested: {
              child: { type: ParameterType.STRING, default: "I'm nested." },
              requiredChild: { type: ParameterType.STRING },
            },
          },
        });
      });

      it("resolves missing parameter values from parent timeline and sets default values", async () => {
        jest.mocked(timeline).getParameterValue.mockImplementation((parameterPath) => {
          if (Array.isArray(parameterPath)) {
            parameterPath = parameterPathArrayToString(parameterPath);
          }

          if (parameterPath === "requiredString") {
            return "foo";
          }
          if (parameterPath === "requiredComplexNestedArray[0].requiredChild") {
            return "foo";
          }
          return undefined;
        });
        const trial = createTrial({
          type: TestPlugin,
          requiredComplexNested: { requiredChild: "bar" },
          requiredComplexNestedArray: [
            // This empty object is allowed because `requiredComplexNestedArray[0]` is (simulated to
            // be) set as a parent timeline parameter:
            {},
            { requiredChild: "bar" },
          ],
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
            complex: { requiredChild: "default" },
            requiredComplexNested: { child: "I'm nested.", requiredChild: "bar" },
            requiredComplexNestedArray: [
              { child: "I'm nested.", requiredChild: "foo" },
              { child: "I'm nested.", requiredChild: "bar" },
            ],
          },
          expect.anything()
        );
      });

      it("errors when an `array` parameter is not an array", async () => {
        TestPlugin.setParameterInfos({
          stringArray: { type: ParameterType.STRING, array: true },
        });

        // This should work:
        await createTrial({ type: TestPlugin, stringArray: [] }).run();

        // This shouldn't:
        await expect(
          createTrial({ type: TestPlugin, stringArray: {} }).run()
        ).rejects.toThrowErrorMatchingInlineSnapshot(
          '"A non-array value (`[object Object]`) was provided for the array parameter "stringArray" in the "test" plugin. Please make sure that "stringArray" is an array."'
        );
        await expect(
          createTrial({ type: TestPlugin, stringArray: 1 }).run()
        ).rejects.toThrowErrorMatchingInlineSnapshot(
          '"A non-array value (`1`) was provided for the array parameter "stringArray" in the "test" plugin. Please make sure that "stringArray" is an array."'
        );
      });

      it("evaluates parameter functions", async () => {
        const functionParameter = () => "invalid";
        const trial = createTrial({
          type: TestPlugin,
          function: functionParameter,
          requiredString: () => "foo",
          requiredComplexNested: () => ({
            requiredChild: () => "bar",
          }),
          requiredComplexNestedArray: () => [() => ({ requiredChild: () => "bar" })],
        });

        await trial.run();

        expect(trial.pluginInstance.trial).toHaveBeenCalledWith(
          expect.anything(),
          expect.objectContaining({
            function: functionParameter,
            requiredString: "foo",
            requiredComplexNested: expect.objectContaining({ requiredChild: "bar" }),
            requiredComplexNestedArray: [expect.objectContaining({ requiredChild: "bar" })],
          }),
          expect.anything()
        );
      });

      it("evaluates timeline variables, including those returned from parameter functions", async () => {
        jest
          .mocked(timeline)
          .evaluateTimelineVariable.mockImplementation((variable: TimelineVariable) => {
            switch (variable.name) {
              case "t":
                return TestPlugin;
              case "x":
                return "foo";
              default:
                return undefined;
            }
          });

        const trial = createTrial({
          type: new TimelineVariable("t"),
          requiredString: new TimelineVariable("x"),
          requiredComplexNested: { requiredChild: () => new TimelineVariable("x") },
          requiredComplexNestedArray: [{ requiredChild: () => new TimelineVariable("x") }],
        });

        await trial.run();

        // The `x` timeline variables should have been replaced with `foo`
        expect(trial.pluginInstance.trial).toHaveBeenCalledWith(
          expect.anything(),
          expect.objectContaining({
            requiredString: "foo",
            requiredComplexNested: expect.objectContaining({ requiredChild: "foo" }),
            requiredComplexNestedArray: [expect.objectContaining({ requiredChild: "foo" })],
          }),
          expect.anything()
        );
      });

      it("allows null values for parameters with a non-null default value", async () => {
        TestPlugin.setParameterInfos({
          allowedNullString: { type: ParameterType.STRING, default: "foo" },
        });

        const trial = createTrial({ type: TestPlugin, allowedNullString: null });
        await trial.run();

        expect(trial.pluginInstance.trial).toHaveBeenCalledWith(
          expect.anything(),
          expect.objectContaining({ allowedNullString: null }),
          expect.anything()
        );
      });

      describe("with missing required parameters", () => {
        it("errors on missing simple parameters", async () => {
          TestPlugin.setParameterInfos({ requiredString: { type: ParameterType.STRING } });

          // This should work:
          await createTrial({ type: TestPlugin, requiredString: "foo" }).run();

          // This shouldn't:
          await expect(createTrial({ type: TestPlugin }).run()).rejects.toThrow(
            '"requiredString" parameter'
          );
        });

        it("errors on missing parameters nested in `COMPLEX` parameters", async () => {
          TestPlugin.setParameterInfos({
            requiredComplexNested: {
              type: ParameterType.COMPLEX,
              nested: { requiredChild: { type: ParameterType.STRING } },
            },
          });

          // This should work:
          await createTrial({
            type: TestPlugin,
            requiredComplexNested: { requiredChild: "bar" },
          }).run();

          // This shouldn't:
          await expect(createTrial({ type: TestPlugin }).run()).rejects.toThrow(
            '"requiredComplexNested" parameter'
          );
          await expect(
            createTrial({ type: TestPlugin, requiredComplexNested: {} }).run()
          ).rejects.toThrowError('"requiredComplexNested.requiredChild" parameter');
        });

        it("errors on missing parameters nested in `COMPLEX` array parameters", async () => {
          TestPlugin.setParameterInfos({
            requiredComplexNestedArray: {
              type: ParameterType.COMPLEX,
              array: true,
              nested: { requiredChild: { type: ParameterType.STRING } },
            },
          });

          // This should work:
          await createTrial({ type: TestPlugin, requiredComplexNestedArray: [] }).run();
          await createTrial({
            type: TestPlugin,
            requiredComplexNestedArray: [{ requiredChild: "bar" }],
          }).run();

          // This shouldn't:
          await expect(createTrial({ type: TestPlugin }).run()).rejects.toThrow(
            '"requiredComplexNestedArray" parameter'
          );
          await expect(
            createTrial({ type: TestPlugin, requiredComplexNestedArray: [{}] }).run()
          ).rejects.toThrow('"requiredComplexNestedArray[0].requiredChild" parameter');
          await expect(
            createTrial({
              type: TestPlugin,
              requiredComplexNestedArray: [{ requiredChild: "bar" }, {}],
            }).run()
          ).rejects.toThrow('"requiredComplexNestedArray[1].requiredChild" parameter');
        });
      });
    });

    it("respects `default_iti` and `post_trial_gap``", async () => {
      dependencies.getDefaultIti.mockReturnValue(100);
      TestPlugin.setManualFinishTrialMode();

      const trial1 = createTrial({ type: TestPlugin });

      let hasTrial1Completed = false;
      trial1.run().then(() => {
        hasTrial1Completed = true;
      });

      await TestPlugin.finishTrial();
      expect(hasTrial1Completed).toBe(false);

      jest.advanceTimersByTime(100);
      await flushPromises();
      expect(hasTrial1Completed).toBe(true);

      const trial2 = createTrial({ type: TestPlugin, post_trial_gap: () => 200 });

      let hasTrial2Completed = false;
      trial2.run().then(() => {
        hasTrial2Completed = true;
      });

      await TestPlugin.finishTrial();
      expect(hasTrial2Completed).toBe(false);

      jest.advanceTimersByTime(100);
      await flushPromises();
      expect(hasTrial2Completed).toBe(false);

      jest.advanceTimersByTime(100);
      await flushPromises();
      expect(hasTrial2Completed).toBe(true);
    });

    it("skips inter-trial interval in data-only simulation mode", async () => {
      dependencies.getSimulationMode.mockReturnValue("data-only");
      TestPlugin.setManualFinishTrialMode();

      const trial = createTrial({ type: TestPlugin, post_trial_gap: 100 });

      let hasTrialCompleted = false;
      trial.run().then(() => {
        hasTrialCompleted = true;
      });

      await TestPlugin.finishTrial();
      expect(hasTrialCompleted).toBe(true);
    });

    it("invokes extension callbacks and includes extension results", async () => {
      dependencies.runOnFinishExtensionCallbacks.mockResolvedValue({ extension: "result" });

      const extensionsConfig: TrialExtensionsConfiguration = [
        { type: jest.fn(), params: { my: "option" } },
      ];

      const trial = createTrial({
        type: TestPlugin,
        extensions: extensionsConfig,
      });
      await trial.run();

      expect(dependencies.runOnStartExtensionCallbacks).toHaveBeenCalledTimes(1);
      expect(dependencies.runOnStartExtensionCallbacks).toHaveBeenCalledWith(extensionsConfig);

      expect(dependencies.runOnLoadExtensionCallbacks).toHaveBeenCalledTimes(1);
      expect(dependencies.runOnLoadExtensionCallbacks).toHaveBeenCalledWith(extensionsConfig);

      expect(dependencies.runOnFinishExtensionCallbacks).toHaveBeenCalledTimes(1);
      expect(dependencies.runOnFinishExtensionCallbacks).toHaveBeenCalledWith(extensionsConfig);
      expect(trial.getResult()).toEqual(expect.objectContaining({ extension: "result" }));
    });

    it("invokes all callbacks in a proper order", async () => {
      const { createInvocationOrderCallback, invocations } = createInvocationOrderUtils();

      const dependencyCallbacks: Array<ConditionalKeys<TimelineNodeDependenciesMock, jest.Mock>> = [
        "onTrialStart",
        "onTrialResultAvailable",
        "onTrialFinished",
        "runOnStartExtensionCallbacks",
        "runOnLoadExtensionCallbacks",
        "runOnFinishExtensionCallbacks",
      ];

      for (const callbackName of dependencyCallbacks) {
        (dependencies[callbackName] as jest.Mock).mockImplementation(
          createInvocationOrderCallback(callbackName)
        );
      }

      const trial = createTrial({
        type: TestPlugin,
        extensions: [{ type: jest.fn(), params: { my: "option" } }],
        on_start: createInvocationOrderCallback("on_start"),
        on_load: createInvocationOrderCallback("on_load"),
        on_finish: createInvocationOrderCallback("on_finish"),
      });

      await trial.run();

      expect(invocations).toEqual([
        "onTrialStart",
        "on_start",
        "runOnStartExtensionCallbacks",

        "on_load",
        "runOnLoadExtensionCallbacks",

        "onTrialResultAvailable",

        "runOnFinishExtensionCallbacks",
        "on_finish",
        "onTrialFinished",
      ]);
    });

    describe("in simulation mode", () => {
      beforeEach(() => {
        dependencies.getSimulationMode.mockReturnValue("data-only");
      });

      it("invokes the plugin's `simulate` method instead of `trial`", async () => {
        const trial = createTrial({ type: TestPlugin });
        await trial.run();

        expect(trial.pluginInstance.trial).not.toHaveBeenCalled();

        expect(trial.pluginInstance.simulate).toHaveBeenCalledTimes(1);
        expect(trial.pluginInstance.simulate).toHaveBeenCalledWith(
          { type: TestPlugin },
          "data-only",
          {},
          expect.any(Function)
        );
      });

      it("doesn't invoke `on_load`, even when `simulate` doesn't return a promise", async () => {
        TestPlugin.simulate = () => {
          dependencies.finishTrialPromise.resolve({});
        };

        const onLoad = jest.fn();
        await createTrial({ type: TestPlugin, on_load: onLoad }).run();

        expect(onLoad).not.toHaveBeenCalled();
      });

      it("invokes the plugin's `trial` method if the plugin has no `simulate` method", async () => {
        const trial = createTrial({
          type: class implements JsPsychPlugin<any> {
            static info = { name: "test", parameters: {} };
            trial = jest.fn(async () => ({}));
          },
        });
        await trial.run();

        expect(trial.pluginInstance.trial).toHaveBeenCalled();
      });

      it("invokes the plugin's `trial` method if `simulate` is `false` in the trial's simulation options", async () => {
        const trial = createTrial({ type: TestPlugin, simulation_options: { simulate: false } });
        await trial.run();

        expect(trial.pluginInstance.trial).toHaveBeenCalled();
        expect(trial.pluginInstance.simulate).not.toHaveBeenCalled();
      });

      it("respects the `mode` parameter from the trial's simulation options", async () => {
        const trial = createTrial({ type: TestPlugin, simulation_options: { mode: "visual" } });
        await trial.run();

        expect(jest.mocked(trial.pluginInstance.simulate).mock.calls[0][1]).toBe("visual");
      });
    });
  });

  describe("getResult[s]()", () => {
    it("returns the result once it is available", async () => {
      TestPlugin.setManualFinishTrialMode();
      const trial = createTrial({ type: TestPlugin });
      trial.run();

      expect(trial.getResult()).toBeUndefined();
      expect(trial.getResults()).toEqual([]);

      await TestPlugin.finishTrial();

      expect(trial.getResult()).toEqual(expect.objectContaining({ my: "result" }));
      expect(trial.getResults()).toEqual([expect.objectContaining({ my: "result" })]);
    });

    it("does not return the result when the `record_data` trial parameter is `false`", async () => {
      TestPlugin.setManualFinishTrialMode();
      const trial = createTrial({ type: TestPlugin, record_data: false });
      trial.run();

      expect(trial.getResult()).toBeUndefined();
      expect(trial.getResults()).toEqual([]);

      await TestPlugin.finishTrial();

      expect(trial.getResult()).toBeUndefined();
      expect(trial.getResults()).toEqual([]);
    });
  });

  describe("evaluateTimelineVariable()", () => {
    it("defers to the parent node", () => {
      jest.mocked(timeline).evaluateTimelineVariable.mockReturnValue(1);

      const trial = new Trial(dependencies, { type: TestPlugin }, timeline);

      const variable = new TimelineVariable("x");
      expect(trial.evaluateTimelineVariable(variable)).toEqual(1);
      expect(timeline.evaluateTimelineVariable).toHaveBeenCalledWith(variable);
    });
  });

  describe("getParameterValue()", () => {
    it("disables recursive lookups of timeline description keys", async () => {
      const trial = createTrial({ type: TestPlugin });

      for (const parameter of [
        "timeline",
        "timeline_variables",
        "repetitions",
        "loop_function",
        "conditional_function",
        "randomize_order",
        "sample",
        "on_timeline_start",
        "on_timeline_finish",
      ]) {
        expect(trial.getParameterValue(parameter)).toBeUndefined();
        expect(timeline.getParameterValue).not.toHaveBeenCalled();
      }
    });
  });

  describe("getSimulationOptions()", () => {
    const createSimulationTrial = (simulationOptions?: SimulationOptionsParameter | string) =>
      createTrial({
        type: TestPlugin,
        simulation_options: simulationOptions,
      });

    it("merges in global default simulation options", async () => {
      dependencies.getGlobalSimulationOptions.mockReturnValue({
        default: { data: { rt: 0, custom: "default" } },
        foo: { data: { custom: "foo" } },
      });

      expect(createSimulationTrial({ data: { rt: 1 } }).getSimulationOptions()).toEqual({
        data: { rt: 1, custom: "default" },
      });

      expect(createSimulationTrial("foo").getSimulationOptions()).toEqual({
        data: { rt: 0, custom: "foo" },
      });
    });

    describe("if no trial-level simulation options are set", () => {
      it("falls back to parent timeline simulation options", async () => {
        jest
          .mocked(timeline.getParameterValue)
          .mockImplementation((parameterPath) =>
            parameterPath.toString() === "simulation_options" ? { data: { rt: 1 } } : undefined
          );

        expect(createTrial({ type: TestPlugin }).getSimulationOptions()).toEqual({
          data: { rt: 1 },
        });
      });

      it("falls back to global default simulation options ", async () => {
        expect(createTrial({ type: TestPlugin }).getSimulationOptions()).toEqual({});

        dependencies.getGlobalSimulationOptions.mockReturnValue({ default: { data: { rt: 1 } } });
        expect(createTrial({ type: TestPlugin }).getSimulationOptions()).toEqual({
          data: { rt: 1 },
        });
      });
    });

    describe("when trial-level simulation options are a string", () => {
      beforeEach(() => {
        dependencies.getGlobalSimulationOptions.mockReturnValue({
          default: { data: { rt: 1 } },
          custom: { data: { rt: 2 } },
        });
      });

      it("looks up the corresponding global simulation options key", async () => {
        expect(createSimulationTrial("custom").getSimulationOptions()).toEqual({ data: { rt: 2 } });
      });

      it("falls back to the global default simulation options ", async () => {
        expect(createSimulationTrial("nonexistent").getSimulationOptions()).toEqual({
          data: { rt: 1 },
        });
      });
    });

    describe("when `simulation_options` is a function that returns a string", () => {
      it("looks up the corresponding global simulation options key", async () => {
        jest.mocked(dependencies.getGlobalSimulationOptions).mockReturnValue({
          foo: { data: { rt: 1 } },
        });

        expect(
          createTrial({ type: TestPlugin, simulation_options: () => "foo" }).getSimulationOptions()
        ).toEqual({
          data: { rt: 1 },
        });
      });
    });

    it("evaluates (nested) functions and timeline variables", async () => {
      const timelineVariables = { x: "foo" };
      jest.mocked(dependencies.getGlobalSimulationOptions).mockReturnValue({
        foo: { data: { rt: 0 } },
      });
      jest
        .mocked(timeline.evaluateTimelineVariable)
        .mockImplementation((variable) => timelineVariables[variable.name]);

      expect(createSimulationTrial(() => new TimelineVariable("x")).getSimulationOptions()).toEqual(
        { data: { rt: 0 } }
      );

      expect(
        createSimulationTrial(() => ({
          data: () => ({ rt: () => 1 }),
          simulate: () => true,
          mode: () => "visual",
        })).getSimulationOptions()
      ).toEqual({ data: { rt: 1 }, simulate: true, mode: "visual" });

      jest.mocked(timeline.evaluateTimelineVariable).mockReturnValue({ data: { rt: 2 } });
      expect(createSimulationTrial(new TimelineVariable("x")).getSimulationOptions()).toEqual({
        data: { rt: 2 },
      });
    });
  });
});
