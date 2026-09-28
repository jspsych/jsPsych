import { SetRequired, Class } from 'type-fest';

/**
 * Parameter types for plugins
 */
declare enum ParameterType {
    BOOL = 0,
    STRING = 1,
    INT = 2,
    FLOAT = 3,
    FUNCTION = 4,
    KEY = 5,
    KEYS = 6,
    SELECT = 7,
    HTML_STRING = 8,
    IMAGE = 9,
    AUDIO = 10,
    VIDEO = 11,
    OBJECT = 12,
    COMPLEX = 13,
    TIMELINE = 14
}
type ParameterTypeMap = {
    [ParameterType.BOOL]: boolean;
    [ParameterType.STRING]: string;
    [ParameterType.INT]: number;
    [ParameterType.FLOAT]: number;
    [ParameterType.FUNCTION]: (...args: any[]) => any;
    [ParameterType.KEY]: string;
    [ParameterType.KEYS]: string[] | "ALL_KEYS" | "NO_KEYS";
    [ParameterType.SELECT]: any;
    [ParameterType.HTML_STRING]: string;
    [ParameterType.IMAGE]: string;
    [ParameterType.AUDIO]: string;
    [ParameterType.VIDEO]: string;
    [ParameterType.OBJECT]: object;
    [ParameterType.COMPLEX]: any;
    [ParameterType.TIMELINE]: any;
};
type PreloadParameterType = ParameterType.AUDIO | ParameterType.VIDEO | ParameterType.IMAGE;
type ParameterInfo = ({
    type: Exclude<ParameterType, ParameterType.COMPLEX | PreloadParameterType>;
} | {
    type: ParameterType.COMPLEX;
    nested?: ParameterInfos;
} | {
    type: PreloadParameterType;
    preload?: boolean;
}) & {
    array?: boolean;
    pretty_name?: string;
    default?: any;
    options?: any;
};
type ParameterInfos = Record<string, ParameterInfo>;
type InferredParameter<I extends ParameterInfo> = I["array"] extends true ? Array<ParameterTypeMap[I["type"]]> : ParameterTypeMap[I["type"]];
type RequiredParameterNames<I extends ParameterInfos> = {
    [K in keyof I]: I[K]["default"] extends undefined ? K : never;
}[keyof I];
type InferredParameters<I extends ParameterInfos> = SetRequired<{
    [Property in keyof I]?: InferredParameter<I[Property]>;
}, RequiredParameterNames<I>>;
interface PluginInfo {
    name: string;
    version?: string;
    parameters: ParameterInfos;
    data?: ParameterInfos;
    citations?: Record<string, string> | string;
}
interface JsPsychPlugin<I extends PluginInfo> {
    trial(display_element: HTMLElement, trial: TrialType<I>, on_load?: () => void): void | Promise<TrialResult | void>;
    simulate?(trial: TrialType<I>, simulation_mode: SimulationMode, simulation_options: SimulationOptions, on_load?: () => void): void | Promise<TrialResult | void>;
}
type TrialType<I extends PluginInfo> = InferredParameters<I["parameters"]> & TrialDescription;

interface JsPsychExtensionInfo {
    name: string;
    version?: string;
    data?: ParameterInfos;
    citations?: Record<string, string> | string;
}
interface JsPsychExtension {
    /**
     * Called once at the start of the experiment to initialize the extension
     */
    initialize(params?: Record<string, any>): Promise<void>;
    /**
     * Called at the start of a trial, prior to invoking the plugin's trial method.
     */
    on_start(params?: Record<string, any>): void;
    /**
     * Called during a trial, after the plugin makes initial changes to the DOM.
     */
    on_load(params?: Record<string, any>): void;
    /**
     * Called at the end of the trial.
     * @returns Data to append to the trial's data object.
     */
    on_finish(params?: Record<string, any>): Record<string, any> | Promise<Record<string, any>>;
}

type GetParameterValueOptions = {
    /**
     * If true, and the retrieved parameter value is a function, invoke the function and return its
     * return value (defaults to `true`)
     */
    evaluateFunctions?: boolean;
    /**
     * Whether to fall back to parent timeline node parameters (defaults to `true`)
     */
    recursive?: boolean;
    /**
     * Whether the timeline node should cache the parameter lookup result for successive lookups,
     * including those of nested properties or array elements (defaults to `true`)
     */
    cacheResult?: boolean;
    /**
     * A function that will be invoked with the original result of the parameter value lookup.
     * Whatever it returns will subsequently be used instead of the original result. This allows to
     * modify results before they are cached.
     */
    replaceResult?: (originalResult: any) => any;
};
declare abstract class TimelineNode {
    protected readonly dependencies: TimelineNodeDependencies;
    abstract readonly description: TimelineDescription | TrialDescription | TimelineArray;
    /**
     * The globally unique trial index of this node. It is set when the node is run. Timeline nodes
     * have the same trial index as their first trial.
     */
    index?: number;
    abstract readonly parent?: Timeline;
    abstract run(): Promise<void>;
    /**
     * Returns a flat array of all currently available results of this node
     */
    abstract getResults(): TrialResult[];
    /**
     * Recursively evaluates the given timeline variable, starting at the current timeline node.
     * Returns the result, or `undefined` if the variable is neither specified in the timeline
     * description of this node, nor in the description of any parent node.
     */
    abstract evaluateTimelineVariable(variable: TimelineVariable): any;
    /**
     * Returns the most recent (child) TimelineNode. For trial nodes, this is always the trial node
     * itself since trial nodes do not have child nodes. For timeline nodes, the return value is a
     * Trial object most of the time, but it may also be a Timeline object when a timeline hasn't yet
     * instantiated its children (e.g. during initial timeline callback functions).
     */
    abstract getLatestNode(): TimelineNode;
    /**
     * Returns an active child timeline (or itself) that matches the given name, or `undefined` if no such child exists.
     */
    abstract getActiveTimelineByName(name: string): Timeline | undefined;
    protected status: TimelineNodeStatus;
    constructor(dependencies: TimelineNodeDependencies);
    getStatus(): TimelineNodeStatus;
    private parameterValueCache;
    /**
     * Initializes the parameter value cache with `this.description`. To be called by subclass
     * constructors after setting `this.description`.
     */
    protected initializeParameterValueCache(): void;
    /**
     * Resets all cached parameter values in this timeline node and all of its parents. This is
     * necessary to re-evaluate function parameters and timeline variables at each new trial.
     */
    protected resetParameterValueCache(): void;
    /**
     * Retrieves a parameter value from the description of this timeline node, recursively falling
     * back to the description of each parent timeline node unless `recursive` is set to `false`. If
     * the parameter...
     *
     * * is a timeline variable, evaluates the variable and returns the result.
     * * is not specified, returns `undefined`.
     * * is a function and `evaluateFunctions` is not set to `false`, invokes the function and returns
     *   its return value
     * * has previously been looked up, return the cached result of the previous lookup
     *
     * @param parameterPath The path of the respective parameter in the timeline node description. If
     * the path is an array, nested object properties or array items will be looked up.
     * @param options See {@link GetParameterValueOptions}
     */
    getParameterValue(parameterPath: string | string[], options?: GetParameterValueOptions): any;
    /**
     * Retrieves and evaluates the `data` parameter. It is different from other parameters in that
     * it's properties may be functions that have to be evaluated, and parent nodes' data parameter
     * properties are merged into the result.
     */
    getDataParameter(): Record<string, any> | undefined;
}

