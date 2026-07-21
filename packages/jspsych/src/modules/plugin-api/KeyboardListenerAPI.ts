import autoBind from "auto-bind";

export type KeyboardListener = (e: KeyboardEvent) => void;

export type ValidResponses = string[] | "ALL_KEYS" | "NO_KEYS";

export interface GetKeyboardResponseOptions {
  callback_function: any;
  valid_responses?: ValidResponses;
  rt_method?: "performance" | "audio";
  persist?: boolean;
  audio_context?: AudioContext;
  audio_context_start_time?: number;
  allow_held_key?: boolean;
  minimum_valid_rt?: number;
  release_callback_function?: (info: { key: string; duration: number | null }) => void;
}

export class KeyboardListenerAPI {
  constructor(
    private getRootElement: () => Element | undefined,
    private areResponsesCaseSensitive: boolean = false,
    private minimumValidRt = 0
  ) {
    autoBind(this);
    this.registerRootListeners();
  }

  private listeners = new Set<KeyboardListener>();
  private heldKeys = new Set<string>();
  private keyDownTimestamps = new Map<string, number>();
  private releaseWatchers = new Map<
    string,
    (info: { key: string; duration: number | null }) => void
  >();

  private areRootListenersRegistered = false;

  /**
   * If not previously done and `this.getRootElement()` returns an element, adds the root key
   * listeners to that element.
   */
  private registerRootListeners() {
    if (!this.areRootListenersRegistered) {
      const rootElement = this.getRootElement();
      if (rootElement) {
        rootElement.addEventListener("keydown", this.rootKeydownListener);
        rootElement.addEventListener("keyup", this.rootKeyupListener);
        this.areRootListenersRegistered = true;
      }
    }
  }

  private rootKeydownListener(e: KeyboardEvent) {
    const key = this.toLowerCaseIfInsensitive(e.key);
    // Record the press timestamp only for the initial keydown, not for key-repeat events of a key
    // that is already held down.
    if (!this.heldKeys.has(key)) {
      this.keyDownTimestamps.set(key, performance.now());
    }
    // Iterate over a static copy of the listeners set because listeners might add other listeners
    // that we do not want to be included in the loop
    for (const listener of [...this.listeners]) {
      listener(e);
    }
    this.heldKeys.add(key);
  }

  private toLowerCaseIfInsensitive(string: string) {
    return this.areResponsesCaseSensitive ? string : string.toLowerCase();
  }

  private rootKeyupListener(e: KeyboardEvent) {
    const key = this.toLowerCaseIfInsensitive(e.key);

    const releaseWatcher = this.releaseWatchers.get(key);
    if (releaseWatcher) {
      const pressTimestamp = this.keyDownTimestamps.get(key);
      const duration =
        pressTimestamp === undefined ? null : Math.round(performance.now() - pressTimestamp);
      releaseWatcher({ key: e.key, duration });
      this.releaseWatchers.delete(key);
    }

    this.keyDownTimestamps.delete(key);
    this.heldKeys.delete(key);
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

  getKeyboardResponse({
    callback_function,
    valid_responses = "ALL_KEYS",
    rt_method = "performance",
    persist,
    audio_context,
    audio_context_start_time,
    allow_held_key = false,
    minimum_valid_rt = this.minimumValidRt,
    release_callback_function,
  }: GetKeyboardResponseOptions) {
    if (rt_method !== "performance" && rt_method !== "audio") {
      console.log(
        'Invalid RT method specified in getKeyboardResponse. Defaulting to "performance" method.'
      );
      rt_method = "performance";
    }

    const usePerformanceRt = rt_method === "performance";
    const startTime = usePerformanceRt ? performance.now() : audio_context_start_time * 1000;

    this.registerRootListeners();

    if (!this.areResponsesCaseSensitive && typeof valid_responses !== "string") {
      valid_responses = valid_responses.map((r) => r.toLowerCase());
    }

    const listener: KeyboardListener = (e) => {
      const rt = Math.round(
        (rt_method == "performance" ? performance.now() : audio_context.currentTime * 1000) -
          startTime
      );
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

        if (release_callback_function) {
          // register a one-shot watcher that fires when this key is released. It is stored
          // separately from `this.listeners` so that it survives cancelKeyboardResponse and
          // cancelAllKeyboardResponses (the trial usually ends at keydown, before the keyup).
          this.releaseWatchers.set(key, release_callback_function);
        }

        callback_function({ key: e.key, rt });
      }
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

  compareKeys(key1: string | null, key2: string | null) {
    if (
      (typeof key1 !== "string" && key1 !== null) ||
      (typeof key2 !== "string" && key2 !== null)
    ) {
      console.error(
        "Error in jsPsych.pluginAPI.compareKeys: arguments must be key strings or null."
      );
      return undefined;
    }

    if (typeof key1 === "string" && typeof key2 === "string") {
      // if both values are strings, then check whether or not letter case should be converted before comparing (case_sensitive_responses in initJsPsych)
      return this.areResponsesCaseSensitive
        ? key1 === key2
        : key1.toLowerCase() === key2.toLowerCase();
    }

    return key1 === null && key2 === null;
  }
}
