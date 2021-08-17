export type KeyboardListener = {
  type: "keydown";
  fn: (e: KeyboardEvent) => void;
};

export type ValidResponses = string[] | "ALL_KEYS" | "NO_KEYS";

export interface GetKeyboardResponseOptions {
  callback_function: any;
  valid_responses?: ValidResponses;
  rt_method?: "performance" | "audio";
  persist?: boolean;
  audio_context?: AudioContext;
  audio_context_start_time?: number;
  allow_held_key?: boolean;
  /**
   * overiding via parameters for testing purposes.
   * TODO (bjoluc): Why exactly?
   */
  minimum_valid_rt?: number;
}

export class KeyboardListenerAPI {
  constructor(private areResponsesCaseSensitive: boolean = false, private minimumValidRt = 0) {}

  private listeners = new Set<KeyboardListener>();
  private heldKeys = new Set<string>();

  private rootKeydownListener(e: KeyboardEvent) {
    // Iterate over a static copy of the listeners set because listeners might add other listeners
    // that we do not want to be included in the loop
    for (const listener of Array.from(this.listeners)) {
      listener.fn(e);
    }
    this.heldKeys.add(this.toLowerCaseIfInsensitive(e.key));
  }

  private toLowerCaseIfInsensitive(string: string) {
    return this.areResponsesCaseSensitive ? string : string.toLowerCase();
  }

  private rootKeyupListener(e: KeyboardEvent) {
    this.heldKeys.delete(this.toLowerCaseIfInsensitive(e.key));
  }

  private isResponseValid(validResponses: ValidResponses, allowHeldKey: boolean, key: string) {
    // check if key was already held down
    if (!allowHeldKey && this.heldKeys.has(key)) {
      return false;
    }

    if (validResponses === "ALL_KEYS") {
      return true;
    }
    if (validResponses === "NO_KEYS") {
      return false;
    }

    return validResponses.includes(key);
  }

  reset(root_element: Element) {
    this.listeners.clear();
    this.heldKeys.clear();
    root_element.removeEventListener("keydown", this.rootKeydownListener);
    root_element.removeEventListener("keyup", this.rootKeyupListener);
  }

  createKeyboardEventListeners(root_element: Element) {
    root_element.addEventListener("keydown", this.rootKeydownListener);
    root_element.addEventListener("keyup", this.rootKeyupListener);
  }

  getKeyboardResponse({
    callback_function,
    valid_responses = "ALL_KEYS",
    rt_method = "performance",
    persist,
    audio_context,
    audio_context_start_time,
    allow_held_key = false,
    minimum_valid_rt = this.minimumValidRt,
  }: GetKeyboardResponseOptions) {
    if (rt_method !== "performance" && rt_method !== "audio") {
      console.log(
        'Invalid RT method specified in getKeyboardResponse. Defaulting to "performance" method.'
      );
      rt_method = "performance";
    }

    const usePerformanceRt = rt_method === "performance";
    const startTime = usePerformanceRt ? performance.now() : audio_context_start_time * 1000;

    if (!this.areResponsesCaseSensitive && typeof valid_responses !== "string") {
      valid_responses = valid_responses.map((r) => r.toLowerCase());
    }

    const listener: KeyboardListener = {
      type: "keydown",
      fn: (e: KeyboardEvent) => {
        const rt =
          (rt_method == "performance" ? performance.now() : audio_context.currentTime * 1000) -
          startTime;
        if (rt < minimum_valid_rt) {
          return;
        }

        const key = this.toLowerCaseIfInsensitive(e.key);

        if (this.isResponseValid(valid_responses, allow_held_key, key)) {
          // if this is a valid response, then we don't want the key event to trigger other actions
          // like scrolling via the spacebar.
          e.preventDefault();

          if (!persist) {
            // remove keyboard listener if it exists
            this.cancelKeyboardResponse(listener);
          }

          callback_function({ key, rt });
        }
      },
    };

    this.listeners.add(listener);
    return listener;
  }

  cancelKeyboardResponse(listener: KeyboardListener) {
    // remove the listener from the set of listeners if it is contained
    this.listeners.delete(listener);
  }

  cancelAllKeyboardResponses() {
    this.listeners.clear();
  }