declare class Timeline extends TimelineNode {
    readonly parent?: Timeline;
    readonly children: TimelineNode[];
    readonly description: TimelineDescription;
    constructor(dependencies: TimelineNodeDependencies, description: TimelineDescription | TimelineArray, parent?: Timeline);
    private currentChild?;
    private shouldAbort;
    run(): Promise<void>;
    private onStart;
    private onFinish;
    pause(): void;
    private resumePromise;
    resume(): void;
    /**
     * If the timeline is running or paused, aborts the timeline after the current trial has completed
     */
    abort(): void;
    private instantiateChildNode;
    private currentTimelineVariables;
    private setCurrentTimelineVariablesByIndex;
    /**
     * If the timeline has timeline variables, returns the order of `timeline_variables` array indices
     * to be used, according to the timeline's `sample` setting. If the timeline has no timeline
     * variables, returns `[null]`.
     */
    private generateTimelineVariableOrder;
    /**
     * Returns the current values of all timeline variables, including those from parent timelines
     */
    getAllTimelineVariables(): Record<string, any>;
    evaluateTimelineVariable(variable: TimelineVariable): any;
    getResults(): TrialResult[];
    /**
     * Returns the naive progress of the timeline (as a fraction), without considering conditional or
     * loop functions.
     */
    getNaiveProgress(): number;
    /**
     * Recursively computes the naive number of trials in the timeline, without considering
     * conditional or loop functions.
     */
    getNaiveTrialCount(): any;
    getLatestNode(): any;
    getActiveTimelineByName(name: string): Timeline;
}

declare class Trial extends TimelineNode {
    readonly description: TrialDescription;
    readonly parent: Timeline;
    readonly pluginClass: Class<JsPsychPlugin<any>>;
    pluginInstance: JsPsychPlugin<any>;
    trialObject?: TrialDescription;
    index?: number;
    private result;
    private readonly pluginInfo;
    constructor(dependencies: TimelineNodeDependencies, description: TrialDescription, parent: Timeline);
    run(): Promise<void>;
    private executeTrial;
    private invokeTrialMethod;
    /**
     * Cleanup the trial by removing the display element and removing event listeners
     */
    private cleanupTrial;
    /**
     * Add the CSS classes from the `css_classes` parameter to the display element
     */
    private addCssClasses;
    /**
     * Removes the provided css classes from the display element
     */
    private removeCssClasses;
    private processResult;
    /**
     * Runs a callback function retrieved from a parameter value and returns its result.
     *
     * @param parameterName The name of the parameter to retrieve the callback function from.
     * @param callbackParameters The parameters (if any) to be passed to the callback function
     */
    private runParameterCallback;
    private onStart;
    private onLoad;
    private onFinish;
    /**
     * The name of this trial's part of the multiplayer shared data: the `multiplayer_scope`
     * parameter, or else the trial's position in the timeline. Each timeline counts every child
     * it runs, across repetitions and loops, so the position is the same for every participant
     * running the same timeline, even when a conditional timeline runs for some and not others.
     */
    getMultiplayerScope(): string;
    evaluateTimelineVariable(variable: TimelineVariable): any;
    getParameterValue(parameterPath: string | string[], options?: GetParameterValueOptions): any;
    /**
     * Retrieves and evaluates the `simulation_options` parameter, considering nested properties and
     * global simulation options.
     */
    getSimulationOptions(): SimulationOptions;
    /**
     * Returns the result object of this trial or `undefined` if the result is not yet known or the
     * `record_data` trial parameter is `false`.
     */
    getResult(): TrialResult;
    getResults(): TrialResult[];
    /**
     * Checks that the parameters provided in the trial description align with the plugin's info
     * object, resolves missing parameter values from the parent timeline, resolves timeline variable
     * parameters, evaluates parameter functions if the expected parameter type is not `FUNCTION`, and
     * sets default values for optional parameters.
     */
    private processParameters;
    getLatestNode(): this;
    getActiveTimelineByName(name: string): Timeline | undefined;
}

/**
 * Maintains a promise and offers a function to resolve it. Whenever the promise is resolved, it is
 * replaced with a new one.
 */
declare class PromiseWrapper<ResolveType = void> {
    constructor();
    private promise;
    private resolvePromise;
    reset(): void;
    get(): Promise<ResolveType>;
    resolve(value: ResolveType): void;
}

