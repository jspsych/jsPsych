import { clickTarget, pressKey, startTimeline } from "@jspsych/test-utils";

import imageTextAnnotation from ".";

jest.useFakeTimers();

describe("image-text-annotation", () => {
  test.skip("basic load with defaults", async () => {
    const { displayElement, getHTML, expectFinished } = await startTimeline([
      {
        type: imageTextAnnotation,
      },
    ]);

    const canvas = displayElement.querySelector("canvas");
    expect(canvas).not.toBeNull();

    expect(displayElement.querySelector("#sketchpad-clear")).not.toBeNull();
    expect(displayElement.querySelector("#sketchpad-undo")).not.toBeNull();
    expect(displayElement.querySelector("#sketchpad-redo")).not.toBeNull();

    clickTarget(displayElement.querySelector("#sketchpad-end"));
    await expectFinished();
  });
});
