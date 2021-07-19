import htmlKeyboardResponse from "@jspsych/plugin-html-keyboard-response";

import { JsPsych, initJsPsych } from "../../src";
import { keyDown, keyUp, pressKey, startTimeline } from "../utils";

let jsPsych: JsPsych;

// https://devblogs.microsoft.com/typescript/announcing-typescript-4-1/#recursive-conditional-types
type Awaited<T> = T extends PromiseLike<infer U> ? Awaited<U> : T;

beforeEach(() => {
  jsPsych = initJsPsych();
});

describe("#getKeyboardResponse", () => {
  let helpers: Awaited<ReturnType<typeof startTimeline>>;
  let callback: jest.Mock;

  beforeEach(async () => {
    helpers = await startTimeline(
      [
        {
          type: htmlKeyboardResponse,
          stimulus: "foo",
          choices: ["q"],
        },
      ],
      jsPsych
    );

    callback = jest.fn();
  });

  test("should execute a function after successful keypress", async () => {
    jsPsych.pluginAPI.getKeyboardResponse({ callback_function: callback });

    expect(callback).toHaveBeenCalledTimes(0);
    keyDown("a");
    expect(callback).toHaveBeenCalledTimes(1);
    keyUp("a");
    expect(callback).toHaveBeenCalledTimes(1);
  });

  test("should execute only valid keys", () => {
    jsPsych.pluginAPI.getKeyboardResponse({ callback_function: callback, valid_responses: ["a"] });

    expect(callback).toHaveBeenCalledTimes(0);
    pressKey("b");
    expect(callback).toHaveBeenCalledTimes(0);
    pressKey("a");
    expect(callback).toHaveBeenCalledTimes(1);
  });

  test("should not respond when jsPsych.NO_KEYS is used", () => {
    jsPsych.pluginAPI.getKeyboardResponse({
      callback_function: callback,
      valid_responses: jsPsych.NO_KEYS,
    });

    expect(callback).toHaveBeenCalledTimes(0);
    pressKey("a");
    expect(callback).toHaveBeenCalledTimes(0);
    pressKey("a");
    expect(callback).toHaveBeenCalledTimes(0);
  });

  test("should not respond to held keys when allow_held_key is false", () => {
    keyDown("a");

    jsPsych.pluginAPI.getKeyboardResponse({
      callback_function: callback,
      valid_responses: jsPsych.ALL_KEYS,
      allow_held_key: false,
    });

    keyDown("a");
    expect(callback).toHaveBeenCalledTimes(0);
    keyUp("a");
    pressKey("a");
    expect(callback).toHaveBeenCalledTimes(1);
  });

  test("should respond to held keys when allow_held_key is true", () => {
    keyDown("a");

    jsPsych.pluginAPI.getKeyboardResponse({
      callback_function: callback,
      valid_responses: jsPsych.ALL_KEYS,
      allow_held_key: true,
    });

    keyDown("a");
    expect(callback).toHaveBeenCalledTimes(1);
    keyUp("a");
  });

  describe("when case_sensitive_responses is false", () => {
    test("should convert response key to lowercase before determining validity", () => {
      // case_sensitive_responses is false by default
      jsPsych.pluginAPI.getKeyboardResponse({
        callback_function: callback,
        valid_responses: ["a"],
      });

      expect(callback).toHaveBeenCalledTimes(0);
      pressKey("A");
      expect(callback).toHaveBeenCalledTimes(1);
    });

    test("should not respond to held key when response/valid key case differs and allow_held_key is false", () => {
      keyDown("A");
      jsPsych.pluginAPI.getKeyboardResponse({
        callback_function: callback,
        valid_responses: ["a"],
        allow_held_key: false,
      });

      keyDown("A");
      expect(callback).toHaveBeenCalledTimes(0);
      keyUp("A");
      pressKey("A");
      expect(callback).toHaveBeenCalledTimes(1);
    });

    test("should respond to held keys when response/valid case differs and allow_held_key is true", () => {
      keyDown("A");
      jsPsych.pluginAPI.getKeyboardResponse({
        callback_function: callback,
        valid_responses: ["a"],
        allow_held_key: true,
      });

      keyDown("A");
      expect(callback).toHaveBeenCalledTimes(1);
      keyUp("A");
    });
  });

  describe("when case_sensitive_responses is true", () => {
    beforeEach(async () => {
      jsPsych = initJsPsych({
        case_sensitive_responses: true,
      });
      helpers = await startTimeline(
        [
          {
            type: htmlKeyboardResponse,
            stimulus: "foo",
            choices: ["q"],
          },
        ],
        jsPsych
      );
    });

    test("should not convert response key to lowercase before determining validity", () => {
      jsPsych.pluginAPI.getKeyboardResponse({
        callback_function: callback,
        valid_responses: ["a"],
      });

      expect(callback).toHaveBeenCalledTimes(0);
      pressKey("A");
      expect(callback).toHaveBeenCalledTimes(0);
    });

    test("should not respond to a held key when response/valid case differs and allow_held_key is true", () => {
      keyDown("A");

      jsPsych.pluginAPI.getKeyboardResponse({
        callback_function: callback,
        valid_responses: ["a"],
        allow_held_key: true,
      });

      keyDown("A");
      expect(callback).toHaveBeenCalledTimes(0);
      keyUp("A");
    });

    test("should not respond to a held key when response/valid case differs and allow_held_key is false", () => {
      keyDown("A");

      jsPsych.pluginAPI.getKeyboardResponse({
        callback_function: callback,
        valid_responses: ["a"],
        allow_held_key: false,
      });

      keyDown("A");
      expect(callback).toHaveBeenCalledTimes(0);
      keyUp("A");
    });
  });
});