declare class TimelineVariable {
    readonly name: string;
    constructor(name: string);
}
type Parameter<T> = T | (() => T) | TimelineVariable;
type TrialExtensionsConfiguration = Array<{
    type: Class<JsPsychExtension>;
    params?: Record<string, any>;
}>;
type SimulationMode = "visual" | "data-only";
type SimulationOptions = {
    data?: Record<string, any>;
    mode?: SimulationMode;
    simulate?: boolean;
};
type SimulationOptionsParameter = Parameter<{
    data?: Parameter<Record<string, Parameter<any>>>;
    mode?: Parameter<SimulationMode>;
    simulate?: Parameter<boolean>;
}>;
interface TrialDescription extends Record<string, any> {
    type: Parameter<Class<JsPsychPlugin<any>>>;
    /** https://www.jspsych.org/latest/overview/plugins/#the-post_trial_gap-iti-parameter */
    post_trial_gap?: Parameter<number>;
    /** https://www.jspsych.org/latest/overview/plugins/#the-save_trial_parameters-parameter */
    save_trial_parameters?: Parameter<Record<string, boolean>>;
    /**
     * Whether to include the values of timeline variables under a `timeline_variables` key. Can be
     * `true` to save the values of all timeline variables, or an array of timeline variable names to
     * only save specific timeline variables. Defaults to `false`.
     */
    save_timeline_variables?: Parameter<boolean | string[]>;
    /** https://www.jspsych.org/latest/overview/style/#using-the-css_classes-trial-parameter */
    css_classes?: Parameter<string | string[]>;
    /** https://www.jspsych.org/latest/overview/simulation/#controlling-simulation-mode-with-simulation_options */
    simulation_options?: SimulationOptionsParameter | string;
    /** https://www.jspsych.org/latest/overview/extensions/ */
    extensions?: Parameter<TrialExtensionsConfiguration>;
    /**
     * Whether to record the data of this trial. Defaults to `true`.
     */
    record_data?: Parameter<boolean>;
    /**
     * Names the part of the multiplayer shared data this trial reads and writes. Defaults to the
     * trial's position in the timeline, which is the same for every participant running the same
     * timeline. Trials that use the same name share data, so a trial that repeats needs a name that
     * changes with each repetition, e.g. one built from a timeline variable.
     */
    multiplayer_scope?: Parameter<string>;
    /** https://www.jspsych.org/latest/overview/events/#on_start-trial */
    on_start?: (trial: any) => void;
    /** https://www.jspsych.org/latest/overview/events/#on_load */
    on_load?: () => void;
    /** https://www.jspsych.org/latest/overview/events/#on_finish-trial */
    on_finish?: (data: any) => void;
}
/** https://www.jspsych.org/latest/overview/timeline/#sampling-methods */
type SampleOptions = {
    type: "with-replacement";
    size: number;
    weights?: number[];
} | {
    type: "without-replacement";
    size: number;
} | {
    type: "fixed-repetitions";
    size: number;
} | {
    type: "alternate-groups";
    groups: number[][];
    randomize_group_order?: boolean;
} | {
    type: "custom";
    fn: (ids: number[]) => number[];
};
type TimelineArray = Array<TimelineDescription | TrialDescription | TimelineArray>;
interface TimelineDescription extends Record<string, any> {
    timeline: TimelineArray;
    timeline_variables?: Record<string, any>[];
    name?: string;
    /** https://www.jspsych.org/latest/overview/timeline/#repeating-a-set-of-trials */
    repetitions?: number;
    /** https://www.jspsych.org/latest/overview/timeline/#looping-timelines */
    loop_function?: (data: any) => boolean;
    /** https://www.jspsych.org/latest/overview/timeline/#conditional-timelines */
    conditional_function?: () => boolean;
    /** https://www.jspsych.org/latest/overview/timeline/#random-orders-of-trials */
    randomize_order?: boolean;
    /** https://www.jspsych.org/latest/overview/timeline/#sampling-methods */
    sample?: SampleOptions;
    /** https://www.jspsych.org/latest/overview/events/#on_timeline_start */
    on_timeline_start?: () => void;
    /** https://www.jspsych.org/latest/overview/events/#on_timeline_finish */
    on_timeline_finish?: () => void;
}
declare enum TimelineNodeStatus {
    PENDING = 0,
    RUNNING = 1,
    PAUSED = 2,
    COMPLETED = 3,
    ABORTED = 4
}
/**
 * Functions and options needed by `TimelineNode`s, provided by the `JsPsych` instance. This
 * approach allows to keep the public `JsPsych` API slim and decouples the `JsPsych` and timeline
 * node classes, simplifying unit testing.
 */
interface TimelineNodeDependencies {
    /**
     * Called at the start of a trial, prior to invoking the plugin's trial method.
     */
    onTrialStart: (trial: Trial) => void;
    /**
     * Called when a trial's result data is available, before invoking `onTrialFinished()`.
     */
    onTrialResultAvailable: (trial: Trial) => void;
    /**
     * Called after a trial has finished.
     */
    onTrialFinished: (trial: Trial) => void;
    /**
     * Invoke `on_start` extension callbacks according to `extensionsConfiguration`
     */
    runOnStartExtensionCallbacks(extensionsConfiguration: TrialExtensionsConfiguration): void;
    /**
     * Invoke `on_load` extension callbacks according to `extensionsConfiguration`
     */
    runOnLoadExtensionCallbacks(extensionsConfiguration: TrialExtensionsConfiguration): void;
    /**
     * Invoke `on_finish` extension callbacks according to `extensionsConfiguration` and return a
     * joint extensions result object
     */
    runOnFinishExtensionCallbacks(extensionsConfiguration: TrialExtensionsConfiguration): Promise<Record<string, any>>;
    /**
     * Returns the simulation mode or `undefined`, if the experiment is not running in simulation
     * mode.
     */
    getSimulationMode(): SimulationMode | undefined;
    /**
     * Returns the global simulation options as passed to `jsPsych.simulate()`
     */
    getGlobalSimulationOptions(): Record<string, SimulationOptionsParameter>;
    /**
     * Given a plugin class, create a new instance of it and return it.
     */
    instantiatePlugin: <Info extends PluginInfo>(pluginClass: Class<JsPsychPlugin<Info>>) => JsPsychPlugin<Info>;
    /**
     * Return JsPsych's display element so it can be provided to plugins
     */
    getDisplayElement: () => HTMLElement;
    /**
     * Return the default inter-trial interval as provided to `initJsPsych()`
     */
    getDefaultIti: () => number;
    /**
     * A `PromiseWrapper` whose promise is resolved with result data whenever `jsPsych.finishTrial()`
     * is called.
     */
    finishTrialPromise: PromiseWrapper<TrialResult | void>;
    /**
     * Clear all of the timeouts
     */
    clearAllTimeouts: () => void;
}
type TrialResult = Record<string, any>;

declare class DataColumn {
    values: any[];
    constructor(values?: any[]);
    sum(): number;
    mean(): number;
    median(): any;
    min(): any;
    max(): any;
    count(): number;
    variance(): number;
    sd(): number;
    frequencies(): {};
    all(eval_fn: any): boolean;
    subset(eval_fn: any): DataColumn;
}

declare class DataCollection {
    private trials;
    constructor(data?: any[]);
    push(new_data: any): this;
    join(other_data_collection: DataCollection): this;
    top(): DataCollection;
    /**
     * Queries the first n elements in a collection of trials.
     *
     * @param n A positive integer of elements to return. A value of
     *          n that is less than 1 will throw an error.
     *
     * @return First n objects of a collection of trials. If fewer than
     *         n trials are available, the trials.length elements will
     *         be returned.
     *
     */
    first(n?: number): DataCollection;
    /**
     * Queries the last n elements in a collection of trials.
     *
     * @param n A positive integer of elements to return. A value of
     *          n that is less than 1 will throw an error.
     *
     * @return Last n objects of a collection of trials. If fewer than
     *         n trials are available, the trials.length elements will
     *         be returned.
     *
     */
    last(n?: number): DataCollection;
    values(): any[];
    count(): number;
    readOnly(): DataCollection;
    addToAll(properties: any): this;
    addToLast(properties: any): this;
    filter(filters: any): DataCollection;
    filterCustom(fn: any): DataCollection;
    filterColumns(columns: Array<string>): DataCollection;
    select(column: any): DataColumn;
    ignore(columns: any): DataCollection;
    uniqueNames(): any[];
    csv(): string;
    json(pretty?: boolean): string;
    localSave(format: any, filename: any): void;
}

