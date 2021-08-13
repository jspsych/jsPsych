import { JsPsych } from "../../JsPsych";
import { DataCollection } from "./DataCollection";
import { getQueryString } from "./utils";

export class JsPsychData {
  // data storage object
  private allData: DataCollection;

  // browser interaction event data
  private interactionData: DataCollection;

  // data properties for all trials
  private dataProperties = {};

  // cache the query_string
  private query_string;

  constructor(private jsPsych: JsPsych) {
    this.reset();
  }

  reset() {
    this.allData = new DataCollection();
    this.interactionData = new DataCollection();
  }

  get() {
    return this.allData;
  }

  getInteractionData() {
    return this.interactionData;
  }

  write(data_object) {
    var progress = this.jsPsych.progress();
    var trial = this.jsPsych.currentTrial();

    //var trial_opt_data = typeof trial.data == 'function' ? trial.data() : trial.data;

    var default_data = {
      trial_type: trial.type.info.name,
      trial_index: progress.current_trial_global,
      time_elapsed: this.jsPsych.totalTime(),
      internal_node_id: this.jsPsych.currentTimelineNodeID(),
    };

    this.allData.push({
      ...data_object,
      ...trial.data,
      ...default_data,
      ...this.dataProperties,
    });
  }

  addProperties(properties) {
    // first, add the properties to all data that's already stored
    this.allData.addToAll(properties);

    // now add to list so that it gets appended to all future data
    this.dataProperties = Object.assign({}, this.dataProperties, properties);
  }

  addDataToLastTrial(data) {
    this.allData.addToLast(data);
  }

  getDataByTimelineNode(node_id) {
    var data = this.allData.filterCustom(function (x) {
      return x.internal_node_id.slice(0, node_id.length) === node_id;
    });

    return data;
  }

  getLastTrialData() {
    return this.allData.top();
  }

  getLastTimelineData() {
    var lasttrial = this.getLastTrialData();
    var node_id = lasttrial.select("internal_node_id").values[0];
    if (typeof node_id === "undefined") {
      return new DataCollection();
    } else {
      var parent_node_id = node_id.substr(0, node_id.lastIndexOf("-"));
      var lastnodedata = this.getDataByTimelineNode(parent_node_id);
      return lastnodedata;
    }
  }

  displayData(format) {
    format = typeof format === "undefined" ? "json" : format.toLowerCase();
    if (format != "json" && format != "csv") {
      console.log("Invalid format declared for displayData function. Using json as default.");
      format = "json";
    }

    var data_string;

    if (format == "json") {
      data_string = this.allData.json(true); // true = pretty print with tabs
    } else {
      data_string = this.allData.csv();
    }

    var display_element = this.jsPsych.getDisplayElement();

    display_element.innerHTML = '<pre id="jspsych-data-display"></pre>';

    document.getElementById("jspsych-data-display").textContent = data_string;
  }

  urlVariables() {
    if (typeof this.query_string == "undefined") {
      this.query_string = getQueryString();
    }
    return this.query_string;
  }

  getURLVariable(whichvar) {
    return this.urlVariables()[whichvar];
  }

  createInteractionListeners() {
    // blur event capture
    window.addEventListener("blur", () => {
      var data = {
        event: "blur",
        trial: this.jsPsych.progress().current_trial_global,
        time: this.jsPsych.totalTime(),
      };
      this.interactionData.push(data);
      this.jsPsych.initSettings().on_interaction_data_update(data);
    });

    // focus event capture
    window.addEventListener("focus", () => {
      var data = {
        event: "focus",
        trial: this.jsPsych.progress().current_trial_global,
        time: this.jsPsych.totalTime(),
      };
      this.interactionData.push(data);
      this.jsPsych.initSettings().on_interaction_data_update(data);
    });

    // fullscreen change capture
    const fullscreenchange = () => {
      const data = {
        event:
          // @ts-expect-error
          document.isFullScreen ||
          // @ts-expect-error
          document.webkitIsFullScreen ||
          // @ts-expect-error
          document.mozIsFullScreen ||
          document.fullscreenElement
            ? "fullscreenenter"
            : "fullscreenexit",
        trial: this.jsPsych.progress().current_trial_global,
        time: this.jsPsych.totalTime(),
      };
      this.interactionData.push(data);
      this.jsPsych.initSettings().on_interaction_data_update(data);
    };

    document.addEventListener("fullscreenchange", fullscreenchange);
    document.addEventListener("mozfullscreenchange", fullscreenchange);
    document.addEventListener("webkitfullscreenchange", fullscreenchange);
  }

  // public methods for testing purposes. not recommended for use.
  _customInsert(data) {
    this.allData = new DataCollection(data);
  }

  _fullreset() {
    this.reset();
    this.dataProperties = {};
  }
}
