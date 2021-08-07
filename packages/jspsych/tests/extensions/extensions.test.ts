import htmlKeyboardResponse from "@jspsych/plugin-html-keyboard-response";

import { JsPsych, initJsPsych } from "../../src";
import { pressKey } from "../utils";
import testExtension from "./test-extension";

jest.useFakeTimers();

// https://github.com/jspsych/jsPsych/projects/6#card-64825201
describe("jsPsych.extensions", () => {

  test.only("initialize is called at start of experiment", async () => {

    let jsPsych = initJsPsych({
      extensions: [
        {type: testExtension}
      ]
    });

    expect(typeof jsPsych.extensions.test.initialize).toBe("function");

    const initFunc = jest.spyOn(jsPsych.extensions.test, "initialize");

    const timeline = [{ type: htmlKeyboardResponse, stimulus: "foo" }];

    jsPsych.run(timeline);

    expect(initFunc).toHaveBeenCalled();
  });

  test("initialize gets params", () => {

    let jsPsych = initJsPsych({
      extensions: [
        {type: testExtension}
      ]
    })

    var initFunc = jest.spyOn(jsPsych.extensions.test, "initialize");

    var timeline = [{ type: htmlKeyboardResponse, stimulus: "foo" }];

    jsPsych = initJsPsych({
      timeline,
      extensions: [{ type: testExtension, params: { foo: 1 } }],
    });

    expect(initFunc).toHaveBeenCalledWith({ foo: 1 });
  });

  test("on_start is called before trial", () => {

    let jsPsych = initJsPsych({
      extensions: [
        {type: testExtension}
      ]
    })

    var onStartFunc = jest.spyOn(jsPsych.extensions.test, "on_start");

    var trial = {
      type: htmlKeyboardResponse,
      stimulus: "foo",
      extensions: [{ type: testExtension }],
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

    let jsPsych = initJsPsych({
      extensions: [
        {type: testExtension}
      ]
    })

    var onStartFunc = jest.spyOn(jsPsych.extensions.test, "on_start");

    var trial = {
      type: htmlKeyboardResponse,
      stimulus: "foo",
      extensions: [{ type: testExtension, params: { foo: 1 } }],
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

    let jsPsych = initJsPsych({
      extensions: [
        {type: testExtension}
      ]
    })

    var onLoadFunc = jest.spyOn(jsPsych.extensions.test, "on_load");

    var trial = {
      type: htmlKeyboardResponse,
      stimulus: "foo",
      extensions: [{ type: testExtension }],
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

    let jsPsych = initJsPsych({
      extensions: [
        {type: testExtension}
      ]
    })

    var onLoadFunc = jest.spyOn(jsPsych.extensions.test, "on_load");

    var trial = {
      type: htmlKeyboardResponse,
      stimulus: "foo",
      extensions: [{ type: testExtension, params: { foo: 1 } }],
    };

    jsPsych = initJsPsych({
      timeline: [trial],
    });

    expect(onLoadFunc).toHaveBeenCalledWith({ foo: 1 });

    pressKey("a");
  });

  test("on_finish called after trial", () => {

    let jsPsych = initJsPsych({
      extensions: [
        {type: testExtension}
      ]
    })

    var onFinishFunc = jest.spyOn(jsPsych.extensions.test, "on_finish");

    var trial = {
      type: htmlKeyboardResponse,
      stimulus: "foo",
      extensions: [{ type: testExtension, params: { foo: 1 } }],
    };

    jsPsych = initJsPsych({
      timeline: [trial],
    });

    expect(onFinishFunc).not.toHaveBeenCalled();

    pressKey("a");

    expect(onFinishFunc).toHaveBeenCalled();
  });

  test("on_finish gets params", () => {

    let jsPsych = initJsPsych({
      extensions: [
        {type: testExtension}
      ]
    })


    var onFinishFunc = jest.spyOn(jsPsych.extensions.test, "on_finish");

    var trial = {
      type: htmlKeyboardResponse,
      stimulus: "foo",
      extensions: [{ type: testExtension, params: { foo: 1 } }],
    };

    jsPsych = initJsPsych({
      timeline: [trial],
    });

    pressKey("a");

    expect(onFinishFunc).toHaveBeenCalledWith({ foo: 1 });
  });

  test("on_finish adds trial data", () => {

    let jsPsych = initJsPsych({
      extensions: [
        {type: testExtension}
      ]
    })


    var trial = {
      type: htmlKeyboardResponse,
      stimulus: "foo",
      extensions: [{ type: testExtension, params: { foo: 1 } }],
    };

    jsPsych = initJsPsych({
      timeline: [trial],
    });

    pressKey("a");

    expect(jsPsych.data.get().values()[0].extension_data).toBe(true);
  });

  test("on_finish data is available in trial on_finish", () => {

    let jsPsych = initJsPsych({
      extensions: [
        {type: testExtension}
      ]
    })

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
