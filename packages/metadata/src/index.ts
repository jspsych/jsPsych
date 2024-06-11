import { JsPsych } from "jspsych";

import { AuthorsMap } from "./AuthorsMap";
import { VariablesMap } from "./VariablesMap";

/**
 * Class that handles the storage, update and retrieval of Metadata.
 *
 * @export
 * @class JsPsychMetadata
 * @typedef {JsPsychMetadata}
 */
export default class JsPsychMetadata {
  /**
   * Field that contains all metadata fields that aren't represented as a list.
   *
   * @private
   * @type {{}}
   */
  private metadata: {};
  /**
   * Custom class that stores and handles the storage, update and retrieval of author metadata.
   *
   * @private
   * @type {AuthorsMap}
   */
  private authors: AuthorsMap;
  /**
   * Custom class that stores and handles the storage, update and retrieval of variable metadata.
   *
   * @private
   * @type {VariablesMap}
   */
  private variables: VariablesMap;

  /** The cache is a dictionary of dictionaries, with the outer dictionary keyed by type of plugin
   * and the inner dictionary keyed by variableName. This is so that even if we have two variables
   * with the same name in different plugins, we can store their descriptions separately.
   * @private
   * @type {{}}
   */
  private cache: {};

  /**
   * Creates an instance of JsPsychMetadata while passing in JsPsych object to have access to context
   *  allowing it to access the screen printing information.
   *
   * @constructor
   * @param {JsPsych} JsPsych
   */
  constructor(private JsPsych: JsPsych) {
    this.generateDefaultMetadata();
  }
  /**
   * Method that fills in JsPsychMetadata class with all the universal fields with default information.
   * This is automatically called whenever creating an instance of JsPsychMetadata and indicates all
   * the required fields that need to filled in to be Psych-DS compliant.
   */
  generateDefaultMetadata(): void {
    this.metadata = {};
    this.setMetadataField("name", "title");
    this.setMetadataField("schemaVersion", "Psych-DS 0.4.0");
    this.setMetadataField("@context", "https://schema.org");
    this.setMetadataField("@type", "Dataset");
    this.setMetadataField("description", "Dataset generated using JsPsych");
    this.authors = new AuthorsMap();
    this.variables = new VariablesMap();
    this.cache = {};
  }

  /**
   * Method that sets simple metadata fields. This method can also be used to update/overwrite existing fields.
   *
   * @param {string} key - Metadata field name
   * @param {*} value - Data associated with the field
   */
  setMetadataField(key: string, value: any): void {
    this.metadata[key] = value;
  }

  /**
   * Simple get that accesses the data associated with a field.
   *
   * @param {string} key - Field name
   * @returns {*} - Data associated with the field
   */
  getMetadataField(key: string): any {
    return this.metadata[key];
  }

  /**
   * Returns the final Metadata in a single javascript object. Bundles together the author and variables
   * together in a list rather than object compliant with Psych-DS standards.
   *
   * @returns {{}} - Final Metadata object
   */
  getMetadata(): {} {
    const res = this.metadata;
    res["author"] = this.authors.getList();
    res["variableMeasured"] = this.variables.getList();

    return res;
  }

  /**
   * Method that creates an author. This method can also be used to overwrite existing authors
   * with the same name in order to update fields.
   *
   * @param {{
   *     type?: string;
   *     name: string;
   *     givenName?: string;
   *     familyName?: string;
   *     identifier?: string;
   *   }} fields - All the required or possible fields associated with listing an author according to Psych-DS standards.
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
   * Method that fetches an author object allowing user to update (in existing workflow should not be necessary).
   *
   * @param {string} name - Name of author to be used as key.
   * @returns {{}} - Object with author information.
   */
  getAuthor(name: string): {} {
    return this.authors.getAuthor(name);
  }

