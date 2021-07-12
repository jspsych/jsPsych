import htmlKeyboardResponse from "@jspsych/plugin-html-keyboard-response";

import { JsPsych, initJsPsych } from "../../src";

let jsPsych: JsPsych;

describe("jsPsych init", () => {
  beforeEach(() => {
    document.body.innerHTML = "";
  });

  function setReadyState(targetState) {
    jest.spyOn(document, "readyState", "get").mockImplementation(() => targetState);
  }

  function getBodyHTML() {
    return document.body.innerHTML;
  }

  function init() {
    jsPsych = initJsPsych({
      timeline: [
        {
          type: htmlKeyboardResponse,
          stimulus: "foo",
        },
      ],
    });
  }

  // Currently not implemented – we need a way to await promises
  it.skip("should delay execution until the document is ready", () => {
    expect(getBodyHTML()).toBe("");

    setReadyState("loading");
    init();
    expect(getBodyHTML()).toBe("");

    // Simulate the document getting ready
    setReadyState("complete");
    window.dispatchEvent(new Event("load"));
    expect(getBodyHTML()).not.toBe("");
  });

  it("should execute immediately when the document is ready", () => {
    // The document is ready by default in jsdom
    init();
    expect(getBodyHTML()).not.toBe("");
  });
});
