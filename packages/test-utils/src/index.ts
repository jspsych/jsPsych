import { setImmediate as flushMicroTasks } from "timers";

import { JsPsych } from "jspsych";

export function dispatchEvent(event: Event) {
  document.body.dispatchEvent(event);
}

export function keyDown(key: string) {
  dispatchEvent(new KeyboardEvent("keydown", { key }));
}

export function keyUp(key: string) {
  dispatchEvent(new KeyboardEvent("keyup", { key }));
}

export function pressKey(key: string) {
  keyDown(key);
  keyUp(key);
}

export function mouseDownMouseUpTarget(target: Element) {
  target.dispatchEvent(new MouseEvent("mousedown", { bubbles: true }));
  target.dispatchEvent(new MouseEvent("mouseup", { bubbles: true }));
}

export function clickTarget(target: Element) {
  target.dispatchEvent(new MouseEvent("click", { bubbles: true }));
}

/**
 * Dispatch a `mousemove` event, with x and y defined relative to the container element.
 * @param x The x location of the event, relative to the x location of `container`.
 * @param y The y location of the event, relative to the y location of `container`.
 * @param container The DOM element for relative location of the event.
 */
export function mouseMove(x: number, y: number, container: Element) {
  const containerRect = container.getBoundingClientRect();

  const eventInit = {
    clientX: containerRect.x + x,
    clientY: containerRect.y + y,
    bubbles: true,
  };

  container.dispatchEvent(new MouseEvent("mousemove", eventInit));
}

/**
 * Dispatch a `mouseup` event, with x and y defined relative to the container element.
 * @param x The x location of the event, relative to the x location of `container`.
 * @param y The y location of the event, relative to the y location of `container`.
 * @param container The DOM element for relative location of the event.
 */
export function mouseUp(x: number, y: number, container: Element) {
  const containerRect = container.getBoundingClientRect();

  const eventInit = {
    clientX: containerRect.x + x,
    clientY: containerRect.y + y,
    bubbles: true,
  };

  container.dispatchEvent(new MouseEvent("mouseup", eventInit));
}

/**
 * Dispatch a `mousemove` event, with x and y defined relative to the container element.
 * @param x The x location of the event, relative to the x location of `container`.
 * @param y The y location of the event, relative to the y location of `container`.
 * @param container The DOM element for relative location of the event.
 */
export function mouseDown(x: number, y: number, container: Element) {
  const containerRect = container.getBoundingClientRect();

  const eventInit = {
    clientX: containerRect.x + x,
    clientY: containerRect.y + y,
    bubbles: true,
  };

  container.dispatchEvent(new MouseEvent("mousedown", eventInit));
}

/**
 * https://github.com/facebook/jest/issues/2157#issuecomment-279171856
 */
export function flushPromises() {
  return new Promise((resolve) => flushMicroTasks(resolve));
}

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
export async function startTimeline(timeline: any[], jsPsych: JsPsych | any = {}) {
  const jsPsychInstance = jsPsych instanceof JsPsych ? jsPsych : new JsPsych(jsPsych);

  let hasFinished = false;
  const finished = jsPsychInstance.run(timeline).then(() => {
    hasFinished = true;
  });
  await flushPromises();

  const displayElement = jsPsychInstance.getDisplayElement();

  return {
    jsPsych: jsPsychInstance,
    displayElement,
    /** Shorthand for `jsPsych.getDisplayElement().innerHTML` */
    getHTML: () => displayElement.innerHTML,
    /** Shorthand for `jsPsych.data.get()` */
    getData: () => jsPsychInstance.data.get(),
    expectFinished: async () => {
      await flushPromises();
      expect(hasFinished).toBe(true);
    },
    expectRunning: async () => {
      await flushPromises();
      expect(hasFinished).toBe(false);
    },
    /** A promise that is resolved when `jsPsych.run()` is done. */
    finished,
  };
}

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
export async function simulateTimeline(
  timeline: any[],
  simulation_mode?: "data-only" | "visual",
  simulation_options: any = {},
  jsPsych: JsPsych | any = {}
) {
  const jsPsychInstance = jsPsych instanceof JsPsych ? jsPsych : new JsPsych(jsPsych);

  let hasFinished = false;
  const finished = jsPsychInstance
    .simulate(timeline, simulation_mode, simulation_options)
    .then(() => {
      hasFinished = true;
    });
  await flushPromises();

  const displayElement = jsPsychInstance.getDisplayElement();

  return {
    jsPsych: jsPsychInstance,
    displayElement,
    /** Shorthand for `jsPsych.getDisplayElement().innerHTML` */
    getHTML: () => displayElement.innerHTML,
    /** Shorthand for `jsPsych.data.get()` */
    getData: () => jsPsychInstance.data.get(),
    expectFinished: async () => {
      await flushPromises();
      expect(hasFinished).toBe(true);
    },
    expectRunning: async () => {
      await flushPromises();
      expect(hasFinished).toBe(false);
    },
    /** A promise that is resolved when `jsPsych.simulate()` is done. */
    finished,
  };
}