  /**
   * Method that creates a variable. This method can also be used to overwrite variables with the same name
   * as a way to update fields.
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
   *   }} fields - Fields associated with the current Psych-DS standard.
   */
  setVariable(fields: {
    type?: string;
    name: string; // required
    description?: string | {};
    value?: string; // string, boolean, or number
    identifier?: string; // identifier that distinguish across dataset (URL)
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

  /**
   * Allows you to access a variable's information by using the name of the variable. Can
   * be used to update fields within a variable, but suggest using updateVariable() to prevent errors.
   *
   * @param {string} name - Name of variable to be accessed
   * @returns {{}} - Returns object of fields
   */
  getVariable(name: string): {} {
    return this.variables.getVariable(name);
  }

  containsVariable(name: string): boolean {
    return this.variables.containsVariable(name);
  }

  /**
   * Allows you to update a variable or add a value in the case of updating values. In other situations will
   * replace the existing value with the new value.
   *
   * @param {string} var_name - Name of variable to be updated.
   * @param {string} field_name - Name of field to be updated.
   * @param {(string | boolean | number | {})} added_value - Value to be used in the update.
   */
  updateVariable(
    var_name: string,
    field_name: string,
    added_value: string | boolean | number | {}
  ): void {
    this.variables.updateVariable(var_name, field_name, added_value);
  }

  /**
   * Allows you to delete a variable by key/name.
   *
   * @param {string} var_name - Name of variable to be deleted.
   */
  deleteVariable(var_name: string): void {
    this.variables.deleteVariable(var_name);
  }

  /**
   * Gets a list of all the variable names.
   *
   * @returns {string[]} - List of variable string names.
   */
  getVariableNames(): string[] {
    return this.variables.getVariableNames();
  }

  /**
   * Method that allows you to display metadata at the end of an experiment.
   *
   * @param {string} [elementId="jspsych-metadata-display"] - Id for how to style the metadata. Defaults to default styling.
   */
  displayMetadata(display_element) {
    const elementId = "jspsych-metadata-display";
    const metadata_string = JSON.stringify(this.getMetadata(), null, 2);
    // const display_element = this.JsPsych.getDisplayElement();
    display_element.innerHTML += `<p id="jspsych-metadata-header">Metadata</p><pre id="${elementId}" class="jspsych-preformat"></pre>`;
    document.getElementById(elementId).textContent += metadata_string;
  }

  /**
   * Method that begins a download for the dataset_description.json at the end of experiment.
   * Allows you to download the metadat.
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

  /**
   * Parses a CSV string into a JSON object.
   *
   * @param {string} csv - The CSV string to be parsed.
   * @returns {Array<Object>} - The parsed JSON object.
   */
  private parseCSV(csv) {
    const lines = csv.split("\n");
    const headers = lines[0].split(",").map((header) => header.trim());
    const result = [];

    for (let i = 1; i < lines.length; i++) {
      const obj = {};
      const currentline = lines[i].split(",");

      headers.forEach((header, index) => {
        obj[header] = currentline[index] ? currentline[index].trim() : "";
      });

      result.push(obj);
    }

    return result;
  }

  /**
   * Generates observations based on the input data and processes optional metadata.
   *
   * This method accepts data, which can be an array of observation objects, a JSON string,
   * or a CSV string. If the data is in CSV format, set the `csv` parameter to `true` to
   * parse it into a JSON object. Each observation is processed asynchronously using the
   * `generateObservation` method. Optionally, metadata can be provided in the form of an
   * object, and each key-value pair in the metadata object will be processed by the
   * `processMetadata` method.
   *
   * @async
   * @param {Array|String} data - The data to generate observations from. Can be an array of objects, a JSON string, or a CSV string.
   * @param {Object} [metadata={}] - Optional metadata to be processed. Each key-value pair in this object will be processed individually.
   * @param {boolean} [csv=false] - Flag indicating if the data is in CSV format. If true, the data will be parsed as CSV.
   */
  async generate(data, metadata = {}, csv = false) {
    // have it so that can pass in a dict of object that the researcher wants to do
    // make it so that help
    if (csv) data = this.parseCSV(data);
    else if (typeof data === "string") {
      data = JSON.parse(data);
    }

    if (typeof data !== "object") {
      console.error("Unable to parse data object object, not in correct format");
      return;
    }

    for (const observation of data) {
      await this.generateObservation(observation);
    }

    for (const key in metadata) {
      this.processMetadata(metadata, key);
    }
  }

  private async generateObservation(observation) {
    // variables can be thought of mapping of one column in a row
    const pluginType = observation["trial_type"];
    const ignored_fields = new Set(["trial_type", "trial_index", "time_elapsed"]);

    for (const variable in observation) {
      const value = observation[variable];

      if (ignored_fields.has(variable)) this.updateFields(variable, value, typeof value);
      else await this.generateMetadata(variable, value, pluginType);
    }
  }

  private async generateMetadata(variable, value, pluginType) {
    // probably should work in a call to the plugin here
    const description = await this.getPluginInfo(pluginType, variable);
    const new_description = description
      ? { [pluginType]: description }
      : { [pluginType]: "unknown" };
    const type = typeof value;

    if (!this.containsVariable(variable)) {
      // probs should have update description called here
      const new_var = {
        type: "PropertyValue",
        name: variable,
        description: { default: "unknown" },
        value: type,
      };
      this.setVariable(new_var);
    }

    // hit the update variable decription fields
    this.updateVariable(variable, "description", new_description);
    this.updateFields(variable, value, type);
  }

  private updateFields(variable, value, type) {
    // calls updates where updateVariable handles logic
    if (type === "number") {
      this.updateVariable(variable, "minValue", value); // technically can refactor one call to do both but makes confusing
      this.updateVariable(variable, "maxValue", value);
      return;
    }
    // calls updates where updateVariable handles logic
    if (type !== "number" && type !== "object") {
      this.updateVariable(variable, "levels", value);
    }
  }

  private processMetadata(metadata, key) {
    const value = metadata[key];

    // iterating through variables metadata
    if (key === "variables") {
      if (typeof value !== "object" || value === null) {
        console.warn("Variable object is either null or incorrect type");
        return;
      }

      // all of the variables must already exist because should have datapoints
      for (let variable_key in value) {
        if (!this.containsVariable(variable_key)) {
          console.warn("Metadata does not contain variable:", variable_key);
          continue;
        }

        const variable_parameters = value[variable_key];

        if (typeof variable_parameters !== "object" || variable_parameters === null) {
          console.warn(
            "Parameters of variable:",
            variable_key,
            "is either null or incorrect type. The value",
            variable_parameters,
            "is either null or not an object."
          );
          continue;
        }

        // calling updates for each of the renamed parameters within variable/errors handled by method call
        for (const parameter in variable_parameters) {
          const parameter_value = variable_parameters[parameter];
          this.updateVariable(variable_key, parameter, parameter_value);
          if (parameter === "name") variable_key = parameter_value; // renames future instances if changing name
        }
      }
    } // iterating through each individual author class
    else if (key === "author") {
      if (typeof value !== "object" || value === null) {
        console.warn("Author object is not correct type");
        return;
      }

      for (const author_key in value) {
        const author = value[author_key];
        if (!("name" in author)) author["name"] = author_key;
        this.setAuthor(author);
      }
    } else this.setMetadataField(key, value);
  }

  /**
   * Gets the description of a variable in a plugin by fetching the source code of the plugin
   * from a remote source (usually unpkg.com) as a string, passing the script to getJsdocsDescription
   * to extract the description for the variable (present as JSDoc); caches the result for future use.
   *
   * @param {string} pluginType - The type of the plugin for which information is to be fetched.
   * @param {string} variableName - The name of the variable for which information is to be fetched.
   * @returns {Promise<string|null>} The description of the plugin variable if found, otherwise null.
   * @throws Will throw an error if the fetch operation fails.
   */
  private async getPluginInfo(pluginType: string, variableName: string) {
    // Check if the cache for the pluginType exists, if not initialize it
    if (!this.cache[pluginType]) this.cache[pluginType] = {};

    // If the variable already exists in the cache for the plugin, return the cached value
    if (variableName in this.cache[pluginType]) {
      return this.cache[pluginType][variableName];
    }
    // If not, we proceed to fetch script:

    // Construct the URL for the unpkg service
    const unpkgUrl = `https://unpkg.com/@jspsych/plugin-${pluginType}/src/index.ts`;

    try {
      // Fetch the script content from the unpkg URL
      const response = await fetch(unpkgUrl);
      const scriptContent = await response.text();

      // Extract the JSDoc description for the variable from the script content
      const description = this.getJsdocsDescription(scriptContent, variableName);

      // Check again if the cache for the pluginType exists, if not initialize it
      if (!this.cache[pluginType]) this.cache[pluginType] = {};

      // Cache the description for the variable in the pluginType cache
      this.cache[pluginType][variableName] = description;

      // Return the description
      return description;
    } catch (error) {
      console.error(`Failed to fetch info from ${unpkgUrl}:`, error);
      // Error is likely due to 1)a fetch failure, or 2)no JSDoc comments in the script content matched.

      //HANDLE FETCH FAILURE CASES

      // In case of the latter, we cache the null value to prevent repeated fetch attempts.

      if (!this.cache[pluginType]) this.cache[pluginType] = {};

      this.cache[pluginType][variableName] = null;

      return null;
    }
  }

  /**
   * Extracts the description for a variable of a plugin from the JSDoc comments present in the script of the plugin. The script content is
   * drawn from the remotely hosted source file of the plugin through getPluginInfo. The script content is taken
   * as a string and Regex is used to extract the description.
   *
   *
   * @param {string} scriptContent - The content of the script from which the JSDoc description is to be extracted.
   * @param {string} variableName - The name of the variable for which the JSDoc description is to be extracted.
   * @returns {string} The extracted JSDoc description, cleaned and trimmed.
   */
  private getJsdocsDescription(scriptContent: string, variableName: string) {
    // Regex to match part of the content that starts with 'parameters:' and ends with '};', which
    // is parameters info. THIS MUST BE CHANGED TO data FOR NEW PLUGIN LAYOUT
    const paramRegex = scriptContent.match(/parameters:\s*{([\s\S]*?)};\s*/).join();

    // Regex that matches everything up to the variable name
    const regex = new RegExp(`((.|\n)*)(?=${variableName}:)`);

    // Regex on paramRegex, to get everything from 'paramaters:' to the variable name.
    const variableRegex = paramRegex.match(regex)[0];

    // Finds the index of the last occurence of `/**` in the variableRegex string, and slices it from there
    // to give the JSDoc comment for our variable.
    const descrip = variableRegex.slice(variableRegex.lastIndexOf("/**"));

    // Regex to remove the leading and trailing '/**' and '*/' characters.
    const clean = descrip.match(/(?<=\*\*)([\s\S]*?)(?=\*\/)/)[1];

    //CLEANING:
    // Regex to remove all newline characters.
    const cleaner = clean.replace(/(\r\n|\n|\r)/gm, "");

    // Remove all '*' characters from the JSDoc comment.
    const cleanest = cleaner.replace(/\*/gm, "");

    // Return the cleaned JSDoc comment, trimmed of leading and trailing whitespace
    return cleanest.trim();
  }
}
