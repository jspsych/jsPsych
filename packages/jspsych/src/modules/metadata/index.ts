import { JsPsych } from "../../JsPsych";
import { AuthorsMap } from "./AuthorsMap";
import { VariablesMap } from "./VariablesMap";

/**
 * Description placeholder
 *
 * @export
 * @class JsPsychMetadata
 * @typedef {JsPsychMetadata}
 */
export class JsPsychMetadata {
  /**
   * Description placeholder
   *
   * @private
   * @type {{}}
   */
  private metadata: {};
  /**
   * Description placeholder
   *
   * @private
   * @type {AuthorsMap}
   */
  private authors: AuthorsMap;
  /**
   * Description placeholder
   *
   * @private
   * @type {VariablesMap}
   */
  private variables: VariablesMap;

  /**
   * Creates an instance of JsPsychMetadata.
   *
   * @constructor
   * @param {JsPsych} JsPsych
   */
  constructor(private JsPsych: JsPsych) {
    this.generateDefaultMetadata();
  }

  // Can update with more important information
  /**
   * Description placeholder
   */
  generateDefaultMetadata(): void {
    this.metadata = {};
    this.setMetadataField("name", "title");
    this.setMetadataField("schemaVersion", "Psych-DS 0.4.0");
    this.setMetadataField("description", "Dataset generated using JsPsych");
    this.authors = new AuthorsMap();
    this.variables = new VariablesMap();
  }

  // Methods for accessing and setting simple fields
  /**
   * Description placeholder
   *
   * @param {string} key
   * @param {*} value
   */
  setMetadataField(key: string, value: any): void {
    this.metadata[key] = value;
  }

  /**
   * Description placeholder
   *
   * @param {string} key
   * @returns {*}
   */
  getMetadataField(key: string): any {
    return this.metadata[key];
  }

  // To get the final data
  /**
   * Description placeholder
   *
   * @returns {{}}
   */
  getMetadata(): {} {
    const res = this.metadata;
    res["author"] = this.authors.getList();
    res["variableMeasured"] = this.variables.getList();

    return res;
  }

  // may need to include, missing documentation in the document
  /**
   * Description placeholder
   *
   * @param {{
   *     type?: string;
   *     name: string;
   *     givenName?: string; // required
   *     familyName?: string;
   *     identifier?: string; // identifier that distinguish across dataset (URL), confusing should check description
   *   }} fields
   */
  setAuthor(fields: {
    type?: string;
    name: string;
    givenName?: string; // required
    familyName?: string;
    identifier?: string; // identifier that distinguish across dataset (URL), confusing should check description
  }): void {
    this.authors.setAuthor(fields);
  }

  /**
   * Description placeholder
   *
   * @param {string} name
   * @returns {{}}
   */
  getAuthor(name: string): {} {
    return this.authors.getAuthor(name);
  }

  // Simple set will overwrite, get structure so that can get fields and return
  /**
   * Description placeholder
   *
   * @param {{
   *     type?: string;
   *     name: string; // required
   *     description?: string | {};
   *     value?: string; // string, boolean, or number
   *     identifier?: string; // identifier that distinguish across dataset (URL), confusing should check description
   *     minValue?: number;
   *     maxValue?: number;
   *     levels?: string[] | []; // technically property values in the other one but not sure how to format it
   *     levelsOrdered?: boolean;
   *     na?: boolean;
   *     naValue?: string;
   *     alternateName?: string;
   *     privacy?: string;
   *   }} fields
   */
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
  }

  // saving a variable
  /**
   * Description placeholder
   *
   * @param {string} name
   * @returns {{}}
   */
  getVariable(name: string): {} {
    return this.variables.getVariable(name);
  }

  /**
   * Description placeholder
   *
   * @param {string} var_name
   * @param {string} field_name
   * @param {(string | boolean | number | {})} added_value
   */
  updateVariable(
    var_name: string,
    field_name: string,
    added_value: string | boolean | number | {}
  ): void {
    this.variables.updateVariable(var_name, field_name, added_value);
  }

  /**
   * Description placeholder
   *
   * @param {string} var_name
   */
  deleteVariable(var_name: string): void {
    this.variables.deleteVariable(var_name);
  }

  /**
   * Description placeholder
   *
   * @returns {string[]}
   */
  getVariableNames(): string[] {
    return this.variables.getVariableNames();
  }

  // display at the end of the experiment
  /**
   * Description placeholder
   */
  displayMetadata(elementId = "jspsych-metadata-display") {
    const metadata_string = JSON.stringify(this.getMetadata(), null, 2);
    const display_element = this.JsPsych.getDisplayElement();
    display_element.innerHTML += `<p id="jspsych-metadata-header">Metadata</p><pre id="${elementId}" class="jspsych-preformat"></pre>`;
    document.getElementById(elementId).textContent = metadata_string;
  }

  // Method to save metadata as JSON file
  /**
   * Description placeholder
   */
  saveAsJsonFile(): void {
    const jsonString = JSON.stringify(this.getMetadata(), null, 2);
    const blob = new Blob([jsonString], { type: "application/json" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "dataset_description.json";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    URL.revokeObjectURL(url);
  }

  // method testing different get and set methods and generating fake metadata
  /**
   * Description placeholder
   */
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

    return;
  }
}
