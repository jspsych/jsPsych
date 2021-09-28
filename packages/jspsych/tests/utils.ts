import { setImmediate as flushMicroTasks } from "timers";

// This import must not be relative because utils.ts is also used in external tests (where jspsych
// should be regularly loaded from the `dist` directory, not from the source files)
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
