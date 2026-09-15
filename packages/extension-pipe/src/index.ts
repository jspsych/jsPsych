import { createSession, getCondition, saveBase64Data, saveData, setBaseURL } from "datapipe-client";
import type { DataPipeSession, SaveResult } from "datapipe-client";
import { JsPsych, JsPsychExtension, JsPsychExtensionInfo } from "jspsych";

import { version } from "../package.json";

// Send an experiment's data to DataPipe without writing any DataPipe code.
//
// Registering this extension is the whole integration: it stages each trial as
// it finishes, so a participant who closes the tab at trial 199 of 200 does not
// take all 199 with them, and it submits the complete dataset when the
// experiment ends. There is no save trial, no `await`, and no session variable
// for the researcher to thread through their timeline.
//
// HOW IT HOOKS IN, AND WHY NOT THE OBVIOUS WAY. An extension's per-trial
// callbacks (`on_start`/`on_load`/`on_finish`) fire only for trials whose
// *timeline* `extensions` parameter lists the extension -- which is a different
// thing from the `extensions` array passed to `initJsPsych`, and which a nested
// timeline can shadow without merging. An extension that relied on them would
// therefore miss trials, silently, whenever a researcher set `extensions` on an
// inner trial for something else. And `on_finish` runs before jsPsych merges
// every extension's returned data, so it cannot see a complete trial record
// anyway.
//
// So this extension takes the two global callbacks instead, through the public
// `getInitSettings()`. `on_data_update` fires for every trial after its data is
// final, and `on_finish` is awaited by `jsPsych.run()`, which is what lets the
// final upload block the end of the experiment. Both are wrapped, never
// replaced: whatever the researcher passed still runs.
//
// FAILURE IS NON-FATAL. Every path here is written so that a participant whose
// staging fails still runs the experiment to the end and still submits at the
// end. Streaming is a safety net, and a net that can break the thing it is
// protecting is worse than no net.

interface InitializeParameters {
  /** The 12-character experiment ID from your DataPipe dashboard. */
  experiment_id: string;
  /**
   * The name of the file to save, e.g. `"subject-01.csv"`. Every file in an
   * experiment must have a unique name.
   *
   * May be a function, and usually needs to be: the participant ID normally
   * comes from `jsPsych.randomization`, which does not exist yet at the point
   * where `initJsPsych` is called. A function is evaluated when the experiment
   * starts, by which time it does.
   */
  filename: string | (() => string);
  /**
   * The format to submit the data in. Ignored when `data_string` is given.
   * @default "csv"
   */
  format?: "csv" | "json";
  /**
   * Returns the data to submit. Use this instead of `format` to filter or
   * transform the data first, e.g. `() => jsPsych.data.get().filter({save: true}).csv()`.
   */
  data_string?: () => string;
  /**
   * Whether to stage each trial as it finishes, so that an abandoned session
   * can be recovered. Set to `false` to submit only at the end, which avoids
   * opening a connection to DataPipe's staging database.
   * @default true
   */
  stream?: boolean;
  /**
   * Set to `false` to turn the extension off entirely: no session, no staging,
   * and no submission. Nothing else in your experiment changes.
   *
   * THIS IS WHAT YOU NEED FOR `jsPsych.simulate()`. A simulated run reaches
   * this extension exactly like a real one -- `simulate()` calls `run()`
   * internally, so extensions initialize the same way -- and jsPsych keeps its
   * simulation mode private, with no public accessor, so there is no way for
   * the extension to notice on its own. Left on, simulating an experiment
   * consumes one of its sessions and writes a real file of fake data into the
   * researcher's dataset.
   *
   * ```js
   * const SIMULATE = new URLSearchParams(location.search).has("simulate");
   * // ...
   * params: { experiment_id: "...", filename: ..., enabled: !SIMULATE }
   * ```
   *
   * @default true
   */
  enabled?: boolean;
  /** HTML shown to the participant while the final upload is in progress. */
  wait_message?: string;
  /**
   * Called with the result of the final upload. The result cannot be recorded
   * in the data, because the data has already been sent by the time it is
   * known, so this is how an experiment reacts to a failed save.
   */
  on_save?: (result: SaveResult) => void;
  /**
   * Point the experiment at a different DataPipe deployment. Only useful for
   * testing against a staging server.
   */
  base_url?: string;
}