type InteractionEvent = "blur" | "focus" | "fullscreenenter" | "fullscreenexit";
interface InteractionRecord {
    event: InteractionEvent;
    trial: number;
    time: number;
}
/**
 * Functions and options needed by the `JsPsychData` module
 */
interface JsPsychDataDependencies {
    /**
     * Returns progress information for interaction records.
     */
    getProgress: () => {
        trial: number;
        time: number;
    };
    onInteractionRecordAdded: (record: InteractionRecord) => void;
    getDisplayElement: () => HTMLElement;
}
declare class JsPsychData {
    private dependencies;
    private results;
    private resultToTrialMap;
    /** Browser interaction event data */
    private interactionRecords;
    /** Data properties for all trials */
    private dataProperties;
    private query_string;
    constructor(dependencies: JsPsychDataDependencies);
    reset(): void;
    get(): DataCollection;
    getInteractionData(): DataCollection;
    write(trial: Trial): void;
    addProperties(properties: any): void;
    addDataToLastTrial(data: any): void;
    getLastTrialData(): DataCollection;
    getLastTimelineData(): DataCollection;
    displayData(format?: string): void;
    urlVariables(): any;
    getURLVariable(whichvar: any): any;
    private addInteractionRecord;
    private interactionListeners;
    createInteractionListeners(): void;
    removeInteractionListeners(): void;
}

/** Shared data keyed by participantId, then by data key. */
type GroupSessionData = Record<string, Record<string, unknown>>;
/** Calling this removes the associated subscription. */
type Unsubscribe = () => void;
/**
 * The state of this client's own connection.
 * - `connected`: the channel is open.
 * - `reconnecting`: the channel dropped and the adapter is trying to restore it.
 * - `closed`: the channel is gone for good, either lost or closed by disconnect().
 */
type ConnectionStatus = "connected" | "reconnecting" | "closed";
/**
 * Whether a participant is still in the session.
 * - `connected`: currently connected.
 * - `away`: dropped out, and may come back within the dropout timeout.
 * - `left`: gone for good. A participant who reaches `left` stays `left`, and the group agrees
 *   on it: once one participant sees someone leave, the others who have also lost sight of them
 *   count them as left too.
 */
type PresenceStatus = "connected" | "away" | "left";
/** Presence of every participant seen in the session, keyed by participantId. */
type PresenceData = Record<string, PresenceStatus>;
/**
 * How the group's membership stands.
 * - `size`: the most participants the group can hold, or null when the backend doesn't say.
 * - `members`: the participants assigned to the group, including this one. Once the group is
 *   sealed, this is the final roster: a member who drops out stays on it, and nobody is added.
 * - `sealed`: true once nobody new can join. Before that, a member who leaves frees their place
 *   for someone new; after it, they count as a dropout. A sealed group never becomes unsealed.
 */
interface GroupState {
    size: number | null;
    members: string[];
    sealed: boolean;
}
/** What the MultiplayerAPI passes to MultiplayerAdapter.connect(). */
interface AdapterConnectOptions {
    /**
     * Aborted when the caller cancels the connection attempt or it times out. The adapter should
     * stop connecting, release anything it opened, and then reject.
     */
    signal: AbortSignal;
    /**
     * Call whenever the connection's getAll(), connectedParticipants(), or group() may have
     * changed. The API re-reads them all, so extra calls are harmless. Calls made before
     * connect() resolves are allowed and ignored; the API reads everything once it resolves.
     */
    onChange(): void;
    /**
     * Call when this client's own channel drops (`reconnecting`), recovers (`connected`), or is
     * lost for good (`closed`).
     */
    onStatus(status: ConnectionStatus): void;
    /**
     * Call when other participants may have seen this client drop out even though its channel
     * never reported `reconnecting`, e.g. after a missed heartbeat. The API then tells the group
     * that this participant is still on the same page. Recovering from `reconnecting` does this
     * already.
     */
    onResumed(): void;
}
/**
 * Contract that any multiplayer network backend must implement. An adapter holds configuration
 * only; each connect() call opens a new, independent MultiplayerConnection. Plugin authors code
 * against the MultiplayerAPI and never touch the adapter directly.
 */
interface MultiplayerAdapter {
    /**
     * Open the communication channel and establish group membership. The backend, not the client,
     * decides which group an arriving participant joins, so two participants who arrive together
     * can't both take the last place. connect() resolves once this participant has a group and the
     * connection's reads are ready.
     */
    connect(options: AdapterConnectOptions): Promise<MultiplayerConnection>;
}
/**
 * One open channel to the backend, returned by MultiplayerAdapter.connect().
 *
 * Reads are synchronous, so an adapter over an asynchronous backend keeps an in-memory mirror of
 * the backend's state and fills it before connect() resolves.
 */
interface MultiplayerConnection {
    /**
     * Identifies this participant within the group session. Keep the same ID for every connection
     * made from the same page, so a participant whose network drops can rejoin.
     */
    readonly participantId: string;
    /**
     * Identifies the group session. Every participant in the group gets the same non-empty value,
     * it stays the same across reconnects and reloads, and a different group gets a different
     * value. The API seeds shared randomness with it.
     */
    readonly sessionId: string;
    /**
     * Every participant's latest pushed data, keyed by participantId. Return `{}` when empty. The
     * API owns the format of each participant's data; store and return it unchanged.
     */
    getAll(): Record<string, unknown>;
    /** IDs of the participants whose channels are currently open, including this participant's. */
    connectedParticipants(): string[];
    /**
     * Store this participant's data, replacing what they pushed before. Resolves when the backend
     * confirms the write, and rejects if it fails; the API retries. The API sends one push at a
     * time and passes an object it owns; treat it as read-only. Whether this participant's own
     * getAll() and onChange() reflect the push before it resolves is up to the adapter.
     *
     * Adapters should let a participant write only their own data where the backend allows it.
     * The API doesn't rely on it, but it keeps one participant from changing another's.
     */
    push(data: Record<string, unknown>): Promise<void>;
    /**
     * Optional. The group's membership as the backend reports it. Omit it when the backend doesn't
     * form groups, e.g. when the researcher gives each group its own link.
     *
     * Report `sealed` only once the backend has confirmed that nobody new can join, and never go
     * back to false. Every member's connection must report the seal, not only the one that asked
     * for it, and once sealed `members` must stay the final roster, including members who drop out.
     */
    group?(): GroupState;
    /**
     * Optional. Ask the backend to stop letting new participants join this group. Resolves once the
     * backend confirms, after which group() reports `sealed`. Sealing an already sealed group
     * succeeds. Omit the method when the backend can't seal groups, rather than throwing.
     */
    sealGroup?(): Promise<void>;
    /** Close the channel cleanly. The API calls it once, and doesn't use the connection afterward. */
    disconnect(): Promise<void>;
}

