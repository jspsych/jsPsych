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

    await keyDown("a");
    expect(callback).toHaveBeenCalledTimes(1);
    await keyUp("a");
    expect(callback).toHaveBeenCalledTimes(1);
  });

  test("should execute only valid keys", async () => {
    new KeyboardListenerAPI(getRootElement).getKeyboardResponse({
      callback_function: callback,
      valid_responses: ["a"],
    });

    await pressKey("b");
    expect(callback).toHaveBeenCalledTimes(0);
    await pressKey("a");
    expect(callback).toHaveBeenCalledTimes(1);
  });

  test('should not respond when "NO_KEYS" is used', async () => {
    new KeyboardListenerAPI(getRootElement).getKeyboardResponse({
      callback_function: callback,
      valid_responses: "NO_KEYS",
    });

    await pressKey("a");
    expect(callback).toHaveBeenCalledTimes(0);
    await pressKey("a");
    expect(callback).toHaveBeenCalledTimes(0);
  });

  test("should not respond to held keys when allow_held_key is false", async () => {
    const api = new KeyboardListenerAPI(getRootElement);
    await keyDown("a");

    api.getKeyboardResponse({
      callback_function: callback,
      valid_responses: "ALL_KEYS",
      allow_held_key: false,
    });

    await keyDown("a");
    expect(callback).toHaveBeenCalledTimes(0);
    await keyUp("a");
    await pressKey("a");
    expect(callback).toHaveBeenCalledTimes(1);
  });

  test("should respond to held keys when allow_held_key is true", async () => {
    const api = new KeyboardListenerAPI(getRootElement);
    await keyDown("a");

    api.getKeyboardResponse({
      callback_function: callback,
      valid_responses: "ALL_KEYS",
      allow_held_key: true,
    });

    await keyDown("a");
    expect(callback).toHaveBeenCalledTimes(1);
    await keyUp("a");
  });

  test("should return the key in standard capitalization (issue #3325)", async () => {
    const api = new KeyboardListenerAPI(getRootElement);

    api.getKeyboardResponse({
      callback_function: callback,
      valid_responses: ["enter"],
    });

    await pressKey("Enter");
    expect(callback).toHaveBeenCalledWith({ key: "Enter", rt: expect.any(Number) });
  });

  describe("when case_sensitive_responses is false", () => {
    let api: KeyboardListenerAPI;

    beforeEach(() => {
      api = new KeyboardListenerAPI(getRootElement);
    });

    test("should convert response key to lowercase before determining validity", async () => {
      // case_sensitive_responses is false by default
      api.getKeyboardResponse({
        callback_function: callback,
        valid_responses: ["a"],
      });

      await pressKey("A");
      expect(callback).toHaveBeenCalledTimes(1);
    });

    test("should not respond to held key when response/valid key case differs and allow_held_key is false", async () => {
      await keyDown("A");
      api.getKeyboardResponse({
        callback_function: callback,
        valid_responses: ["a"],
        allow_held_key: false,
      });

      await keyDown("A");
      expect(callback).not.toHaveBeenCalled();
      await keyUp("A");
      await pressKey("A");
      expect(callback).toHaveBeenCalledTimes(1);
    });

    test("should respond to held keys when response/valid case differs and allow_held_key is true", async () => {
      await keyDown("A");
      api.getKeyboardResponse({
        callback_function: callback,
        valid_responses: ["a"],
        allow_held_key: true,
      });

      await keyDown("A");
      expect(callback).toHaveBeenCalledTimes(1);
      await keyUp("A");
    });
  });

  describe("when case_sensitive_responses is true", () => {
    let api: KeyboardListenerAPI;

    beforeEach(() => {
      api = new KeyboardListenerAPI(getRootElement, true);
    });

    test("should not convert response key to lowercase before determining validity", async () => {
      api.getKeyboardResponse({
        callback_function: callback,
        valid_responses: ["a"],
      });

      await pressKey("A");
      expect(callback).toHaveBeenCalledTimes(0);
    });

    test("should not respond to a held key when response/valid case differs and allow_held_key is true", async () => {
      await keyDown("A");

      api.getKeyboardResponse({
        callback_function: callback,
        valid_responses: ["a"],
        allow_held_key: true,
      });

      await keyDown("A");
      expect(callback).toHaveBeenCalledTimes(0);
      await keyUp("A");
    });

    test("should not respond to a held key when response/valid case differs and allow_held_key is false", async () => {
      await keyDown("A");

      api.getKeyboardResponse({
        callback_function: callback,
        valid_responses: ["a"],
        allow_held_key: false,
      });

      await keyDown("A");
      expect(callback).toHaveBeenCalledTimes(0);
      await keyUp("A");
    });
  });

  test("handles two listeners on the same key correctly #2104/#2105", async () => {
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

    await keyDown("a");

    expect(callback_1).toHaveBeenCalledTimes(1);
    expect(callback_2).toHaveBeenCalledTimes(1);

    await keyUp("a");

    await keyDown("a");

    expect(callback_1).toHaveBeenCalledTimes(2);
    expect(callback_2).toHaveBeenCalledTimes(1);

    await keyUp("a");
  });
});