const DEFAULT_WAIT_MESSAGE = "<p>Saving data. Please do not close this page.</p>";

/**
 * https://www.jspsych.org/latest/extensions/pipe
 */
class PipeExtension implements JsPsychExtension {
  static info: JsPsychExtensionInfo = {
    name: "pipe",
    version: version,
    // The extension contributes nothing to any trial's data. It reads the data
    // and sends it; it does not add to it.
    data: {},
  };

  /**
   * Request this participant's condition assignment.
   *
   * Static, because a condition usually decides which timeline to build, and
   * so has to be known before `initJsPsych()` is called -- long before this
   * extension is initialized. It is here rather than in a separate package
   * only so that an experiment needs one script tag instead of two.
   *
   * THROWS if the condition cannot be obtained. There is no safe value to fall
   * back to: a participant sent down the wrong branch, or an empty one, looks
   * like a successful run until someone reads the data.
   *
   * ```js
   * let condition;
   * try {
   *   condition = await jsPsychExtensionPipe.getCondition("EXPERIMENT_ID");
   * } catch (error) {
   *   document.body.innerHTML = "<p>The experiment could not be started.</p>";
   *   throw error;
   * }
   * ```
   */
  static async getCondition(
    experiment_id: string,
    options: { base_url?: string } = {}
  ): Promise<number> {
    return getCondition({ experimentID: experiment_id, baseURL: options.base_url });
  }

  /**
   * Save a base64-encoded file: audio, video, or an image.
   *
   * Static and callable from a trial's `on_finish`, which jsPsych awaits, so
   * the timeline waits for the upload if you return the promise.
   *
   * Unlike `getCondition`, this does not throw -- check `result.ok`.
   */
  static async saveBase64Data(
    experiment_id: string,
    filename: string,
    data: string,
    options: { base_url?: string } = {}
  ): Promise<SaveResult> {
    return saveBase64Data({
      experimentID: experiment_id,
      filename,
      data,
      baseURL: options.base_url,
    });
  }

  constructor(private jsPsych: JsPsych) {}

  private params: InitializeParameters;
  private session: DataPipeSession | null = null;
  private filename = "";
  /** Set once the session has been closed, so it is never closed twice. */
  private closed = false;
  /** Set once the global callbacks are wrapped, so they are never wrapped twice. */
  private installed = false;

  initialize = async (params: InitializeParameters): Promise<void> => {
    this.params = params;

    // jsPsych calls initialize() once per entry in the `extensions` array, and
    // the same instance answers each time -- so registering this extension
    // twice would wrap the global callbacks twice and submit the data twice.
    if (this.installed) return;

    if (params?.enabled === false) return;

    if (!params?.experiment_id) {
      console.warn(
        "extension-pipe: no experiment_id was given, so no data will be sent to DataPipe."
      );
      return;
    }

    if (params.base_url) {
      setBaseURL(params.base_url);
    }

    this.filename = typeof params.filename === "function" ? params.filename() : params.filename;

    // INSTALLED BEFORE ANYTHING ELSE, AND SYNCHRONOUSLY. jsPsych 8 does not
    // await the promise this method returns, so a trial can finish while the
    // rest of this function is still running. The hooks have to be in place
    // before that can happen; `createSession` is deliberately synchronous for
    // the same reason, and buffers whatever arrives before it is ready.
    this.installHooks();

    if (params.stream !== false) {
      this.session = createSession({
        experimentID: params.experiment_id,
        filename: this.filename,
      });
    }
  };

  // Nothing per-trial. See the note at the top of this file: these callbacks
  // fire only for trials that name the extension in their own `extensions`
  // parameter, which is not something this extension asks researchers to do.
  on_start = (): void => {};
  on_load = (): void => {};
  on_finish = (): Record<string, any> => ({});

