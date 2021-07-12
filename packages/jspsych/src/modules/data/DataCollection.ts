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
    if (this.trials.length == 0) return new DataCollection();
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
    if (this.trials.length == 0) return new DataCollection();
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
    for (var i = 0; i < this.trials.length; i++) {
      for (var key in properties) {
        this.trials[i][key] = properties[key];
      }
    }
    return this;
  }

  addToLast(properties) {
    if (this.trials.length != 0) {
      for (var key in properties) {
        this.trials[this.trials.length - 1][key] = properties[key];
      }
    }
    return this;
  }

  filter(filters) {
    // [{p1: v1, p2:v2}, {p1:v2}]
    // {p1: v1}
    if (!Array.isArray(filters)) {
      var f = deepCopy([filters]);
    } else {
      var f = deepCopy(filters);
    }

    var filtered_data = [];
    for (var x = 0; x < this.trials.length; x++) {
      var keep = false;
      for (var i = 0; i < f.length; i++) {
        var match = true;
        var keys = Object.keys(f[i]);
        for (var k = 0; k < keys.length; k++) {
          if (
            typeof this.trials[x][keys[k]] !== "undefined" &&
            this.trials[x][keys[k]] == f[i][keys[k]]
          ) {
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
        filtered_data.push(this.trials[x]);
      }
    }

    return new DataCollection(filtered_data);
  }

  filterCustom(fn) {
    var included = [];
    for (var i = 0; i < this.trials.length; i++) {
      if (fn(this.trials[i])) {
        included.push(this.trials[i]);
      }
    }
    return new DataCollection(included);
  }

  select(column) {
    var values = [];
    for (var i = 0; i < this.trials.length; i++) {
      if (typeof this.trials[i][column] !== "undefined") {
        values.push(this.trials[i][column]);
      }
    }
    return new DataColumn(values);
  }

  ignore(columns) {
    if (!Array.isArray(columns)) {
      columns = [columns];
    }
    var o = deepCopy(this.trials);
    for (var i = 0; i < o.length; i++) {
      for (var j in columns) {
        delete o[i][columns[j]];
      }
    }
    return new DataCollection(o);
  }

  uniqueNames() {
    var names = [];

    for (var i = 0; i < this.trials.length; i++) {
      var keys = Object.keys(this.trials[i]);
      for (var j = 0; j < keys.length; j++) {
        if (!names.includes(keys[j])) {
          names.push(keys[j]);
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
    var data_string;

    if (format === "JSON" || format === "json") {
      data_string = this.json();
    } else if (format == "CSV" || format == "csv") {
      data_string = this.csv();
    } else {
      throw new Error('Invalid format specified for localSave. Must be "JSON" or "CSV".');
    }

    saveTextToFile(data_string, filename);
  }
}
