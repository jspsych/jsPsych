'use strict';

var jspsych = require('jspsych');

var version = "0.0.1";

const info = {
  name: "multiplayer-sync",
  version,
  parameters: {
    /**
     * Predicate evaluated against the full group session on every update. The trial ends as soon
     * as it returns true. Receives the group session data (keyed by participantId). This is the
     * same condition you would pass to `jsPsych.pluginAPI.wait()`.
     */
    wait_for: {
      type: jspsych.ParameterType.FUNCTION,
      default: void 0
    },
    /**
     * Data to push into the shared group session when the trial starts, before waiting. Leave
     * null to wait without pushing. As with any jsPsych parameter, you may supply a function that
     * returns the object — useful for reading state set by earlier trials, e.g. `() => ({ offer })`.
     */
    push_data: {
      type: jspsych.ParameterType.OBJECT,
      default: null
    },
    /** HTML shown while waiting for the condition to be met. */
    message: {
      type: jspsych.ParameterType.HTML_STRING,
      default: "<p>Waiting for other players\u2026</p>"
    },
    /**
     * Maximum time to wait, in milliseconds, before giving up. When the timeout elapses the trial
     * ends with `timed_out: true` and `on_timeout` is called. Null waits indefinitely.
     */
    timeout: {
      type: jspsych.ParameterType.INT,
      default: null
    },
    /** Called if `timeout` elapses before `wait_for` is satisfied. */
    on_timeout: {
      type: jspsych.ParameterType.FUNCTION,
      default: null
    },
    /**
     * Minimum time, in milliseconds, to keep the waiting message on screen. Prevents the screen
     * from flashing by when the condition is already satisfied. Does not extend a wait that takes
     * longer than this on its own.
     */
    minimum_wait: {
      type: jspsych.ParameterType.INT,
      default: 0
    }
  },
  data: {
    /** The full group session snapshot at the moment the condition was met (or the timeout fired). */
    group: {
      type: jspsych.ParameterType.OBJECT,
      default: void 0
    },
    /** Time spent waiting, in milliseconds, from trial start until the trial ended. */
    wait_time: {
      type: jspsych.ParameterType.INT,
      default: void 0
    },
    /** True if the trial ended because `timeout` elapsed rather than because `wait_for` was met. */
    timed_out: {
      type: jspsych.ParameterType.BOOL,
      default: false
    }
  },
  // prettier-ignore
  citations: {
    "apa": "de Leeuw, J. R., Gilbert, R. A., & Luchterhandt, B. (2023). jsPsych: Enabling an Open-Source Collaborative Ecosystem of Behavioral Experiments. Journal of Open Source Software, 8(85), 5351. https://doi.org/10.21105/joss.05351 ",
    "bibtex": '@article{Leeuw2023jsPsych, 	author = {de Leeuw, Joshua R. and Gilbert, Rebecca A. and Luchterhandt, Bj{\\" o}rn}, 	journal = {Journal of Open Source Software}, 	doi = {10.21105/joss.05351}, 	issn = {2475-9066}, 	number = {85}, 	year = {2023}, 	month = {may 11}, 	pages = {5351}, 	publisher = {Open Journals}, 	title = {jsPsych: Enabling an {Open}-{Source} {Collaborative} {Ecosystem} of {Behavioral} {Experiments}}, 	url = {https://joss.theoj.org/papers/10.21105/joss.05351}, 	volume = {8}, }  '
  }
};
class MultiplayerSyncPlugin {
  constructor(jsPsych) {
    this.jsPsych = jsPsych;
  }
  static {
    this.info = info;
  }
  async trial(display_element, trial) {
    const api = this.jsPsych.pluginAPI;
    display_element.innerHTML = `<div class="jspsych-multiplayer-sync">${trial.message}</div>`;
    const start = performance.now();
    const finish = (group, timed_out) => {
      this.jsPsych.finishTrial({
        group,
        wait_time: Math.round(performance.now() - start),
        timed_out
      });
    };
    try {
      if (trial.push_data != null) {
        await api.push(trial.push_data);
      }
      const group = await api.wait(
        trial.wait_for,
        trial.timeout ?? void 0
      );
      const elapsed = performance.now() - start;
      if (elapsed < trial.minimum_wait) {
        await new Promise((resolve) => setTimeout(resolve, trial.minimum_wait - elapsed));
      }
      finish(group, false);
    } catch (e) {
      if (typeof trial.on_timeout === "function") {
        trial.on_timeout(e);
      }
      finish(api.getAll(), true);
    }
  }
}

module.exports = MultiplayerSyncPlugin;
//# sourceMappingURL=index.cjs.map
