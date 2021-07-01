import { describe, expect, jest, test } from "@jest/globals";
import htmlKeyboardResponse from "@jspsych/plugin-html-keyboard-response";

import jsPsych from "../../src";
import * as pluginAPI from "../../src/plugin-api";

describe("#getKeyboardResponse", function () {
  test("should execute a function after successful keypress", function () {
    var callback = jest.fn();
    var t = {
      type: htmlKeyboardResponse,
      stimulus: "foo",
      choices: ["q"],
    };
    jsPsych.init({
      timeline: [t],
    });
    pluginAPI.getKeyboardResponse({ callback_function: callback });
    expect(callback.mock.calls.length).toBe(0);
    document
      .querySelector(".jspsych-display-element")
      .dispatchEvent(new KeyboardEvent("keydown", { key: "a" }));
    expect(callback.mock.calls.length).toBe(1);
    document
      .querySelector(".jspsych-display-element")
      .dispatchEvent(new KeyboardEvent("keyup", { key: "a" }));
    expect(callback.mock.calls.length).toBe(1);
  });
  test("should execute only valid keys", function () {
    var callback = jest.fn();
    var t = {
      type: htmlKeyboardResponse,
      stimulus: "foo",
      choices: ["q"],
    };
    jsPsych.init({
      timeline: [t],
    });
    pluginAPI.getKeyboardResponse({ callback_function: callback, valid_responses: ["a"] });
    expect(callback.mock.calls.length).toBe(0);
    document
      .querySelector(".jspsych-display-element")
      .dispatchEvent(new KeyboardEvent("keydown", { key: "b" }));
    document
      .querySelector(".jspsych-display-element")
      .dispatchEvent(new KeyboardEvent("keyup", { key: "b" }));
    expect(callback.mock.calls.length).toBe(0);
    document
      .querySelector(".jspsych-display-element")
      .dispatchEvent(new KeyboardEvent("keydown", { key: "a" }));
    document
      .querySelector(".jspsych-display-element")
      .dispatchEvent(new KeyboardEvent("keyup", { key: "a" }));
    expect(callback.mock.calls.length).toBe(1);
  });
  test("should not respond when jsPsych.NO_KEYS is used", function () {
    var callback = jest.fn();
    var t = {
      type: htmlKeyboardResponse,
      stimulus: "foo",
      choices: ["q"],
    };
    jsPsych.init({
      timeline: [t],
    });
    pluginAPI.getKeyboardResponse({
      callback_function: callback,
      valid_responses: jsPsych.NO_KEYS,
    });
    expect(callback.mock.calls.length).toBe(0);
    document
      .querySelector(".jspsych-display-element")
      .dispatchEvent(new KeyboardEvent("keydown", { key: "a" }));
    document
      .querySelector(".jspsych-display-element")
      .dispatchEvent(new KeyboardEvent("keyup", { key: "a" }));
    expect(callback.mock.calls.length).toBe(0);
    document
      .querySelector(".jspsych-display-element")
      .dispatchEvent(new KeyboardEvent("keydown", { key: "a" }));
    document
      .querySelector(".jspsych-display-element")
      .dispatchEvent(new KeyboardEvent("keyup", { key: "a" }));
    expect(callback.mock.calls.length).toBe(0);
  });
  test("should not respond to held keys when allow_held_key is false", function () {
    var callback = jest.fn();
    var t = {
      type: htmlKeyboardResponse,
      stimulus: "foo",
      choices: ["q"],
    };
    jsPsych.init({
      timeline: [t],
    });
    document
      .querySelector(".jspsych-display-element")
      .dispatchEvent(new KeyboardEvent("keydown", { key: "a" }));
    pluginAPI.getKeyboardResponse({
      callback_function: callback,
      valid_responses: jsPsych.ALL_KEYS,
      allow_held_key: false,
    });
    document
      .querySelector(".jspsych-display-element")
      .dispatchEvent(new KeyboardEvent("keydown", { key: "a" }));
    expect(callback.mock.calls.length).toBe(0);
    document
      .querySelector(".jspsych-display-element")
      .dispatchEvent(new KeyboardEvent("keyup", { key: "a" }));
    document
      .querySelector(".jspsych-display-element")
      .dispatchEvent(new KeyboardEvent("keydown", { key: "a" }));
    document
      .querySelector(".jspsych-display-element")
      .dispatchEvent(new KeyboardEvent("keyup", { key: "a" }));
    expect(callback.mock.calls.length).toBe(1);
  });
  test("should respond to held keys when allow_held_key is true", function () {
    var callback = jest.fn();
    var t = {
      type: htmlKeyboardResponse,
      stimulus: "foo",
      choices: ["q"],
    };
    jsPsych.init({
      timeline: [t],
    });
    document
      .querySelector(".jspsych-display-element")
      .dispatchEvent(new KeyboardEvent("keydown", { key: "a" }));
    pluginAPI.getKeyboardResponse({
      callback_function: callback,
      valid_responses: jsPsych.ALL_KEYS,
      allow_held_key: true,
    });
    document
      .querySelector(".jspsych-display-element")
      .dispatchEvent(new KeyboardEvent("keydown", { key: "a" }));
    expect(callback.mock.calls.length).toBe(1);
    document
      .querySelector(".jspsych-display-element")
      .dispatchEvent(new KeyboardEvent("keyup", { key: "a" }));
  });
  test("should convert response key to lowercase before determining validity, when case_sensitive_responses is false", function () {
    var callback = jest.fn();
    var t = {
      type: htmlKeyboardResponse,
      stimulus: "foo",
      choices: ["q"],
    };
    jsPsych.init({
      timeline: [t],
      case_sensitive_responses: false,
    });
    pluginAPI.getKeyboardResponse({ callback_function: callback, valid_responses: ["a"] });
    expect(callback.mock.calls.length).toBe(0);
    document
      .querySelector(".jspsych-display-element")
      .dispatchEvent(new KeyboardEvent("keydown", { key: "A" }));
    document
      .querySelector(".jspsych-display-element")
      .dispatchEvent(new KeyboardEvent("keyup", { key: "A" }));
    expect(callback.mock.calls.length).toBe(1);
  });
  test("should not convert response key to lowercase before determining validity, when case_sensitive_responses is true", function () {
    var callback = jest.fn();
    var t = {
      type: htmlKeyboardResponse,
      stimulus: "foo",
      choices: ["q"],
    };
    jsPsych.init({
      timeline: [t],
      case_sensitive_responses: true,
    });
    pluginAPI.getKeyboardResponse({ callback_function: callback, valid_responses: ["a"] });
    expect(callback.mock.calls.length).toBe(0);
    document
      .querySelector(".jspsych-display-element")
      .dispatchEvent(new KeyboardEvent("keydown", { key: "A" }));
    document
      .querySelector(".jspsych-display-element")
      .dispatchEvent(new KeyboardEvent("keyup", { key: "A" }));
    expect(callback.mock.calls.length).toBe(0);
  });
  test("should not respond to held key when response/valid key case differs, case_sensitive_responses is false, and allow held key is false", function () {
    var callback = jest.fn();
    var t = {
      type: htmlKeyboardResponse,
      stimulus: "foo",
      choices: ["q"],
    };
    jsPsych.init({
      timeline: [t],
      case_sensitive_responses: false,
    });
    document
      .querySelector(".jspsych-display-element")
      .dispatchEvent(new KeyboardEvent("keydown", { key: "A" }));
    pluginAPI.getKeyboardResponse({
      callback_function: callback,
      valid_responses: ["a"],
      allow_held_key: false,
    });
    document
      .querySelector(".jspsych-display-element")
      .dispatchEvent(new KeyboardEvent("keydown", { key: "A" }));
    expect(callback.mock.calls.length).toBe(0);
    document
      .querySelector(".jspsych-display-element")
      .dispatchEvent(new KeyboardEvent("keyup", { key: "A" }));
    document
      .querySelector(".jspsych-display-element")
      .dispatchEvent(new KeyboardEvent("keydown", { key: "A" }));
    document
      .querySelector(".jspsych-display-element")
      .dispatchEvent(new KeyboardEvent("keyup", { key: "A" }));
    expect(callback.mock.calls.length).toBe(1);
  });
  test("should respond to held keys when response/valid case differs, case_sensitive_responses is false, and allow_held_key is true", function () {
    var callback = jest.fn();
    var t = {
      type: htmlKeyboardResponse,
      stimulus: "foo",
      choices: ["q"],
    };
    jsPsych.init({
      timeline: [t],
      case_sensitive_responses: false,
    });
    document
      .querySelector(".jspsych-display-element")
      .dispatchEvent(new KeyboardEvent("keydown", { key: "A" }));
    pluginAPI.getKeyboardResponse({
      callback_function: callback,
      valid_responses: ["a"],
      allow_held_key: true,
    });
    document
      .querySelector(".jspsych-display-element")
      .dispatchEvent(new KeyboardEvent("keydown", { key: "A" }));
    expect(callback.mock.calls.length).toBe(1);
    document
      .querySelector(".jspsych-display-element")
      .dispatchEvent(new KeyboardEvent("keyup", { key: "A" }));
  });
  test("should not respond to a held key when response/valid case differs, case_sensitive_responses is true, and allow_held_key is true", function () {
    var callback = jest.fn();
    var t = {
      type: htmlKeyboardResponse,
      stimulus: "foo",
      choices: ["q"],
    };
    jsPsych.init({
      timeline: [t],
      case_sensitive_responses: true,
    });
    document
      .querySelector(".jspsych-display-element")
      .dispatchEvent(new KeyboardEvent("keydown", { key: "A" }));
    pluginAPI.getKeyboardResponse({
      callback_function: callback,
      valid_responses: ["a"],
      allow_held_key: true,
    });
    document
      .querySelector(".jspsych-display-element")
      .dispatchEvent(new KeyboardEvent("keydown", { key: "A" }));
    expect(callback.mock.calls.length).toBe(0);
    document
      .querySelector(".jspsych-display-element")
      .dispatchEvent(new KeyboardEvent("keyup", { key: "A" }));
  });
  test("should not respond to a held key when response/valid case differs, case_sensitive_responses is true, and allow_held_key is false", function () {
    var callback = jest.fn();
    var t = {
      type: htmlKeyboardResponse,
      stimulus: "foo",
      choices: ["q"],
    };
    jsPsych.init({
      timeline: [t],
      case_sensitive_responses: true,
    });
    document
      .querySelector(".jspsych-display-element")
      .dispatchEvent(new KeyboardEvent("keydown", { key: "A" }));
    pluginAPI.getKeyboardResponse({
      callback_function: callback,
      valid_responses: ["a"],
      allow_held_key: false,
    });
    document
      .querySelector(".jspsych-display-element")
      .dispatchEvent(new KeyboardEvent("keydown", { key: "A" }));
    expect(callback.mock.calls.length).toBe(0);
    document
      .querySelector(".jspsych-display-element")
      .dispatchEvent(new KeyboardEvent("keyup", { key: "A" }));
  });
  test("should default to case insensitive when used before jsPsych.init is called", function () {
    expect(jsPsych.initSettings().case_sensitive_responses).toBeUndefined();
    var callback = jest.fn();
    pluginAPI.getKeyboardResponse({ callback_function: callback, valid_responses: ["a"] });
    pluginAPI.createKeyboardEventListeners(document.body);
    expect(callback.mock.calls.length).toBe(0);
    document.body.dispatchEvent(new KeyboardEvent("keydown", { key: "a" }));
    document.body.dispatchEvent(new KeyboardEvent("keyup", { key: "a" }));
    expect(callback.mock.calls.length).toBe(1);
    pluginAPI.getKeyboardResponse({ callback_function: callback, valid_responses: ["a"] });
    pluginAPI.createKeyboardEventListeners(document.body);
    document.body.dispatchEvent(new KeyboardEvent("keydown", { key: "A" }));
    document.body.dispatchEvent(new KeyboardEvent("keyup", { key: "A" }));
    expect(callback.mock.calls.length).toBe(2);
    pluginAPI.reset(document.body);
  });
});