  private installHooks(): void {
    this.installed = true;
    const settings = this.jsPsych.getInitSettings();

    const downstreamDataUpdate = settings.on_data_update;
    settings.on_data_update = (data: Record<string, any>) => {
      try {
        this.session?.record(data);
      } catch (error) {
        // Never let a staging failure break the researcher's own callback,
        // which is the next thing to run.
        console.warn("extension-pipe: a trial could not be staged", error);
      }
      return downstreamDataUpdate?.(data);
    };

    const downstreamFinish = settings.on_finish;
    settings.on_finish = async (data: unknown) => {
      // BEFORE the researcher's own `on_finish`, which is where a redirect to
      // Prolific or MTurk usually lives. Running after it would mean racing a
      // page navigation with the upload.
      await this.finish();
      return downstreamFinish?.(data);
    };
  }

  /**
   * Submit the complete dataset and close the session.
   *
   * Reached at the end of the timeline and also after `abortExperiment()`,
   * which unwinds the timeline and falls through to `on_finish`. That is worth
   * noting: a save *trial* is never reached on an abort, so a participant
   * failed out by an attention check used to lose everything. Here they do not.
   *
   * THE EXTENSION ALWAYS OWNS THE SUBMISSION. There is deliberately no option
   * to hand it back to a `jsPsychPipe` save trial, because that combination
   * silently duplicates data: the plugin cannot send a `sessionId` (it has no
   * session), so DataPipe has no way to tell that the submission completes the
   * staged copy, nothing discards the staging node, and the sweep's 24-hour
   * expiry backstop eventually writes those same trials out a second time as a
   * `.partial.json`. Linking the two would mean giving the plugin the session
   * back, which is the coupling splitting the client out removed.
   */
  private async finish(): Promise<void> {
    const display = this.jsPsych.getDisplayElement();
    if (display) {
      display.innerHTML = this.params.wait_message ?? DEFAULT_WAIT_MESSAGE;
    }

    // BEFORE reading sessionId, and before submitting. Two reasons, and the
    // first is not obvious: `flush()` waits for the session's start request to
    // settle, and until it has, `sessionId` is still empty. A short experiment
    // can reach the end inside that round trip, and submitting without the id
    // would leave DataPipe unable to match the file to the staged copy -- which
    // it would then recover a second time, as a spurious `.partial.json`.
    // The second is the plain one: it makes the staged copy as complete as it
    // can be if the submission below fails.
    await this.session?.flush().catch(() => undefined);

    let result: SaveResult;
    try {
      result = await saveData({
        experimentID: this.params.experiment_id,
        filename: this.filename,
        data: this.dataString(),
        // Tells DataPipe this submission completes a staged session, so the
        // staged copy can be discarded rather than recovered as a partial.
        sessionId: this.session?.sessionId || undefined,
      });
    } catch (error) {
      // saveData is not supposed to throw, but the whole point of this hook is
      // that it runs last: if it throws here, the session is never closed and
      // the staged trials are stranded until the 24-hour expiry.
      console.error("extension-pipe: the final save failed", error);
      result = { ok: false, status: 0, body: null };
    }

    await this.closeSession(result.ok);

    if (!result.ok) {
      console.error(
        `extension-pipe: DataPipe did not accept the data (HTTP ${result.status}).`,
        result.body
      );
    }
    try {
      this.params.on_save?.(result);
    } catch (error) {
      console.error("extension-pipe: the on_save callback threw", error);
    }
  }

  /**
   * Close the session, telling it whether the data arrived.
   *
   * On success the queued abandonment stamp is cancelled, so a completed
   * session is never also reported as abandoned when the tab finally closes.
   * On failure it is written immediately, which gets the staged trials
   * recovered on DataPipe's normal sweep rather than by the 24-hour expiry --
   * a failed submission is exactly the case staging exists for.
   */
  private async closeSession(submitted: boolean): Promise<void> {
    if (!this.session || this.closed) return;
    this.closed = true;
    try {
      await this.session.close({ submitted });
    } catch (error) {
      console.warn("extension-pipe: could not close the staging session", error);
    }
  }

  private dataString(): string {
    if (this.params.data_string) return this.params.data_string();
    return this.params.format === "json"
      ? this.jsPsych.data.get().json()
      : this.jsPsych.data.get().csv();
  }
}

export default PipeExtension;
