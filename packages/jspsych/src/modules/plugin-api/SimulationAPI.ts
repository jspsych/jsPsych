export class SimulationAPI {
  dispatchEvent(event: Event) {
    document.body.dispatchEvent(event);
  }

  /**
   * Dispatches a `keydown` event for the specified key
   * @param key Character code (`.key` property) for the key to press.
   */
  keyDown(key: string) {
    this.dispatchEvent(new KeyboardEvent("keydown", { key }));
  }

  /**
   * Dispatches a `keyup` event for the specified key
   * @param key Character code (`.key` property) for the key to press.
   */
  keyUp(key: string) {
    this.dispatchEvent(new KeyboardEvent("keyup", { key }));
  }

  /**
   * Dispatches a `keydown` and `keyup` event in sequence to simulate pressing a key.
   * @param key Character code (`.key` property) for the key to press.
   * @param delay Length of time to wait (ms) before executing action
   */
  pressKey(key: string, delay = 0) {
    if (delay > 0) {
      setTimeout(() => {
        this.keyDown(key);
        this.keyUp(key);
      }, delay);
    } else {
      this.keyDown(key);
      this.keyUp(key);
    }
  }

  /**
   * Dispatches `mousedown`, `mouseup`, and `click` events on the target element
   * @param target The element to click
   * @param delay Length of time to wait (ms) before executing action
   */
  clickTarget(target: Element, delay = 0) {
    if (delay > 0) {
      setTimeout(() => {
        target.dispatchEvent(new MouseEvent("mousedown", { bubbles: true }));
        target.dispatchEvent(new MouseEvent("mouseup", { bubbles: true }));
        target.dispatchEvent(new MouseEvent("click", { bubbles: true }));
      }, delay);
    } else {
      target.dispatchEvent(new MouseEvent("mousedown", { bubbles: true }));
      target.dispatchEvent(new MouseEvent("mouseup", { bubbles: true }));
      target.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    }
  }

  /**
   * Sets the value of a target text input
   * @param target A text input element to fill in
   * @param text Text to input
   * @param delay Length of time to wait (ms) before executing action
   */
  fillTextInput(target: HTMLInputElement, text: string, delay = 0) {
    if (delay > 0) {
      setTimeout(() => {
        target.value = text;
      }, delay);
    } else {
      target.value = text;
    }
  }

  /**
   * Picks a valid key from `choices`, taking into account jsPsych-specific
   * identifiers like "NO_KEYS" and "ALL_KEYS".
   * @param choices Which keys are valid.
   * @returns A key selected at random from the valid keys.
   */
  getValidKey(choices: "NO_KEYS" | "ALL_KEYS" | Array<string> | Array<Array<string>>) {
    const possible_keys = [
      "a",
      "b",
      "c",
      "d",
      "e",
      "f",
      "g",
      "h",
      "i",
      "j",
      "k",
      "l",
      "m",
      "n",
      "o",
      "p",
      "q",
      "r",
      "s",
      "t",
      "u",
      "v",
      "w",
      "x",
      "y",
      "z",
      "0",
      "1",
      "2",
      "3",
      "4",
      "5",
      "6",
      "7",
      "8",
      "9",
      " ",
    ];

    let key;
    if (choices == "NO_KEYS") {
      key = null;
    } else if (choices == "ALL_KEYS") {
      key = possible_keys[Math.floor(Math.random() * possible_keys.length)];
    } else {
      const flat_choices = choices.flat();
      key = flat_choices[Math.floor(Math.random() * flat_choices.length)];
    }

    return key;
  }

  mergeSimulationData(default_data, simulation_options) {
    // override any data with data from simulation object
    return {
      ...default_data,
      ...simulation_options?.data,
    };
  }

  ensureSimulationDataConsistency(trial, data) {
    // All RTs must be rounded
    if (data.rt) {
      data.rt = Math.round(data.rt);
    }

    // If a trial_duration and rt exist, make sure that the RT is not longer than the trial.
    if (trial.trial_duration && data.rt && data.rt > trial.trial_duration) {
      data.rt = null;
      if (data.response) {
        data.response = null;
      }
      if (data.correct) {
        data.correct = false;
      }
    }

    // If trial.choices is NO_KEYS make sure that response and RT are null
    if (trial.choices && trial.choices == "NO_KEYS") {
      if (data.rt) {
        data.rt = null;
      }
      if (data.response) {
        data.response = null;
      }
    }

    // If response is not allowed before stimulus display complete, ensure RT
    // is longer than display time.
    if (trial.allow_response_before_complete) {
      if (trial.sequence_reps && trial.frame_time) {
        const min_time = trial.sequence_reps * trial.frame_time * trial.stimuli.length;
        if (data.rt < min_time) {
          data.rt = null;
          data.response = null;
        }
      }
    }
  }
}
