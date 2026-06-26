import { MultiplayerAdapter, GroupSessionData, Unsubscribe } from 'jspsych';

/**
 * Multiplayer adapter backed by JATOS group studies.
 *
 * Usage:
 *   const jsPsych = initJsPsych({ ... });
 *   await jsPsych.pluginAPI.connect(new JatosAdapter());
 *   await jsPsych.run(timeline);
 *
 * Each participant's pushed data is stored under groupSession[workerId],
 * so keys never collide across participants.
 */
declare class JatosAdapter implements MultiplayerAdapter {
    readonly participantId: string;
    /**
     * Local fan-out list. jatos.onGroupSession accepts only a single callback,
     * so the adapter registers one dispatcher and routes it to all subscribers.
     */
    private subscribers;
    constructor();
    connect(): Promise<void>;
    push(data: Record<string, unknown>): Promise<void>;
    getAll(): GroupSessionData;
    get(participantId: string): Record<string, unknown> | undefined;
    subscribe(callback: (data: GroupSessionData) => void): Unsubscribe;
    disconnect(): Promise<void>;
}

export { JatosAdapter as default };
