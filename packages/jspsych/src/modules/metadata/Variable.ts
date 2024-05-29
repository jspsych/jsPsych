export class Variable {
  private type: string;
  private name: string;
  private description: string;
  private value: string;
  private minValue: number;
  private maxValue: number;

  constructor() {
    this.type = "";
    this.name = "";
    this.description = "";
    this.value = "";
    this.minValue = 0;
    this.maxValue = 0;
  }

  // getFields() : {} {
  //   // might need to define more or less, maybe make if it it's empty or 0 just not to be included

  // }

  // Method to set multiple fields at once
  setFields(fields: {
    type?: string;
    name?: string;
    description?: string;
    value?: string;
    minValue?: number;
    maxValue?: number;
  }): this {
    if (fields.type !== undefined) {
      this.type = fields.type;
    }
    if (fields.name !== undefined) {
      this.name = fields.name;
    }
    if (fields.description !== undefined) {
      this.description = fields.description;
    }
    if (fields.value !== undefined) {
      this.value = fields.value;
    }
    if (fields.minValue !== undefined) {
      this.minValue = fields.minValue;
    }
    if (fields.maxValue !== undefined) {
      this.maxValue = fields.maxValue;
    }
    return this; // For method chaining
  }
}
