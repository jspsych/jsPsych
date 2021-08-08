import htmlKeyboardResponse from "@jspsych/plugin-html-keyboard-response";

import { JsPsych, initJsPsych } from "../../src";
import { pressKey } from "../utils";
import testExtension from "./test-extension";

jest.useFakeTimers();

// https://github.com/jspsych/jsPsych/projects/6#card-64825201
describe("jsPsych.extensions", () => {

  test("initialize is called at start of experiment", async () => {

    let jsPsych = initJsPsych({
      on_finish: () => {
        expect(initFunc).toHaveBeenCalled();
      },
      extensions: [
        {type: testExtension}
      ]
    });

    expect(typeof jsPsych.extensions.test.initialize).toBe("function");

    const initFunc = jest.spyOn(jsPsych.extensions.test, "initialize");

    const timeline = [{ type: htmlKeyboardResponse, stimulus: "foo", on_load: () => {pressKey('a')} }];

    await jsPsych.run(timeline);
  });

  test("initialize gets params", async () => {

    let jsPsych = initJsPsych({
      on_finish: () => {
        expect(initFunc).toHaveBeenCalledWith({ foo: 1 });
      },
      extensions: [
        {type: testExtension, params: { foo: 1 } }
      ]
    });

    expect(typeof jsPsych.extensions.test.initialize).toBe("function");

    const initFunc = jest.spyOn(jsPsych.extensions.test, "initialize");

    const timeline = [{ type: htmlKeyboardResponse, stimulus: "foo", on_load: () => {pressKey('a')} }];

    await jsPsych.run(timeline);
    
  });

  test("on_start is called before trial", async () => {

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
        pressKey('a');
      },
    };

    await jsPsych.run([trial]);
  });

  test("on_start gets params", async () => {

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
        pressKey("a");
      },
    };

    await jsPsych.run([trial]);
  });

  test("on_load is called after load", async () => {

    let jsPsych = initJsPsych({
      extensions: [
        {type: testExtension}
      ]
    })

    const onLoadFunc = jest.spyOn(jsPsych.extensions.test, "on_load");

    const trial = {
      type: htmlKeyboardResponse,
      stimulus: "foo",
      extensions: [{ type: testExtension }],
      on_load: () => {
        // trial load happens before extension load
        expect(onLoadFunc).not.toHaveBeenCalled();
        pressKey("a");
      }
    };

    await jsPsych.run([trial]);

    expect(onLoadFunc).toHaveBeenCalled();
  });

  test("on_load gets params", async () => {

    let jsPsych = initJsPsych({
      extensions: [
        {type: testExtension}
      ]
    })

    const onLoadFunc = jest.spyOn(jsPsych.extensions.test, "on_load");

    const trial = {
      type: htmlKeyboardResponse,
      stimulus: "foo",
      extensions: [{ type: testExtension, params: { foo: 1 } }],
      on_load: () => {
        pressKey("a");
      }
    };

    await jsPsych.run([trial]);

    expect(onLoadFunc).toHaveBeenCalledWith({ foo: 1 });
  });

  test("on_finish called after trial", async () => {

    let jsPsych = initJsPsych({
      extensions: [
        {type: testExtension}
      ]
    })

    var onFinishFunc = jest.spyOn(jsPsych.extensions.test, "on_finish");

    var trial = {
      type: htmlKeyboardResponse,
      stimulus: "foo",
      extensions: [{ type: testExtension }],
      on_load: () => {
        expect(onFinishFunc).not.toHaveBeenCalled();
        pressKey("a");
      }
    };

    await jsPsych.run([trial]);

    expect(onFinishFunc).toHaveBeenCalled();
  });

  test("on_finish gets params", async () => {

    let jsPsych = initJsPsych({
      extensions: [
        {type: testExtension}
      ]
    });

    var onFinishFunc = jest.spyOn(jsPsych.extensions.test, "on_finish");

    var trial = {
      type: htmlKeyboardResponse,
      stimulus: "foo",
      extensions: [{ type: testExtension, params: { foo: 1 } }],
      on_load: () => {
        expect(onFinishFunc).not.toHaveBeenCalled();
        pressKey("a");
      }
    };

    await jsPsych.run([trial]);

    expect(onFinishFunc).toHaveBeenCalledWith({ foo: 1 });
  });

  test("on_finish adds trial data", async () => {

    let jsPsych = initJsPsych({
      extensions: [
        {type: testExtension}
      ]
    })

    var trial = {
      type: htmlKeyboardResponse,
      stimulus: "foo",
      extensions: [{ type: testExtension }],
      on_load: () => {
        pressKey("a");
      }
    };

    await jsPsych.run([trial]);

    expect(jsPsych.data.get().values()[0].extension_data).toBe(true);
  });

  test("on_finish data is available in trial on_finish", async () => {

    let jsPsych = initJsPsych({
      extensions: [
        {type: testExtension}
      ]
    })

    var trial = {
      type: htmlKeyboardResponse,
      stimulus: "foo",
      extensions: [{ type: testExtension }],
      on_load: () => {
        pressKey("a");
      },
      on_finish: (data) => {
        expect(data.extension_data).toBe(true);
      },
    };

    await jsPsych.run([trial]);

    
  });
});