describe("#cancelKeyboardResponse", function () {
  test("should cancel a keyboard response listener", function () {
    var callback = jest.fn();
    var t = {
      type: htmlKeyboardResponse,
      stimulus: "foo",
      choices: ["q"],
    };
    jsPsych.init({
      timeline: [t],
    });
    var listener = pluginAPI.getKeyboardResponse({ callback_function: callback });
    expect(callback.mock.calls.length).toBe(0);
    pluginAPI.cancelKeyboardResponse(listener);
    document
      .querySelector(".jspsych-display-element")
      .dispatchEvent(new KeyboardEvent("keydown", { key: "q" }));
    document
      .querySelector(".jspsych-display-element")
      .dispatchEvent(new KeyboardEvent("keyup", { key: "q" }));
    expect(callback.mock.calls.length).toBe(0);
  });
});

describe("#cancelAllKeyboardResponses", function () {
  test("should cancel all keyboard response listeners", function () {
    var callback = jest.fn();
    var t = {
      type: htmlKeyboardResponse,
      stimulus: "foo",
      choices: ["q"],
    };
    jsPsych.init({
      timeline: [t],
    });
    pluginAPI.getKeyboardResponse({ callback_function: callback });
    expect(callback.mock.calls.length).toBe(0);
    pluginAPI.cancelAllKeyboardResponses();
    document
      .querySelector(".jspsych-display-element")
      .dispatchEvent(new KeyboardEvent("keydown", { key: "q" }));
    document
      .querySelector(".jspsych-display-element")
      .dispatchEvent(new KeyboardEvent("keyup", { key: "q" }));
    expect(callback.mock.calls.length).toBe(0);
  });
});

