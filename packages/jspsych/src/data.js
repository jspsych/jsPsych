import jsPsych from ".";

// data storage object
var allData = DataCollection();

// browser interaction event data
var interactionData = DataCollection();

// data properties for all trials
var dataProperties = {};

// cache the query_string
var query_string;

// DataCollection
function DataCollection(data) {
  var data_collection = {};

  var trials = typeof data === "undefined" ? [] : data;

  data_collection.push = function (new_data) {
    trials.push(new_data);
    return data_collection;
  };

  data_collection.join = function (other_data_collection) {
    trials = trials.concat(other_data_collection.values());
    return data_collection;
  };

  data_collection.top = function () {
    if (trials.length <= 1) {
      return data_collection;
    } else {
      return DataCollection([trials[trials.length - 1]]);
    }
  };

  /**
   * Queries the first n elements in a collection of trials.
   *
   * @param {number} n A positive integer of elements to return. A value of
   *                   n that is less than 1 will throw an error.
   *
   * @return {Array} First n objects of a collection of trials. If fewer than
   *                 n trials are available, the trials.length elements will
   *                 be returned.
   *
   */
  data_collection.first = function (n) {
    if (typeof n == "undefined") {
      n = 1;
    }
    if (n < 1) {
      throw `You must query with a positive nonzero integer. Please use a 
               different value for n.`;
    }
    if (trials.length == 0) return DataCollection([]);
    if (n > trials.length) n = trials.length;
    return DataCollection(trials.slice(0, n));
  };

  /**
   * Queries the last n elements in a collection of trials.
   *
   * @param {number} n A positive integer of elements to return. A value of
   *                   n that is less than 1 will throw an error.
   *
   * @return {Array} Last n objects of a collection of trials. If fewer than
   *                 n trials are available, the trials.length elements will
   *                 be returned.
   *
   */
  data_collection.last = function (n) {
    if (typeof n == "undefined") {
      n = 1;
    }
    if (n < 1) {
      throw `You must query with a positive nonzero integer. Please use a 
               different value for n.`;
    }
    if (trials.length == 0) return DataCollection([]);
    if (n > trials.length) n = trials.length;
    return DataCollection(trials.slice(trials.length - n, trials.length));
  };

  data_collection.values = function () {
    return trials;
  };

  data_collection.count = function () {
    return trials.length;
  };

  data_collection.readOnly = function () {
    return DataCollection(jsPsych.utils.deepCopy(trials));
  };

  data_collection.addToAll = function (properties) {
    for (var i = 0; i < trials.length; i++) {
      for (var key in properties) {
        trials[i][key] = properties[key];
      }
    }
    return data_collection;
  };

  data_collection.addToLast = function (properties) {
    if (trials.length != 0) {
      for (var key in properties) {
        trials[trials.length - 1][key] = properties[key];
      }
    }
    return data_collection;
  };

  data_collection.filter = function (filters) {
    // [{p1: v1, p2:v2}, {p1:v2}]
    // {p1: v1}
    if (!Array.isArray(filters)) {
      var f = jsPsych.utils.deepCopy([filters]);
    } else {
      var f = jsPsych.utils.deepCopy(filters);
    }

    var filtered_data = [];
    for (var x = 0; x < trials.length; x++) {
      var keep = false;
      for (var i = 0; i < f.length; i++) {
        var match = true;
        var keys = Object.keys(f[i]);
        for (var k = 0; k < keys.length; k++) {
          if (typeof trials[x][keys[k]] !== "undefined" && trials[x][keys[k]] == f[i][keys[k]]) {
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
        filtered_data.push(trials[x]);
      }
    }

    var out = DataCollection(filtered_data);

    return out;
  };

  data_collection.filterCustom = function (fn) {
    var included = [];
    for (var i = 0; i < trials.length; i++) {
      if (fn(trials[i])) {
        included.push(trials[i]);
      }
    }
    return DataCollection(included);
  };

  data_collection.select = function (column) {
    var values = [];
    for (var i = 0; i < trials.length; i++) {
      if (typeof trials[i][column] !== "undefined") {
        values.push(trials[i][column]);
      }
    }
    var out = DataColumn();
    out.values = values;
    return out;
  };

  data_collection.ignore = function (columns) {
    if (!Array.isArray(columns)) {
      columns = [columns];
    }
    var o = jsPsych.utils.deepCopy(trials);
    for (var i = 0; i < o.length; i++) {
      for (var j in columns) {
        delete o[i][columns[j]];
      }
    }
    return DataCollection(o);
  };

  data_collection.uniqueNames = function () {
    var names = [];

    for (var i = 0; i < trials.length; i++) {
      var keys = Object.keys(trials[i]);
      for (var j = 0; j < keys.length; j++) {
        if (!names.includes(keys[j])) {
          names.push(keys[j]);
        }
      }
    }

    return names;
  };

  data_collection.csv = function () {
    return JSON2CSV(trials);
  };

  data_collection.json = function (pretty) {
    if (pretty) {
      return JSON.stringify(trials, null, "\t");
    }
    return JSON.stringify(trials);
  };

  data_collection.localSave = function (format, filename) {
    var data_string;

    if (format == "JSON" || format == "json") {
      data_string = data_collection.json();
    } else if (format == "CSV" || format == "csv") {
      data_string = data_collection.csv();
    } else {
      throw new Error('Invalid format specified for localSave. Must be "JSON" or "CSV".');
    }

    saveTextToFile(data_string, filename);
  };

  return data_collection;
}

// DataColumn class
function DataColumn() {
  var data_column = {};

  data_column.values = [];

  data_column.sum = function () {
    var s = 0;
    for (var i = 0; i < data_column.values.length; i++) {
      s += data_column.values[i];
    }
    return s;
  };

  data_column.mean = function () {
    return data_column.sum() / data_column.count();
  };

  data_column.median = function () {
    if (data_column.values.length == 0) {
      return undefined;
    }
    var numbers = data_column.values.slice(0).sort(function (a, b) {
      return a - b;
    });
    var middle = Math.floor(numbers.length / 2);
    var isEven = numbers.length % 2 === 0;
    return isEven ? (numbers[middle] + numbers[middle - 1]) / 2 : numbers[middle];
  };

  data_column.min = function () {
    return Math.min.apply(null, data_column.values);
  };

  data_column.max = function () {
    return Math.max.apply(null, data_column.values);
  };

  data_column.count = function () {
    return data_column.values.length;
  };

  data_column.variance = function () {
    var mean = data_column.mean();
    var sum_square_error = 0;
    for (var i = 0; i < data_column.values.length; i++) {
      sum_square_error += Math.pow(data_column.values[i] - mean, 2);
    }
    var mse = sum_square_error / (data_column.values.length - 1);
    return mse;
  };

  data_column.sd = function () {
    var mse = data_column.variance();
    var rmse = Math.sqrt(mse);
    return rmse;
  };

  data_column.frequencies = function () {
    var unique = {};
    for (var i = 0; i < data_column.values.length; i++) {
      var v = data_column.values[i];
      if (typeof unique[v] == "undefined") {
        unique[v] = 1;
      } else {
        unique[v]++;
      }
    }
    return unique;
  };

  data_column.all = function (eval_fn) {
    for (var i = 0; i < data_column.values.length; i++) {
      if (!eval_fn(data_column.values[i])) {
        return false;
      }
    }
    return true;
  };

  data_column.subset = function (eval_fn) {
    var out = [];
    for (var i = 0; i < data_column.values.length; i++) {
      if (eval_fn(data_column.values[i])) {
        out.push(data_column.values[i]);
      }
    }
    var o = DataColumn();
    o.values = out;
    return o;
  };

  return data_column;
}

export function reset() {
  allData = DataCollection();
  interactionData = DataCollection();
}

export function get() {
  return allData;
}

export function getInteractionData() {
  return interactionData;
}

export function write(data_object) {
  var progress = jsPsych.progress();
  var trial = jsPsych.currentTrial();

  //var trial_opt_data = typeof trial.data == 'function' ? trial.data() : trial.data;

  var default_data = {
    trial_type: trial.type,
    trial_index: progress.current_trial_global,
    time_elapsed: jsPsych.totalTime(),
    internal_node_id: jsPsych.currentTimelineNodeID(),
  };

  var ext_data_object = Object.assign({}, data_object, trial.data, default_data, dataProperties);

  allData.push(ext_data_object);
}

export function addProperties(properties) {
  // first, add the properties to all data that's already stored
  allData.addToAll(properties);

  // now add to list so that it gets appended to all future data
  dataProperties = Object.assign({}, dataProperties, properties);
}

export function addDataToLastTrial(data) {
  allData.addToLast(data);
}

export function getDataByTimelineNode(node_id) {
  var data = allData.filterCustom(function (x) {
    return x.internal_node_id.slice(0, node_id.length) === node_id;
  });

  return data;
}

export function getLastTrialData() {
  return allData.top();
}

export function getLastTimelineData() {
  var lasttrial = getLastTrialData();
  var node_id = lasttrial.select("internal_node_id").values[0];
  if (typeof node_id === "undefined") {
    return DataCollection();
  } else {
    var parent_node_id = node_id.substr(0, node_id.lastIndexOf("-"));
    var lastnodedata = getDataByTimelineNode(parent_node_id);
    return lastnodedata;
  }
}

export function displayData(format) {
  format = typeof format === "undefined" ? "json" : format.toLowerCase();
  if (format != "json" && format != "csv") {
    console.log("Invalid format declared for displayData function. Using json as default.");
    format = "json";
  }

  var data_string;

  if (format == "json") {
    data_string = allData.json(true); // true = pretty print with tabs
  } else {
    data_string = allData.csv();
  }

  var display_element = jsPsych.getDisplayElement();

  display_element.innerHTML = '<pre id="jspsych-data-display"></pre>';

  document.getElementById("jspsych-data-display").textContent = data_string;
}

export function urlVariables() {
  if (typeof query_string == "undefined") {
    query_string = getQueryString();
  }
  return query_string;
}

export function getURLVariable(whichvar) {
  if (typeof query_string == "undefined") {
    query_string = getQueryString();
  }
  return query_string[whichvar];
}

export function createInteractionListeners() {
  // blur event capture
  window.addEventListener("blur", function () {
    var data = {
      event: "blur",
      trial: jsPsych.progress().current_trial_global,
      time: jsPsych.totalTime(),
    };
    interactionData.push(data);
    jsPsych.initSettings().on_interaction_data_update(data);
  });

  // focus event capture
  window.addEventListener("focus", function () {
    var data = {
      event: "focus",
      trial: jsPsych.progress().current_trial_global,
      time: jsPsych.totalTime(),
    };
    interactionData.push(data);
    jsPsych.initSettings().on_interaction_data_update(data);
  });

  // fullscreen change capture
  function fullscreenchange() {
    var type =
      document.isFullScreen ||
      document.webkitIsFullScreen ||
      document.mozIsFullScreen ||
      document.fullscreenElement
        ? "fullscreenenter"
        : "fullscreenexit";
    var data = {
      event: type,
      trial: jsPsych.progress().current_trial_global,
      time: jsPsych.totalTime(),
    };
    interactionData.push(data);
    jsPsych.initSettings().on_interaction_data_update(data);
  }

  document.addEventListener("fullscreenchange", fullscreenchange);
  document.addEventListener("mozfullscreenchange", fullscreenchange);
  document.addEventListener("webkitfullscreenchange", fullscreenchange);
}

// public methods for testing purposes. not recommended for use.
export function _customInsert(data) {
  allData = DataCollection(data);
}

export function _fullreset() {
  reset();
  dataProperties = {};
}

// private function to save text file on local drive
function saveTextToFile(textstr, filename) {
  var blobToSave = new Blob([textstr], {
    type: "text/plain",
  });
  var blobURL = "";
  if (typeof window.webkitURL !== "undefined") {
    blobURL = window.webkitURL.createObjectURL(blobToSave);
  } else {
    blobURL = window.URL.createObjectURL(blobToSave);
  }

  var display_element = jsPsych.getDisplayElement();

  display_element.insertAdjacentHTML(
    "beforeend",
    '<a id="jspsych-download-as-text-link" style="display:none;" download="' +
      filename +
      '" href="' +
      blobURL +
      '">click to download</a>'
  );
  document.getElementById("jspsych-download-as-text-link").click();
}

//
// A few helper functions to handle data format conversion
//

// this function based on code suggested by StackOverflow users:
// http://stackoverflow.com/users/64741/zachary
// http://stackoverflow.com/users/317/joseph-sturtevant

function JSON2CSV(objArray) {
  var array = typeof objArray != "object" ? JSON.parse(objArray) : objArray;
  var line = "";
  var result = "";
  var columns = [];

  var i = 0;
  for (var j = 0; j < array.length; j++) {
    for (var key in array[j]) {
      var keyString = key + "";
      keyString = '"' + keyString.replace(/"/g, '""') + '",';
      if (!columns.includes(key)) {
        columns[i] = key;
        line += keyString;
        i++;
      }
    }
  }

  line = line.slice(0, -1);
  result += line + "\r\n";

  for (var i = 0; i < array.length; i++) {
    var line = "";
    for (var j = 0; j < columns.length; j++) {
      var value = typeof array[i][columns[j]] === "undefined" ? "" : array[i][columns[j]];
      if (typeof value == "object") {
        value = JSON.stringify(value);
      }
      var valueString = value + "";
      line += '"' + valueString.replace(/"/g, '""') + '",';
    }

    line = line.slice(0, -1);
    result += line + "\r\n";
  }

  return result;
}

// this function is modified from StackOverflow:
// http://stackoverflow.com/posts/3855394

function getQueryString() {
  var a = window.location.search.substr(1).split("&");
  if (a == "") return {};
  var b = {};
  for (var i = 0; i < a.length; ++i) {
    var p = a[i].split("=", 2);
    if (p.length == 1) b[p[0]] = "";
    else b[p[0]] = decodeURIComponent(p[1].replace(/\+/g, " "));
  }
  return b;
}
