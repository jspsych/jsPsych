//import { JsPsych } from "../../src/JsPsych";
import { TestExtension } from "../extensions/TestExtension";
import TestPlugin from "../TestPlugin";

const jsPsychApaCitation =
  "de Leeuw, J. R., Gilbert, R. A., & Luchterhandt, B. (2023). jsPsych: Enabling an Open-Source Collaborative Ecosystem of Behavioral Experiments. Journal of Open Source Software, 8(85), 5351. https://doi.org/10.21105/joss.05351";
const jsPsychBibtexCitation =
  '@misc{LeeuwjsPsych, 	author = {de Leeuw, Joshua R. and Gilbert, Rebecca A. and Luchterhandt, Bj{\\" o}rn}, 	doi = {10.5281/zenodo.7702307}, 	title = {jsPsych: Enabling an {Open}-{Source} {Collaborative} {Ecosystem} of {Behavioral} {Experiments}}, } @article{Leeuw2023jsPsych, 	author = {de Leeuw, Joshua R. and Gilbert, Rebecca A. and Luchterhandt, Bj{\\" o}rn}, 	journal = {Journal of Open Source Software}, 	doi = {10.21105/joss.05351}, 	issn = {2475-9066}, 	number = {85}, 	year = {2023}, 	month = {may 11}, 	pages = {5351}, 	publisher = {Open Journals}, 	title = {jsPsych: Enabling an {Open}-{Source} {Collaborative} {Ecosystem} of {Behavioral} {Experiments}}, 	url = {https://joss.theoj.org/papers/10.21105/joss.05351}, 	volume = {8}, }  ';
const testPluginApaCitation = "Test plugin APA citation";
const testPluginBibtexCitation = "Test plugin BibTeX citation";
const testExtensionApaCitation = "Test extension APA citation";

let consoleLogSpy: jest.SpyInstance;
let consoleWarnSpy: jest.SpyInstance;

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

  beforeEach(() => {
    jspsych = new JsPsych();
    consoleLogSpy = jest.spyOn(console, "log").mockImplementation();
    consoleWarnSpy = jest.spyOn(console, "warn").mockImplementation();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe("citing not using an array", () => {
    test("citing nothing", () => {
      expect(() => jspsych.getCitations(null)).toThrow("Expected array of plugins/extensions");
    });
    test("citing without input and with invalid format", () => {
      expect(() => jspsych.getCitations(null, "apa")).toThrow(
        "Expected array of plugins/extensions"
      );
    });
  });

  describe("citing using an array in different formats", () => {
    test("citing empty array with APA format", () => {
      jspsych.getCitations([], "apa");
      expect(consoleWarnSpy.mock.calls[0][0]).toBe("No plugins/extensions provided");
    });
    test("citing empty array with BibTeX format", () => {
      jspsych.getCitations([], "bibtex");
      expect(consoleWarnSpy.mock.calls[0][0]).toBe("No plugins/extensions provided");
    });
    test("citing empty array without format", () => {
      jspsych.getCitations([]);
      expect(consoleWarnSpy.mock.calls[0][0]).toBe("No plugins/extensions provided");
    });
    test("citing one plugin with valid format in all caps", () => {
      jspsych.getCitations([TestPlugin], "APA");
      expect(consoleLogSpy.mock.calls[0][0]).toBe(testPluginApaCitation);
    });
    test("citing with unsupported format", () => {
      expect(() => jspsych.getCitations([TestPlugin], "DummyTex")).toThrow(
        "Unsupported citation format"
      );
    });
  });

  describe("citing mix of valid plugins/extensions", () => {
    test("citing a plugin", () => {
      jspsych.getCitations([TestPlugin]);
      expect(consoleLogSpy.mock.calls[0][0]).toBe(testPluginApaCitation);
    });
    test("citing a plugin in BibTeX", () => {
      jspsych.getCitations([TestPlugin], "bibtex");
      expect(consoleLogSpy.mock.calls[0][0]).toBe(testPluginBibtexCitation);
    });
    test("citing multiple plugins", () => {
      jspsych.getCitations([TestPlugin, TestPlugin]);
      expect(consoleLogSpy.mock.calls).toHaveLength(2);
      expect(consoleLogSpy.mock.calls[0][0]).toBe(testPluginApaCitation);
      expect(consoleLogSpy.mock.calls[1][0]).toBe(testPluginApaCitation);
    });
    test("citing mix of plugins and extensions", () => {
      jspsych.getCitations([TestPlugin, TestExtension]);
      expect(consoleLogSpy.mock.calls).toHaveLength(2);
      expect(consoleLogSpy.mock.calls[0][0]).toBe(testPluginApaCitation);
      expect(consoleLogSpy.mock.calls[1][0]).toBe(testExtensionApaCitation);
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