interface SessionOptions {
    /**
     * How long a participant can stay disconnected before they count as having left, in
     * milliseconds. Defaults to 10000. null means never.
     */
    dropoutTimeout?: number | null;
    /**
     * How long this participant's own connection can stay `reconnecting` before the API gives up
     * and closes it, in milliseconds. Defaults to null: keep trying for as long as the adapter does.
     */
    reconnectTimeout?: number | null;
    /**
     * Seed for random(), randomInt(), shuffle(), and sample() in place of the session ID. Every
     * participant in the group must pass the same value. Use it to make the random values the
     * same in every session.
     */
    randomSeed?: string;
    /**
     * Called once when another participant reaches the `left` presence status, whether their
     * connection dropped for longer than the dropout timeout or they reloaded the page.
     */
    onParticipantLeft?: (participantId: string) => void;
    /** Called whenever this client's connection status changes. */
    onStatusChange?: (status: ConnectionStatus) => void;
}
type SessionListener = (data: GroupSessionData, presence: PresenceData, group: GroupState) => void;

/**
 * Why a multiplayer operation failed.
 * - `timeout`: a wait() or connect() ran out of time.
 * - `cancelled`: the operation was cancelled on purpose: by its signal, by disconnect(), or
 *   because its trial or the experiment ended.
 * - `participant_left`: a participant the wait depended on left the session.
 * - `connection_lost`: this participant's connection was lost for good.
 * - `not_connected`: there is no open session to use.
 * - `unsupported`: the adapter can't do what was asked, e.g. seal a group.
 */
type MultiplayerErrorCode = "timeout" | "cancelled" | "participant_left" | "connection_lost" | "not_connected" | "unsupported";
/**
 * Every error the multiplayer API raises on its own account; `code` says why. Invalid arguments
 * throw a TypeError or RangeError instead.
 *
 * Code checking errors from separately bundled packages should compare `error.name` to
 * "MultiplayerError" rather than use instanceof, which fails if two copies of jspsych are loaded.
 */
declare class MultiplayerError extends Error {
    readonly code: MultiplayerErrorCode;
    /** With `participant_left`, the participant who left. */
    readonly participantId?: string;
    constructor(code: MultiplayerErrorCode, message: string, participantId?: string);
}

interface ConnectOptions extends SessionOptions {
    /**
     * Aborting this signal cancels a connect() that is still pending. connect() then rejects with
     * a `cancelled` MultiplayerError once the adapter has closed anything it opened.
     */
    signal?: AbortSignal;
    /**
     * How long to wait for the adapter to connect before giving up with a `timeout`
     * MultiplayerError, in milliseconds. Defaults to 20000. null means no limit.
     */
    connectTimeout?: number | null;
    /**
     * Whether to add `multiplayer_participant_id` and `multiplayer_session_id` to every row of
     * jsPsych's data recorded while connected, so data from the members of a group can be joined.
     * Defaults to true.
     */
    recordIds?: boolean;
}
interface ScopeOptions {
    /**
     * Which part of the shared data to use. During a trial, calls use that trial's scope by
     * default, so data from one trial never shows up in another. `"session"` uses the data that
     * lasts the whole session, which is also the default outside trials. `"trial"` insists on the
     * current trial's scope and throws outside a trial.
     */
    scope?: "trial" | "session";
}
interface SubscribeOptions extends ScopeOptions {
    /** Aborting this signal removes the subscription. */
    signal?: AbortSignal;
}
interface WaitOptions extends SubscribeOptions {
    /** Maximum time to wait in milliseconds. null or undefined means no limit. */
    timeout?: number | null;
    /**
     * Participants the wait depends on. If one of them leaves before the condition is met, the
     * wait rejects with a `participant_left` MultiplayerError.
     */
    participants?: string[];
}
/** Options for waitForGroup(). */
type GroupWaitOptions = Pick<WaitOptions, "timeout" | "signal">;
/** Key of the hooks jsPsych calls as its timeline runs. Not part of the public API. */
declare const timelineHooks: unique symbol;
/**
 * jsPsych.multiplayer: opens a session with a backend adapter and forwards every other method to
 * it, so plugins can call jsPsych.multiplayer.update() and so on without holding a session.
 */
