import { initJsPsych } from "../../dist/index.js";
import { TestExtension } from "../extensions/TestExtension";
import TestPlugin from "../TestPlugin";

const jsPsychApaCitation =
  "de Leeuw, J. R., Gilbert, R. A., & Luchterhandt, B. (2023). jsPsych: Enabling an Open-Source Collaborative Ecosystem of Behavioral Experiments. Journal of Open Source Software, 8(85), 5351. https://doi.org/10.21105/joss.05351";
const jsPsychBibtexCitation =
  '@misc{LeeuwjsPsych, 	author = {de Leeuw, Joshua R. and Gilbert, Rebecca A. and Luchterhandt, Bj{\\" o}rn}, 	doi = {10.5281/zenodo.7702307}, 	title = {jsPsych: Enabling an {Open}-{Source} {Collaborative} {Ecosystem} of {Behavioral} {Experiments}}, } @article{Leeuw2023jsPsych, 	author = {de Leeuw, Joshua R. and Gilbert, Rebecca A. and Luchterhandt, Bj{\\" o}rn}, 	journal = {Journal of Open Source Software}, 	doi = {10.21105/joss.05351}, 	issn = {2475-9066}, 	number = {85}, 	year = {2023}, 	month = {may 11}, 	pages = {5351}, 	publisher = {Open Journals}, 	title = {jsPsych: Enabling an {Open}-{Source} {Collaborative} {Ecosystem} of {Behavioral} {Experiments}}, 	url = {https://joss.theoj.org/papers/10.21105/joss.05351}, 	volume = {8}, }  ';
const testPluginApaCitation = "Test plugin APA citation";
const testPluginBibtexCitation = "Test plugin BibTeX citation";
const testExtensionApaCitation = "Test extension APA citation";

let jsPsych;
beforeEach(() => {
  jsPsych = initJsPsych();
});

describe("citing not using an array", () => {
  test("citing nothing", () => {
    const citation = jsPsych.getCitations();
    console.log(citation);
    expect(citation).toMatch(jsPsychApaCitation);
  });
  test("citing without input and with valid format", () => {
    jsPsych.getCitations(null, "apa");
    expect(consoleLogSpy.mock.calls).toHaveLength(1);
    expect(consoleLogSpy.mock.calls[0][0]).toBe(jsPsychApaCitation);
  });
  test("citing without input and with invalid format", () => {
    expect(() => jspsych.getCitations(null, "dummyTex")).toThrow("Unsupported citation format");
  });
});

describe("citing using an array in different formats", () => {
  test("citing empty array with APA format", () => {
    jspsych.getCitations([], "apa");
    expect(consoleLogSpy.mock.calls).toHaveLength(1);
    expect(consoleLogSpy.mock.calls[0][0]).toBe(jsPsychApaCitation);
  });
  test("citing empty array with BibTeX format", () => {
    jspsych.getCitations([], "bibtex");
    expect(consoleLogSpy.mock.calls).toHaveLength(1);
    expect(consoleLogSpy.mock.calls[0][0]).toBe(jsPsychBibtexCitation);
  });
  test("citing empty array without format", () => {
    jspsych.getCitations([]);
    expect(consoleLogSpy.mock.calls).toHaveLength(1);
    expect(consoleLogSpy.mock.calls[0][0]).toBe(jsPsychApaCitation);
  });
  test("citing one plugin with valid format in all caps", () => {
    const citation = jsPsych.getCitations([TestPlugin], "APA");
    expect(citation).toBe(jsPsychApaCitation + "\n" + testPluginApaCitation + "\n");
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
    expect(consoleLogSpy.mock.calls).toHaveLength(2);
    // expect(consoleLogSpy.mock.calls[0][0]).toBe(jsPsychApaCitation);
    expect(consoleLogSpy.mock.calls[1][0]).toBe(testPluginApaCitation);
  });
  test("citing a plugin in BibTeX", () => {
    jspsych.getCitations([TestPlugin], "bibtex");
    expect(consoleLogSpy.mock.calls).toHaveLength(2);
    expect(consoleLogSpy.mock.calls[0][0]).toBe(jsPsychBibtexCitation);
    expect(consoleLogSpy.mock.calls[1][0]).toBe(testPluginBibtexCitation);
  });
  test("citing multiple of the same plugins", () => {
    jspsych.getCitations([TestPlugin, TestPlugin]);
    expect(consoleLogSpy.mock.calls).toHaveLength(2);
    expect(consoleLogSpy.mock.calls[0][0]).toBe(jsPsychApaCitation);
    expect(consoleLogSpy.mock.calls[1][0]).toBe(testPluginApaCitation);
  });
  test("citing mix of plugins and extensions", () => {
    jspsych.getCitations([TestPlugin, TestExtension]);
    expect(consoleLogSpy.mock.calls).toHaveLength(3);
    expect(consoleLogSpy.mock.calls[0][0]).toBe(jsPsychApaCitation);
    expect(consoleLogSpy.mock.calls[1][0]).toBe(testPluginApaCitation);
    expect(consoleLogSpy.mock.calls[2][0]).toBe(testExtensionApaCitation);
  });
});
