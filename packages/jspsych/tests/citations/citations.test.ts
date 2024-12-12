import { JsPsych } from "../../src/JsPsych";
import { TestExtension } from "../extensions/TestExtension";
import TestPlugin from "../TestPlugin";

const testPluginApaCitation = "Test plugin APA citation";
const testPluginBibtexCitation = "Test plugin BibTeX citation";
const testExtensionApaCitation = "Test extension APA citation";

let jspsych: JsPsych;
let consoleLogSpy: jest.SpyInstance;
let consoleWarnSpy: jest.SpyInstance;

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
    expect(() => jspsych.getCitations(null, "apa")).toThrow("Expected array of plugins/extensions");
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