declare class MultiplayerAPI {
    /** The latest session, open or closed. Closed sessions still answer reads. */
    private session;
    private connecting;
    /** The running trial's scope name, or null between trials. */
    private trialScope;
    /** The IDs to add to each row of jsPsych's data, or null when not recording them. */
    private recordedIds;
    /**
     * This page load's identity, shared by every session opened from it, so the group can tell a
     * reconnect of this page from a reload.
     */
    private readonly identity;
    constructor();
    /** This participant's ID within the group. Null until connect() resolves. */
    get participantId(): string | null;
    /** The group session's ID, the same for every participant in the group. Null until connect() resolves. */
    get sessionId(): string | null;
    /**
     * True when this participant reloaded or reopened the study after joining the group: their
     * experiment restarted, the group has moved on, and the others count them as having left.
     */
    get restarted(): boolean;
    /** This participant's connection status. Null until connect() resolves; `closed` after disconnect(). */
    get status(): ConnectionStatus | null;
    /** The session to read from: the latest one, even if it has closed. */
    private readable;
    /** The session to write to, which must still be open. */
    private writable;
    /** The scope a call uses: null for the session scope, or the running trial's. */
    private scopeOf;
    /**
     * Open a session with a backend adapter. Must be called (and awaited) before jsPsych.run().
     * Rejects if a session is already open or connecting; a closed session can be replaced.
     */
    connect(adapter: MultiplayerAdapter, options?: ConnectOptions): Promise<void>;
    /**
     * Close the current session, or cancel a connect() that is still pending. Resolves once the
     * adapter has closed the connection. Reads keep returning the last state.
     */
    disconnect(): Promise<void>;
    /**
     * Shallow-merge data into this participant's data: top-level keys in `data` replace the same
     * keys, other keys are kept, and a key set to undefined is removed. Everyone sees the change;
     * the promise resolves once the backend has it.
     */
    update(data: Record<string, unknown>, options?: ScopeOptions): Promise<void>;
    /** Replace this participant's data in the scope with `data`, dropping every key it omits. */
    replace(data: Record<string, unknown>, options?: ScopeOptions): Promise<void>;
    /** Every participant's data in the scope, keyed by participant ID. Frozen; don't modify it. */
    getAll(options?: ScopeOptions): GroupSessionData;
    /** One participant's data in the scope, or undefined if they haven't written any. Frozen. */
    get(participantId: string, options?: ScopeOptions): Record<string, unknown> | undefined;
    /** The presence status of every participant seen in the session. Frozen. */
    presence(): PresenceData;
    /** The group's size, members, and whether it is sealed. Frozen. */
    group(): GroupState;
    /**
     * Stop new participants from joining, sealing the group with the members it has now. Rejects
     * with an `unsupported` MultiplayerError if the adapter can't seal groups.
     */
    sealGroup(): Promise<void>;
    /** Resolve with the group's state once it is sealed. */
    waitForGroup(options?: GroupWaitOptions): Promise<GroupState>;
    /**
     * Call `callback(data, presence, group)` now and after every change to the scope's data,
     * presence, or the group. A subscription made during a trial ends with the trial, unless it
     * uses `scope: "session"`, which lasts until the experiment ends.
     */
    subscribe(callback: SessionListener, options?: SubscribeOptions): Unsubscribe;
    /**
     * Resolve with the scope's data once `condition(data, presence, group)` returns true. A wait
     * made during a trial is cancelled when the trial ends, unless it uses `scope: "session"`.
     */
    wait(condition: (data: GroupSessionData, presence: PresenceData, group: GroupState) => boolean, options?: WaitOptions): Promise<GroupSessionData>;
    /**
     * A float in [0, 1) that is the same for every participant who asks with the same `key`.
     * Asking again with the same key returns the same value.
     */
    random(key: string): number;
    /** An integer from `lower` to `upper`, inclusive, shared like random(). */
    randomInt(key: string, lower: number, upper: number): number;
    /** A shuffled copy of `array`, in the same order for every participant who uses `key`. */
    shuffle<T>(key: string, array: readonly T[]): T[];
    /** `size` items drawn from `array` without replacement, shared like shuffle(). */
    sample<T>(key: string, array: readonly T[], size: number): T[];
    /** Called by jsPsych as its timeline runs. */
    readonly [timelineHooks]: {
        /** A trial is starting; its calls use `scope` by default. */
        trialStarted: (scope: string) => void;
        /** The trial's result is in: end its subscriptions and waits. */
        trialEnded: () => void;
        /** The trial's on_finish has run; later calls use the session scope. */
        trialFinished: () => void;
        /** The experiment finished or was aborted: end every subscription and wait. */
        experimentEnded: () => void;
        /** Properties to add to a trial's data row, or null for none. */
        dataProperties: () => Record<string, string> | null;
    };
}

type KeyboardListener = (e: KeyboardEvent) => void;
type ValidResponses = string[] | "ALL_KEYS" | "NO_KEYS";
interface GetKeyboardResponseOptions {
    callback_function: any;
    valid_responses?: ValidResponses;
    rt_method?: "performance" | "audio";
    persist?: boolean;
    audio_context?: AudioContext;
    audio_context_start_time?: number;
    allow_held_key?: boolean;
    minimum_valid_rt?: number;
}
declare class KeyboardListenerAPI {
    private getRootElement;
    private areResponsesCaseSensitive;
    private minimumValidRt;
    constructor(getRootElement: () => Element | undefined, areResponsesCaseSensitive?: boolean, minimumValidRt?: number);
    private listeners;
    private heldKeys;
    private areRootListenersRegistered;
    /**
     * If not previously done and `this.getRootElement()` returns an element, adds the root key
     * listeners to that element.
     */
    private registerRootListeners;
    private rootKeydownListener;
    private toLowerCaseIfInsensitive;
    private rootKeyupListener;
    private isResponseValid;
    getKeyboardResponse({ callback_function, valid_responses, rt_method, persist, audio_context, audio_context_start_time, allow_held_key, minimum_valid_rt, }: GetKeyboardResponseOptions): KeyboardListener;
    cancelKeyboardResponse(listener: KeyboardListener): void;
    cancelAllKeyboardResponses(): void;
    compareKeys(key1: string | null, key2: string | null): boolean;
}

interface AudioPlayerOptions {
    useWebAudio: boolean;
    audioContext?: AudioContext;
}
interface AudioPlayerInterface {
    load(): Promise<void>;
    play(): void;
    stop(): void;
    addEventListener(eventName: string, callback: EventListenerOrEventListenerObject): void;
    removeEventListener(eventName: string, callback: EventListenerOrEventListenerObject): void;
}
declare class AudioPlayer implements AudioPlayerInterface {
    private audio;
    private webAudioBuffer;
    private audioContext;
    private useWebAudio;
    private src;
    constructor(src: string, options?: AudioPlayerOptions);
    load(): Promise<void>;
    play(): void;
    stop(): void;
    addEventListener(eventName: string, callback: EventListenerOrEventListenerObject): void;
    removeEventListener(eventName: string, callback: EventListenerOrEventListenerObject): void;
    private getAudioSourceNode;
    private preloadWebAudio;
    private preloadHTMLAudio;
}

declare class MediaAPI {
    useWebaudio: boolean;
    constructor(useWebaudio: boolean);
    private video_buffers;
    getVideoBuffer(videoID: string): any;
    private context;
    private audio_buffers;
    audioContext(): AudioContext;
    getAudioPlayer(audioID: string): Promise<AudioPlayer>;
    private preload_requests;
    private img_cache;
    preloadAudio(files: any, callback_complete?: () => void, callback_load?: (filepath: string) => void, callback_error?: (error: any) => void): void;
    preloadImages(images: any, callback_complete?: () => void, callback_load?: (filepath: any) => void, callback_error?: (error_msg: any) => void): void;
    preloadVideo(videos: any, callback_complete?: () => void, callback_load?: (filepath: any) => void, callback_error?: (error_msg: any) => void): void;
    private preloadMap;
    getAutoPreloadList(timeline_description: any[]): {
        images: string[];
        audio: string[];
        video: string[];
    };
    cancelPreloads(): void;
    private microphone_recorder;
    initializeMicrophoneRecorder(stream: MediaStream): void;
    getMicrophoneRecorder(): MediaRecorder;
    private camera_stream;
    private camera_recorder;
    initializeCameraRecorder(stream: MediaStream, opts?: MediaRecorderOptions): void;
    /** returns a compatible mimetype string, or null if none from the array are supported. */
    private getCompatibleMimeType;
    getCameraStream(): MediaStream;
    getCameraRecorder(): MediaRecorder;
}