describe("#compareKeys", function () {
  test("should compare keys regardless of type (old key-keyCode functionality)", function () {
    expect(pluginAPI.compareKeys("q", 81)).toBe(true);
    expect(pluginAPI.compareKeys(81, 81)).toBe(true);
    expect(pluginAPI.compareKeys("q", "Q")).toBe(true);
    expect(pluginAPI.compareKeys(80, 81)).toBe(false);
    expect(pluginAPI.compareKeys("q", "1")).toBe(false);
    expect(pluginAPI.compareKeys("q", 80)).toBe(false);
  });
  test("should be case sensitive when case_sensitive_responses is true", function () {
    var t = {
      type: htmlKeyboardResponse,
      stimulus: "foo",
    };
    jsPsych.init({
      timeline: [t],
      case_sensitive_responses: true,
    });
    expect(pluginAPI.compareKeys("q", "Q")).toBe(false);
    expect(pluginAPI.compareKeys("q", "q")).toBe(true);
  });
  test("should not be case sensitive when case_sensitive_responses is false", function () {
    var t = {
      type: htmlKeyboardResponse,
      stimulus: "foo",
    };
    jsPsych.init({
      timeline: [t],
      case_sensitive_responses: false,
    });
    expect(pluginAPI.compareKeys("q", "Q")).toBe(true);
    expect(pluginAPI.compareKeys("q", "q")).toBe(true);
  });
  test("should default to case insensitive for strings when used before jsPsych.init is called", function () {
    expect(jsPsych.initSettings().case_sensitive_responses).toBeUndefined();
    expect(pluginAPI.compareKeys("q", "Q")).toBe(true);
    expect(pluginAPI.compareKeys("q", "q")).toBe(true);
  });
  test("should accept null as argument, and return true if both arguments are null, and return false if one argument is null and other is string or numeric", function () {
    const spy = jest.spyOn(console, "error").mockImplementation();
    expect(pluginAPI.compareKeys(null, "Q")).toBe(false);
    expect(pluginAPI.compareKeys(80, null)).toBe(false);
    expect(pluginAPI.compareKeys(null, null)).toBe(true);
    expect(console.error).not.toHaveBeenCalled();
    spy.mockRestore();
  });
  test("should return undefined and produce a console warning if either/both arguments are not a string, integer, or null", function () {
    const spy = jest.spyOn(console, "error").mockImplementation();
    var t1 = pluginAPI.compareKeys({}, "Q");
    var t2 = pluginAPI.compareKeys(true, null);
    var t3 = pluginAPI.compareKeys(null, ["Q"]);
    expect(typeof t1).toBe("undefined");
    expect(typeof t2).toBe("undefined");
    expect(typeof t3).toBe("undefined");
    expect(console.error).toHaveBeenCalledTimes(3);
    expect(console.error.mock.calls).toEqual([
      [
        "Error in jsPsych.pluginAPI.compareKeys: arguments must be numeric key codes, key strings, or null.",
      ],
      [
        "Error in jsPsych.pluginAPI.compareKeys: arguments must be numeric key codes, key strings, or null.",
      ],
      [
        "Error in jsPsych.pluginAPI.compareKeys: arguments must be numeric key codes, key strings, or null.",
      ],
    ]);
    spy.mockRestore();
  });
});

