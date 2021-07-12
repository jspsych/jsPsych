export class KeyboardListenerAPI {
  constructor(
    private areResponsesCaseSensitive: boolean,
    private minimumValidRt = 0,
    private readonly ALL_KEYS = "allkeys",
    private readonly NO_KEYS = "none"
  ) {}

  private keyboard_listeners = [];

  private held_keys = {};

  private root_keydown_listener(e) {
    for (var i = 0; i < this.keyboard_listeners.length; i++) {
      this.keyboard_listeners[i].fn(e);
    }
    this.held_keys[e.key] = true;
  }

  private root_keyup_listener(e) {
    this.held_keys[e.key] = false;
  }

  reset(root_element) {
    this.keyboard_listeners = [];
    this.held_keys = {};
    root_element.removeEventListener("keydown", this.root_keydown_listener);
    root_element.removeEventListener("keyup", this.root_keyup_listener);
  }

  createKeyboardEventListeners(root_element) {
    root_element.addEventListener("keydown", this.root_keydown_listener);
    root_element.addEventListener("keyup", this.root_keyup_listener);
  }

  getKeyboardResponse(parameters) {
    //parameters are: callback_function, valid_responses, rt_method, persist, audio_context, audio_context_start_time, allow_held_key

    parameters.rt_method =
      typeof parameters.rt_method === "undefined" ? "performance" : parameters.rt_method;
    if (parameters.rt_method != "performance" && parameters.rt_method != "audio") {
      console.log(
        'Invalid RT method specified in getKeyboardResponse. Defaulting to "performance" method.'
      );
      parameters.rt_method = "performance";
    }

    var start_time;
    if (parameters.rt_method == "performance") {
      start_time = performance.now();
    } else if (parameters.rt_method === "audio") {
      start_time = parameters.audio_context_start_time;
    }

    var case_sensitive =
      typeof this.areResponsesCaseSensitive === "undefined"
        ? false
        : this.areResponsesCaseSensitive;

    var listener_id;

    const listener_function = (e) => {
      var key_time;
      if (parameters.rt_method == "performance") {
        key_time = performance.now();
      } else if (parameters.rt_method === "audio") {
        key_time = parameters.audio_context.currentTime;
      }
      var rt = key_time - start_time;

      // overiding via parameters for testing purposes.
      // TODO (bjoluc): Why exactly?
      var minimum_valid_rt = parameters.minimum_valid_rt || this.minimumValidRt;

      var rt_ms = rt;
      if (parameters.rt_method == "audio") {
        rt_ms = rt_ms * 1000;
      }
      if (rt_ms < minimum_valid_rt) {
        return;
      }

      var valid_response = false;
      if (typeof parameters.valid_responses === "undefined") {
        valid_response = true;
      } else if (parameters.valid_responses == this.ALL_KEYS) {
        valid_response = true;
      } else if (parameters.valid_responses != this.NO_KEYS) {
        if (parameters.valid_responses.includes(e.key)) {
          valid_response = true;
        }
        if (!case_sensitive) {
          var valid_lower = parameters.valid_responses.map(function (v) {
            return v.toLowerCase();
          });
          var key_lower = e.key.toLowerCase();
          if (valid_lower.includes(key_lower)) {
            valid_response = true;
          }
        }
      }

      // check if key was already held down
      if (
        (typeof parameters.allow_held_key === "undefined" || !parameters.allow_held_key) &&
        valid_response
      ) {
        if (typeof this.held_keys[e.key] !== "undefined" && this.held_keys[e.key] == true) {
          valid_response = false;
        }
        if (
          !case_sensitive &&
          typeof this.held_keys[e.key.toLowerCase()] !== "undefined" &&
          this.held_keys[e.key.toLowerCase()] == true
        ) {
          valid_response = false;
        }
      }

      if (valid_response) {
        // if this is a valid response, then we don't want the key event to trigger other actions
        // like scrolling via the spacebar.
        e.preventDefault();
        var key = e.key;
        if (!case_sensitive) {
          key = key.toLowerCase();
        }
        parameters.callback_function({
          key: key,
          rt: rt_ms,
        });

        if (this.keyboard_listeners.includes(listener_id)) {
          if (!parameters.persist) {
            // remove keyboard listener
            this.cancelKeyboardResponse(listener_id);
          }
        }
      }
    };

    // create listener id object
    listener_id = {
      type: "keydown",
      fn: listener_function,
    };

    // add this keyboard listener to the list of listeners
    this.keyboard_listeners.push(listener_id);

    return listener_id;
  }

  cancelKeyboardResponse(listener) {
    // remove the listener from the list of listeners
    if (this.keyboard_listeners.includes(listener)) {
      this.keyboard_listeners.splice(this.keyboard_listeners.indexOf(listener), 1);
    }
  }

  cancelAllKeyboardResponses() {
    this.keyboard_listeners = [];
  }

  convertKeyCharacterToKeyCode(character) {
    console.warn(
      "Warning: The jsPsych.pluginAPI.convertKeyCharacterToKeyCode function will be removed in future jsPsych releases. " +
        "We recommend removing this function and using strings to identify/compare keys."
    );
    var code;
    character = character.toLowerCase();
    if (typeof KeyboardListenerAPI.keylookup[character] !== "undefined") {
      code = KeyboardListenerAPI.keylookup[character];
    }
    return code;
  }

  convertKeyCodeToKeyCharacter(code) {
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

  compareKeys(key1, key2) {
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
      var case_sensitive =
        typeof this.areResponsesCaseSensitive === "undefined"
          ? false
          : this.areResponsesCaseSensitive;
      if (case_sensitive) {
        return key1 == key2;
      } else {
        return key1.toLowerCase() == key2.toLowerCase();
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