declare class SimulationAPI {
    private getDisplayContainerElement;
    private setJsPsychTimeout;
    constructor(getDisplayContainerElement: () => HTMLElement, setJsPsychTimeout: (callback: () => void, delay: number) => number);
    dispatchEvent(event: Event): void;
    /**
     * Dispatches a `keydown` event for the specified key
     * @param key Character code (`.key` property) for the key to press.
     */
    keyDown(key: string): void;
    /**
     * Dispatches a `keyup` event for the specified key
     * @param key Character code (`.key` property) for the key to press.
     */
    keyUp(key: string): void;
    /**
     * Dispatches a `keydown` and `keyup` event in sequence to simulate pressing a key.
     * @param key Character code (`.key` property) for the key to press.
     * @param delay Length of time to wait (ms) before executing action
     */
    pressKey(key: string, delay?: number): void;
    /**
     * Dispatches `mousedown`, `mouseup`, and `click` events on the target element
     * @param target The element to click
     * @param delay Length of time to wait (ms) before executing action
     */
    clickTarget(target: Element, delay?: number): void;
    /**
     * Sets the value of a target text input
     * @param target A text input element to fill in
     * @param text Text to input
     * @param delay Length of time to wait (ms) before executing action
     */
    fillTextInput(target: HTMLInputElement, text: string, delay?: number): void;
    /**
     * Picks a valid key from `choices`, taking into account jsPsych-specific
     * identifiers like "NO_KEYS" and "ALL_KEYS".
     * @param choices Which keys are valid.
     * @returns A key selected at random from the valid keys.
     */
    getValidKey(choices: "NO_KEYS" | "ALL_KEYS" | Array<string> | Array<Array<string>>): any;
    mergeSimulationData(default_data: any, simulation_options: any): any;
    ensureSimulationDataConsistency(trial: any, data: any): void;
}

/**
 * A class that provides a wrapper around the global setTimeout and clearTimeout functions.
 */
declare class TimeoutAPI {
    private timeout_handlers;
    /**
     * Calls a function after a specified delay, in milliseconds.
     * @param callback The function to call after the delay.
     * @param delay The number of milliseconds to wait before calling the function.
     * @returns A handle that can be used to clear the timeout with clearTimeout.
     */
    setTimeout(callback: () => void, delay: number): number;
    /**
     * Clears all timeouts that have been created with setTimeout.
     */
    clearAllTimeouts(): void;
}

declare function createJointPluginAPIObject(jsPsych: JsPsych): KeyboardListenerAPI & TimeoutAPI & MediaAPI & SimulationAPI;
type PluginAPI = ReturnType<typeof createJointPluginAPIObject>;

/**
 * Uses the `seedrandom` package to replace Math.random() with a seedable PRNG.
 *
 * @param seed An optional seed. If none is given, a random seed will be generated.
 * @returns The seed value.
 */
declare function setSeed(seed?: string): string;
declare function repeat(array: any, repetitions: any, unpack?: boolean): any;
declare function shuffle<T>(array: Array<T>): T[];
declare function shuffleNoRepeats<T>(arr: Array<T>, equalityTest: (a: T, b: T) => boolean): T[];
declare function shuffleAlternateGroups<T extends any[]>(arr_groups: Array<T>, random_group_order?: boolean): any[];
declare function sampleWithoutReplacement<T>(arr: Array<T>, size: number): T[];
declare function sampleWithReplacement<T>(arr: Array<T>, size: number, weights?: number[]): any[];
declare function factorial(factors: Record<string, any>, repetitions?: number, unpack?: boolean): any;
declare function randomID(length?: number): string;
/**
 * Generate a random integer from `lower` to `upper`, inclusive of both end points.
 * @param lower The lowest value it is possible to generate
 * @param upper The highest value it is possible to generate
 * @returns A random integer
 */
declare function randomInt(lower: number, upper: number): number;
/**
 * Generates a random sample from a Bernoulli distribution.
 * @param p The probability of sampling 1.
 * @returns 0, with probability 1-p, or 1, with probability p.
 */
declare function sampleBernoulli(p: number): 0 | 1;
declare function sampleNormal(mean: number, standard_deviation: number): number;
declare function sampleExponential(rate: number): number;
declare function sampleExGaussian(mean: number, standard_deviation: number, rate: number, positive?: boolean): number;
type RandomWordsOptions = {
    min?: number;
    max?: number;
    exactly?: number;
    maxLength?: number;
    wordsPerString?: number;
    seperator?: string;
    formatter?: (word: string, index: number) => string;
    join?: string;
};
type RandomWordsResult<T extends RandomWordsOptions> = T extends {
    join: string;
} ? string : string[];
/**
 * Generate one or more random words.
 *
 * This is a wrapper function for the {@link https://www.npmjs.com/package/random-words `random-words` npm package}.
 *
 * @param opts An object with optional properties `min`, `max`, `exactly`,
 * `join`, `maxLength`, `wordsPerString`, `separator`, and `formatter`.
 *
 * @returns An array of words or a single string, depending on parameter choices.
 */
declare function randomWords<T extends RandomWordsOptions>(opts: T): RandomWordsResult<T>;

declare const randomization_factorial: typeof factorial;
declare const randomization_randomID: typeof randomID;
declare const randomization_randomInt: typeof randomInt;
declare const randomization_randomWords: typeof randomWords;
declare const randomization_repeat: typeof repeat;
declare const randomization_sampleBernoulli: typeof sampleBernoulli;
declare const randomization_sampleExGaussian: typeof sampleExGaussian;
declare const randomization_sampleExponential: typeof sampleExponential;
declare const randomization_sampleNormal: typeof sampleNormal;
declare const randomization_sampleWithReplacement: typeof sampleWithReplacement;
declare const randomization_sampleWithoutReplacement: typeof sampleWithoutReplacement;
declare const randomization_setSeed: typeof setSeed;
declare const randomization_shuffle: typeof shuffle;
declare const randomization_shuffleAlternateGroups: typeof shuffleAlternateGroups;
declare const randomization_shuffleNoRepeats: typeof shuffleNoRepeats;
declare namespace randomization {
  export { randomization_factorial as factorial, randomization_randomID as randomID, randomization_randomInt as randomInt, randomization_randomWords as randomWords, randomization_repeat as repeat, randomization_sampleBernoulli as sampleBernoulli, randomization_sampleExGaussian as sampleExGaussian, randomization_sampleExponential as sampleExponential, randomization_sampleNormal as sampleNormal, randomization_sampleWithReplacement as sampleWithReplacement, randomization_sampleWithoutReplacement as sampleWithoutReplacement, randomization_setSeed as setSeed, randomization_shuffle as shuffle, randomization_shuffleAlternateGroups as shuffleAlternateGroups, randomization_shuffleNoRepeats as shuffleNoRepeats };
}

