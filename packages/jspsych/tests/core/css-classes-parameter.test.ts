import htmlKeyboardResponse from "@jspsych/plugin-html-keyboard-response";
import { pressKey, startTimeline } from "@jspsych/test-utils";

import { initJsPsych } from "../../src";

describe("The css_classes parameter for trials", () => {
  test("Adds a single CSS class to the root jsPsych element", async () => {
    const { displayElement } = await startTimeline([
      { type: htmlKeyboardResponse, stimulus: "<p>foo</p>", css_classes: ["foo"] },
    ]);

    expect(displayElement.classList).toContain("foo");
  });

  test("Gracefully handles single class when not in array", async () => {
    const { displayElement } = await startTimeline([
      { type: htmlKeyboardResponse, stimulus: "<p>foo</p>", css_classes: "foo" },
    ]);

    expect(displayElement.classList).toContain("foo");
  });

  test("Removes the added classes at the end of the trial", async () => {
    const { displayElement } = await startTimeline([
      { type: htmlKeyboardResponse, stimulus: "<p>foo</p>", css_classes: ["foo"] },
    ]);

    expect(displayElement.classList).toContain("foo");
    pressKey("a");
    expect(displayElement.classList).not.toContain("foo");
  });

  test("Class inherits in nested timelines", async () => {
    const { displayElement } = await startTimeline([
      {
        timeline: [
          {
            type: htmlKeyboardResponse,
            stimulus: "<p>foo</p>",
          },
        ],
        css_classes: ["foo"],
      },
    ]);

    expect(displayElement.classList).toContain("foo");
    pressKey("a");
    expect(displayElement.classList).not.toContain("foo");
  });

  test("Parameter works when defined as a function", async () => {
    const { displayElement } = await startTimeline([
      {
        type: htmlKeyboardResponse,
        stimulus: "<p>foo</p>",
        css_classes: () => ["foo"],
      },
    ]);

    expect(displayElement.classList).toContain("foo");
    pressKey("a");
    expect(displayElement.classList).not.toContain("foo");
  });

  test("Parameter works when defined as a timeline variable", async () => {
    const jsPsych = initJsPsych();
    const { displayElement } = await startTimeline(
      [
        {
          timeline: [
            {
              type: htmlKeyboardResponse,
              stimulus: "<p>foo</p>",
              css_classes: jsPsych.timelineVariable("css"),
            },
          ],
          timeline_variables: [{ css: ["foo"] }],
        },
      ],
      jsPsych
    );

    expect(displayElement.classList).toContain("foo");
    pressKey("a");
    expect(displayElement.classList).not.toContain("foo");
  });
});
