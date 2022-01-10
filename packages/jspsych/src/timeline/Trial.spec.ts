import { JsPsych, initJsPsych } from "jspsych";
import { mocked } from "ts-jest/utils";

import TestPlugin from "../../tests/TestPlugin";
import { Timeline } from "./Timeline";
import { Trial } from "./Trial";
import { TimelineNode, TimelineVariable, TrialDescription } from ".";

jest.mock("../../tests/TestPlugin");
jest.mock("./Timeline");
const TestPluginMock = mocked(TestPlugin, true);

describe("Trial", () => {
  let jsPsych: JsPsych;

  beforeEach(() => {
    jsPsych = initJsPsych();
    TestPluginMock.mockReset();
    TestPluginMock.prototype.trial.mockImplementation(() => {
      jsPsych.finishTrial({ my: "result" });
    });
  });

  const createTrial = (description: TrialDescription) => new Trial(jsPsych, description);

  describe("run()", () => {
    it("instantiates the corresponding plugin", async () => {
      const trial = new Trial(jsPsych, { type: TestPlugin });

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
});