interface turkInformation {
    /**
     * Is the experiment being loaded in preview mode on Mechanical Turk?
     */
    previewMode: boolean;
    /**
     * Is the experiment being loaded outside of the Mechanical Turk environment?
     */
    outsideTurk: boolean;
    /**
     * The HIT ID.
     */
    hitId: string;
    /**
     * The Assignment ID.
     */
    assignmentId: string;
    /**
     * The worker ID.
     */
    workerId: string;
    /**
     * URL for submission of the HIT.
     */
    turkSubmitTo: string;
}
/**
 * Gets information about the Mechanical Turk Environment, HIT, Assignment, and Worker
 * by parsing the URL variables that Mechanical Turk generates.
 * @returns An object containing information about the Mechanical Turk Environment, HIT, Assignment, and Worker.
 */
declare function turkInfo(): turkInformation;
/**
 * Send data to Mechnical Turk for storage.
 * @param data An object containing `key:value` pairs to send to Mechanical Turk. Values
 * cannot contain nested objects, arrays, or functions.
 * @returns Nothing
 */
declare function submitToTurk(data: any): void;

declare const turk_submitToTurk: typeof submitToTurk;
declare const turk_turkInfo: typeof turkInfo;
declare namespace turk {
  export { turk_submitToTurk as submitToTurk, turk_turkInfo as turkInfo };
}

/**
 * Finds all of the unique items in an array.
 * @param arr The array to extract unique values from
 * @returns An array with one copy of each unique item in `arr`
 */
declare function unique(arr: Array<any>): any[];
declare function deepCopy(obj: any): any;
/**
 * Merges two objects, recursively.
 * @param obj1 Object to merge
 * @param obj2 Object to merge
 */
declare function deepMerge(obj1: any, obj2: any): any;

declare const utils_deepCopy: typeof deepCopy;
declare const utils_deepMerge: typeof deepMerge;
declare const utils_unique: typeof unique;
declare namespace utils {
  export { utils_deepCopy as deepCopy, utils_deepMerge as deepMerge, utils_unique as unique };
}

/**
 * Maintains a visual progress bar using HTML and CSS
 */
declare class ProgressBar {
    private readonly containerElement;
    private readonly message;
    constructor(containerElement: HTMLDivElement, message: string | ((progress: number) => string));
    private _progress;
    private innerDiv;
    private messageSpan;
    /** Adds the progress bar HTML code into `this.containerElement` */
    private setupElements;
    /** Updates the progress bar according to `this.progress` */
    private update;
    /**
     * The bar's current position as a number in the closed interval [0, 1]. Set this to update the
     * progress bar accordingly.
     */
    set progress(progress: number);
    get progress(): number;
}

declare class JsPsych {
    turk: typeof turk;
    randomization: typeof randomization;
    utils: typeof utils;
    data: JsPsychData;
    multiplayer: MultiplayerAPI;
    pluginAPI: PluginAPI;
    version(): string;
    private citation;
    /** Options */
    private options;
    /** Experiment timeline */
    private timeline?;
    /** Target DOM element */
    private displayContainerElement;
    private displayElement;
    /** Time that the experiment began */
    private experimentStartTime;
    /**
     * Whether the page is retrieved directly via the `file://` protocol (true) or hosted on a web
     * server (false)
     */
    private isFileProtocolUsed;
    /** The simulation mode (if the experiment is being simulated) */
    private simulationMode?;
    /** Simulation options passed in via `simulate()` */
    private simulationOptions;
    private extensionManager;
    constructor(options?: any);
    private endMessage?;
    /**
     * Starts an experiment using the provided timeline and returns a promise that is resolved when
     * the experiment is finished.
     *
     * @param timeline The timeline to be run
     */
    run(timeline: TimelineDescription | TimelineArray): Promise<void>;
    simulate(timeline: any[], simulation_mode?: "data-only" | "visual", simulation_options?: {}): Promise<void>;
    progressBar?: ProgressBar;
    getProgress(): {
        total_trials: any;
        current_trial_global: any;
        percent_complete: number;
    };
    getStartTime(): Date;
    getTotalTime(): number;
    getDisplayElement(): HTMLElement;
    getDisplayContainerElement(): HTMLElement;
    abortExperiment(endMessage?: string, data?: {}): void;
    abortCurrentTimeline(): void;
    /**
     * Aborts a named timeline. The timeline must be currently running in order to abort it.
     *
     * @param name The name of the timeline to abort. Timelines can be given names by setting the `name` parameter in the description of the timeline.
     */
    abortTimelineByName(name: string): void;
    getCurrentTrial(): TrialDescription;
    getInitSettings(): any;
    timelineVariable(variableName: string): TimelineVariable;
    evaluateTimelineVariable(variableName: string): any;
    pauseExperiment(): void;
    resumeExperiment(): void;
    getSafeModeStatus(): boolean;
    getTimeline(): TimelineArray;
    /**
     * Prints out a string containing citations for the jsPsych library and all input plugins/extensions in the specified format.
     * If called without input, prints citation for jsPsych library.
     *
     * @param plugins The plugins/extensions to generate citations for. Always prints the citation for the jsPsych library at the top.
     * @param format The desired output citation format. Currently supports "apa" and "bibtex".
     * @returns String containing citations separated with newline character.
     */
    getCitations(plugins?: Array<Class<JsPsychPlugin<any>> | Class<JsPsychExtension>>, format?: "apa" | "bibtex"): string;
    get extensions(): Record<string, JsPsychExtension>;
    private prepareDom;
    private finishTrialPromise;
    finishTrial(data?: TrialResult): void;
    private timelineDependencies;
    private extensionManagerDependencies;
    private dataDependencies;
}

/**
 * Creates a new JsPsych instance using the provided options.
 *
 * @param options The options to pass to the JsPsych constructor
 * @returns A new JsPsych instance
 */
declare function initJsPsych(options?: any): JsPsych;

export { type AdapterConnectOptions, type ConnectOptions, type ConnectionStatus, DataCollection, type GroupSessionData, type GroupState, type GroupWaitOptions, JsPsych, type JsPsychExtension, type JsPsychExtensionInfo, type JsPsychPlugin, type MultiplayerAdapter, type MultiplayerConnection, MultiplayerError, type MultiplayerErrorCode, ParameterType, type PluginInfo, type PresenceData, type PresenceStatus, type ScopeOptions, type SessionListener, type SubscribeOptions, type TrialType, type Unsubscribe, type WaitOptions, initJsPsych };
