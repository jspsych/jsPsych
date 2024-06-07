/**
 * Custom class that stores and handles the storage, update and retrieval of variable metadata.
 *
 * @export
 * @class VariablesMap
 * @typedef {VariablesMap}
 */
export class VariablesMap {
  /**
   * Field that holds a map of the current variables allowing for fast look-up.
   *
   * @private
   * @type {{}}
   */
  private variables: {};

  /**
   *  Creates the VariablesMap bycalling generateDefaultVariables() method to
   * generate the basic metadata common to every dataset_description.json file.
   *
   * @constructor
   */
  constructor() {
    this.generateDefaultVariables();
  }

  /**
   * Generates the default variables shared between every JsPsych experiment and fills in
   * with filler descriptions for reseachers to change.
   */
  generateDefaultVariables(): void {
    this.variables = {};

    const trial_type_var = {
      type: "PropertyValue",
      name: "trial_type",
      description: "Plugin type that has been used to run trials",
      value: "string",
    };
    this.setVariable(trial_type_var);

    const trial_index_var = {
      type: "PropertyValue",
      name: "trial_index",
      description: "Position of trial in the timeline",
      value: "numeric",
    };
    this.setVariable(trial_index_var);

    const time_elapsed_var = {
      type: "PropertyValue",
      name: "time_elapsed",
      description: "Time (in ms) since the start of the experiment",
      value: "numeric",
    };
    this.setVariable(time_elapsed_var);

    const response_time_var = {
      type: "PropertyValue",
      name: "rt", // adjusted to response time
      description: "Time measured in ms participant takes to respond to a stimulus",
      value: "numeric",
    };
    this.setVariable(response_time_var);

    const internal_type_node_id = {
      type: "PropertyValue",
      name: "internal_node_id",
      description: "Internal measurements of node",
      value: "interval",
    };
    this.setVariable(internal_type_node_id);
  }

  /**
   * Returns a list of the variables instead of an object according to the Psych-DS format.
   *
   * @returns {{}[]} - The list of variables represented as objects.
   */
  getList(): {}[] {
    var var_list = [];
    for (const key of Object.keys(this.variables)) {
      var_list.push(this.variables[key]);
    }
    return var_list;
  }

  /**
   * Allows user to set a variable and includes all the fields that are possible according to
   * Psych-DS guidelines. Only requires the name field which it uses a key to map to the variable.
   * Can also be used to overwrite existing variables if they have the same name.
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
   *   }} fields - Input fields as specified by Psych-DS standards.
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
    const new_variable: { [key: string]: any } = {}; // Define an empty object to store the variables

    for (const key in fields) {
      // Check if the property is defined and not null
      if (fields[key] !== undefined && fields[key] !== null) {
        new_variable[key] = fields[key];
      }
    }

    this.variables[new_variable.name] = new_variable;
  }

  /**
   * Allows you to get information for a single variable returning empty dict if it doesn't exist.
   * Allows you to update fields but not recommended in favor of updateVariable.
   *
   * @param {string} name - Name of variable to map to.
   * @returns {{}} - Variable information or empty dict if doesn't exist
   */
  getVariable(name: string): {} {
    return this.variables[name] || {};
  }

  /**
   * Method that gets a list of the names of variables.
   *
   * @returns {string[]} - String list containing names of existing variables.
   */
  getVariableNames(): string[] {
    var var_list = [];
    for (const key of Object.keys(this.variables)) {
      var_list.push(this.variables[key]["name"]);
    }

    return var_list;
  }

  /**
   * Allows you to update a variable or add a value in the case of updating values. In other situations will
   * replace the existing value with the new value. Has special cases and logic for levels and names making it
   * easier to update variable values.
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
    const updated_var = this.getVariable(var_name);

    if (Object.keys(updated_var).length === 0) {
      // error checking to see variable exists
      console.error(`Variable "${var_name}" does not exist.`);
      return;
    }

    if (field_name === "levels") {
      // for levels adds value, creating new array if necessary
      if (!Array.isArray(updated_var["levels"])) {
        updated_var["levels"] = [];
      }
      updated_var["levels"].push(added_value);
    } else if (
      field_name === "description" &&
      (var_name === "response" || var_name === "stimulus" || var_name == "rt")
    ) {
      // getting key and value for new value for clarity
      const add_key = Object.keys(added_value)[0];
      const add_value = Object.values(added_value)[0];
      var exists = false;
      // creates map for description if doesn't exist
      if (typeof updated_var["description"] !== "object") {
        updated_var["description"] = {};
      }

      // appends key to other keys if default value/description are the same already exist to keep metadata shorter
      Object.entries(updated_var["description"]).forEach(([key, value]) => {
        if (value === add_value) {
          if (!key.includes(add_key)) {
            // substring check to see it doesn't exist
            delete updated_var["description"][key]; // deletes old version
            updated_var["description"][key + ", " + add_key] = add_value;
          }
          exists = true;
        }
      });

      // if value description doesn't exist previous, adds
      if (!exists) Object.assign(updated_var["description"], added_value); // Assuming added_value is { chatplugin: "response that user input" }
    } else if (field_name === "name") {
      const old_name = updated_var["name"];
      updated_var["name"] = added_value;
      delete this.variables[old_name];

      this.setVariable(
        updated_var as {
          type?: string;
          name: string;
          description?: string | {};
          value?: string;
          identifier?: string;
          minValue?: number;
          maxValue?: number;
          levels?: string[] | [];
          levelsOrdered?: boolean;
          na?: boolean;
          naValue?: string;
          alternateName?: string;
          privacy?: string;
        }
      );
    } else {
      updated_var[field_name] = added_value;
    }
  }

  /**
   * Allows you to delete a variable by key/name. Returns console error if not found.
   *
   * @param {string} var_name - Name of variable to be deleted.
   */
  deleteVariable(var_name: string): void {
    if (var_name in this.variables) {
      delete this.variables[var_name];
    } else {
      console.error(`Variable "${var_name}" does not exist.`);
    }
  }
}
