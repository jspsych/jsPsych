import htmlKeyboardResponse from "@jspsych/plugin-html-keyboard-response";

import { JsPsych, initJsPsych } from "../../src";
import { pressKey } from "../utils";
import testExtension from "./test-extension";

let jsPsych: JsPsych;

jest.useFakeTimers();

// https://github.com/jspsych/jsPsych/projects/6#card-64825201
describe.skip("jsPsych.extensions", () => {
  beforeEach(() => {
    jsPsych.extensions.test = testExtension;
  });

  test("initialize is called at start of experiment", () => {
    var initFunc = jest.spyOn(jsPsych.extensions.test, "initialize");

    var timeline = [{ type: htmlKeyboardResponse, stimulus: "foo" }];

    jsPsych = initJsPsych({
      timeline,
      extensions: [{ type: "test" }],
    });

    expect(initFunc).toHaveBeenCalled();
  });

  test("initialize gets params", () => {
    var initFunc = jest.spyOn(jsPsych.extensions.test, "initialize");

    var timeline = [{ type: htmlKeyboardResponse, stimulus: "foo" }];

    jsPsych = initJsPsych({
      timeline,
      extensions: [{ type: "test", params: { foo: 1 } }],
    });

    expect(initFunc).toHaveBeenCalledWith({ foo: 1 });
  });

  test("on_start is called before trial", () => {
    var onStartFunc = jest.spyOn(jsPsych.extensions.test, "on_start");

    var trial = {
      type: htmlKeyboardResponse,
      stimulus: "foo",
      extensions: [{ type: "test" }],
      on_load: () => {
        expect(onStartFunc).toHaveBeenCalled();
      },
    };

    jsPsych = initJsPsych({
      timeline: [trial],
    });

    pressKey("a");
  });

  test("on_start gets params", () => {
    var onStartFunc = jest.spyOn(jsPsych.extensions.test, "on_start");

    var trial = {
      type: htmlKeyboardResponse,
      stimulus: "foo",
      extensions: [{ type: "test", params: { foo: 1 } }],
      on_load: () => {
        expect(onStartFunc).toHaveBeenCalledWith({ foo: 1 });
      },
    };

    jsPsych = initJsPsych({
      timeline: [trial],
    });

    pressKey("a");
  });

  test("on_load is called after load", () => {
    var onLoadFunc = jest.spyOn(jsPsych.extensions.test, "on_load");

    var trial = {
      type: htmlKeyboardResponse,
      stimulus: "foo",
      extensions: [{ type: "test" }],
      on_load: () => {
        // trial load happens before extension load
        expect(onLoadFunc).not.toHaveBeenCalled();
      },
    };

    jsPsych = initJsPsych({
      timeline: [trial],
    });

    expect(onLoadFunc).toHaveBeenCalled();

    pressKey("a");
  });

  test("on_load gets params", () => {
    var onLoadFunc = jest.spyOn(jsPsych.extensions.test, "on_load");

    var trial = {
      type: htmlKeyboardResponse,
      stimulus: "foo",
      extensions: [{ type: "test", params: { foo: 1 } }],
    };

    jsPsych = initJsPsych({
      timeline: [trial],
    });

    expect(onLoadFunc).toHaveBeenCalledWith({ foo: 1 });

    pressKey("a");
  });

  test("on_finish called after trial", () => {
    var onFinishFunc = jest.spyOn(jsPsych.extensions.test, "on_finish");

    var trial = {
      type: htmlKeyboardResponse,
      stimulus: "foo",
      extensions: [{ type: "test", params: { foo: 1 } }],
    };

    jsPsych = initJsPsych({
      timeline: [trial],
    });

    expect(onFinishFunc).not.toHaveBeenCalled();

    pressKey("a");

    expect(onFinishFunc).toHaveBeenCalled();
  });

  test("on_finish gets params", () => {
    var onFinishFunc = jest.spyOn(jsPsych.extensions.test, "on_finish");

    var trial = {
      type: htmlKeyboardResponse,
      stimulus: "foo",
      extensions: [{ type: "test", params: { foo: 1 } }],
    };

    jsPsych = initJsPsych({
      timeline: [trial],
    });

    pressKey("a");

    expect(onFinishFunc).toHaveBeenCalledWith({ foo: 1 });
  });

  test("on_finish adds trial data", () => {
    var trial = {
      type: htmlKeyboardResponse,
      stimulus: "foo",
      extensions: [{ type: "test", params: { foo: 1 } }],
    };

    jsPsych = initJsPsych({
      timeline: [trial],
    });

    pressKey("a");

    expect(jsPsych.data.get().values()[0].extension_data).toBe(true);
  });

  test("on_finish data is available in trial on_finish", () => {
    var trial = {
      type: htmlKeyboardResponse,
      stimulus: "foo",
      extensions: [{ type: "test", params: { foo: 1 } }],
      on_finish: (data) => {
        expect(data.extension_data).toBe(true);
      },
    };

    jsPsych = initJsPsych({
      timeline: [trial],
    });

    pressKey("a");
  });
});
