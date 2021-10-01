import htmlKeyboardResponse from "@jspsych/plugin-html-keyboard-response";
import { flushPromises, startTimeline } from "@jspsych/test-utils";

describe("jsPsych.run()", () => {
  beforeEach(() => {
    document.body.innerHTML = "";
  });

  function setReadyState(targetState: "loading" | "complete") {
    jest.spyOn(document, "readyState", "get").mockImplementation(() => targetState);
  }

  function getBodyHTML() {
    return document.body.innerHTML;
  }

  async function init() {
    await startTimeline([
      {
        type: htmlKeyboardResponse,
        stimulus: "foo",
      },
    ]);
  }

  // Currently not implemented – we need a way to await promises
  it("should delay execution until the document is ready", async () => {
    expect(getBodyHTML()).toBe("");

    setReadyState("loading");
    await init();
    expect(getBodyHTML()).toBe("");

    // Simulate the document getting ready
    setReadyState("complete");
    window.dispatchEvent(new Event("load"));
    await flushPromises();
    expect(getBodyHTML()).not.toBe("");
  });

  it("should execute immediately when the document is ready", async () => {
    // The document is ready by default in jsdom
    await init();
    expect(getBodyHTML()).not.toBe("");
  });
});