describe("#getKeyboardResponse wait_for_key_release", () => {
  let callback: jest.Mock;

  beforeEach(() => {
    callback = jest.fn();
  });

  test("does not fire at keydown; fires at keyup with { key, rt, rt_key_duration }", async () => {
    jest.advanceTimersByTime(100);
    new KeyboardListenerAPI(getRootElement).getKeyboardResponse({
      callback_function: callback,
      wait_for_key_release: true,
    });

    // rt is measured relative to the call above; advance before keydown to set rt.
    jest.advanceTimersByTime(100);
    await keyDown("a");
    expect(callback).toHaveBeenCalledTimes(0);

    jest.advanceTimersByTime(300);
    await keyUp("a");
    expect(callback).toHaveBeenCalledTimes(1);
    expect(callback).toHaveBeenCalledWith({ key: "a", rt: 100, rt_key_duration: 300 });
  });

  test("default (no option): fires at keydown with no rt_key_duration property", async () => {
    new KeyboardListenerAPI(getRootElement).getKeyboardResponse({
      callback_function: callback,
    });

    await keyDown("a");
    expect(callback).toHaveBeenCalledTimes(1);
    expect(callback).toHaveBeenCalledWith({ key: "a", rt: expect.any(Number) });
    expect(callback).not.toHaveBeenCalledWith(
      expect.objectContaining({ rt_key_duration: expect.anything() })
    );

    await keyUp("a");
    expect(callback).toHaveBeenCalledTimes(1);
  });

  test("cancelKeyboardResponse(handle) between keydown and keyup: callback never fires", async () => {
    const api = new KeyboardListenerAPI(getRootElement);
    const listener = api.getKeyboardResponse({
      callback_function: callback,
      wait_for_key_release: true,
    });

    await keyDown("a");
    expect(callback).toHaveBeenCalledTimes(0);

    api.cancelKeyboardResponse(listener);

    jest.advanceTimersByTime(200);
    await keyUp("a");
    expect(callback).toHaveBeenCalledTimes(0);
  });

  test("cancelAllKeyboardResponses between keydown and keyup: callback never fires", async () => {
    const api = new KeyboardListenerAPI(getRootElement);
    api.getKeyboardResponse({
      callback_function: callback,
      wait_for_key_release: true,
    });

    await keyDown("a");
    expect(callback).toHaveBeenCalledTimes(0);

    api.cancelAllKeyboardResponses();

    jest.advanceTimersByTime(200);
    await keyUp("a");
    expect(callback).toHaveBeenCalledTimes(0);
  });

  test("invalid (non-choice) key: nothing fires on keydown or keyup", async () => {
    new KeyboardListenerAPI(getRootElement).getKeyboardResponse({
      callback_function: callback,
      valid_responses: ["a"],
      wait_for_key_release: true,
    });

    await keyDown("b");
    expect(callback).toHaveBeenCalledTimes(0);
    jest.advanceTimersByTime(100);
    await keyUp("b");
    expect(callback).toHaveBeenCalledTimes(0);
  });

  test("key-repeat while held does not reset the press timestamp", async () => {
    new KeyboardListenerAPI(getRootElement).getKeyboardResponse({
      callback_function: callback,
      wait_for_key_release: true,
    });

    await keyDown("a");
    jest.advanceTimersByTime(100);
    // key-repeat: a second keydown while the key is still held
    await keyDown("a");
    jest.advanceTimersByTime(100);

    await keyUp("a");
    expect(callback).toHaveBeenCalledTimes(1);
    expect(callback).toHaveBeenCalledWith({
      key: "a",
      rt: expect.any(Number),
      rt_key_duration: 200,
    });
  });

  test("persist: true: two press-release cycles produce two callbacks with correct durations", async () => {
    new KeyboardListenerAPI(getRootElement).getKeyboardResponse({
      callback_function: callback,
      wait_for_key_release: true,
      persist: true,
    });

    await keyDown("a");
    jest.advanceTimersByTime(150);
    await keyUp("a");
    expect(callback).toHaveBeenCalledTimes(1);
    expect(callback).toHaveBeenLastCalledWith(
      expect.objectContaining({ key: "a", rt_key_duration: 150 })
    );

    await keyDown("a");
    jest.advanceTimersByTime(250);
    await keyUp("a");
    expect(callback).toHaveBeenCalledTimes(2);
    expect(callback).toHaveBeenLastCalledWith(
      expect.objectContaining({ key: "a", rt_key_duration: 250 })
    );
  });

  test("persist: true: a second press before the first is released supersedes the first; only the latest press's release fires", async () => {
    new KeyboardListenerAPI(getRootElement).getKeyboardResponse({
      callback_function: callback,
      wait_for_key_release: true,
      persist: true,
    });

    // press "a", then press "b" before releasing "a"
    await keyDown("a");
    jest.advanceTimersByTime(100);
    await keyDown("b");
    jest.advanceTimersByTime(100);

    // releasing "a" does not fire: it was superseded by the "b" press
    await keyUp("a");
    expect(callback).toHaveBeenCalledTimes(0);

    // releasing "b" fires with the duration measured from the "b" press
    await keyUp("b");
    expect(callback).toHaveBeenCalledTimes(1);
    expect(callback).toHaveBeenLastCalledWith(
      expect.objectContaining({ key: "b", rt_key_duration: 100 })
    );
  });
});

describe("#cancelKeyboardResponse", () => {
  test("should cancel a keyboard response listener", async () => {
    const api = new KeyboardListenerAPI(getRootElement);
    const callback = jest.fn();

    api.getKeyboardResponse({ callback_function: callback });
    const listener = api.getKeyboardResponse({ callback_function: callback });
    api.cancelKeyboardResponse(listener);

    await pressKey("q");
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

    await pressKey("q");
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
