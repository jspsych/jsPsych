import { AuthorFields, AuthorsMap } from "./AuthorsMap";
import { PluginCache } from "./PluginCache";
import { VariableFields, VariablesMap } from "./VariablesMap";

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
  /**;
   * Custom class that stores and handles the storage, update and retrieval of variable metadata.
   *
   * @private
   * @type {VariablesMap}
   */
  private variables: VariablesMap;

  private pluginCache: PluginCache;

  /**
   * Creates an instance of JsPsychMetadata while passing in JsPsych object to have access to context
   *  allowing it to access the screen printing information.
   *
   * @constructor
   * @param {JsPsych} JsPsych
   */
  constructor() {
    this.metadata = {};
    // generates default metadata
    this.setMetadataField("name", "title");
    this.setMetadataField("schemaVersion", "Psych-DS 0.4.0");
    this.setMetadataField("@context", "https://schema.org");
    this.setMetadataField("@type", "Dataset");
    this.setMetadataField("description", "Dataset generated using JsPsych");
    this.authors = new AuthorsMap();
    this.variables = new VariablesMap();
    this.pluginCache = new PluginCache();
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
   * @param {AuthorFields | string} author - All the required or possible fields associated with listing an author according to Psych-DS standards. Option as a string to define an author according only to name.
   */
  setAuthor(fields: AuthorFields): void {
    this.authors.setAuthor(fields); // Assuming `authors` is an instance of the AuthorsMap class
  }

  /**
   * Method that fetches an author object allowing user to update (in existing workflow should not be necessary).
   *
   * @param {string} name - Name of author to be used as key.
   * @returns {(AuthorFields | string | {})} - Object with author information. Empty object if not found.
   */
  getAuthor(name: string): AuthorFields | string | {} {
    return this.authors.getAuthor(name);
  }

  /**
   * Method that creates a variable. This method can also be used to overwrite variables with the same name
   * as a way to update fields.
   *
   * @param {{
   *     @type?: string;
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
  setVariable(variable: VariableFields): void {
    this.variables.setVariable(variable);
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
   * Function to convert string csv into a javascript json object.
   *
   * Created by reversing function in datamodule using ChatGPT.
   *
   * @private
   * @param {*} csv - CSV that is represented as string
   * @returns {*} - Returns a json object
   */
  private CSV2JSON(csvString) {
    const lines = csvString.split("\r\n");
    const result = [];
    const headers = lines[0].split(",").map((header) => header.replace(/""/g, '"').slice(1, -1));

    for (let i = 1; i < lines.length; i++) {
      if (!lines[i]) continue; // Skip empty lines
      const obj = {};
      const currentLine = lines[i]
        .split(",")
        .map((value) => value.replace(/""/g, '"').slice(1, -1));

      headers.forEach((header, index) => {
        const value = currentLine[index];
        if (value !== undefined && value !== "") {
          if (!isNaN(value)) {
            obj[header] = parseFloat(value); // Convert to number if possible
          } else if (value.toLowerCase() === "null") {
            obj[header] = null; // Set as null if the string is "null"
          } else {
            try {
              obj[header] = JSON.parse(value); // Try to parse as JSON (handles objects and arrays)
            } catch (e) {
              obj[header] = value; // Use the string value if parsing fails
            }
          }
        }
        // If value is undefined or empty, skip adding it to the object
      });

      if (Object.keys(obj).length > 0) {
        result.push(obj);
      }
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
   * @param {boolean} [csv=false] - Flag indicating if the data is in a string CSV. If true, the data will be parsed as CSV.
   */
  async generate(data, metadata = {}, csv = false) {
    if (csv) {
      data = this.CSV2JSON(data);
    } else if (typeof data === "string") {
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
    const version = observation["version"] ? observation["version"] : null; // changed
    const pluginType = observation["trial_type"];
    const extensionType = observation["extension_type"]; // fix for non-list (single item extension)
    const extensionVersion = observation["extension_version"];
    const ignored_fields = new Set(["trial_type", "trial_index", "time_elapsed"]);

    for (const variable in observation) {
      const value = observation[variable];

      if (value === null || value === undefined) continue; // Error checking

      if (ignored_fields.has(variable)) this.updateFields(variable, value, typeof value);
      else {
        await this.generateMetadata(variable, value, pluginType, version);
        extensionType
          ? extensionType.forEach((ext, index) =>
              this.generateMetadata(variable, value, ext, extensionVersion[index])
            ) // verify
          : console.log("No extensionType");
      }
    }
  }

  private async generateMetadata(variable, value, pluginType, version?) {
    // probably should work in a call to the plugin here
    const pluginInfo = await this.getPluginInfo(pluginType, variable, version);
    const description = pluginInfo["description"];
    const new_description = description
      ? { [pluginType]: description }
      : { [pluginType]: "unknown" };
    const type = typeof value;

    if (!this.containsVariable(variable)) {
      // probs should have update description called here
      const new_var = {
        "@type": "PropertyValue",
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

        if (typeof author !== "string" && !("name" in author)) author["name"] = author_key; // handles string case and empty name (uses handle)

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
  private async getPluginInfo(pluginType: string, variableName: string, version?) {
    return this.pluginCache.getPluginInfo(pluginType, variableName, version);
  }
}
