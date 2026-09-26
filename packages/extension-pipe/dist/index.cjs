'use strict';

var datapipeClient = require('datapipe-client');

var version = "0.2.0";

const DEFAULT_WAIT_MESSAGE = "<p>Saving data. Please do not close this page.</p>";
const DEFAULT_DONE_MESSAGE = "<p>Done. You may close this page.</p>";
class PipeExtension {
  constructor(jsPsych) {
    this.jsPsych = jsPsych;
    this.session = null;
    this.filename = "";
    /** Set once the session has been closed, so it is never closed twice. */
    this.closed = false;
    /** Set once the global callbacks are wrapped, so they are never wrapped twice. */
    this.installed = false;
    /**
     * The wait message as the display element reports it back, which is not
     * always the string that was assigned: the browser normalizes the markup.
     */
    this.shownWaitMessage = null;
    this.initialize = async (params) => {
      if (this.installed) return;
      this.params = params;
      if (params?.enabled === false) return;
      if (!params?.experiment_id) {
        console.warn(
          "extension-pipe: no experiment_id was given, so no data will be sent to DataPipe."
        );
        return;
      }
      if (params.base_url) {
        datapipeClient.setBaseURL(params.base_url);
      }
      this.installHooks();
      try {
        this.filename = this.resolveFilename();
      } catch (error) {
        console.warn(
          "extension-pipe: the filename function threw when the experiment started. It will be called again when the experiment ends.",
          error
        );
      }
      if (params.stream !== false) {
        this.session = datapipeClient.createSession({
          experimentID: params.experiment_id,
          filename: this.filename || void 0
        });
      }
    };
    // Nothing per-trial. See the note at the top of this file: these callbacks
    // fire only for trials that name the extension in their own `extensions`
    // parameter, which is not something this extension asks researchers to do.
    this.on_start = () => {
    };
    this.on_load = () => {
    };
    this.on_finish = () => ({});
  }
  static {
    this.info = {
      name: "pipe",
      version,
      // The extension contributes nothing to any trial's data. It reads the data
      // and sends it; it does not add to it.
      data: {}
    };
  }
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
  static async getCondition(experiment_id, options = {}) {
    return datapipeClient.getCondition({ experimentID: experiment_id, baseURL: options.base_url });
  }
  /**
   * Save a base64-encoded file: audio, video, or an image.
   *
   * Static and callable from a trial's `on_finish`, which jsPsych awaits, so
   * the timeline waits for the upload if you return the promise.
   *
   * Unlike `getCondition`, this does not throw -- check `result.ok`.
   */
  static async saveBase64Data(experiment_id, filename, data, options = {}) {
    return datapipeClient.saveBase64Data({
      experimentID: experiment_id,
      filename,
      data,
      baseURL: options.base_url
    });
  }
  installHooks() {
    this.installed = true;
    const settings = this.jsPsych.getInitSettings();
    const downstreamDataUpdate = settings.on_data_update;
    settings.on_data_update = (data) => {
      try {
        this.session?.record(data);
      } catch (error) {
        console.warn("extension-pipe: a trial could not be staged", error);
      }
      return downstreamDataUpdate?.(data);
    };
    const downstreamFinish = settings.on_finish;
    settings.on_finish = async (data) => {
      await this.finish();
      const result = await downstreamFinish?.(data);
      this.showDoneMessage();
      return result;
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
  async finish() {
    const display = this.jsPsych.getDisplayElement();
    if (display) {
      display.innerHTML = this.params.wait_message ?? DEFAULT_WAIT_MESSAGE;
      this.shownWaitMessage = display.innerHTML;
    }
    await this.session?.flush().catch(() => void 0);
    if (!this.filename) {
      this.filename = this.finalFilename();
    }
    let result;
    try {
      result = await datapipeClient.saveData({
        experimentID: this.params.experiment_id,
        filename: this.filename,
        data: this.dataString(),
        // Tells DataPipe this submission completes a staged session, so the
        // staged copy can be discarded rather than recovered as a partial.
        sessionId: this.session?.sessionId || void 0
      });
    } catch (error) {
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
   * Replace the wait message, which would otherwise tell the participant not to
   * close the page forever.
   *
   * Left alone if anything else has taken over the display since, which is how
   * the researcher's `on_finish` and `abortExperiment()` keep the last word.
   * (The end message from `abortExperiment()` is written by `jsPsych.run()`
   * after this runs, so it wins regardless.)
   */
  showDoneMessage() {
    const display = this.jsPsych.getDisplayElement();
    if (display && display.innerHTML === this.shownWaitMessage) {
      display.innerHTML = this.params.done_message ?? DEFAULT_DONE_MESSAGE;
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
  async closeSession(submitted) {
    if (!this.session || this.closed) return;
    this.closed = true;
    try {
      await this.session.close({ submitted });
    } catch (error) {
      console.warn("extension-pipe: could not close the staging session", error);
    }
  }
  resolveFilename() {
    const { filename } = this.params;
    return typeof filename === "function" ? filename() : filename;
  }
  /**
   * The filename to submit under when none could be resolved at the start.
   *
   * Never throws. If the filename function fails a second time, the data goes
   * out under a random name rather than not at all: a file the researcher has
   * to rename is recoverable, and data that was never sent is not.
   */
  finalFilename() {
    try {
      const filename = this.resolveFilename();
      if (filename) return filename;
    } catch (error) {
      console.error("extension-pipe: the filename function threw", error);
    }
    const extension = this.params.format === "json" ? "json" : "csv";
    const fallback = `${this.jsPsych.randomization.randomID(10)}.${extension}`;
    console.error(`extension-pipe: no filename could be determined, so saving as "${fallback}".`);
    return fallback;
  }
  dataString() {
    if (this.params.data_string) return this.params.data_string();
    return this.params.format === "json" ? this.jsPsych.data.get().json() : this.jsPsych.data.get().csv();
  }
}

module.exports = PipeExtension;
//# sourceMappingURL=index.cjs.map
