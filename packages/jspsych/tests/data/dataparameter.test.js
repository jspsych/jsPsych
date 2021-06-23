import htmlKeyboardResponse from "@jspsych/plugin-html-keyboard-response";

import jsPsych from "../../src";
import { pressKey } from "../utils";

describe("The data parameter", function () {
  test("should record data to a trial", function () {
    return new Promise(function (resolve, reject) {
      var key_data = null;

      var trial = {
        type: htmlKeyboardResponse,
        stimulus: "hello",
        data: { added: true },
      };

      jsPsych.init({
        timeline: [trial],
        on_finish: function () {
          var d = jsPsych.data.get().values()[0].added;
          resolve(d);
        },
      });

      pressKey("a");

      //resolve();
    }).then(function (data) {
      expect(data).toBe(true);
    });
  });

  test("should record data to all nested trials", function () {
    return new Promise(function (resolve, reject) {
      var key_data = null;

      var trial = {
        type: htmlKeyboardResponse,
        timeline: [{ stimulus: "a" }, { stimulus: "b" }],
        data: { added: true },
      };

      jsPsych.init({
        timeline: [trial],
        on_finish: function () {
          var d = jsPsych.data.get().filter({ added: true }).count();
          resolve(d);
        },
      });

      pressKey("a");

      pressKey("a");

      //resolve();
    }).then(function (data) {
      expect(data).toBe(2);
    });
  });

  test("should record data to all nested trials with timeline variables", function () {
    return new Promise(function (resolve, reject) {
      var key_data = null;

      var vars = [{ stimulus: "a" }, { stimulus: "b" }];

      var trial = {
        timeline: [{ type: htmlKeyboardResponse, stimulus: jsPsych.timelineVariable("stimulus") }],
        timeline_variables: vars,
        data: { added: true },
      };

      jsPsych.init({
        timeline: [trial],
        on_finish: function () {
          var d = jsPsych.data.get().filter({ added: true }).count();
          resolve(d);
        },
      });

      pressKey("a");

      pressKey("a");

      //resolve();
    }).then(function (data) {
      expect(data).toBe(2);
    });
  });

  test("should work as timeline variable at root level", function () {
    var trial = {
      timeline: [
        { type: htmlKeyboardResponse, stimulus: "foo", data: jsPsych.timelineVariable("d") },
      ],
      timeline_variables: [{ d: { added: true } }, { d: { added: false } }],
    };

    jsPsych.init({
      timeline: [trial],
    });

    pressKey("a"); // trial 1
    pressKey("a"); // trial 2

    expect(jsPsych.data.get().filter({ added: true }).count()).toBe(1);
    expect(jsPsych.data.get().filter({ added: false }).count()).toBe(1);
  });

  test("should work as timeline variable at nested level", function () {
    var trial = {
      timeline: [
        {
          type: htmlKeyboardResponse,
          stimulus: "foo",
          data: { added: jsPsych.timelineVariable("added") },
        },
      ],
      timeline_variables: [{ added: true }, { added: false }],
    };

    jsPsych.init({
      timeline: [trial],
    });

    pressKey("a"); // trial 1
    pressKey("a"); // trial 2

    expect(jsPsych.data.get().filter({ added: true }).count()).toBe(1);
    expect(jsPsych.data.get().filter({ added: false }).count()).toBe(1);
  });

  test("timeline variable should be available in trial on_finish", function () {
    var trial = {
      timeline: [
        {
          type: htmlKeyboardResponse,
          stimulus: "foo",
          data: { added: jsPsych.timelineVariable("added") },
          on_finish: function (data) {
            data.added_copy = data.added;
          },
        },
      ],
      timeline_variables: [{ added: true }, { added: false }],
    };

    jsPsych.init({
      timeline: [trial],
    });

    pressKey("a"); // trial 1
    pressKey("a"); // trial 2

    expect(jsPsych.data.get().filter({ added_copy: true }).count()).toBe(1);
    expect(jsPsych.data.get().filter({ added_copy: false }).count()).toBe(1);
  });

  test("should record data to all nested trials with timeline variables even when nested trials have own data", function () {
    return new Promise(function (resolve, reject) {
      var key_data = null;

      var vars = [{ stimulus: "a" }, { stimulus: "b" }];

      var trial = {
        timeline: [
          {
            type: htmlKeyboardResponse,
            stimulus: jsPsych.timelineVariable("stimulus"),
            data: { foo: 1 },
          },
        ],
        timeline_variables: vars,
        data: { added: true },
      };

      jsPsych.init({
        timeline: [trial],
        on_finish: function () {
          var d = jsPsych.data.get().filter({ added: true, foo: 1 }).count();
          resolve(d);
        },
      });

      pressKey("a");

      pressKey("a");

      //resolve();
    }).then(function (data) {
      expect(data).toBe(2);
    });
  });

  test("should accept a function as a parameter", function (done) {
    var trial = {
      type: htmlKeyboardResponse,
      stimulus: "foo",
      data: {
        a: function () {
          return 1;
        },
      },
    };

    var timeline = [trial];

    jsPsych.init({
      timeline: timeline,
      on_finish: function () {
        expect(jsPsych.data.get().values()[0].a).toBe(1);
        done();
      },
    });

    pressKey("a");
  });
});
