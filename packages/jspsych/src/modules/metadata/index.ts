import { JsPsych } from "../../JsPsych";
import { AuthorsMap } from "./AuthorsMap";
import { VariablesMap } from "./VariablesMap";

export class JsPsychMetadata {
  private metadata: {};
  // private authors: {};
  private authors: AuthorsMap;
  // private variables: {};
  private variables: VariablesMap;

  constructor(private JsPsych: JsPsych) {
    this.generateDefaultMetadata();
  }

  // Can update with more important information
  generateDefaultMetadata(): void {
    this.metadata = {};
    this.setMetadataField("name", "title");
    this.setMetadataField("schemaVersion", "Psych-DS 0.4.0");
    this.setMetadataField("description", "Dataset generated using JsPsych");
    this.authors = new AuthorsMap();
    this.variables = new VariablesMap();
  }

  // Methods for accessing and setting simple fields
  setMetadataField(key: string, value: any): void {
    this.metadata[key] = value;
  }

  getMetadataField(key: string): any {
    return this.metadata[key];
  }

  // To get the final data
  getMetadata(): {} {
    const res = this.metadata;

    const author_list = this.authors.getList();
    res["author"] = author_list;

    const var_list = this.variables.getList();
    res["variableMeasured"] = var_list;

    return res;
  }

  // may need to include, missing documentation in the document
  setAuthor(fields: {
    type?: string;
    name: string;
    givenName?: string; // required
    familyName?: string;
    identifier?: string; // identifier that distinguish across dataset (URL), confusing should check description
  }): void {
    this.authors.setAuthor(fields);
  }

  getAuthor(name: string): {} {
    return this.authors.getAuthor(name);
  }

  // Simple set, get structure so taht can get fields and return
  setVariable(fields: {
    type?: string;
    name: string; // required
    description?: string | {};
    value?: string; // string, boolean, or number
    identifier?: string; // identifier that distinguish across dataset (URL), confusing should check description
    minValue?: number;
    maxValue?: number;
    levels?: string[] | []; // technically property values in the other one but not sure how to format it
    levelsOrdered?: boolean;
    na?: boolean;
    naValue?: string;
    alternateName?: string;
    privacy?: string;
  }): void {
    this.variables.setVariable(fields);

    // const new_variable: { [key: string]: any } = {}; // Define an empty object to store the variables

    // for (const key in fields) {
    //   // Check if the property is defined and not null
    //   if (fields[key] !== undefined && fields[key] !== null) {
    //     new_variable[key] = fields[key];
    //   }
    // }

    // this.variables[new_variable.name] = new_variable;
  }

  getVariable(name: string): {} {
    return this.variables.getVariable(name);
  }

  displayMetadata(): void {
    // Format the metadata as a JSON string for display
    const metadata_string = JSON.stringify(this.getMetadata(), null, 2);

    // Get the display element from jsPsych
    const display_element = this.JsPsych.getDisplayElement();

    // Set the inner HTML of the display element to include a preformatted text block
    display_element.innerHTML = '<pre id="jspsych-metadata-display"></pre>';

    // Set the text content of the preformatted text block to the metadata string
    document.getElementById("jspsych-metadata-display").textContent = metadata_string;
  }

  generateFakeMetadata(): void {
    const author1 = {
      name: "John Cena",
    };
    this.setAuthor(author1);

    const author2 = {
      name: "Wreck-it-Ralph",
      identifier: "www.google.com",
    };
    this.setAuthor(author2);

    const prop_value_var = {
      type: "PropertyValue",
      name: "Response Time (rt)",
      description: "Time participant takes to respond to a stimulus",
      value: "numeric",
      minValue: 0,
      maxValue: 10000,
    };
    this.setVariable(prop_value_var);

    const stimulus_var = {
      type: "PropertyValue",
      name: "Stimulus",
      description: {
        "<p style='text-align:center; font-size:80px;'>+</p>":
          "This is a fixation screen that helps concentrate focus",
        '["img/happy_face_1.jpg", "img/happy_face_2.jpg","img/happy_face_3.jpg"]':
          "These are different pictures of peoples faces that we using for the study",
      },
      value: "null",
      levels: [
        "<p style='text-align:center; font-size:80px;'>+</p>",
        "img/happy_face_1.jpg",
        "img/happy_face_2.jpg",
        "img/happy_face_3.jpg",
      ],
    };
    this.setVariable(stimulus_var);

    const stimulus_updated = this.getVariable("Stimulus");
    stimulus_updated["name"] = "stimulus_updated";
    stimulus_updated["levels"].push("img/test.jpg"); // pushing to levels
    Object.assign(stimulus_updated["description"], { "<h1>TestingTESTING</h1>": "shock factor" });

    return;
  }
}
