import { clickTarget, startTimeline } from "@jspsych/test-utils";
import { JsPsych, JsPsychPlugin, ParameterType, TrialType } from "jspsych";

import { initJsPsych } from "../../src";

describe("Display element sizing", () => {
  test("jspsych-content should have the jspsych-content class", async () => {
    const jsPsych = initJsPsych();
    
    class TestSizingPlugin implements JsPsychPlugin<any> {
      static info = {
        name: "test-sizing",
        version: "1.0.0",
        parameters: {},
        data: {},
      };
      
      constructor(private jsPsych: JsPsych) {}
      
      trial(display_element: HTMLElement, trial: any) {
        display_element.innerHTML = '<div id="test-content">Test</div>';
        
        // Check that the display element has the jspsych-content class
        expect(display_element.classList.contains("jspsych-content")).toBe(true);
        
        // Check that it's wrapped in jspsych-content-wrapper
        const contentWrapper = display_element.parentElement;
        expect(contentWrapper?.classList.contains("jspsych-content-wrapper")).toBe(true);
        
        // Check that the content wrapper is inside jspsych-display-element
        const displayContainer = contentWrapper?.parentElement;
        expect(displayContainer?.classList.contains("jspsych-display-element")).toBe(true);
        
        this.jsPsych.finishTrial();
      }
    }
    
    await jsPsych.run([
      {
        type: TestSizingPlugin,
      },
    ]);
  });

  test("jspsych-content-wrapper should exist with progress bar", async () => {
    const jsPsych = initJsPsych({
      show_progress_bar: true,
    });
    
    class TestProgressPlugin implements JsPsychPlugin<any> {
      static info = {
        name: "test-progress",
        version: "1.0.0",
        parameters: {},
        data: {},
      };
      
      constructor(private jsPsych: JsPsych) {}
      
      trial(display_element: HTMLElement, trial: any) {
        // Verify progress bar exists
        const progressBar = document.querySelector("#jspsych-progressbar-container");
        expect(progressBar).not.toBeNull();
        
        // Verify content wrapper still exists and has proper styling
        const contentWrapper = display_element.parentElement;
        expect(contentWrapper?.classList.contains("jspsych-content-wrapper")).toBe(true);
        
        // Verify display element structure
        const displayContainer = contentWrapper?.parentElement;
        expect(displayContainer?.classList.contains("jspsych-display-element")).toBe(true);
        
        // Progress bar should be a sibling of the content wrapper (both inside display element)
        expect(displayContainer?.contains(progressBar)).toBe(true);
        
        this.jsPsych.finishTrial();
      }
    }
    
    await jsPsych.run([
      {
        type: TestProgressPlugin,
      },
    ]);
  });
});
