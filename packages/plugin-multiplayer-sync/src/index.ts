import { JsPsych, JsPsychPlugin, ParameterType, TrialType } from "jspsych";

import { version } from "../package.json";

const info = <const>{
  name: "multiplayer-sync",
  version: version,
  parameters: {
    /**
     * Predicate evaluated against the full group session on every update. The trial ends as soon
     * as it returns true. Receives the group session data (keyed by participantId). This is the
     * same condition you would pass to `jsPsych.pluginAPI.wait()`.
     */
    wait_for: {
      type: ParameterType.FUNCTION,
      default: undefined,
    },
    /**
     * Data to push into the shared group session when the trial starts, before waiting. Leave
     * null to wait without pushing. As with any jsPsych parameter, you may supply a function that
     * returns the object — useful for reading state set by earlier trials, e.g. `() => ({ offer })`.
     */
    push_data: {
      type: ParameterType.OBJECT,
      default: null,
    },
    /** HTML shown while waiting for the condition to be met. */
    message: {
      type: ParameterType.HTML_STRING,
      default: "<p>Waiting for other players…</p>",
    },
    /**
     * Maximum time to wait, in milliseconds, before giving up. When the timeout elapses the trial
     * ends with `timed_out: true` and `on_timeout` is called. Null waits indefinitely.
     */
    timeout: {
      type: ParameterType.INT,
      default: null,
    },
    /** Called if `timeout` elapses before `wait_for` is satisfied. */
    on_timeout: {
      type: ParameterType.FUNCTION,
      default: null,
    },
    /**
     * Minimum time, in milliseconds, to keep the waiting message on screen. Prevents the screen
     * from flashing by when the condition is already satisfied. Does not extend a wait that takes
     * longer than this on its own.
     */
    minimum_wait: {
      type: ParameterType.INT,
      default: 0,
    },
  },
  data: {
    /** The full group session snapshot at the moment the condition was met (or the timeout fired). */
    group: {
      type: ParameterType.OBJECT,
      default: undefined,
    },
    /** Time spent waiting, in milliseconds, from trial start until the trial ended. */
    wait_time: {
      type: ParameterType.INT,
      default: undefined,
    },
    /** True if the trial ended because `timeout` elapsed rather than because `wait_for` was met. */
    timed_out: {
      type: ParameterType.BOOL,
      default: false,
    },
  },
  // prettier-ignore
  citations: '__CITATIONS__',
};

type Info = typeof info;

/**
 * **multiplayer-sync**
 *
 * A synchronization barrier for multiplayer experiments. Optionally pushes this participant's data
 * into the shared group session, displays a waiting message, and ends the trial once a condition
 * over the group session is met (or an optional timeout elapses). It packages the common
 * push → wait pattern as a single declarative trial so experiments don't have to shoehorn waiting
 * into `call-function` or a `NO_KEYS` keyboard-response trial.
 *
 * Requires a connected multiplayer adapter — call `await jsPsych.pluginAPI.connect(adapter)` before
 * `jsPsych.run()`. The resolved group session is stored in the trial's `group` data so peer reads
 * and role assignment can happen in a normal `on_finish`.
 *
 * @author jsPsych multiplayer
 * @see {@link https://www.jspsych.org/latest/plugins/multiplayer-sync/ multiplayer-sync plugin documentation on jspsych.org}
 */
class MultiplayerSyncPlugin implements JsPsychPlugin<Info> {
  static info = info;

  constructor(private jsPsych: JsPsych) {}

  async trial(display_element: HTMLElement, trial: TrialType<Info>) {
    const api = this.jsPsych.pluginAPI;
    display_element.innerHTML = `<div class="jspsych-multiplayer-sync">${trial.message}</div>`;

    const start = performance.now();

    const finish = (group: Record<string, unknown>, timed_out: boolean) => {
      this.jsPsych.finishTrial({
        group,
        wait_time: Math.round(performance.now() - start),
        timed_out,
      });
    };

    if (trial.push_data != null) {
      // Pushing is not part of the wait/timeout contract below — let a push failure
      // (e.g. the adapter exhausting its retries) propagate as a real trial error
      // instead of being recorded as a timeout.
      await api.push(trial.push_data as Record<string, unknown>);
    }

    try {
      const group = await api.wait(
        trial.wait_for as (data: Record<string, Record<string, unknown>>) => boolean,
        trial.timeout ?? undefined
      );

      const elapsed = performance.now() - start;
      if (elapsed < trial.minimum_wait) {
        await new Promise((resolve) => setTimeout(resolve, trial.minimum_wait - elapsed));
      }

      finish(group, false);
    } catch (e) {
      // The only rejection api.wait() produces is a timeout; surface it rather than a raw
      // network error and let the experimenter react via on_timeout.
      if (typeof trial.on_timeout === "function") {
        trial.on_timeout(e);
      }
      finish(api.getAll(), true);
    }
  }
}

export default MultiplayerSyncPlugin;
