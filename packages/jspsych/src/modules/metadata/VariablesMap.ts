export class VariablesMap {
  private variables: {};

  constructor() {
    this.variables = {};
  }

  getList(): {}[] {
    var var_list = [];
    for (const key of Object.keys(this.variables)) {
      var_list.push(this.variables[key]);
    }

    return var_list;
  }

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
    if (name in this.variables) {
      return this.variables[name];
    } else return {};
  }

  replaceVariable(
    var_name: string,
    field_name: string,
    new_value: string | boolean | number
  ): void {}

  // levels, description
  updateMapping(
    var_name: string,
    field_name: string,
    added_value: string | boolean | number
  ): void {}
}
