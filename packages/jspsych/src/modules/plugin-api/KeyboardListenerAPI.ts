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
  wait_for_key_release?: boolean;
}

interface PendingRelease {
  /**
   * physical key (`KeyboardEvent.code`) whose release is being awaited; falls back to the
   * case-normalized key value for synthetic events that do not set `code`.
   */
  code: string;
  key: string;
  rt: number;
  callback_function: any;
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
  private pendingReleases = new Map<KeyboardListener, PendingRelease>();

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
        // When the window loses focus the browser stops delivering keyup events, so a key held at
        // that moment would otherwise never be seen as released. Treat a blur as releasing all keys.
        window.addEventListener("blur", this.rootBlurListener);
        this.areRootListenersRegistered = true;
      }
    }
  }

  private rootKeydownListener(e: KeyboardEvent) {
    const physicalKey = this.getPhysicalKey(e);
    // Record the press timestamp only for the initial keydown, not for key-repeat events of a key
    // that is already held down (the timestamp is only removed again by the key's keyup).
    if (!this.keyDownTimestamps.has(physicalKey)) {
      this.keyDownTimestamps.set(physicalKey, performance.now());
    }
    // Iterate over a static copy of the listeners set because listeners might add other listeners
    // that we do not want to be included in the loop
    for (const listener of [...this.listeners]) {
      listener(e);
    }
    this.heldKeys.add(this.toLowerCaseIfInsensitive(e.key));
  }

  private toLowerCaseIfInsensitive(string: string) {
    return this.areResponsesCaseSensitive ? string : string.toLowerCase();
  }

  /**
   * identifies physical key of a keyboard event, for matching a keydown event with
   * its corresponding keyup event, in the case of a change of shift state while
   * the key is being held.
   */
  private getPhysicalKey(e: KeyboardEvent) {
    return e.code || this.toLowerCaseIfInsensitive(e.key);
  }

  private rootKeyupListener(e: KeyboardEvent) {
    const physicalKey = this.getPhysicalKey(e);

    // match pending releases by physical key so that a change in shift state while the key is held
    // (which changes `e.key`, but not `e.code`) cannot orphan a pending release.
    for (const [listener, pending] of this.pendingReleases) {
      if (pending.code === physicalKey) {
        const pressTimestamp = this.keyDownTimestamps.get(physicalKey);
        const rt_key_duration =
          pressTimestamp === undefined ? null : Math.round(performance.now() - pressTimestamp);
        this.pendingReleases.delete(listener);
        // report the key as it was at keydown, so that the deferred and immediate paths record
        // the same response for the same key press
        pending.callback_function({ key: pending.key, rt: pending.rt, rt_key_duration });
      }
    }

    this.keyDownTimestamps.delete(physicalKey);
    this.heldKeys.delete(this.toLowerCaseIfInsensitive(e.key));
  }

  /**
   * When the window loses focus (`blur`), the browser will not deliver the `keyup` events for keys
   * that are currently held, which would otherwise leave stale entries in `heldKeys` and
   * `keyDownTimestamps` (making a key look permanently held) and orphan any pending releases. Treat
   * the blur as a release of every held key: resolve each pending release with
   * `rt_key_duration: null`, since the true hold duration cannot be measured once the release is
   * never observed, then clear the tracked key state.
   */
  private rootBlurListener() {
    for (const [listener, pending] of this.pendingReleases) {
      this.pendingReleases.delete(listener);
      pending.callback_function({ key: pending.key, rt: pending.rt, rt_key_duration: null });
    }
    this.heldKeys.clear();
    this.keyDownTimestamps.clear();
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
    wait_for_key_release = false,
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

        if (wait_for_key_release) {
          // defer the callback until this key is released, keyed by the listener handle so that
          // the pending release is cancelled together with the listener (see cancelKeyboardResponse
          // and cancelAllKeyboardResponses).
          //
          // Because the pending release is keyed by listener, each listener tracks only one pending
          // release at a time. With persist: true, if a second valid key is pressed before the first
          // is released, this overwrites the earlier pending release: the superseded press is
          // dropped and only the most recent press's release fires the callback. This is a
          // deliberate trade-off of the single-slot design — note that it differs from the
          // non-deferred persist path, which fires the callback for every valid press.
          this.pendingReleases.set(listener, {
            code: this.getPhysicalKey(e),
            key: e.key,
            rt,
            callback_function,
          });
        } else {
          callback_function({ key: e.key, rt });
        }
      }
    };

    this.listeners.add(listener);
    return listener;
  }

  cancelKeyboardResponse(listener: KeyboardListener) {
    // remove the listener from the set of listeners if it is contained
    this.listeners.delete(listener);
    // also drop any pending release so a deferred callback never fires after cancellation
    this.pendingReleases.delete(listener);
  }

  cancelAllKeyboardResponses() {
    this.listeners.clear();
    this.pendingReleases.clear();
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
