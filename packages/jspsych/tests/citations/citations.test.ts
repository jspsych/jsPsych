import { initJsPsych } from "../../src";
import { TestExtension } from "../extensions/TestExtension";
import TestPlugin from "../TestPlugin";

const jsPsychApaCitation = "Test base APA citation";
const jsPsychBibtexCitation = "Test base BibTeX citation";
const testPluginApaCitation = "Test plugin APA citation";
const testPluginBibtexCitation = "Test plugin BibTeX citation";
const testExtensionApaCitation = "Test extension APA citation";

let jspsych;

beforeEach(() => {
  jspsych = initJsPsych();
  (jspsych as any).citation = {
    apa: "Test base APA citation",
    bibtex: "Test base BibTeX citation",
  };
});

describe("citing not using an array", () => {
  test("citing without input", () => {
    expect(jspsych.getCitations()).toBe(jsPsychApaCitation);
  });
  test("citing null", () => {
    expect(() => jspsych.getCitations(null)).toThrow("Expected array of plugins/extensions");
  });
  test("citing without input and with invalid format", () => {
    expect(() => jspsych.getCitations(null, "apa")).toThrow("Expected array of plugins/extensions");
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
