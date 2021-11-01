export class SimulationAPI {
  dispatchEvent(event: Event) {
    document.body.dispatchEvent(event);
  }

  keyDown(key: string) {
    this.dispatchEvent(new KeyboardEvent("keydown", { key }));
  }

  keyUp(key: string) {
    this.dispatchEvent(new KeyboardEvent("keyup", { key }));
  }

  pressKey(key: string) {
    this.keyDown(key);
    this.keyUp(key);
  }

  clickTarget(target: Element) {
    target.dispatchEvent(new MouseEvent("click", { bubbles: true }));
  }

  getValidKey(choices: "NO_KEYS" | "ALL_KEYS" | Array<string>) {
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
      key = choices[Math.floor(Math.random() * choices.length)];
    }

    return key;
  }

  mergeSimulationData(default_data, simulation_options) {
    // override any data with data from simulation object
    let data;
    if (simulation_options && simulation_options.data) {
      data = {
        ...default_data,
        ...simulation_options.data,
      };
    } else {
      data = default_data;
    }
    return data;
  }

  checkSimulationDataConsistency(trial, data) {
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
  }
}
