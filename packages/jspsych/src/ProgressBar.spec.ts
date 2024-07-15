import { ProgressBar } from "./ProgressBar";

describe("ProgressBar", () => {
  let containerElement: HTMLDivElement;
  let progressBar: ProgressBar;

  beforeEach(() => {
    containerElement = document.createElement("div");
    progressBar = new ProgressBar(containerElement, "My message");
  });

  it("sets up proper HTML markup when created", () => {
    expect(containerElement.innerHTML).toMatchInlineSnapshot(
      '"<span>My message</span><div id="jspsych-progressbar-outer"><div id="jspsych-progressbar-inner" style="width: 0%;"></div></div>"'
    );
  });

  describe("progress", () => {
    it("updates the bar width accordingly", () => {
      expect(progressBar.progress).toEqual(0);
      expect(containerElement.innerHTML).toContain('style="width: 0%;"');
      progressBar.progress = 0.5;
      expect(progressBar.progress).toEqual(0.5);
      expect(containerElement.innerHTML).toContain('style="width: 50%;"');

      progressBar.progress = 1;
      expect(progressBar.progress).toEqual(1);
      expect(containerElement.innerHTML).toContain('style="width: 100%;"');
    });

    it("errors if an invalid progress value is provided", () => {
      expect(() => {
        // @ts-expect-error
        progressBar.progress = "0";
      }).toThrowErrorMatchingInlineSnapshot(
        '"jsPsych.progressBar.progress must be a number between 0 and 1"'
      );
      expect(() => {
        progressBar.progress = -0.1;
      }).toThrowErrorMatchingInlineSnapshot(
        '"jsPsych.progressBar.progress must be a number between 0 and 1"'
      );
      expect(() => (progressBar.progress = 1.1)).toThrowErrorMatchingInlineSnapshot(
        '"jsPsych.progressBar.progress must be a number between 0 and 1"'
      );
    });

    it("should work when message is a function", () => {
      // Override default container element and progress bar
      containerElement = document.createElement("div");
      progressBar = new ProgressBar(containerElement, (progress: number) => String(progress));
      let messageSpan: HTMLSpanElement = containerElement.querySelector("span");

      expect(messageSpan.innerHTML).toEqual("0");

      progressBar.progress = 0.5;
      expect(messageSpan.innerHTML).toEqual("0.5");
    });
  });
});
