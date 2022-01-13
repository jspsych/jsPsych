import { JsPsych, initJsPsych } from "jspsych";
import { mocked } from "ts-jest/utils";

import TestPlugin from "../../tests/TestPlugin";
import {
  repeat,
  sampleWithReplacement,
  sampleWithoutReplacement,
  shuffle,
  shuffleAlternateGroups,
} from "../modules/randomization";
import { Timeline } from "./Timeline";
import { Trial } from "./Trial";
import { SampleOptions, TimelineDescription, TimelineVariable, trialDescriptionKeys } from ".";

jest.mock("../../tests/TestPlugin");
jest.mock("../modules/randomization");
const TestPluginMock = mocked(TestPlugin, true);

const exampleTimeline: TimelineDescription = {
  timeline: [{ type: TestPlugin }, { type: TestPlugin }, { timeline: [{ type: TestPlugin }] }],
};

describe("Timeline", () => {
  let jsPsych: JsPsych;

  beforeEach(() => {
    jsPsych = initJsPsych();
    TestPluginMock.mockReset();
    TestPluginMock.prototype.trial.mockImplementation(() => {
      jsPsych.finishTrial({ my: "result" });
    });
  });

  describe("run()", () => {
    it("instantiates proper child nodes", async () => {
      const timeline = new Timeline(jsPsych, exampleTimeline);

      await timeline.run();

      const children = timeline.children;
      expect(children).toEqual([expect.any(Trial), expect.any(Trial), expect.any(Timeline)]);
      expect((children[2] as Timeline).children).toEqual([expect.any(Trial)]);
    });

    it("repeats a timeline according to `repetitions`", async () => {
      const timeline = new Timeline(jsPsych, { ...exampleTimeline, repetitions: 2 });

      await timeline.run();

      expect(timeline.children.length).toBe(6);
    });

    it("repeats a timeline according to `loop_function`", async () => {
      const loopFunction = jest.fn();
      loopFunction.mockReturnValue(false);
      loopFunction.mockReturnValueOnce(true);

      const timeline = new Timeline(jsPsych, { ...exampleTimeline, loop_function: loopFunction });

      await timeline.run();
      expect(loopFunction).toHaveBeenCalledTimes(2);
      expect(timeline.children.length).toBe(6);
    });

    it("repeats a timeline according to `repetitions` and `loop_function`", async () => {
      const loopFunction = jest.fn();
      loopFunction.mockReturnValue(false);
      loopFunction.mockReturnValueOnce(true);
      loopFunction.mockReturnValueOnce(false);
      loopFunction.mockReturnValueOnce(true);

      const timeline = new Timeline(jsPsych, {
        ...exampleTimeline,
        repetitions: 2,
        loop_function: loopFunction,
      });

      await timeline.run();
      expect(loopFunction).toHaveBeenCalledTimes(4);
      expect(timeline.children.length).toBe(12);
    });

    it("skips execution if `conditional_function` returns `false`", async () => {
      const timeline = new Timeline(jsPsych, {
        ...exampleTimeline,
        conditional_function: jest.fn(() => false),
      });

      await timeline.run();
      expect(timeline.children.length).toBe(0);
    });

    it("executes regularly if `conditional_function` returns `true`", async () => {
      const timeline = new Timeline(jsPsych, {
        ...exampleTimeline,
        conditional_function: jest.fn(() => true),
      });

      await timeline.run();
      expect(timeline.children.length).toBe(3);
    });

    describe("with timeline variables", () => {
      it("repeats all trials for each set of variables", async () => {
        const xValues = [];
        TestPluginMock.prototype.trial.mockImplementation(() => {
          xValues.push(timeline.evaluateTimelineVariable(new TimelineVariable("x")));
          jsPsych.finishTrial();
        });

        const timeline = new Timeline(jsPsych, {
          timeline: [{ type: TestPlugin }],
          timeline_variables: [{ x: 0 }, { x: 1 }, { x: 2 }, { x: 3 }],
        });

        await timeline.run();
        expect(timeline.children.length).toBe(4);
        expect(xValues).toEqual([0, 1, 2, 3]);
      });

      it("respects the `randomize_order` and `sample` options", async () => {
        let xValues: number[];

        const createTimeline = (sample: SampleOptions, randomize_order?: boolean) => {
          xValues = [];
          const timeline = new Timeline(jsPsych, {
            timeline: [{ type: TestPlugin }],
            timeline_variables: [{ x: 0 }, { x: 1 }],
            sample,
            randomize_order,
          });
          TestPluginMock.prototype.trial.mockImplementation(() => {
            xValues.push(timeline.evaluateTimelineVariable(new TimelineVariable("x")));
            jsPsych.finishTrial();
          });
          return timeline;
        };

        // `randomize_order`
        mocked(shuffle).mockReturnValue([1, 0]);
        await createTimeline(undefined, true).run();
        expect(shuffle).toHaveBeenCalledWith([0, 1]);
        expect(xValues).toEqual([1, 0]);

        // with-replacement
        mocked(sampleWithReplacement).mockReturnValue([0, 0]);
        await createTimeline({ type: "with-replacement", size: 2, weights: [1, 1] }).run();
        expect(sampleWithReplacement).toHaveBeenCalledWith([0, 1], 2, [1, 1]);
        expect(xValues).toEqual([0, 0]);

        // without-replacement
        mocked(sampleWithoutReplacement).mockReturnValue([1, 0]);
        await createTimeline({ type: "without-replacement", size: 2 }).run();
        expect(sampleWithoutReplacement).toHaveBeenCalledWith([0, 1], 2);
        expect(xValues).toEqual([1, 0]);

        // fixed-repetitions
        mocked(repeat).mockReturnValue([0, 0, 1, 1]);
        await createTimeline({ type: "fixed-repetitions", size: 2 }).run();
        expect(repeat).toHaveBeenCalledWith([0, 1], 2);
        expect(xValues).toEqual([0, 0, 1, 1]);

        // alternate-groups
        mocked(shuffleAlternateGroups).mockReturnValue([1, 0]);
        await createTimeline({
          type: "alternate-groups",
          groups: [[0], [1]],
          randomize_group_order: true,
        }).run();
        expect(shuffleAlternateGroups).toHaveBeenCalledWith([[0], [1]], true);
        expect(xValues).toEqual([1, 0]);

        // custom function
        const sampleFunction = jest.fn(() => [0]);
        await createTimeline({ type: "custom", fn: sampleFunction }).run();
        expect(sampleFunction).toHaveBeenCalledTimes(1);
        expect(xValues).toEqual([0]);

        // @ts-expect-error non-existing type
        await expect(createTimeline({ type: "invalid" }).run()).rejects.toEqual(expect.any(Error));
      });
    });
  });

  describe("evaluateTimelineVariable()", () => {
    describe("if a local timeline variable exists", () => {
      it("returns the local timeline variable", async () => {
        const timeline = new Timeline(jsPsych, {
          timeline: [{ type: TestPlugin }],
          timeline_variables: [{ x: 0 }],
        });

        await timeline.run();
        expect(timeline.evaluateTimelineVariable(new TimelineVariable("x"))).toBe(0);
      });
    });

    describe("if a timeline variable is not defined locally", () => {
      it("recursively falls back to parent timeline variables", async () => {
        const timeline = new Timeline(jsPsych, {
          timeline: [{ timeline: [{ type: TestPlugin }], timeline_variables: [{ x: undefined }] }],
          timeline_variables: [{ x: 0, y: 0 }],
        });

        await timeline.run();
        expect(timeline.evaluateTimelineVariable(new TimelineVariable("x"))).toBe(0);
        expect(timeline.evaluateTimelineVariable(new TimelineVariable("y"))).toBe(0);

        const childTimeline = timeline.children[0] as Timeline;
        expect(childTimeline.evaluateTimelineVariable(new TimelineVariable("x"))).toBeUndefined();
        expect(childTimeline.evaluateTimelineVariable(new TimelineVariable("y"))).toBe(0);
      });

      it("returns `undefined` if there are no parents or none of them has a value for the variable", async () => {
        const timeline = new Timeline(jsPsych, {
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
      const timeline = new Timeline(jsPsych, {
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

      expect(timeline.getParameterValue("timeline")).toBeUndefined();
      expect(timeline.getParameterValue("timeline_variables")).toBeUndefined();
      expect(timeline.getParameterValue("repetitions")).toBeUndefined();
      expect(timeline.getParameterValue("loop_function")).toBeUndefined();
      expect(timeline.getParameterValue("conditional_function")).toBeUndefined();
      expect(timeline.getParameterValue("randomize_order")).toBeUndefined();
      expect(timeline.getParameterValue("sample")).toBeUndefined();
      expect(timeline.getParameterValue("on_timeline_start")).toBeUndefined();
      expect(timeline.getParameterValue("on_timeline_finish")).toBeUndefined();
    });

    it("returns the local parameter value, if it exists", async () => {
      const timeline = new Timeline(jsPsych, { timeline: [], my_parameter: "test" });

      expect(timeline.getParameterValue("my_parameter")).toBe("test");
      expect(timeline.getParameterValue("other_parameter")).toBeUndefined();
    });

    it("falls back to parent parameter values if `recursive` is not `false`", async () => {
      const parentTimeline = new Timeline(jsPsych, {
        timeline: [],
        first_parameter: "test",
        second_parameter: "test",
      });
      const childTimeline = new Timeline(
        jsPsych,
        { timeline: [], first_parameter: undefined },
        parentTimeline
      );

      expect(childTimeline.getParameterValue("second_parameter")).toBe("test");
      expect(
        childTimeline.getParameterValue("second_parameter", { recursive: false })
      ).toBeUndefined();

      expect(childTimeline.getParameterValue("first_parameter")).toBeUndefined();
      expect(childTimeline.getParameterValue("other_parameter")).toBeUndefined();
    });

    it("evaluates timeline variables", async () => {
      const timeline = new Timeline(jsPsych, {
        timeline: [{ timeline: [], child_parameter: new TimelineVariable("x") }],
        timeline_variables: [{ x: 0 }],
        parent_parameter: new TimelineVariable("x"),
      });

      await timeline.run();

      expect(timeline.children[0].getParameterValue("child_parameter")).toBe(0);
      expect(timeline.children[0].getParameterValue("parent_parameter")).toBe(0);
    });

    it("evaluates functions if `evaluateFunctions` is set to `true`", async () => {
      const timeline = new Timeline(jsPsych, {
        timeline: [],
        function_parameter: jest.fn(() => "result"),
      });

      expect(typeof timeline.getParameterValue("function_parameter")).toBe("function");
      expect(
        typeof timeline.getParameterValue("function_parameter", { evaluateFunctions: false })
      ).toBe("function");
      expect(timeline.getParameterValue("function_parameter", { evaluateFunctions: true })).toBe(
        "result"
      );
    });

    it("considers nested properties if `parameterName` contains dots", async () => {
      const timeline = new Timeline(jsPsych, {
        timeline: [],
        object: {
          childString: "foo",
          childObject: {
            childString: "bar",
          },
        },
      });

      expect(timeline.getParameterValue("object.childString")).toBe("foo");
      expect(timeline.getParameterValue("object.childObject")).toEqual({ childString: "bar" });
      expect(timeline.getParameterValue("object.childObject.childString")).toBe("bar");
    });
  });
});
