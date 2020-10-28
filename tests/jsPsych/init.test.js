require("../../jspsych");
require("../../plugins/jspsych-html-keyboard-response");

describe("jsPsych init", () => {
  beforeEach(() => {
    document.body.innerHTML = "";
  });

  function setReadyState(targetState) {
    jest
      .spyOn(document, "readyState", "get")
      .mockImplementation(() => targetState);
  }

  function getBodyHTML() {
    return document.body.innerHTML;
  }

  function init() {
    jsPsych.init({
      timeline: [
        {
          type: "html-keyboard-response",
          stimulus: "foo",
        },
      ],
    });
  }

  it("should delay execution until the document is ready", () => {
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
