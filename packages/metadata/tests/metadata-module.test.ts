import JsPsychMetadata from "../src/index";

// missing displaying data modules tests
describe("JsPsychMetadata", () => {
  let jsPsychMetadata: JsPsychMetadata;

  beforeEach(() => {
    jsPsychMetadata = new JsPsychMetadata();
    jsPsychMetadata.generateDefaultMetadata();
  });

  test("#setAndGetField", () => {
    // Set metadata fields
    jsPsychMetadata.setMetadataField("citations", 100);
    jsPsychMetadata.setMetadataField("colors", ["green", "yellow", "red"]);
    jsPsychMetadata.setMetadataField("description", "Updated description that says nothing"); // update

    // Check if fields are set correctly
    expect(jsPsychMetadata.getMetadataField("citations")).toBe(100);
    expect(jsPsychMetadata.getMetadataField("colors")).toStrictEqual(["green", "yellow", "red"]);
    expect(jsPsychMetadata.getMetadataField("description")).toBe(
      "Updated description that says nothing"
    );

    // Check if unset field returns undefined
    expect(jsPsychMetadata.getMetadataField("undefinedField")).toBeUndefined();
  });

  test("#setAndGetAuthor", () => {
    const author1 = {
      name: "John Cena",
    };
    jsPsychMetadata.setAuthor(author1);
    expect(jsPsychMetadata.getAuthor("John Cena")).toStrictEqual(author1["name"]);

    author1["type"] = "WWE Pro Wrestler";
    jsPsychMetadata.setAuthor(author1);
    expect(jsPsychMetadata.getAuthor("John Cena")).toStrictEqual(author1);
  });

  test("#setAndGetVariable", () => {
    const trialType = {
      type: "PropertyValue",
      name: "trial_type",
      description: "Plugin type that has been used to run trials",
      value: "string",
    };

    jsPsychMetadata.setVariable(trialType);
    expect(jsPsychMetadata.getVariable("trial_type")).toStrictEqual(trialType);
  });

  test("#deleteVariable", () => {
    const trialType = {
      type: "PropertyValue",
      name: "trial_type",
      description: "Plugin type that has been used to run trials",
      value: "string",
    };
    jsPsychMetadata.setVariable(trialType);

    jsPsychMetadata.deleteVariable("trial_type");
    expect(jsPsychMetadata.getVariableNames()).not.toContain("trial_type");
  });

  test("#updateVariable", () => {
    const trialType = {
      type: "PropertyValue",
      name: "trial_type",
      description: {
        default: "unknown",
        jsPsych: "The name of the plugin used to run the trial.",
      },
      value: "string",
    };

    jsPsychMetadata.updateVariable("trial_type", "levels", 100);
    trialType["levels"] = [100];
    expect(jsPsychMetadata.getVariable("trial_type")).toStrictEqual(trialType);
  });
});
