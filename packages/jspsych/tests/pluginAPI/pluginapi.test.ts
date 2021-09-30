import { keyDown, keyUp, pressKey } from "@jspsych/test-utils";

import { KeyboardListenerAPI } from "../../src/modules/plugin-api/KeyboardListenerAPI";
import { TimeoutAPI } from "../../src/modules/plugin-api/TimeoutAPI";

jest.useFakeTimers();

const getRootElement = () => document.body;

describe("#getKeyboardResponse", () => {
  let callback: jest.Mock;

  beforeEach(() => {
    callback = jest.fn();
  });

  test("should execute a function after successful keypress", async () => {
    new KeyboardListenerAPI(getRootElement).getKeyboardResponse({
      callback_function: callback,
    });

    keyDown("a");
    expect(callback).toHaveBeenCalledTimes(1);
    keyUp("a");
    expect(callback).toHaveBeenCalledTimes(1);
  });

  test("should execute only valid keys", () => {
    new KeyboardListenerAPI(getRootElement).getKeyboardResponse({
      callback_function: callback,
      valid_responses: ["a"],
    });

    pressKey("b");
    expect(callback).toHaveBeenCalledTimes(0);
    pressKey("a");
    expect(callback).toHaveBeenCalledTimes(1);
  });

  test('should not respond when "NO_KEYS" is used', () => {
    new KeyboardListenerAPI(getRootElement).getKeyboardResponse({
      callback_function: callback,
      valid_responses: "NO_KEYS",
    });

    pressKey("a");
    expect(callback).toHaveBeenCalledTimes(0);
    pressKey("a");
    expect(callback).toHaveBeenCalledTimes(0);
  });

  test("should not respond to held keys when allow_held_key is false", () => {
    const api = new KeyboardListenerAPI(getRootElement);
    keyDown("a");

    api.getKeyboardResponse({
      callback_function: callback,
      valid_responses: "ALL_KEYS",
      allow_held_key: false,
    });

    keyDown("a");
    expect(callback).toHaveBeenCalledTimes(0);
    keyUp("a");
    pressKey("a");
    expect(callback).toHaveBeenCalledTimes(1);
  });

  test("should respond to held keys when allow_held_key is true", () => {
    const api = new KeyboardListenerAPI(getRootElement);
    keyDown("a");

    api.getKeyboardResponse({
      callback_function: callback,
      valid_responses: "ALL_KEYS",
      allow_held_key: true,
    });

    keyDown("a");
    expect(callback).toHaveBeenCalledTimes(1);
    keyUp("a");
  });

  describe("when case_sensitive_responses is false", () => {
    let api: KeyboardListenerAPI;

    beforeEach(() => {
      api = new KeyboardListenerAPI(getRootElement);
    });

    test("should convert response key to lowercase before determining validity", () => {
      // case_sensitive_responses is false by default
      api.getKeyboardResponse({
        callback_function: callback,
        valid_responses: ["a"],
      });

      pressKey("A");
      expect(callback).toHaveBeenCalledTimes(1);
    });

    test("should not respond to held key when response/valid key case differs and allow_held_key is false", () => {
      keyDown("A");
      api.getKeyboardResponse({
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
      api.getKeyboardResponse({
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
    let api: KeyboardListenerAPI;

    beforeEach(() => {
      api = new KeyboardListenerAPI(getRootElement, true);
    });

    test("should not convert response key to lowercase before determining validity", () => {
      api.getKeyboardResponse({
        callback_function: callback,
        valid_responses: ["a"],
      });

      pressKey("A");
      expect(callback).toHaveBeenCalledTimes(0);
    });

    test("should not respond to a held key when response/valid case differs and allow_held_key is true", () => {
      keyDown("A");

      api.getKeyboardResponse({
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

      api.getKeyboardResponse({
        callback_function: callback,
        valid_responses: ["a"],
        allow_held_key: false,
      });

      keyDown("A");
      expect(callback).toHaveBeenCalledTimes(0);
      keyUp("A");
    });
  });

  test("handles two listeners on the same key correctly #2104/#2105", () => {
    const callback_1 = jest.fn();
    const callback_2 = jest.fn();
    const api = new KeyboardListenerAPI(getRootElement);
    const listener_1 = api.getKeyboardResponse({
      callback_function: callback_1,
      valid_responses: ["a"],
      persist: true,
    });
    const listener_2 = api.getKeyboardResponse({
      callback_function: callback_2,
      persist: false,
    });

    keyDown("a");

    expect(callback_1).toHaveBeenCalledTimes(1);
    expect(callback_2).toHaveBeenCalledTimes(1);

    keyUp("a");

    keyDown("a");

    expect(callback_1).toHaveBeenCalledTimes(2);
    expect(callback_2).toHaveBeenCalledTimes(1);

    keyUp("a");
  });
});

describe("#cancelKeyboardResponse", () => {
  test("should cancel a keyboard response listener", async () => {
    const api = new KeyboardListenerAPI(getRootElement);
    const callback = jest.fn();

    api.getKeyboardResponse({ callback_function: callback });
    const listener = api.getKeyboardResponse({ callback_function: callback });
    api.cancelKeyboardResponse(listener);

    pressKey("q");
    expect(callback).toHaveBeenCalledTimes(1);
  });
});

describe("#cancelAllKeyboardResponses", () => {
  test("should cancel all keyboard response listeners", async () => {
    const api = new KeyboardListenerAPI(getRootElement);
    const callback = jest.fn();

    api.getKeyboardResponse({ callback_function: callback });
    api.getKeyboardResponse({ callback_function: callback });
    api.cancelAllKeyboardResponses();

    pressKey("q");
    expect(callback).toHaveBeenCalledTimes(0);
  });
});

describe("#compareKeys", () => {
  test("should be case sensitive when case_sensitive_responses is true", () => {
    const api = new KeyboardListenerAPI(getRootElement, true);

    expect(api.compareKeys("q", "Q")).toBe(false);
    expect(api.compareKeys("q", "q")).toBe(true);
  });

  test("should not be case sensitive when case_sensitive_responses is false", () => {
    const api = new KeyboardListenerAPI(getRootElement);

    expect(api.compareKeys("q", "Q")).toBe(true);
    expect(api.compareKeys("q", "q")).toBe(true);
  });

  test("should accept null as argument, and return true if both arguments are null, and return false if one argument is null and other is string", () => {
    const spy = jest.spyOn(console, "error").mockImplementation(() => {});

    const api = new KeyboardListenerAPI(getRootElement);
    expect(api.compareKeys(null, "Q")).toBe(false);
    expect(api.compareKeys("Q", null)).toBe(false);
    expect(api.compareKeys(null, null)).toBe(true);

    expect(console.error).not.toHaveBeenCalled();
    spy.mockRestore();
  });

  test("should return undefined and produce a console warning if either/both arguments are not a string, integer, or null", () => {
    const spy = jest.spyOn(console, "error").mockImplementation(() => {});
    const api = new KeyboardListenerAPI(getRootElement);

    // @ts-expect-error The compareKeys types forbid this
    expect(api.compareKeys({}, "Q")).toBeUndefined();
    // @ts-expect-error The compareKeys types forbid this
    expect(api.compareKeys(true, null)).toBeUndefined();
    // @ts-expect-error The compareKeys types forbid this
    expect(api.compareKeys(null, ["Q"])).toBeUndefined();

    expect(console.error).toHaveBeenCalledTimes(3);
    for (let i = 1; i < 4; i++) {
      expect(spy).toHaveBeenNthCalledWith(
        i,
        "Error in jsPsych.pluginAPI.compareKeys: arguments must be key strings or null."
      );
    }

    spy.mockRestore();
  });
});

describe("#setTimeout", () => {
  test("basic setTimeout control with centralized storage", () => {
    const api = new TimeoutAPI();

    var callback = jest.fn();
    api.setTimeout(callback, 1000);
    expect(callback).not.toHaveBeenCalled();
    jest.advanceTimersByTime(1000);
    expect(callback).toHaveBeenCalled();
  });
});

describe("#clearAllTimeouts", () => {
  test("clear timeouts before they execute", () => {
    const api = new TimeoutAPI();

    var callback = jest.fn();
    api.setTimeout(callback, 5000);
    expect(callback).not.toHaveBeenCalled();
    api.clearAllTimeouts();
    jest.advanceTimersByTime(5000);
    expect(callback).not.toHaveBeenCalled();
  });
});
