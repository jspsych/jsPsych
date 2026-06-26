import { JsPsychPlugin, ParameterType, JsPsych, TrialType } from 'jspsych';

declare const info: {
    readonly name: "multiplayer-sync";
    readonly version: string;
    readonly parameters: {
        /**
         * Predicate evaluated against the full group session on every update. The trial ends as soon
         * as it returns true. Receives the group session data (keyed by participantId). This is the
         * same condition you would pass to `jsPsych.pluginAPI.wait()`.
         */
        readonly wait_for: {
            readonly type: ParameterType.FUNCTION;
            readonly default: any;
        };
        /**
         * Data to push into the shared group session when the trial starts, before waiting. Leave
         * null to wait without pushing. As with any jsPsych parameter, you may supply a function that
         * returns the object — useful for reading state set by earlier trials, e.g. `() => ({ offer })`.
         */
        readonly push_data: {
            readonly type: ParameterType.OBJECT;
            readonly default: any;
        };
        /** HTML shown while waiting for the condition to be met. */
        readonly message: {
            readonly type: ParameterType.HTML_STRING;
            readonly default: "<p>Waiting for other players…</p>";
        };
        /**
         * Maximum time to wait, in milliseconds, before giving up. When the timeout elapses the trial
         * ends with `timed_out: true` and `on_timeout` is called. Null waits indefinitely.
         */
        readonly timeout: {
            readonly type: ParameterType.INT;
            readonly default: any;
        };
        /** Called if `timeout` elapses before `wait_for` is satisfied. */
        readonly on_timeout: {
            readonly type: ParameterType.FUNCTION;
            readonly default: any;
        };
        /**
         * Minimum time, in milliseconds, to keep the waiting message on screen. Prevents the screen
         * from flashing by when the condition is already satisfied. Does not extend a wait that takes
         * longer than this on its own.
         */
        readonly minimum_wait: {
            readonly type: ParameterType.INT;
            readonly default: 0;
        };
    };
    readonly data: {
        /** The full group session snapshot at the moment the condition was met (or the timeout fired). */
        readonly group: {
            readonly type: ParameterType.OBJECT;
            readonly default: any;
        };
        /** Time spent waiting, in milliseconds, from trial start until the trial ended. */
        readonly wait_time: {
            readonly type: ParameterType.INT;
            readonly default: any;
        };
        /** True if the trial ended because `timeout` elapsed rather than because `wait_for` was met. */
        readonly timed_out: {
            readonly type: ParameterType.BOOL;
            readonly default: false;
        };
    };
    readonly citations: "__CITATIONS__";
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
declare class MultiplayerSyncPlugin implements JsPsychPlugin<Info> {
    private jsPsych;
    static info: {
        readonly name: "multiplayer-sync";
        readonly version: string;
        readonly parameters: {
            /**
             * Predicate evaluated against the full group session on every update. The trial ends as soon
             * as it returns true. Receives the group session data (keyed by participantId). This is the
             * same condition you would pass to `jsPsych.pluginAPI.wait()`.
             */
            readonly wait_for: {
                readonly type: ParameterType.FUNCTION;
                readonly default: any;
            };
            /**
             * Data to push into the shared group session when the trial starts, before waiting. Leave
             * null to wait without pushing. As with any jsPsych parameter, you may supply a function that
             * returns the object — useful for reading state set by earlier trials, e.g. `() => ({ offer })`.
             */
            readonly push_data: {
                readonly type: ParameterType.OBJECT;
                readonly default: any;
            };
            /** HTML shown while waiting for the condition to be met. */
            readonly message: {
                readonly type: ParameterType.HTML_STRING;
                readonly default: "<p>Waiting for other players…</p>";
            };
            /**
             * Maximum time to wait, in milliseconds, before giving up. When the timeout elapses the trial
             * ends with `timed_out: true` and `on_timeout` is called. Null waits indefinitely.
             */
            readonly timeout: {
                readonly type: ParameterType.INT;
                readonly default: any;
            };
            /** Called if `timeout` elapses before `wait_for` is satisfied. */
            readonly on_timeout: {
                readonly type: ParameterType.FUNCTION;
                readonly default: any;
            };
            /**
             * Minimum time, in milliseconds, to keep the waiting message on screen. Prevents the screen
             * from flashing by when the condition is already satisfied. Does not extend a wait that takes
             * longer than this on its own.
             */
            readonly minimum_wait: {
                readonly type: ParameterType.INT;
                readonly default: 0;
            };
        };
        readonly data: {
            /** The full group session snapshot at the moment the condition was met (or the timeout fired). */
            readonly group: {
                readonly type: ParameterType.OBJECT;
                readonly default: any;
            };
            /** Time spent waiting, in milliseconds, from trial start until the trial ended. */
            readonly wait_time: {
                readonly type: ParameterType.INT;
                readonly default: any;
            };
            /** True if the trial ended because `timeout` elapsed rather than because `wait_for` was met. */
            readonly timed_out: {
                readonly type: ParameterType.BOOL;
                readonly default: false;
            };
        };
        readonly citations: "__CITATIONS__";
    };
    constructor(jsPsych: JsPsych);
    trial(display_element: HTMLElement, trial: TrialType<Info>): Promise<void>;
}

export { MultiplayerSyncPlugin as default };
