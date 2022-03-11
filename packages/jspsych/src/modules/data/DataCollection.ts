import { deepCopy } from "../utils";
import { DataColumn } from "./DataColumn";
import { JSON2CSV, saveTextToFile } from "./utils";

export class DataCollection {
  private trials: any[];

  constructor(data = []) {
    this.trials = data;
  }

  push(new_data) {
    this.trials.push(new_data);
    return this;
  }

  join(other_data_collection: DataCollection) {
    this.trials = this.trials.concat(other_data_collection.values());
    return this;
  }

  top() {
    if (this.trials.length <= 1) {
      return this;
    } else {
      return new DataCollection([this.trials[this.trials.length - 1]]);
    }
  }

  /**
   * Queries the first n elements in a collection of trials.
   *
   * @param n A positive integer of elements to return. A value of
   *          n that is less than 1 will throw an error.
   *
   * @return First n objects of a collection of trials. If fewer than
   *         n trials are available, the trials.length elements will
   *         be returned.
   *
   */
  first(n = 1) {
    if (n < 1) {
      throw `You must query with a positive nonzero integer. Please use a
               different value for n.`;
    }
    if (this.trials.length === 0) return new DataCollection();
    if (n > this.trials.length) n = this.trials.length;
    return new DataCollection(this.trials.slice(0, n));
  }

  /**
   * Queries the last n elements in a collection of trials.
   *
   * @param n A positive integer of elements to return. A value of
   *          n that is less than 1 will throw an error.
   *
   * @return Last n objects of a collection of trials. If fewer than
   *         n trials are available, the trials.length elements will
   *         be returned.
   *
   */
  last(n = 1) {
    if (n < 1) {
      throw `You must query with a positive nonzero integer. Please use a
               different value for n.`;
    }
    if (this.trials.length === 0) return new DataCollection();
    if (n > this.trials.length) n = this.trials.length;
    return new DataCollection(this.trials.slice(this.trials.length - n, this.trials.length));
  }

  values() {
    return this.trials;
  }

  count() {
    return this.trials.length;
  }

  readOnly() {
    return new DataCollection(deepCopy(this.trials));
  }

  addToAll(properties) {
    for (const trial of this.trials) {
      Object.assign(trial, properties);
    }
    return this;
  }

  addToLast(properties) {
    if (this.trials.length != 0) {
      Object.assign(this.trials[this.trials.length - 1], properties);
    }
    return this;
  }

  filter(filters) {
    // [{p1: v1, p2:v2}, {p1:v2}]
    // {p1: v1}
    let f;
    if (!Array.isArray(filters)) {
      f = deepCopy([filters]);
    } else {
      f = deepCopy(filters);
    }

    const filtered_data = [];
    for (const trial of this.trials) {
      let keep = false;
      for (const filter of f) {
        let match = true;
        for (const key of Object.keys(filter)) {
          if (typeof trial[key] !== "undefined" && trial[key] === filter[key]) {
            // matches on this key!
          } else {
            match = false;
          }
        }
        if (match) {
          keep = true;
          break;
        } // can break because each filter is OR.
      }
      if (keep) {
        filtered_data.push(trial);
      }
    }

    return new DataCollection(filtered_data);
  }

  filterCustom(fn) {
    return new DataCollection(this.trials.filter(fn));
  }

  filterColumns(columns: Array<string>) {
    return new DataCollection(
      this.trials.map((trial) =>
        Object.fromEntries(columns.filter((key) => key in trial).map((key) => [key, trial[key]]))
      )
    );
  }

  select(column) {
    const values = [];
    for (const trial of this.trials) {
      if (typeof trial[column] !== "undefined") {
        values.push(trial[column]);
      }
    }
    return new DataColumn(values);
  }

  ignore(columns) {
    if (!Array.isArray(columns)) {
      columns = [columns];
    }
    const o = deepCopy(this.trials);
    for (const trial of o) {
      for (const delete_key of columns) {
        delete trial[delete_key];
      }
    }
    return new DataCollection(o);
  }

  uniqueNames() {
    const names = [];

    for (const trial of this.trials) {
      for (const key of Object.keys(trial)) {
        if (!names.includes(key)) {
          names.push(key);
        }
      }
    }

    return names;
  }

  csv() {
    return JSON2CSV(this.trials);
  }

  json(pretty = false) {
    if (pretty) {
      return JSON.stringify(this.trials, null, "\t");
    }
    return JSON.stringify(this.trials);
  }

  localSave(format, filename) {
    format = format.toLowerCase();
    let data_string;
    if (format === "json") {
      data_string = this.json();
    } else if (format === "csv") {
      data_string = this.csv();
    } else {
      throw new Error('Invalid format specified for localSave. Must be "json" or "csv".');
    }

    saveTextToFile(data_string, filename);
  }
}
