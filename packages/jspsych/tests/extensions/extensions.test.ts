import htmlKeyboardResponse from "@jspsych/plugin-html-keyboard-response";

import { JsPsych, initJsPsych } from "../../src";
import { pressKey } from "../utils";
import testExtension from "./test-extension";

let jsPsych: JsPsych;

jest.useFakeTimers();

// https://github.com/jspsych/jsPsych/projects/6#card-64825201
describe.skip("jsPsych.extensions", function () {
  beforeEach(function () {
    jsPsych.extensions.test = testExtension;
  });

  test("initialize is called at start of experiment", function () {
    var initFunc = jest.spyOn(jsPsych.extensions.test, "initialize");

    var timeline = [{ type: htmlKeyboardResponse, stimulus: "foo" }];

    jsPsych = initJsPsych({
      timeline,
      extensions: [{ type: "test" }],
    });

    expect(initFunc).toHaveBeenCalled();
  });

  test("initialize gets params", function () {
    var initFunc = jest.spyOn(jsPsych.extensions.test, "initialize");

    var timeline = [{ type: htmlKeyboardResponse, stimulus: "foo" }];

    jsPsych = initJsPsych({
      timeline,
      extensions: [{ type: "test", params: { foo: 1 } }],
    });

    expect(initFunc).toHaveBeenCalledWith({ foo: 1 });
  });

  test("on_start is called before trial", function () {
    var onStartFunc = jest.spyOn(jsPsych.extensions.test, "on_start");

    var trial = {
      type: htmlKeyboardResponse,
      stimulus: "foo",
      extensions: [{ type: "test" }],
      on_load: function () {
        expect(onStartFunc).toHaveBeenCalled();
      },
    };

    jsPsych = initJsPsych({
      timeline: [trial],
    });

    pressKey("a");
  });

  test("on_start gets params", function () {
    var onStartFunc = jest.spyOn(jsPsych.extensions.test, "on_start");

    var trial = {
      type: htmlKeyboardResponse,
      stimulus: "foo",
      extensions: [{ type: "test", params: { foo: 1 } }],
      on_load: function () {
        expect(onStartFunc).toHaveBeenCalledWith({ foo: 1 });
      },
    };

    jsPsych = initJsPsych({
      timeline: [trial],
    });

    pressKey("a");
  });

  test("on_load is called after load", function () {
    var onLoadFunc = jest.spyOn(jsPsych.extensions.test, "on_load");

    var trial = {
      type: htmlKeyboardResponse,
      stimulus: "foo",
      extensions: [{ type: "test" }],
      on_load: function () {
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

  test("on_load gets params", function () {
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

  test("on_finish called after trial", function () {
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

  test("on_finish gets params", function () {
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

  test("on_finish adds trial data", function () {
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

  test("on_finish data is available in trial on_finish", function () {
    var trial = {
      type: htmlKeyboardResponse,
      stimulus: "foo",
      extensions: [{ type: "test", params: { foo: 1 } }],
      on_finish: function (data) {
        expect(data.extension_data).toBe(true);
      },
    };

    jsPsych = initJsPsych({
      timeline: [trial],
    });

    pressKey("a");
  });
});
