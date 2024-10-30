import { flushPromises } from "@jspsych/test-utils";

import { TimelineNodeDependenciesMock, createSnapshotUtils } from "../../tests/test-utils";
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
  TimelineNodeStatus,
  TimelineVariable,
} from ".";

jest.useFakeTimers();

jest.mock("../modules/randomization");

const exampleTimeline: TimelineDescription = {
  timeline: [{ type: TestPlugin }, { type: TestPlugin }, { timeline: [{ type: TestPlugin }] }],
};

describe("Timeline", () => {
  let dependencies: TimelineNodeDependenciesMock;

  beforeEach(() => {
    dependencies = new TimelineNodeDependenciesMock();
    TestPlugin.reset();
  });

  const createTimeline = (description: TimelineDescription | TimelineArray, parent?: Timeline) =>
    new Timeline(dependencies, description, parent);

  describe("run()", () => {
    it("instantiates proper child nodes", async () => {
      const timeline = createTimeline([
        { type: TestPlugin },
        { timeline: [{ type: TestPlugin }, { type: TestPlugin }] },
        { timeline: [{ type: TestPlugin }] },
      ]);

      await timeline.run();

      const children = timeline.children;
      expect(children).toEqual([expect.any(Trial), expect.any(Timeline), expect.any(Timeline)]);
      expect((children[1] as Timeline).children).toEqual([expect.any(Trial), expect.any(Trial)]);
      expect((children[2] as Timeline).children).toEqual([expect.any(Trial)]);

      expect(children.map((child) => child.index)).toEqual([0, 1, 3]);
      expect((children[1] as Timeline).children.map((child) => child.index)).toEqual([1, 2]);
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

      // https://www.jspsych.org/7.1/reference/jspsych/#jspsychresumeexperiment
      it("doesn't affect `post_trial_gap`", async () => {
        const timeline = createTimeline([{ type: TestPlugin, post_trial_gap: 200 }]);
        const runPromise = timeline.run();
        let hasTimelineCompleted = false;
        runPromise.then(() => {
          hasTimelineCompleted = true;
        });

        expect(hasTimelineCompleted).toBe(false);
        await TestPlugin.finishTrial();
        expect(hasTimelineCompleted).toBe(false);

        timeline.pause();
        jest.advanceTimersByTime(100);
        timeline.resume();
        await flushPromises();
        expect(hasTimelineCompleted).toBe(false);

        jest.advanceTimersByTime(100);
        await flushPromises();
        expect(hasTimelineCompleted).toBe(true);
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

    it("invokes `on_timeline_start` and `on_timeline_finished` callbacks at the beginning and at the end of the timeline, respectively", async () => {
      TestPlugin.setManualFinishTrialMode();

      const onTimelineStart = jest.fn();
      const onTimelineFinish = jest.fn();

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
      await TestPlugin.finishTrial();

      expect(onTimelineStart).toHaveBeenCalledTimes(1);
      expect(onTimelineFinish).toHaveBeenCalledTimes(1);
    });

    it("loop function ignores data from trials where `record_data` is false", async () => {
      const loopFunction = jest.fn();
      loopFunction.mockReturnValue(false);

      const timeline = createTimeline({
        timeline: [{ type: TestPlugin, record_data: false }, { type: TestPlugin }],
        loop_function: loopFunction,
      });

      await timeline.run();
      expect((loopFunction.mock.calls[0][0] as DataCollection).count()).toBe(1);
    });

    describe("with timeline variables", () => {
      it("repeats all trials for each set of variables", async () => {
        const xValues = [];
        TestPlugin.trial = async () => {
          xValues.push(timeline.evaluateTimelineVariable(new TimelineVariable("x")));
        };

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
          TestPlugin.trial = async () => {
            xValues.push(timeline.evaluateTimelineVariable(new TimelineVariable("x")));
          };
          return timeline;
        };

        // `randomize_order`
        jest.mocked(shuffle).mockReturnValue([1, 0]);
        await createSampleTimeline(undefined, true).run();
        expect(shuffle).toHaveBeenCalledWith([0, 1]);
        expect(xValues).toEqual([1, 0]);

        // with-replacement
        jest.mocked(sampleWithReplacement).mockReturnValue([0, 0]);
        await createSampleTimeline({ type: "with-replacement", size: 2, weights: [1, 1] }).run();
        expect(sampleWithReplacement).toHaveBeenCalledWith([0, 1], 2, [1, 1]);
        expect(xValues).toEqual([0, 0]);

        // without-replacement
        jest.mocked(sampleWithoutReplacement).mockReturnValue([1, 0]);
        await createSampleTimeline({ type: "without-replacement", size: 2 }).run();
        expect(sampleWithoutReplacement).toHaveBeenCalledWith([0, 1], 2);
        expect(xValues).toEqual([1, 0]);

        // fixed-repetitions
        jest.mocked(repeat).mockReturnValue([0, 0, 1, 1]);
        await createSampleTimeline({ type: "fixed-repetitions", size: 2 }).run();
        expect(repeat).toHaveBeenCalledWith([0, 1], 2);
        expect(xValues).toEqual([0, 0, 1, 1]);

        // alternate-groups
        jest.mocked(shuffleAlternateGroups).mockReturnValue([1, 0]);
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

  describe("getAllTimelineVariables()", () => {
    it("returns the current values of all timeline variables, including those from parent timelines", async () => {
      const timeline = createTimeline({
        timeline: [{ timeline: [{ type: TestPlugin }], timeline_variables: [{ y: 1, z: 1 }] }],
        timeline_variables: [{ x: 0, y: 0 }],
      });

      await timeline.run();

      expect(timeline.getAllTimelineVariables()).toEqual({ x: 0, y: 0 });
      expect((timeline.children[0] as Timeline).getAllTimelineVariables()).toEqual({
        x: 0,
        y: 1,
        z: 1,
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
      it("falls back to parent timeline variables", async () => {
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

      it("throws an exception if there are no parents or none of them has a value for the variable", async () => {
        const timeline = createTimeline({
          timeline: [{ timeline: [{ type: TestPlugin }] }],
        });

        const variable = new TimelineVariable("x");

        await timeline.run();
        expect(() => timeline.evaluateTimelineVariable(variable)).toThrowError("");
        expect(() =>
          (timeline.children[0] as Timeline).evaluateTimelineVariable(variable)
        ).toThrowError("");
      });
    });
  });

  describe("getParameterValue()", () => {
    // Note: This includes test cases for the implementation provided by `BaseTimelineNode`.

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

      expect(childTimeline.getParameterValue("second_parameter", { cacheResult: false })).toEqual(
        "test"
      );
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

      expect(timeline.getParameterValue("function_parameter", { cacheResult: false })).toEqual(
        "result"
      );

      expect(
        timeline.getParameterValue("function_parameter", {
          evaluateFunctions: true,
          cacheResult: false,
        })
      ).toEqual("result");

      expect(
        typeof timeline.getParameterValue("function_parameter", { evaluateFunctions: false })
      ).toEqual("function");
    });

    it("considers nested properties if `parameterName` is an array", async () => {
      const timeline = createTimeline({
        timeline: [],
        object: {
          childString: "foo",
          childObject: {
            childString: "bar",
          },
        },
      });

      expect(timeline.getParameterValue(["object", "childString"])).toEqual("foo");
      expect(timeline.getParameterValue(["object", "childObject"])).toEqual({ childString: "bar" });
      expect(timeline.getParameterValue(["object", "childObject", "childString"])).toEqual("bar");
    });

    it("respects the `replaceResult` function", () => {
      const timeline = createTimeline({ timeline: [] });

      expect(timeline.getParameterValue("key", { replaceResult: () => "value" })).toBe("value");
    });

    it("caches results and uses them for nested lookups", async () => {
      const timeline = createTimeline({ timeline: [], object: () => ({ child: "foo" }) });

      expect(
        timeline.getParameterValue("object", {
          replaceResult: () => ({ child: "bar" }),
        })
      ).toEqual({ child: "bar" });
      expect(timeline.getParameterValue(["object", "child"])).toEqual("bar");
    });

    it("does not cache results when `cacheResult` is set to false", async () => {
      const timeline = createTimeline({ timeline: [], object: { child: "foo" } });

      expect(
        timeline.getParameterValue("object", {
          replaceResult: () => ({ child: "bar" }),
          cacheResult: false,
        })
      ).toEqual({ child: "bar" });
      expect(timeline.getParameterValue(["object", "child"])).toEqual("foo");
    });

    test("all result caches are reset after every trial", async () => {
      TestPlugin.setManualFinishTrialMode();

      const timeline = createTimeline({
        timeline: [
          {
            timeline: [{ type: TestPlugin }, { type: TestPlugin }],
            object1: jest.fn().mockReturnValueOnce({ child: "foo" }),
          },
        ],
        object2: jest.fn().mockReturnValueOnce({ child: "foo" }),
      });

      timeline.run();
      const childTimeline = timeline.children[0];

      // First trial
      for (const parameter of ["object1", "object2"]) {
        expect(childTimeline.getParameterValue(parameter)).toEqual({ child: "foo" });
        expect(childTimeline.getParameterValue([parameter, "child"])).toEqual("foo");
      }

      await TestPlugin.finishTrial();

      // Second trial, caches should have been reset
      for (const parameter of ["object1", "object2"]) {
        expect(childTimeline.getParameterValue(parameter)).toBeUndefined();
        expect(childTimeline.getParameterValue([parameter, "child"])).toBeUndefined();
      }
    });
  });

  describe("getDataParameter()", () => {
    it("works when the `data` parameter is a function", async () => {
      const timeline = createTimeline({ timeline: [], data: () => ({ custom: "value" }) });
      expect(timeline.getDataParameter()).toEqual({ custom: "value" });
    });

    it("evaluates nested functions and timeline variables", async () => {
      const timeline = createTimeline({
        timeline: [],
        timeline_variables: [{ x: 1 }],
        data: {
          custom: () => "value",
          variable: new TimelineVariable("x"),
        },
      });

      await timeline.run(); // required to properly evaluate timeline variables

      expect(timeline.getDataParameter()).toEqual({ custom: "value", variable: 1 });
    });

    it("merges in all parent node `data` parameters", async () => {
      const timeline = createTimeline({
        timeline: [{ timeline: [], data: { custom: "value" } }],
        data: { other: "value" },
      });

      await timeline.run();

      expect((timeline.children[0] as Timeline).getDataParameter()).toEqual({
        custom: "value",
        other: "value",
      });
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

  describe("getNaiveProgress()", () => {
    it("returns the progress of a timeline at any time", async () => {
      TestPlugin.setManualFinishTrialMode();
      const { snapshots, createSnapshotCallback } = createSnapshotUtils(() =>
        timeline.getNaiveProgress()
      );

      const timeline = createTimeline({
        on_timeline_start: createSnapshotCallback("mainTimelineStart"),
        on_timeline_finish: createSnapshotCallback("mainTimelineFinish"),
        timeline: [
          {
            type: TestPlugin,
            on_start: createSnapshotCallback("trial1Start"),
            on_finish: createSnapshotCallback("trial1Finish"),
          },
          {
            on_timeline_start: createSnapshotCallback("nestedTimelineStart"),
            on_timeline_finish: createSnapshotCallback("nestedTimelineFinish"),
            timeline: [{ type: TestPlugin }, { type: TestPlugin }],
            repetitions: 2,
          },
        ],
      });
      expect(timeline.getNaiveProgress()).toEqual(0);

      const runPromise = timeline.run();
      expect(timeline.getNaiveProgress()).toEqual(0);
      expect(snapshots.mainTimelineStart).toEqual(0);
      expect(snapshots.trial1Start).toEqual(0);

      await TestPlugin.finishTrial();
      expect(timeline.getNaiveProgress()).toEqual(0.2);
      expect(snapshots.trial1Finish).toEqual(0.2);
      expect(snapshots.nestedTimelineStart).toEqual(0.2);

      await TestPlugin.finishTrial();
      expect(timeline.getNaiveProgress()).toEqual(0.4);

      await TestPlugin.finishTrial();
      expect(timeline.getNaiveProgress()).toEqual(0.6);

      await TestPlugin.finishTrial();
      expect(timeline.getNaiveProgress()).toEqual(0.8);

      await TestPlugin.finishTrial();
      expect(timeline.getNaiveProgress()).toEqual(1);
      expect(snapshots.nestedTimelineFinish).toEqual(1);
      expect(snapshots.mainTimelineFinish).toEqual(1);

      await runPromise;
      expect(timeline.getNaiveProgress()).toEqual(1);
    });

    it("does not return values above 1", async () => {
      const timeline = createTimeline({
        timeline: [{ type: TestPlugin }],
        loop_function: jest.fn().mockReturnValue(false).mockReturnValueOnce(true),
      });

      await timeline.run();
      expect(timeline.getNaiveProgress()).toEqual(1);
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

    describe("when the `sample` option is used", () => {
      it("handles `with-replacement` sampling", async () => {
        expect(
          createTimeline({
            timeline: [{ type: TestPlugin }],
            timeline_variables: [{}, {}],
            sample: { type: "with-replacement", size: 5 },
          }).getNaiveTrialCount()
        ).toEqual(5);
      });

      it("handles `without-replacement` sampling", async () => {
        expect(
          createTimeline({
            timeline: [{ type: TestPlugin }],
            timeline_variables: [{}, {}],
            sample: { type: "without-replacement", size: 5 },
          }).getNaiveTrialCount()
        ).toEqual(5);
      });

      it("handles `fixed-repetitions` sampling", async () => {
        expect(
          createTimeline({
            timeline: [{ type: TestPlugin }],
            timeline_variables: [{}, {}],
            sample: { type: "fixed-repetitions", size: 5 },
          }).getNaiveTrialCount()
        ).toEqual(10);
      });

      it("handles `alternate-groups` sampling", async () => {
        expect(
          createTimeline({
            timeline: [{ type: TestPlugin }],
            timeline_variables: [{}, {}, {}, {}],
            sample: {
              type: "alternate-groups",
              groups: [
                [0, 1],
                [2, 3],
              ],
            },
          }).getNaiveTrialCount()
        ).toEqual(4);

        expect(
          createTimeline({
            timeline: [{ type: TestPlugin }],
            timeline_variables: [{}, {}, {}, {}],
            sample: {
              type: "alternate-groups",
              groups: [[0, 1], [2]],
            },
          }).getNaiveTrialCount()
        ).toEqual(3);
      });
    });
  });

  describe("getLatestNode()", () => {
    it("returns the latest `TimelineNode` or `undefined` when no node is active", async () => {
      TestPlugin.setManualFinishTrialMode();
      const { snapshots, createSnapshotCallback } = createSnapshotUtils(() =>
        timeline.getLatestNode()
      );

      const timeline = createTimeline({
        timeline: [
          { type: TestPlugin },
          {
            timeline: [{ type: TestPlugin }],
            on_timeline_start: createSnapshotCallback("innerTimelineStart"),
            on_timeline_finish: createSnapshotCallback("innerTimelineFinish"),
          },
        ],
        on_timeline_start: createSnapshotCallback("outerTimelineStart"),
        on_timeline_finish: createSnapshotCallback("outerTimelineFinish"),
      });

      expect(timeline.getLatestNode()).toBe(timeline);

      timeline.run();

      expect(snapshots.outerTimelineStart).toBe(timeline);
      expect(timeline.getLatestNode()).toBeInstanceOf(Trial);
      expect(timeline.getLatestNode()).toBe(timeline.children[0]);

      await TestPlugin.finishTrial();
      expect(snapshots.innerTimelineStart).toBeInstanceOf(Timeline);
      expect(snapshots.innerTimelineStart).toBe(timeline.children[1]);

      const nestedTrial = (timeline.children[1] as Timeline).children[0];
      expect(timeline.getLatestNode()).toBeInstanceOf(Trial);
      expect(timeline.getLatestNode()).toBe(nestedTrial);

      await TestPlugin.finishTrial();
      expect(snapshots.innerTimelineFinish).toBe(nestedTrial);
      expect(snapshots.outerTimelineFinish).toBe(nestedTrial);
      expect(timeline.getLatestNode()).toBe(nestedTrial);
    });
  });

  describe("getActiveTimelineByName()", () => {
    it("returns the timeline with the given name", async () => {
      TestPlugin.setManualFinishTrialMode();

      const timeline = createTimeline({
        timeline: [{ timeline: [{ type: TestPlugin }], name: "innerTimeline" }],
        name: "outerTimeline",
      });

      timeline.run();

      expect(timeline.getActiveTimelineByName("outerTimeline")).toBe(timeline);
      expect(timeline.getActiveTimelineByName("innerTimeline")).toBe(
        timeline.children[0] as Timeline
      );
    });

    it("returns only active timelines", async () => {
      TestPlugin.setManualFinishTrialMode();

      const timeline = createTimeline({
        timeline: [
          { type: TestPlugin },
          { timeline: [{ type: TestPlugin }], name: "innerTimeline" },
        ],
        name: "outerTimeline",
      });

      timeline.run();

      expect(timeline.getActiveTimelineByName("outerTimeline")).toBe(timeline);
      expect(timeline.getActiveTimelineByName("innerTimeline")).toBeUndefined();

      await TestPlugin.finishTrial();

      expect(timeline.getActiveTimelineByName("innerTimeline")).toBe(
        timeline.children[1] as Timeline
      );
    });
  });
});
