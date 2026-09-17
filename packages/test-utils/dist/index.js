import { setImmediate } from 'node:timers';
import { JsPsych } from 'jspsych';

function flushPromises() {
  return new Promise((resolve) => setImmediate(resolve));
}
function dispatchEvent(event, target = document.body) {
  target.dispatchEvent(event);
  return flushPromises();
}
async function keyDown(key) {
  await dispatchEvent(new KeyboardEvent("keydown", { key }));
}
async function keyUp(key) {
  await dispatchEvent(new KeyboardEvent("keyup", { key }));
}
async function pressKey(key) {
  await keyDown(key);
  await keyUp(key);
}
async function mouseDownMouseUpTarget(target) {
  await dispatchEvent(new MouseEvent("mousedown", { bubbles: true }), target);
  await dispatchEvent(new MouseEvent("mouseup", { bubbles: true }), target);
}
async function clickTarget(target) {
  if (target instanceof HTMLButtonElement || target instanceof HTMLInputElement) {
    if (target.disabled) {
      console.log("Target is disabled, not dispatching click event.");
      return;
    }
  }
  await dispatchEvent(new MouseEvent("click", { bubbles: true }), target);
}
async function dispatchMouseEvent(eventType, x, y, container) {
  const containerRect = container.getBoundingClientRect();
  await dispatchEvent(
    new MouseEvent(eventType, {
      clientX: containerRect.x + x,
      clientY: containerRect.y + y,
      bubbles: true
    }),
    container
  );
}
async function mouseMove(x, y, container) {
  await dispatchMouseEvent("mousemove", x, y, container);
}
async function mouseUp(x, y, container) {
  await dispatchMouseEvent("mouseup", x, y, container);
}
async function mouseDown(x, y, container) {
  await dispatchMouseEvent("mousedown", x, y, container);
}
async function startTimeline(timeline, jsPsych = {}) {
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
    finished
  };
}
async function simulateTimeline(timeline, simulation_mode, simulation_options = {}, jsPsych = {}) {
  const jsPsychInstance = jsPsych instanceof JsPsych ? jsPsych : new JsPsych(jsPsych);
  let hasFinished = false;
  const finished = jsPsychInstance.simulate(timeline, simulation_mode, simulation_options).then(() => {
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
    finished
  };
}

export { clickTarget, dispatchEvent, flushPromises, keyDown, keyUp, mouseDown, mouseDownMouseUpTarget, mouseMove, mouseUp, pressKey, simulateTimeline, startTimeline };
//# sourceMappingURL=index.js.map