  convertKeyCharacterToKeyCode(character: string) {
    console.warn(
      "Warning: The jsPsych.pluginAPI.convertKeyCharacterToKeyCode function will be removed in future jsPsych releases. " +
        "We recommend removing this function and using strings to identify/compare keys."
    );
    return KeyboardListenerAPI.keylookup[character.toLowerCase()];
  }

  convertKeyCodeToKeyCharacter(code: number) {
    console.warn(
      "Warning: The jsPsych.pluginAPI.convertKeyCodeToKeyCharacter function will be removed in future jsPsych releases. " +
        "We recommend removing this function and using strings to identify/compare keys."
    );
    for (var i in Object.keys(KeyboardListenerAPI.keylookup)) {
      if (KeyboardListenerAPI.keylookup[Object.keys(KeyboardListenerAPI.keylookup)[i]] == code) {
        return Object.keys(KeyboardListenerAPI.keylookup)[i];
      }
    }
    return undefined;
  }

  compareKeys(key1: string | number | null, key2: string | number | null) {
    if (Number.isFinite(key1) || Number.isFinite(key2)) {
      // if either value is a numeric keyCode, then convert both to numeric keyCode values and compare (maintained for backwards compatibility)
      if (typeof key1 == "string") {
        key1 = this.convertKeyCharacterToKeyCode(key1);
      }
      if (typeof key2 == "string") {
        key2 = this.convertKeyCharacterToKeyCode(key2);
      }
      return key1 == key2;
    } else if (typeof key1 === "string" && typeof key2 === "string") {
      // if both values are strings, then check whether or not letter case should be converted before comparing (case_sensitive_responses in jsPsych.init)
      if (this.areResponsesCaseSensitive) {
        return key1 === key2;
      } else {
        return key1.toLowerCase() === key2.toLowerCase();
      }
    } else if (
      (key1 === null && (typeof key2 === "string" || Number.isFinite(key2))) ||
      (key2 === null && (typeof key1 === "string" || Number.isFinite(key1)))
    ) {
      return false;
    } else if (key1 === null && key2 === null) {
      return true;
    } else {
      console.error(
        "Error in jsPsych.pluginAPI.compareKeys: arguments must be numeric key codes, key strings, or null."
      );
      return undefined;
    }
  }

  static keylookup = {
    backspace: 8,
    tab: 9,
    enter: 13,
    shift: 16,
    ctrl: 17,
    alt: 18,
    pause: 19,
    capslock: 20,
    esc: 27,
    space: 32,
    spacebar: 32,
    " ": 32,
    pageup: 33,
    pagedown: 34,
    end: 35,
    home: 36,
    leftarrow: 37,
    uparrow: 38,
    rightarrow: 39,
    downarrow: 40,
    insert: 45,
    delete: 46,
    0: 48,
    1: 49,
    2: 50,
    3: 51,
    4: 52,
    5: 53,
    6: 54,
    7: 55,
    8: 56,
    9: 57,
    a: 65,
    b: 66,
    c: 67,
    d: 68,
    e: 69,
    f: 70,
    g: 71,
    h: 72,
    i: 73,
    j: 74,
    k: 75,
    l: 76,
    m: 77,
    n: 78,
    o: 79,
    p: 80,
    q: 81,
    r: 82,
    s: 83,
    t: 84,
    u: 85,
    v: 86,
    w: 87,
    x: 88,
    y: 89,
    z: 90,
    "0numpad": 96,
    "1numpad": 97,
    "2numpad": 98,
    "3numpad": 99,
    "4numpad": 100,
    "5numpad": 101,
    "6numpad": 102,
    "7numpad": 103,
    "8numpad": 104,
    "9numpad": 105,
    multiply: 106,
    plus: 107,
    minus: 109,
    decimal: 110,
    divide: 111,
    f1: 112,
    f2: 113,
    f3: 114,
    f4: 115,
    f5: 116,
    f6: 117,
    f7: 118,
    f8: 119,
    f9: 120,
    f10: 121,
    f11: 122,
    f12: 123,
    "=": 187,
    ",": 188,
    ".": 190,
    "/": 191,
    "`": 192,
    "[": 219,
    "\\": 220,
    "]": 221,
  };
}
