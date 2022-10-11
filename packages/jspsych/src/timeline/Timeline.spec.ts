import { flushPromises } from "@jspsych/test-utils";
import { mocked } from "ts-jest/utils";

import { MockTimelineNodeDependencies } from "../../tests/test-utils";
import TestPlugin from "../../tests/TestPlugin";
import { DataCollection } from "../modules/data/DataCollection";
import {
  repeat,
  sampleWithReplacement,
  sampleWithoutReplacement,
  shuffle,
  shuffleAlternateGroups,
} from "../modules/randomization";
import { Timeline } from "./Timeline";
import { Trial } from "./Trial";
import {
  SampleOptions,
  TimelineArray,
  TimelineDescription,
  TimelineNode,
  TimelineNodeStatus,
  TimelineVariable,
} from ".";

jest.useFakeTimers();

jest.mock("../modules/randomization");

const exampleTimeline: TimelineDescription = {
  timeline: [{ type: TestPlugin }, { type: TestPlugin }, { timeline: [{ type: TestPlugin }] }],
};

const dependencies = new MockTimelineNodeDependencies();

describe("Timeline", () => {
  const createTimeline = (description: TimelineDescription | TimelineArray, parent?: Timeline) =>
    new Timeline(dependencies, description, parent);

  beforeEach(() => {
    dependencies.reset();
    TestPlugin.reset();
  });

  describe("run()", () => {
    it("instantiates proper child nodes", async () => {
      const timeline = createTimeline(exampleTimeline);

      await timeline.run();

      const children = timeline.children;
      expect(children).toEqual([expect.any(Trial), expect.any(Trial), expect.any(Timeline)]);
      expect((children[2] as Timeline).children).toEqual([expect.any(Trial)]);

      expect(children.map((child) => child.index)).toEqual([0, 1, 2]);
    });

    describe("with `pause()` and `resume()` calls`", () => {
      beforeEach(() => {
        TestPlugin.setManualFinishTrialMode();
      });

      it("pauses, resumes, and updates the results of getStatus()", async () => {
        const timeline = createTimeline({
          timeline: [
            { type: TestPlugin },
            { type: TestPlugin },
            { timeline: [{ type: TestPlugin }, { type: TestPlugin }] },
          ],
        });
        const runPromise = timeline.run();

        expect(timeline.getStatus()).toBe(TimelineNodeStatus.RUNNING);
        expect(timeline.children[0].getStatus()).toBe(TimelineNodeStatus.RUNNING);
        await TestPlugin.finishTrial();

        expect(timeline.children[0].getStatus()).toBe(TimelineNodeStatus.COMPLETED);
        expect(timeline.children[1].getStatus()).toBe(TimelineNodeStatus.RUNNING);
        timeline.pause();
        expect(timeline.getStatus()).toBe(TimelineNodeStatus.PAUSED);

        await TestPlugin.finishTrial();
        expect(timeline.children[1].getStatus()).toBe(TimelineNodeStatus.COMPLETED);
        expect(timeline.children[2].getStatus()).toBe(TimelineNodeStatus.PENDING);

        // Resolving the next trial promise shouldn't continue the experiment since no trial should be running.
        await TestPlugin.finishTrial();

        expect(timeline.children[2].getStatus()).toBe(TimelineNodeStatus.PENDING);

        timeline.resume();
        await flushPromises();
        expect(timeline.getStatus()).toBe(TimelineNodeStatus.RUNNING);
        expect(timeline.children[2].getStatus()).toBe(TimelineNodeStatus.RUNNING);

        // The child timeline is running. Let's pause the parent timeline to check whether the child
        // gets paused too
        timeline.pause();
        expect(timeline.getStatus()).toBe(TimelineNodeStatus.PAUSED);
        expect(timeline.children[2].getStatus()).toBe(TimelineNodeStatus.PAUSED);

        await TestPlugin.finishTrial();
        timeline.resume();
        await flushPromises();
        expect(timeline.children[2].getStatus()).toBe(TimelineNodeStatus.RUNNING);

        await TestPlugin.finishTrial();

        expect(timeline.children[2].getStatus()).toBe(TimelineNodeStatus.COMPLETED);
        expect(timeline.getStatus()).toBe(TimelineNodeStatus.COMPLETED);

        await runPromise;
      });

      // https://www.jspsych.org/7.1/reference/jspsych/#description_15
      it("doesn't affect `post_trial_gap`", async () => {
        const timeline = createTimeline([{ type: TestPlugin, post_trial_gap: 200 }]);
        const runPromise = timeline.run();
        const child = timeline.children[0];

        expect(child.getStatus()).toBe(TimelineNodeStatus.RUNNING);
        await TestPlugin.finishTrial();
        expect(child.getStatus()).toBe(TimelineNodeStatus.RUNNING);

        timeline.pause();
        jest.advanceTimersByTime(100);
        timeline.resume();
        await flushPromises();
        expect(timeline.getStatus()).toBe(TimelineNodeStatus.RUNNING);

        jest.advanceTimersByTime(100);
        await flushPromises();
        expect(timeline.getStatus()).toBe(TimelineNodeStatus.COMPLETED);

        await runPromise;
      });
    });

    describe("abort()", () => {
      beforeEach(() => {
        TestPlugin.setManualFinishTrialMode();
      });

      describe("aborts the timeline after the current trial ends, updating the result of getStatus()", () => {
        test("when the timeline is running", async () => {
          const timeline = createTimeline(exampleTimeline);
          const runPromise = timeline.run();

          expect(timeline.getStatus()).toBe(TimelineNodeStatus.RUNNING);
          timeline.abort();
          expect(timeline.getStatus()).toBe(TimelineNodeStatus.RUNNING);
          await TestPlugin.finishTrial();
          expect(timeline.getStatus()).toBe(TimelineNodeStatus.ABORTED);
          await runPromise;
        });

        test("when the timeline is paused", async () => {
          const timeline = createTimeline(exampleTimeline);
          timeline.run();

          timeline.pause();
          await TestPlugin.finishTrial();
          expect(timeline.getStatus()).toBe(TimelineNodeStatus.PAUSED);
          timeline.abort();
          await flushPromises();
          expect(timeline.getStatus()).toBe(TimelineNodeStatus.ABORTED);
        });
      });

      it("aborts child timelines too", async () => {
        const timeline = createTimeline({
          timeline: [{ timeline: [{ type: TestPlugin }, { type: TestPlugin }] }],
        });
        const runPromise = timeline.run();

        expect(timeline.children[0].getStatus()).toBe(TimelineNodeStatus.RUNNING);
        timeline.abort();
        await TestPlugin.finishTrial();
        expect(timeline.children[0].getStatus()).toBe(TimelineNodeStatus.ABORTED);
        expect(timeline.getStatus()).toBe(TimelineNodeStatus.ABORTED);
        await runPromise;
      });

      it("doesn't affect the timeline when it is neither running nor paused", async () => {
        const timeline = createTimeline([{ type: TestPlugin }]);

        expect(timeline.getStatus()).toBe(TimelineNodeStatus.PENDING);
        timeline.abort();
        expect(timeline.getStatus()).toBe(TimelineNodeStatus.PENDING);

        // Complete the timeline
        const runPromise = timeline.run();
        await TestPlugin.finishTrial();
        await runPromise;

        expect(timeline.getStatus()).toBe(TimelineNodeStatus.COMPLETED);
        timeline.abort();
        expect(timeline.getStatus()).toBe(TimelineNodeStatus.COMPLETED);
      });
    });

    it("repeats a timeline according to `repetitions`", async () => {
      const timeline = createTimeline({ ...exampleTimeline, repetitions: 2 });

      await timeline.run();

      expect(timeline.children.length).toEqual(6);
    });

    it("repeats a timeline according to `loop_function`", async () => {
      const loopFunction = jest.fn();
      loopFunction.mockReturnValue(false);
      loopFunction.mockReturnValueOnce(true);

      const timeline = createTimeline({ ...exampleTimeline, loop_function: loopFunction });

      await timeline.run();
      expect(loopFunction).toHaveBeenCalledTimes(2);

      for (const call of loopFunction.mock.calls) {
        expect(call[0]).toBeInstanceOf(DataCollection);
        expect((call[0] as DataCollection).values()).toEqual(
          Array(3).fill(expect.objectContaining({ my: "result" }))
        );
      }

      expect(timeline.children.length).toEqual(6);
    });

    it("repeats a timeline according to `repetitions` and `loop_function`", async () => {
      const loopFunction = jest.fn();
      loopFunction.mockReturnValue(false);
      loopFunction.mockReturnValueOnce(true);
      loopFunction.mockReturnValueOnce(false);
      loopFunction.mockReturnValueOnce(true);

      const timeline = createTimeline({
        ...exampleTimeline,
        repetitions: 2,
        loop_function: loopFunction,
      });

      await timeline.run();
      expect(loopFunction).toHaveBeenCalledTimes(4);
      expect(timeline.children.length).toEqual(12);
    });

    it("skips execution if `conditional_function` returns `false`", async () => {
      const timeline = createTimeline({
        ...exampleTimeline,
        conditional_function: jest.fn(() => false),
      });

      await timeline.run();
      expect(timeline.children.length).toEqual(0);
    });

    it("executes regularly if `conditional_function` returns `true`", async () => {
      const timeline = createTimeline({
        ...exampleTimeline,
        conditional_function: jest.fn(() => true),
      });

      await timeline.run();
      expect(timeline.children.length).toEqual(3);
    });

    describe("`on_timeline_start` and `on_timeline_finished` callbacks are invoked", () => {
      const onTimelineStart = jest.fn();
      const onTimelineFinish = jest.fn();

      beforeEach(() => {
        TestPlugin.setManualFinishTrialMode();
      });

      afterEach(() => {
        onTimelineStart.mockReset();
        onTimelineFinish.mockReset();
      });

      test("at the beginning and at the end of a timeline, respectively", async () => {
        const timeline = createTimeline({
          timeline: [{ type: TestPlugin }],
          on_timeline_start: onTimelineStart,
          on_timeline_finish: onTimelineFinish,
        });
        timeline.run();
        expect(onTimelineStart).toHaveBeenCalledTimes(1);
        expect(onTimelineFinish).toHaveBeenCalledTimes(0);

        await TestPlugin.finishTrial();
        expect(onTimelineStart).toHaveBeenCalledTimes(1);
        expect(onTimelineFinish).toHaveBeenCalledTimes(1);
      });

      test("in every repetition", async () => {
        const timeline = createTimeline({
          timeline: [{ type: TestPlugin }],
          on_timeline_start: onTimelineStart,
          on_timeline_finish: onTimelineFinish,
          repetitions: 2,
        });

        timeline.run();
        expect(onTimelineStart).toHaveBeenCalledTimes(1);
        expect(onTimelineFinish).toHaveBeenCalledTimes(0);

        await TestPlugin.finishTrial();
        expect(onTimelineFinish).toHaveBeenCalledTimes(1);
        expect(onTimelineStart).toHaveBeenCalledTimes(2);

        await TestPlugin.finishTrial();
        expect(onTimelineStart).toHaveBeenCalledTimes(2);
        expect(onTimelineFinish).toHaveBeenCalledTimes(2);
      });
    });

    describe("with timeline variables", () => {
      it("repeats all trials for each set of variables", async () => {
        const xValues = [];
        TestPlugin.prototype.trial.mockImplementation(async () => {
          xValues.push(timeline.evaluateTimelineVariable(new TimelineVariable("x")));
        });

        const timeline = createTimeline({
          timeline: [{ type: TestPlugin }],
          timeline_variables: [{ x: 0 }, { x: 1 }, { x: 2 }, { x: 3 }],
        });

        await timeline.run();
        expect(timeline.children.length).toEqual(4);
        expect(xValues).toEqual([0, 1, 2, 3]);
      });

      it("respects the `randomize_order` and `sample` options", async () => {
        let xValues: number[];

        const createSampleTimeline = (sample: SampleOptions, randomize_order?: boolean) => {
          xValues = [];
          const timeline = createTimeline({
            timeline: [{ type: TestPlugin }],
            timeline_variables: [{ x: 0 }, { x: 1 }],
            sample,
            randomize_order,
          });
          TestPlugin.prototype.trial.mockImplementation(async () => {
            xValues.push(timeline.evaluateTimelineVariable(new TimelineVariable("x")));
          });
          return timeline;
        };

        // `randomize_order`
        mocked(shuffle).mockReturnValue([1, 0]);
        await createSampleTimeline(undefined, true).run();
        expect(shuffle).toHaveBeenCalledWith([0, 1]);
        expect(xValues).toEqual([1, 0]);

        // with-replacement
        mocked(sampleWithReplacement).mockReturnValue([0, 0]);
        await createSampleTimeline({ type: "with-replacement", size: 2, weights: [1, 1] }).run();
        expect(sampleWithReplacement).toHaveBeenCalledWith([0, 1], 2, [1, 1]);
        expect(xValues).toEqual([0, 0]);

        // without-replacement
        mocked(sampleWithoutReplacement).mockReturnValue([1, 0]);
        await createSampleTimeline({ type: "without-replacement", size: 2 }).run();
        expect(sampleWithoutReplacement).toHaveBeenCalledWith([0, 1], 2);
        expect(xValues).toEqual([1, 0]);

        // fixed-repetitions
        mocked(repeat).mockReturnValue([0, 0, 1, 1]);
        await createSampleTimeline({ type: "fixed-repetitions", size: 2 }).run();
        expect(repeat).toHaveBeenCalledWith([0, 1], 2);
        expect(xValues).toEqual([0, 0, 1, 1]);

        // alternate-groups
        mocked(shuffleAlternateGroups).mockReturnValue([1, 0]);
        await createSampleTimeline({
          type: "alternate-groups",
          groups: [[0], [1]],
          randomize_group_order: true,
        }).run();
        expect(shuffleAlternateGroups).toHaveBeenCalledWith([[0], [1]], true);
        expect(xValues).toEqual([1, 0]);

        // custom function
        const sampleFunction = jest.fn(() => [0]);
        await createSampleTimeline({ type: "custom", fn: sampleFunction }).run();
        expect(sampleFunction).toHaveBeenCalledTimes(1);
        expect(xValues).toEqual([0]);

        await expect(
          // @ts-expect-error non-existing type
          createSampleTimeline({ type: "invalid" }).run()
        ).rejects.toThrow('Invalid type "invalid" in timeline sample parameters.');
      });

      it("samples on each loop iteration (be it via `repetitions` or `loop_function`)", async () => {
        const sampleFunction = jest.fn(() => [0]);

        await createTimeline({
          timeline: [{ type: TestPlugin }],
          timeline_variables: [{ x: 0 }],
          sample: { type: "custom", fn: sampleFunction },
          repetitions: 2,
          loop_function: jest.fn().mockReturnValue(false).mockReturnValueOnce(true),
        }).run();

        // 2 repetitions + 1 loop in the first repitition = 3 sample function calls
        expect(sampleFunction).toHaveBeenCalledTimes(3);
      });

      it("makes variables available to callbacks", async () => {
        const variableResults: Record<string, any> = {};
        const makeCallback = (resultName: string, callbackReturnValue?: any) => () => {
          variableResults[resultName] = timeline.evaluateTimelineVariable(
            new TimelineVariable("x")
          );
          return callbackReturnValue;
        };

        const timeline = createTimeline({
          timeline: [{ type: TestPlugin }],
          timeline_variables: [{ x: 0 }],
          on_timeline_start: jest.fn().mockImplementation(makeCallback("on_timeline_start")),
          on_timeline_finish: jest.fn().mockImplementation(makeCallback("on_timeline_finish")),
          conditional_function: jest
            .fn()
            .mockImplementation(makeCallback("conditional_function", true)),
          loop_function: jest.fn().mockImplementation(makeCallback("loop_function", false)),
        });

        await timeline.run();
        expect(variableResults).toEqual({
          on_timeline_start: 0,
          on_timeline_finish: 0,
          conditional_function: 0,
          loop_function: 0,
        });
      });
    });
  });

  describe("evaluateTimelineVariable()", () => {
    describe("if a local timeline variable exists", () => {
      it("returns the local timeline variable", async () => {
        const timeline = createTimeline({
          timeline: [{ type: TestPlugin }],
          timeline_variables: [{ x: 0 }],
        });

        await timeline.run();
        expect(timeline.evaluateTimelineVariable(new TimelineVariable("x"))).toEqual(0);
      });
    });

    describe("if a timeline variable is not defined locally", () => {
      it("recursively falls back to parent timeline variables", async () => {
        const timeline = createTimeline({
          timeline: [{ timeline: [{ type: TestPlugin }], timeline_variables: [{ x: undefined }] }],
          timeline_variables: [{ x: 0, y: 0 }],
        });

        await timeline.run();
        expect(timeline.evaluateTimelineVariable(new TimelineVariable("x"))).toEqual(0);
        expect(timeline.evaluateTimelineVariable(new TimelineVariable("y"))).toEqual(0);

        const childTimeline = timeline.children[0] as Timeline;
        expect(childTimeline.evaluateTimelineVariable(new TimelineVariable("x"))).toBeUndefined();
        expect(childTimeline.evaluateTimelineVariable(new TimelineVariable("y"))).toEqual(0);
      });

      it("returns `undefined` if there are no parents or none of them has a value for the variable", async () => {
        const timeline = createTimeline({
          timeline: [{ timeline: [{ type: TestPlugin }] }],
        });

        const variable = new TimelineVariable("x");

        await timeline.run();
        expect(timeline.evaluateTimelineVariable(variable)).toBeUndefined();
        expect(
          (timeline.children[0] as Timeline).evaluateTimelineVariable(variable)
        ).toBeUndefined();
      });
    });
  });

  describe("getParameterValue()", () => {
    // Note: This includes test cases for the implementation provided by `BaseTimelineNode`.

    it("ignores builtin timeline parameters", async () => {
      const timeline = createTimeline({
        timeline: [],
        timeline_variables: [],
        repetitions: 1,
        loop_function: jest.fn(),
        conditional_function: jest.fn(),
        randomize_order: false,
        sample: { type: "custom", fn: jest.fn() },
        on_timeline_start: jest.fn(),
        on_timeline_finish: jest.fn(),
      });

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
        expect(timeline.getParameterValue(parameter)).toBeUndefined();
      }
    });

    it("returns the local parameter value, if it exists", async () => {
      const timeline = createTimeline({ timeline: [], my_parameter: "test" });

      expect(timeline.getParameterValue("my_parameter")).toEqual("test");
      expect(timeline.getParameterValue("other_parameter")).toBeUndefined();
    });

    it("falls back to parent parameter values if `recursive` is not `false`", async () => {
      const parentTimeline = createTimeline({
        timeline: [],
        first_parameter: "test",
        second_parameter: "test",
      });
      const childTimeline = createTimeline(
        { timeline: [], first_parameter: undefined },
        parentTimeline
      );

      expect(childTimeline.getParameterValue("second_parameter")).toEqual("test");
      expect(
        childTimeline.getParameterValue("second_parameter", { recursive: false })
      ).toBeUndefined();

      expect(childTimeline.getParameterValue("first_parameter")).toBeUndefined();
      expect(childTimeline.getParameterValue("other_parameter")).toBeUndefined();
    });

    it("evaluates timeline variables", async () => {
      const timeline = createTimeline({
        timeline: [{ timeline: [], child_parameter: new TimelineVariable("x") }],
        timeline_variables: [{ x: 0 }],
        parent_parameter: new TimelineVariable("x"),
      });

      await timeline.run();

      expect(timeline.children[0].getParameterValue("child_parameter")).toEqual(0);
      expect(timeline.children[0].getParameterValue("parent_parameter")).toEqual(0);
    });

    it("evaluates functions unless `evaluateFunctions` is set to `false`", async () => {
      const timeline = createTimeline({
        timeline: [],
        function_parameter: jest.fn(() => "result"),
      });

      expect(timeline.getParameterValue("function_parameter")).toEqual("result");
      expect(timeline.getParameterValue("function_parameter", { evaluateFunctions: true })).toEqual(
        "result"
      );
      expect(
        typeof timeline.getParameterValue("function_parameter", { evaluateFunctions: false })
      ).toEqual("function");
    });

    it("considers nested properties if `parameterName` contains dots", async () => {
      const timeline = createTimeline({
        timeline: [],
        object: {
          childString: "foo",
          childObject: {
            childString: "bar",
          },
        },
      });

      expect(timeline.getParameterValue("object.childString")).toEqual("foo");
      expect(timeline.getParameterValue("object.childObject")).toEqual({ childString: "bar" });
      expect(timeline.getParameterValue("object.childObject.childString")).toEqual("bar");
    });
  });

  describe("getResults()", () => {
    it("recursively returns all results", async () => {
      const timeline = createTimeline(exampleTimeline);
      await timeline.run();
      expect(timeline.getResults()).toEqual(
        Array(3).fill(expect.objectContaining({ my: "result" }))
      );
    });

    it("does not include `undefined` results", async () => {
      const timeline = createTimeline(exampleTimeline);
      await timeline.run();

      jest.spyOn(timeline.children[0] as Trial, "getResult").mockReturnValue(undefined);
      expect(timeline.getResults()).toEqual(
        Array(2).fill(expect.objectContaining({ my: "result" }))
      );
    });
  });

  describe("getProgress()", () => {
    it("always returns the current progress of a simple timeline", async () => {
      TestPlugin.setManualFinishTrialMode();

      const timeline = createTimeline(Array(4).fill({ type: TestPlugin }));
      expect(timeline.getProgress()).toEqual(0);

      const runPromise = timeline.run();
      expect(timeline.getProgress()).toEqual(0);

      await TestPlugin.finishTrial();
      expect(timeline.getProgress()).toEqual(0.25);

      await TestPlugin.finishTrial();
      expect(timeline.getProgress()).toEqual(0.5);

      await TestPlugin.finishTrial();
      expect(timeline.getProgress()).toEqual(0.75);

      await TestPlugin.finishTrial();
      expect(timeline.getProgress()).toEqual(1);

      await runPromise;
      expect(timeline.getProgress()).toEqual(1);
    });
  });

  describe("getNaiveTrialCount()", () => {
    it("correctly estimates the length of a timeline (including nested timelines)", async () => {
      const timeline = createTimeline({
        timeline: [
          { type: TestPlugin },
          { timeline: [{ type: TestPlugin }], repetitions: 2, timeline_variables: [] },
          { timeline: [{ type: TestPlugin }], repetitions: 5 },
        ],
        repetitions: 3,
        timeline_variables: [{ x: 1 }, { x: 2 }],
      });

      const estimate = (1 + 1 * 2 + 1 * 5) * 3 * 2;
      expect(timeline.getNaiveTrialCount()).toEqual(estimate);
    });
  });

  describe("getActiveNode()", () => {
    it("returns the currently active `TimelineNode` or `undefined` when no node is active", async () => {
      TestPlugin.setManualFinishTrialMode();

      let outerTimelineActiveNode: TimelineNode;
      let innerTimelineActiveNode: TimelineNode;

      const timeline = createTimeline({
        timeline: [
          { type: TestPlugin },
          {
            timeline: [{ type: TestPlugin }],
            on_timeline_start: () => {
              innerTimelineActiveNode = timeline.getActiveNode();
            },
          },
        ],
        on_timeline_start: () => {
          outerTimelineActiveNode = timeline.getActiveNode();
        },
      });

      expect(timeline.getActiveNode()).toBeUndefined();

      timeline.run();
      // Avoiding direct .toBe(timeline) here to circumvent circular reference errors caused by Jest
      // trying to stringify `Timeline` objects
      expect(outerTimelineActiveNode).toBeInstanceOf(Timeline);
      expect(outerTimelineActiveNode.index).toEqual(0);
      expect(timeline.getActiveNode()).toBeInstanceOf(Trial);
      expect(timeline.getActiveNode().index).toEqual(0);

      await TestPlugin.finishTrial();

      expect(innerTimelineActiveNode).toBeInstanceOf(Timeline);
      expect(innerTimelineActiveNode.index).toEqual(1);
      expect(timeline.getActiveNode()).toBeInstanceOf(Trial);
      expect(timeline.getActiveNode().index).toEqual(1);

      await TestPlugin.finishTrial();
      expect(timeline.getActiveNode()).toBeUndefined();
    });
  });
});
