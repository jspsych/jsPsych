import * as jspsych from 'jspsych';
import { JsPsych } from 'jspsych';

/**
 * https://github.com/facebook/jest/issues/2157#issuecomment-279171856
 */
declare function flushPromises(): Promise<unknown>;
declare function dispatchEvent(event: Event, target?: Element): Promise<unknown>;
declare function keyDown(key: string): Promise<void>;
declare function keyUp(key: string): Promise<void>;
declare function pressKey(key: string): Promise<void>;
declare function mouseDownMouseUpTarget(target: Element): Promise<void>;
declare function clickTarget(target: Element): Promise<void>;
/**
 * Dispatch a `mousemove` event, with x and y defined relative to the container element.
 * @param x The x location of the event, relative to the x location of `container`.
 * @param y The y location of the event, relative to the y location of `container`.
 * @param container The DOM element for relative location of the event.
 */
declare function mouseMove(x: number, y: number, container: Element): Promise<void>;
/**
 * Dispatch a `mouseup` event, with x and y defined relative to the container element.
 * @param x The x location of the event, relative to the x location of `container`.
 * @param y The y location of the event, relative to the y location of `container`.
 * @param container The DOM element for relative location of the event.
 */
declare function mouseUp(x: number, y: number, container: Element): Promise<void>;
/**
 * Dispatch a `mousemove` event, with x and y defined relative to the container element.
 * @param x The x location of the event, relative to the x location of `container`.
 * @param y The y location of the event, relative to the y location of `container`.
 * @param container The DOM element for relative location of the event.
 */
declare function mouseDown(x: number, y: number, container: Element): Promise<void>;
/**
 * Runs the given timeline by calling `jsPsych.run()` on the provided JsPsych object.
 *
 * @param timeline The timeline that is passed to `jsPsych.run()`
 * @param jsPsych The jsPsych instance to be used. If left empty, a new instance will be created. If
 * a settings object is passed instead, the settings will be used to create the jsPsych instance.
 *
 * @returns An object containing test helper functions, the jsPsych instance, and the jsPsych
 * display element
 */
declare function startTimeline(timeline: any[], jsPsych?: JsPsych | any): Promise<{
    jsPsych: JsPsych;
    displayElement: HTMLElement;
    /** Shorthand for `jsPsych.getDisplayElement().innerHTML` */
    getHTML: () => string;
    /** Shorthand for `jsPsych.data.get()` */
    getData: () => jspsych.DataCollection;
    expectFinished: () => Promise<void>;
    expectRunning: () => Promise<void>;
    /** A promise that is resolved when `jsPsych.run()` is done. */
    finished: Promise<void>;
}>;
/**
 * Runs the given timeline by calling `jsPsych.simulate()` on the provided JsPsych object.
 *
 * @param timeline The timeline that is passed to `jsPsych.run()`
 * @param simulation_mode Either 'data-only' mode or 'visual' mode.
 * @param simulation_options Options to pass to `jsPsych.simulate()`
 * @param jsPsych The jsPsych instance to be used. If left empty, a new instance will be created. If
 * a settings object is passed instead, the settings will be used to create the jsPsych instance.
 *
 * @returns An object containing test helper functions, the jsPsych instance, and the jsPsych
 * display element
 */
declare function simulateTimeline(timeline: any[], simulation_mode?: "data-only" | "visual", simulation_options?: any, jsPsych?: JsPsych | any): Promise<{
    jsPsych: JsPsych;
    displayElement: HTMLElement;
    /** Shorthand for `jsPsych.getDisplayElement().innerHTML` */
    getHTML: () => string;
    /** Shorthand for `jsPsych.data.get()` */
    getData: () => jspsych.DataCollection;
    expectFinished: () => Promise<void>;
    expectRunning: () => Promise<void>;
    /** A promise that is resolved when `jsPsych.simulate()` is done. */
    finished: Promise<void>;
}>;

export { clickTarget, dispatchEvent, flushPromises, keyDown, keyUp, mouseDown, mouseDownMouseUpTarget, mouseMove, mouseUp, pressKey, simulateTimeline, startTimeline };