describe("#convertKeyCharacterToKeyCode", function () {
  test("should return the keyCode for a particular character", function () {
    expect(pluginAPI.convertKeyCharacterToKeyCode("q")).toBe(81);
    expect(pluginAPI.convertKeyCharacterToKeyCode("1")).toBe(49);
    expect(pluginAPI.convertKeyCharacterToKeyCode("space")).toBe(32);
    expect(pluginAPI.convertKeyCharacterToKeyCode("enter")).toBe(13);
  });
});

describe("#convertKeyCodeToKeyCharacter", function () {
  test("should return the keyCode for a particular character", function () {
    expect(pluginAPI.convertKeyCodeToKeyCharacter(81)).toBe("q");
    expect(pluginAPI.convertKeyCodeToKeyCharacter(49)).toBe("1");
    expect(pluginAPI.convertKeyCodeToKeyCharacter(32)).toBe("space");
    expect(pluginAPI.convertKeyCodeToKeyCharacter(13)).toBe("enter");
  });
});

describe("#setTimeout", function () {
  test("basic setTimeout control with centralized storage", function () {
    jest.useFakeTimers();
    var callback = jest.fn();
    pluginAPI.setTimeout(callback, 1000);
    expect(callback).not.toBeCalled();
    jest.runAllTimers();
    expect(callback).toBeCalled();
  });
});

describe("#clearAllTimeouts", function () {
  test("clear timeouts before they execute", function () {
    jest.useFakeTimers();
    var callback = jest.fn();
    pluginAPI.setTimeout(callback, 5000);
    expect(callback).not.toBeCalled();
    pluginAPI.clearAllTimeouts();
    jest.runAllTimers();
    expect(callback).not.toBeCalled();
  });
});
