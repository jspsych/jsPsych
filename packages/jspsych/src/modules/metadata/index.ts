import { JsPsych } from "../../JsPsych";
import { Author } from "./Author";
import { Variable } from "./Variable";

export class JsPsychMetadata {
  private metadata: {};
  private authors: {};
  private variables: {};

  constructor(private JsPsych: JsPsych) {
    this.generateDefaultMetaData();
  }

  setMetadataField(key: string, value: any): void {
    this.metadata[key] = value;
  }

  getMetadataField(key: string): any {
    return this.metadata[key];
  }

  // formats metadata into lists rather than dicts
  getMetadata(): {} {
    const res = this.metadata;
    const author_list = [];
    const var_list = [];

    for (const key of Object.keys(this.authors)) {
      author_list.push(this.authors[key]);
    }
    res["author"] = author_list;

    for (const key of Object.keys(this.variables)) {
      var_list.push(this.variables[key]);
    }
    res["variableMeasured"] = var_list;

    return res;
  }

  // Can update with more important information
  generateDefaultMetaData(): void {
    this.metadata = {};
    this.setMetadataField("name", "title");
    this.setMetadataField("schemaVersion", "Psych-DS 0.4.0");
    this.setMetadataField("description", "Dataset generated using JsPsych");
    this.authors = {};
    this.variables = {};
  }

  // may need to include, missing documentation in the document
  setAuthor(fields: {
    type?: string;
    ();
    name: string;
    givenName?: string; // required
    familyName?: string;
    identifier?: string; // identifier that distinguish across dataset (URL), confusing should check description
  }): void {
    if (Object.keys(fields).length == 1) {
      // if only name, just add to list without dict format, according to documentation
      this.authors[fields.name] = fields.name;
      return;
    }

    const new_variable: { [key: string]: any } = {}; // Define an empty object to store the variables
    for (const key in fields) {
      // Check if the property is defined and not null
      if (fields[key] !== undefined && fields[key] !== null) {
        new_variable[key] = fields[key];
      }
    }

    this.authors[new_variable.name] = new_variable;
  }

  setVariable(fields: {
    type?: string;
    name: string; // required
    description?: string | {};
    value?: string; // string, boolean, or number
    identifier?: string; // identifier that distinguish across dataset (URL), confusing should check description
    minValue?: number;
    maxValue?: number;
    levels?: []; // technically property values in the other one but not sure how to format it
    levelsOrdered?: boolean;
    na?: boolean;
    naValue?: string;
    alternateName?: string;
    privacy?: string;
  }): void {
    const new_variable: { [key: string]: any } = {}; // Define an empty object to store the variables

    for (const key in fields) {
      // Check if the property is defined and not null
      if (fields[key] !== undefined && fields[key] !== null) {
        new_variable[key] = fields[key];
      }
    }

    this.variables[new_variable.name] = new_variable;
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
}
