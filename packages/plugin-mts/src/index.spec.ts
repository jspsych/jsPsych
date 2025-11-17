import { clickTarget, simulateTimeline, startTimeline } from "@jspsych/test-utils";

import mts from ".";

jest.useFakeTimers();

describe("plugin-mts", () => {
  it("should load", () => {
    expect(mts).toBeDefined();
  });

  describe("SMTS (Simultaneous Matching-to-Sample)", () => {
    it("should display sample and comparison stimuli simultaneously", async () => {
      const { getHTML, expectFinished } = await startTimeline([
        {
          type: mts,
          sample_stimuli: ["img/sample1.png"],
          comparison_stimuli: ["img/comp1.png", "img/comp2.png"],
          correct_comparison: "img/comp1.png",
          require_sample_click: false,
          protocol: "SMTS",
        },
      ]);

      expect(getHTML()).toContain("sample1.png");
      expect(getHTML()).toContain("comp1.png");
      expect(getHTML()).toContain("comp2.png");

      clickTarget(document.querySelector('img[src="img/comp1.png"]'));
      await expectFinished();
    });

    it("should record correct response when correct comparison is selected", async () => {
      const { getData, expectFinished } = await startTimeline([
        {
          type: mts,
          sample_stimuli: ["img/sample1.png"],
          comparison_stimuli: ["img/comp1.png", "img/comp2.png"],
          correct_comparison: "img/comp1.png",
          require_sample_click: false,
        },
      ]);

      clickTarget(document.querySelector('img[src="img/comp1.png"]'));
      await expectFinished();

      const data = getData().values()[0];
      expect(data.correct).toBe(true);
      expect(data.selected_comparison).toBe("img/comp1.png");
    });

    it("should record incorrect response when wrong comparison is selected", async () => {
      const { getData, expectFinished } = await startTimeline([
        {
          type: mts,
          sample_stimuli: ["img/sample1.png"],
          comparison_stimuli: ["img/comp1.png", "img/comp2.png"],
          correct_comparison: "img/comp1.png",
          require_sample_click: false,
        },
      ]);

      clickTarget(document.querySelector('img[src="img/comp2.png"]'));
      await expectFinished();

      const data = getData().values()[0];
      expect(data.correct).toBe(false);
      expect(data.selected_comparison).toBe("img/comp2.png");
    });
  });

  describe("Sample click requirement", () => {
    it("should require sample click before displaying comparisons when require_sample_click is true", async () => {
      const { getHTML } = await startTimeline([
        {
          type: mts,
          sample_stimuli: ["img/sample1.png"],
          comparison_stimuli: ["img/comp1.png", "img/comp2.png"],
          correct_comparison: "img/comp1.png",
          require_sample_click: true,
          protocol: "SMTS",
        },
      ]);

      expect(getHTML()).toContain("sample1.png");

      // Click sample
      clickTarget(document.querySelector('img[src="img/sample1.png"]'));
      jest.runAllTimers();

      // Now comparisons should be visible
      expect(getHTML()).toContain("comp1.png");
      expect(getHTML()).toContain("comp2.png");
    });
  });

  describe("Multiple samples (contextual stimuli)", () => {
    it("should display multiple sample stimuli", async () => {
      const { getHTML, expectFinished } = await startTimeline([
        {
          type: mts,
          sample_stimuli: ["img/sample1.png", "img/context.png"],
          sample_positions: [
            [0, 200],
            [350, 250],
          ],
          comparison_stimuli: ["img/comp1.png", "img/comp2.png"],
          correct_comparison: "img/comp1.png",
          require_sample_click: false,
        },
      ]);

      expect(getHTML()).toContain("sample1.png");
      expect(getHTML()).toContain("context.png");
      expect(getHTML()).toContain("comp1.png");

      clickTarget(document.querySelector('img[src="img/comp1.png"]'));
      await expectFinished();
    });
  });

  describe("Consequence display", () => {
    it("should display correct consequence image after correct response", async () => {
      const { getHTML, expectFinished } = await startTimeline([
        {
          type: mts,
          sample_stimuli: ["img/sample1.png"],
          comparison_stimuli: ["img/comp1.png", "img/comp2.png"],
          correct_comparison: "img/comp1.png",
          require_sample_click: false,
          correct_consequence_image: "img/correct.png",
          correct_consequence_duration: 1000,
        },
      ]);

      clickTarget(document.querySelector('img[src="img/comp1.png"]'));
      jest.advanceTimersByTime(100);

      expect(getHTML()).toContain("correct.png");

      jest.advanceTimersByTime(1000);
      await expectFinished();
    });

    it("should display incorrect consequence image after incorrect response", async () => {
      const { getHTML, expectFinished } = await startTimeline([
        {
          type: mts,
          sample_stimuli: ["img/sample1.png"],
          comparison_stimuli: ["img/comp1.png", "img/comp2.png"],
          correct_comparison: "img/comp1.png",
          require_sample_click: false,
          incorrect_consequence_image: "img/incorrect.png",
          incorrect_consequence_duration: 1000,
        },
      ]);

      clickTarget(document.querySelector('img[src="img/comp2.png"]'));
      jest.advanceTimersByTime(100);

      expect(getHTML()).toContain("incorrect.png");

      jest.advanceTimersByTime(1000);
      await expectFinished();
    });
  });

  describe("Reaction time recording", () => {
    it("should record rt_sample, rt_comparison, and rt_total", async () => {
      const { getData, expectFinished } = await startTimeline([
        {
          type: mts,
          sample_stimuli: ["img/sample1.png"],
          comparison_stimuli: ["img/comp1.png", "img/comp2.png"],
          correct_comparison: "img/comp1.png",
          require_sample_click: true,
          protocol: "SMTS",
        },
      ]);

      jest.advanceTimersByTime(500);
      clickTarget(document.querySelector('img[src="img/sample1.png"]'));

      jest.advanceTimersByTime(1000);
      clickTarget(document.querySelector('img[src="img/comp1.png"]'));

      await expectFinished();

      const data = getData().values()[0];
      expect(data.rt_sample).toBeGreaterThan(0);
      expect(data.rt_comparison).toBeGreaterThan(0);
      expect(data.rt_total).toBeGreaterThan(0);
    });
  });

  describe("Multiple correct comparisons", () => {
    it("should accept any of multiple correct comparisons", async () => {
      const { getData, expectFinished } = await startTimeline([
        {
          type: mts,
          sample_stimuli: ["img/sample1.png"],
          comparison_stimuli: ["img/comp1.png", "img/comp2.png", "img/comp3.png"],
          correct_comparison: ["img/comp1.png", "img/comp2.png"],
          require_sample_click: false,
        },
      ]);

      clickTarget(document.querySelector('img[src="img/comp2.png"]'));
      await expectFinished();

      const data = getData().values()[0];
      expect(data.correct).toBe(true);
      expect(data.selected_comparison).toBe("img/comp2.png");
    });
  });

  describe("Randomization", () => {
    it("should randomize comparison positions when randomize_comparison_positions is true", async () => {
      const { getData, expectFinished } = await startTimeline([
        {
          type: mts,
          sample_stimuli: ["img/sample1.png"],
          comparison_stimuli: ["img/comp1.png", "img/comp2.png"],
          correct_comparison: "img/comp1.png",
          require_sample_click: false,
          randomize_comparison_positions: true,
        },
      ]);

      clickTarget(document.querySelectorAll("img")[1]); // Click first comparison
      await expectFinished();

      const data = getData().values()[0];
      expect(data.selected_comparison).toBeDefined();
    });
  });

  describe("Background color", () => {
    it("should set background color", async () => {
      const { displayElement } = await startTimeline([
        {
          type: mts,
          sample_stimuli: ["img/sample1.png"],
          comparison_stimuli: ["img/comp1.png", "img/comp2.png"],
          correct_comparison: "img/comp1.png",
          require_sample_click: false,
          background_color: "#FF0000",
        },
      ]);

      expect(displayElement.style.backgroundColor).toBe("rgb(255, 0, 0)");
    });
  });
});
