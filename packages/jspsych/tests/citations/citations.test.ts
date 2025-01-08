import { TestExtension } from "../extensions/TestExtension";
import TestPlugin from "../TestPlugin";

const jsPsychApaCitation =
  "de Leeuw, J. R., Gilbert, R. A., & Luchterhandt, B. (2023). jsPsych: Enabling an Open-Source Collaborative Ecosystem of Behavioral Experiments. Journal of Open Source Software, 8(85), 5351. https://doi.org/10.21105/joss.05351 ";
const jsPsychBibtexCitation =
  '@article{Leeuw2023jsPsych, 	author = {de Leeuw, Joshua R. and Gilbert, Rebecca A. and Luchterhandt, Bj{\\" o}rn}, 	journal = {Journal of Open Source Software}, 	doi = {10.21105/joss.05351}, 	issn = {2475-9066}, 	number = {85}, 	year = {2023}, 	month = {may 11}, 	pages = {5351}, 	publisher = {Open Journals}, 	title = {jsPsych: Enabling an {Open}-{Source} {Collaborative} {Ecosystem} of {Behavioral} {Experiments}}, 	url = {https://joss.theoj.org/papers/10.21105/joss.05351}, 	volume = {8}, }  ';
const testPluginApaCitation = "Test plugin APA citation";
const testPluginBibtexCitation = "Test plugin BibTeX citation";
const testExtensionApaCitation = "Test extension APA citation";

let JsPsych;

/**
 * These tests are skipped if the built version of JsPsych is not found.
 * This is because the citation functionality is only available in the built version
 * due to code injections that run during the build.
 */
try {
  // Try to import built version
  JsPsych = require("../../dist/index").JsPsych;
  let jspsych: typeof JsPsych;

  // Check if getCitations exists in current built version
  if (!jspsych.hasOwnProperty("getCitations")) {
    throw new Error("getCitations not found");
  }

  beforeEach(() => {
    jspsych = new JsPsych();
  });

  describe("citing not using an array", () => {
    test("citing without input", () => {
      expect(jspsych.getCitations()).toBe(jsPsychApaCitation);
    });
    test("citing null", () => {
      expect(() => jspsych.getCitations(null)).toThrow("Expected array of plugins/extensions");
    });
    test("citing without input and with invalid format", () => {
      expect(() => jspsych.getCitations(null, "apa")).toThrow(
        "Expected array of plugins/extensionss"
      );
    });
  });

  describe("citing using an array in different formats", () => {
    test("citing empty array with APA format", () => {
      expect(jspsych.getCitations([], "apa")).toBe(jsPsychApaCitation);
    });
    test("citing empty array with BibTeX format", () => {
      expect(jspsych.getCitations([], "bibtex")).toBe(jsPsychBibtexCitation);
    });
    test("citing empty array without format", () => {
      expect(jspsych.getCitations([])).toBe(jsPsychApaCitation);
    });
    test("citing one plugin with valid format in all caps", () => {
      expect(jspsych.getCitations([TestPlugin], "APA")).toBe(
        jsPsychApaCitation + "\n" + testPluginApaCitation
      );
    });
    test("citing with unsupported format", () => {
      expect(() => jspsych.getCitations([TestPlugin], "DummyTex")).toThrow(
        "Unsupported citation format"
      );
    });
  });

  describe("citing mix of valid plugins/extensions", () => {
    test("citing a plugin", () => {
      expect(jspsych.getCitations([TestPlugin])).toBe(
        jsPsychApaCitation + "\n" + testPluginApaCitation
      );
    });
    test("citing a plugin in BibTeX", () => {
      expect(jspsych.getCitations([TestPlugin], "bibtex")).toBe(
        jsPsychBibtexCitation + "\n" + testPluginBibtexCitation
      );
    });
    test("citing multiple plugins", () => {
      expect(jspsych.getCitations([TestPlugin, TestPlugin])).toBe(
        jsPsychApaCitation + "\n" + testPluginApaCitation
      );
    });
    test("citing mix of plugins and extensions", () => {
      expect(jspsych.getCitations([TestPlugin, TestExtension])).toBe(
        jsPsychApaCitation + "\n" + testPluginApaCitation + "\n" + testExtensionApaCitation
      );
    });
  });
} catch (e) {
  // Fall back to development version if built version not found
  describe("skipping citation tests because of missing built version", () => {
    test.skip("skip", () => {
      expect(true).toBe(true);
    });
  });
}
