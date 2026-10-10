import { SaveResult } from 'datapipe-client';
import { JsPsychExtension, JsPsychExtensionInfo, JsPsych } from 'jspsych';

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
    /**
     * HTML shown to the participant while the final upload is in progress.
     * Change it to translate or reword it.
     * @default "<p>Saving data. Please do not close this page.</p>"
     */
    wait_message?: string;
    /**
     * HTML shown to the participant once the upload has finished, whether or not
     * it succeeded. Change it to translate or reword it.
     *
     * It is shown after your own `on_finish` has run, and only if the wait
     * message is still on screen, so anything your `on_finish` puts on the page
     * -- or the message passed to `abortExperiment()` -- is left in place.
     * @default "<p>Done. You may close this page.</p>"
     */
    done_message?: string;
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
/**
 * https://www.jspsych.org/latest/extensions/pipe
 */
declare class PipeExtension implements JsPsychExtension {
    private jsPsych;
    static info: JsPsychExtensionInfo;
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
    static getCondition(experiment_id: string, options?: {
        base_url?: string;
    }): Promise<number>;
    /**
     * Save a base64-encoded file: audio, video, or an image.
     *
     * Static and callable from a trial's `on_finish`, which jsPsych awaits, so
     * the timeline waits for the upload if you return the promise.
     *
     * Unlike `getCondition`, this does not throw -- check `result.ok`.
     */
    static saveBase64Data(experiment_id: string, filename: string, data: string, options?: {
        base_url?: string;
    }): Promise<SaveResult>;
    constructor(jsPsych: JsPsych);
    private params;
    private session;
    private filename;
    /** Set once the session has been closed, so it is never closed twice. */
    private closed;
    /** Set once the global callbacks are wrapped, so they are never wrapped twice. */
    private installed;
    /**
     * The wait message as the display element reports it back, which is not
     * always the string that was assigned: the browser normalizes the markup.
     */
    private shownWaitMessage;
    initialize: (params: InitializeParameters) => Promise<void>;
    on_start: () => void;
    on_load: () => void;
    on_finish: () => Record<string, any>;
    private installHooks;
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
    private finish;
    /**
     * Replace the wait message, which would otherwise tell the participant not to
     * close the page forever.
     *
     * Left alone if anything else has taken over the display since, which is how
     * the researcher's `on_finish` and `abortExperiment()` keep the last word.
     * (The end message from `abortExperiment()` is written by `jsPsych.run()`
     * after this runs, so it wins regardless.)
     */
    private showDoneMessage;
    /**
     * Close the session, telling it whether the data arrived.
     *
     * On success the queued abandonment stamp is cancelled, so a completed
     * session is never also reported as abandoned when the tab finally closes.
     * On failure it is written immediately, which gets the staged trials
     * recovered on DataPipe's normal sweep rather than by the 24-hour expiry --
     * a failed submission is exactly the case staging exists for.
     */
    private closeSession;
    private resolveFilename;
    /**
     * The filename to submit under when none could be resolved at the start.
     *
     * Never throws. If the filename function fails a second time, the data goes
     * out under a random name rather than not at all: a file the researcher has
     * to rename is recoverable, and data that was never sent is not.
     */
    private finalFilename;
    private dataString;
}

export { PipeExtension as default };