describe("#cancelKeyboardResponse", () => {
  test("should cancel a keyboard response listener", async () => {
    const callback = jest.fn();

    await startTimeline([
      {
        type: htmlKeyboardResponse,
        stimulus: "foo",
        choices: ["q"],
      },
    ]);

    const listener = jsPsych.pluginAPI.getKeyboardResponse({ callback_function: callback });
    expect(callback).toHaveBeenCalledTimes(0);

    jsPsych.pluginAPI.cancelKeyboardResponse(listener);
    pressKey("q");
    expect(callback).toHaveBeenCalledTimes(0);
  });
});

describe("#cancelAllKeyboardResponses", () => {
  test("should cancel all keyboard response listeners", async () => {
    const callback = jest.fn();

    await startTimeline([
      {
        type: htmlKeyboardResponse,
        stimulus: "foo",
        choices: ["q"],
      },
    ]);

    jsPsych.pluginAPI.getKeyboardResponse({ callback_function: callback });
    expect(callback).toHaveBeenCalledTimes(0);

    jsPsych.pluginAPI.cancelAllKeyboardResponses();
    pressKey("q");
    expect(callback).toHaveBeenCalledTimes(0);
  });
});

describe("#compareKeys", () => {
  test("should compare keys regardless of type (old key-keyCode functionality)", () => {
    expect(jsPsych.pluginAPI.compareKeys("q", 81)).toBe(true);
    expect(jsPsych.pluginAPI.compareKeys(81, 81)).toBe(true);
    expect(jsPsych.pluginAPI.compareKeys("q", "Q")).toBe(true);
    expect(jsPsych.pluginAPI.compareKeys(80, 81)).toBe(false);
    expect(jsPsych.pluginAPI.compareKeys("q", "1")).toBe(false);
    expect(jsPsych.pluginAPI.compareKeys("q", 80)).toBe(false);
  });

  test("should be case sensitive when case_sensitive_responses is true", () => {
    var t = {
      type: htmlKeyboardResponse,
      stimulus: "foo",
    };
    jsPsych = initJsPsych({
      timeline: [t],
      case_sensitive_responses: true,
    });
    expect(jsPsych.pluginAPI.compareKeys("q", "Q")).toBe(false);
    expect(jsPsych.pluginAPI.compareKeys("q", "q")).toBe(true);
  });

  test("should not be case sensitive when case_sensitive_responses is false", () => {
    var t = {
      type: htmlKeyboardResponse,
      stimulus: "foo",
    };
    jsPsych = initJsPsych({
      timeline: [t],
      case_sensitive_responses: false,
    });
    expect(jsPsych.pluginAPI.compareKeys("q", "Q")).toBe(true);
    expect(jsPsych.pluginAPI.compareKeys("q", "q")).toBe(true);
  });

  test("should accept null as argument, and return true if both arguments are null, and return false if one argument is null and other is string or numeric", () => {
    const spy = jest.spyOn(console, "error").mockImplementation(() => {});
    expect(jsPsych.pluginAPI.compareKeys(null, "Q")).toBe(false);
    expect(jsPsych.pluginAPI.compareKeys(80, null)).toBe(false);
    expect(jsPsych.pluginAPI.compareKeys(null, null)).toBe(true);
    expect(console.error).not.toHaveBeenCalled();
    spy.mockRestore();
  });

  test("should return undefined and produce a console warning if either/both arguments are not a string, integer, or null", () => {
    const spy = jest.spyOn(console, "error").mockImplementation(() => {});
    var t1 = jsPsych.pluginAPI.compareKeys({}, "Q");
    var t2 = jsPsych.pluginAPI.compareKeys(true, null);
    var t3 = jsPsych.pluginAPI.compareKeys(null, ["Q"]);
    expect(typeof t1).toBe("undefined");
    expect(typeof t2).toBe("undefined");
    expect(typeof t3).toBe("undefined");
    expect(console.error).toHaveBeenCalledTimes(3);
    expect(spy.mock.calls).toEqual([
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

describe("#convertKeyCharacterToKeyCode", () => {
  test("should return the keyCode for a particular character", () => {
    expect(jsPsych.pluginAPI.convertKeyCharacterToKeyCode("q")).toBe(81);
    expect(jsPsych.pluginAPI.convertKeyCharacterToKeyCode("1")).toBe(49);
    expect(jsPsych.pluginAPI.convertKeyCharacterToKeyCode("space")).toBe(32);
    expect(jsPsych.pluginAPI.convertKeyCharacterToKeyCode("enter")).toBe(13);
  });
});

describe("#convertKeyCodeToKeyCharacter", () => {
  test("should return the keyCode for a particular character", () => {
    expect(jsPsych.pluginAPI.convertKeyCodeToKeyCharacter(81)).toBe("q");
    expect(jsPsych.pluginAPI.convertKeyCodeToKeyCharacter(49)).toBe("1");
    expect(jsPsych.pluginAPI.convertKeyCodeToKeyCharacter(32)).toBe("space");
    expect(jsPsych.pluginAPI.convertKeyCodeToKeyCharacter(13)).toBe("enter");
  });
});

describe("#setTimeout", () => {
  test("basic setTimeout control with centralized storage", () => {
    jest.useFakeTimers();
    var callback = jest.fn();
    jsPsych.pluginAPI.setTimeout(callback, 1000);
    expect(callback).not.toBeCalled();
    jest.runAllTimers();
    expect(callback).toBeCalled();
  });
});

describe("#clearAllTimeouts", () => {
  test("clear timeouts before they execute", () => {
    jest.useFakeTimers();
    var callback = jest.fn();
    jsPsych.pluginAPI.setTimeout(callback, 5000);
    expect(callback).not.toBeCalled();
    jsPsych.pluginAPI.clearAllTimeouts();
    jest.runAllTimers();
    expect(callback).not.toBeCalled();
  });
});
