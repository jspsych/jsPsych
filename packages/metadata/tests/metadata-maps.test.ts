import { AuthorsMap } from "../src/AuthorsMap";
import { VariablesMap } from "../src/VariablesMap";
import { VariableFields } from "../src/VariablesMap";

const author_data = [
  {
    name: "John Cena",
    identifier: "www.johncena.com",
  },
  {
    name: "Barrack Obama",
  },
  {
    type: "Author",
    name: "Donald Trump",
  },
  {
    type: "Contributor",
    name: "Stan Johnson",
    givenName: "Julio Jones",
    familyName: "Aaron",
    identifier: "www.stantheman",
  },
];

describe("AuthorsMap", () => {
  let authors: AuthorsMap;

  beforeEach(() => {
    authors = new AuthorsMap();
    for (const a of author_data) {
      authors.setAuthor(a);
    }
  });

  test("#setAndGetAuthor", () => {
    expect(authors.getAuthor(author_data[0]["name"])).toStrictEqual(author_data[0]);
    expect(authors.getAuthor(author_data[1]["name"])).toStrictEqual(author_data[1]["name"]); // when only name, writes string not object according to Psych-DS standards
    expect(authors.getAuthor(author_data[2]["name"])).toStrictEqual(author_data[2]);
    expect(authors.getAuthor(author_data[3]["name"])).toStrictEqual(author_data[3]);
  });

  test("#setOverwrite", () => {
    const newJohnCena = {
      type: "WWE Pro Wrestler",
      name: "John Cena",
    };

    authors.setAuthor(newJohnCena);
    expect(authors.getAuthor("John Cena")).toStrictEqual(newJohnCena);
    expect(authors.getAuthor("John Cena")).not.toStrictEqual(author_data[0]);
  });

  test("#getList", () => {
    const compare: (VariableFields | {})[] = [];

    for (const a of author_data) {
      compare.push(authors.getAuthor(a["name"]));
    }

    expect(authors.getList()).toStrictEqual(compare);
  });
});

const variable_data = [
  {
    type: "PropertyValue",
    name: "trial_type",
    description: {
      default: "unknown",
      jsPsych: "The name of the plugin used to run the trial.",
    },
    value: "string",
  },
  {
    type: "PropertyValue",
    name: "trial_index",
    description: {
      default: "unknown",
      jsPsych: "The index of the current trial across the whole experiment.",
    },
    value: "numeric",
  },
  {
    type: "PropertyValue",
    name: "time_elapsed",
    description: {
      default: "unknown",
      jsPsych:
        "The number of milliseconds between the start of the experiment and when the trial ended.",
    },
    value: "numeric",
  },
];

describe("VariablesMap", () => {
  let variablesMap: VariablesMap;

  beforeEach(() => {
    variablesMap = new VariablesMap(); // generates the default
    // variablesMap = new VariablesMap();
    // for (const v of variable_data) {
    //   variablesMap.setVariable(v);
    // }
  });

  test("#setAndGetVariable", () => {
    expect(variablesMap.getVariable(variable_data[0]["name"])).toStrictEqual(variable_data[0]);
    expect(variablesMap.getVariable(variable_data[1]["name"])).toStrictEqual(variable_data[1]);
    expect(variablesMap.getVariable(variable_data[2]["name"])).toStrictEqual(variable_data[2]);
  });

  test("#setOverwrite", () => {
    const newTrialType: VariableFields = {
      type: "PropertyValue",
      name: "trial_type",
      description: {
        default: "different fields",
        jsPsych: "checking what this is",
      },
      value: "string",
    };

    variablesMap.setVariable(newTrialType);
    expect(variablesMap.getVariable("trial_type")).toStrictEqual(newTrialType);
    expect(variablesMap.getVariable("trial_type")).not.toStrictEqual(variable_data[0]);
  });

  test("#getList", () => {
    const compare: (VariableFields | {})[] = [];

    for (const v of variable_data) {
      compare.push(variablesMap.getVariable(v["name"]));
    }

    expect(variablesMap.getList()).toStrictEqual(compare);
  });

  test("#deleteVariables", () => {
    variablesMap.deleteVariable("trial_type");
    variablesMap.deleteVariable("trial_index");
    variablesMap.deleteVariable("time_elapsed");

    expect(variablesMap.getList().length).toBe(0);
  });

  // // updating normal variable (exists and doesn't exist)
  test("#updateNormalVariables", () => {
    const compare = {
      type: "PropertyValue",
      name: "trial_type",
      description: {
        default: "unknown",
        jsPsych: "The name of the plugin used to run the trial.",
      },
      value: "string",
    };

    const new_description = { plugin: "new description that is super informative!" };
    const new_min_value = 0;
    const new_max_value = 100;

    variablesMap.updateVariable("trial_type", "description", new_description);
    variablesMap.updateVariable("trial_type", "minValue", new_min_value);
    variablesMap.updateVariable("trial_type", "maxValue", new_max_value);

    compare.description = { ...compare.description, ...new_description };
    compare["minValue"] = new_min_value;
    compare["maxValue"] = new_max_value;

    expect(variablesMap.getVariable("trial_type")).toStrictEqual(compare);
  });

  test("#updateLevels", () => {
    interface Compare {
      type: string;
      name: string;
      description: {};
      value: string;
      levels: any[]; // Use specific type if known, e.g., string[] if levels contain strings
    }

    const compare: Compare = {
      type: "PropertyValue",
      name: "trial_type",
      description: {
        default: "unknown",
        jsPsych: "The name of the plugin used to run the trial.",
      },
      value: "string",
      levels: [],
    };

    const level1: string = "<p>hello world</p>";
    const level2: string = "<h1>BOOOOOOO</h1>";
    const level3: string = "<p>......spot me......</p>";

    variablesMap.updateVariable("trial_type", "levels", level1);
    variablesMap.updateVariable("trial_type", "levels", level2);
    variablesMap.updateVariable("trial_type", "levels", level3);

    compare["levels"].push(level1);
    compare["levels"].push(level2);
    compare["levels"].push(level3);

    expect(variablesMap.getVariable("trial_type")).toStrictEqual(compare);
  });

  // // updating name (checking references)
  test("#updatingName", () => {
    const compare = {
      type: "PropertyValue",
      name: "trial_type",
      description: {
        default: "unknown",
        jsPsych: "The name of the plugin used to run the trial.",
      },
      value: "string",
    };
    const newName = "trial_type_updated";

    variablesMap.updateVariable("trial_type", "name", newName);
    compare["name"] = newName;

    expect(variablesMap.getVariable(newName)).toStrictEqual(compare);
  });
});
