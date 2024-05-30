export class VariablesMap {
  private variables: {};

  constructor() {
    this.generateDefaultVariables();
  }

  // trial type, trial index, time elapsed, interal typenode id
  generateDefaultVariables(): void {
    this.variables = {};

    const trial_type_var = {
      type: "Property_Value",
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
      name: "rt (Response time)",
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

  getList(): {}[] {
    var var_list = [];
    for (const key of Object.keys(this.variables)) {
      var_list.push(this.variables[key]);
    }
    return var_list;
  }

  // could replace this method and instead pass in fields directly, would make it faster
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

  getVariable(name: string): {} {
    return this.variables[name] || {};
  }

  getVariableNames(): string[] {
    var var_list = [];
    for (const key of Object.keys(this.variables)) {
      var_list.push(this.variables[key]["name"]);
    }

    return var_list;
  }

  // levels, description
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
      if (!Array.isArray(updated_var["levels"])) {
        updated_var["levels"] = [];
      }
      updated_var["levels"].push(added_value);
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

  deleteVariable(var_name: string): void {
    if (var_name in this.variables) {
      delete this.variables[var_name];
    } else {
      console.error(`Variable "${var_name}" does not exist.`);
    }
  }

  deleteVariablesTest(): void {
    // this.generateFakeMetadata(); called in jsPsychMetadata function
    this.deleteVariable("trial_type");
    this.deleteVariable("trial_index");
    this.deleteVariable("stimulus_updated");
    this.deleteVariable("Response Time (rt)");
    this.deleteVariable("Stimulus");
    this.deleteVariable("internal_node_id");
    this.deleteVariable("time_elapsed");
    this.deleteVariable("rt (Response time)");
  }

  updateVariableTest(): void {
    // editing new variables
    const test_var = {
      type: "PropertyValue",
      name: "Test",
      description: "Random description",
      value: "numeric",
    };
    this.setVariable(test_var);
    this.updateVariable("Test", "levels", "<p>hello world</p>");
    this.updateVariable("Test", "levels", "<h1>BOOOOOOO</h1>");
    this.updateVariable("Test", "levels", "<p>......spot me......</p>");

    this.updateVariable("Test", "name", "NewTest");
    // jsPsych.metadata.deleteVariable("Test");
    // jsPsych.metadata.deleteVariable("NewTest");
    this.updateVariable("NewTest", "minValue", 10);
    this.updateVariable("NewTest", "description", "this is a new description");
  }

  getVariableTest(): void {
    console.log(this.getVariableNames());
    console.log(this.getVariable("trial_type"));
    console.log(this.getVariable("blablablah"));
  }
}
