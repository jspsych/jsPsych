import { TrialResult } from "src/timeline";
import { Trial } from "src/timeline/Trial";

import { DataCollection } from "./DataCollection";
import { getQueryString } from "./utils";

export type InteractionEvent = "blur" | "focus" | "fullscreenenter" | "fullscreenexit";

export interface InteractionRecord {
  event: InteractionEvent;
  trial: number;
  time: number;
}

/**
 * Functions and options needed by the `JsPsychData` module
 */
export interface JsPsychDataDependencies {
  /**
   * Returns progress information for interaction records.
   */
  getProgress: () => { trial: number; time: number };

  onInteractionRecordAdded: (record: InteractionRecord) => void;

  getDisplayElement: () => HTMLElement;
}

export class JsPsychData {
  private results: DataCollection;
  private resultToTrialMap: WeakMap<TrialResult, Trial>;

  /** Browser interaction event data */
  private interactionRecords: DataCollection;

  /** Data properties for all trials */
  private dataProperties = {};

  // cache the query_string
  private query_string;

  constructor(private dependencies: JsPsychDataDependencies) {
    this.reset();
  }

  reset() {
    this.results = new DataCollection();
    this.resultToTrialMap = new WeakMap<TrialResult, Trial>();
    this.interactionRecords = new DataCollection();
  }

  get() {
    return this.results;
  }

  getInteractionData() {
    return this.interactionRecords;
  }

  write(trial: Trial) {
    const result = trial.getResult();
    Object.assign(result, this.dataProperties);
    this.results.push(result);
    this.resultToTrialMap.set(result, trial);
  }

  addProperties(properties) {
    // first, add the properties to all data that's already stored
    this.results.addToAll(properties);

    // now add to list so that it gets appended to all future data
    this.dataProperties = Object.assign({}, this.dataProperties, properties);
  }

  addDataToLastTrial(data) {
    this.results.addToLast(data);
  }

  getLastTrialData() {
    return this.results.top();
  }

  getLastTimelineData() {
    const lastResult = this.getLastTrialData().values()[0];

    return new DataCollection(
      lastResult ? this.resultToTrialMap.get(lastResult).parent.getResults() : []
    );

    // const node_id = lasttrial.select("internal_node_id").values[0];
    // if (typeof node_id === "undefined") {
    //   return new DataCollection();
    // } else {
    //   const parent_node_id = node_id.substr(0, node_id.lastIndexOf("-"));
    //   const lastnodedata = this.getDataByTimelineNode(parent_node_id);
    //   return lastnodedata;
    // }
  }

  displayData(format = "json") {
    format = format.toLowerCase();
    if (format !== "json" && format !== "csv") {
      console.log("Invalid format declared for displayData function. Using json as default.");
      format = "json";
    }

    const dataContainer = document.createElement("pre");
    dataContainer.id = "jspsych-data-display";
    dataContainer.textContent = format === "json" ? this.results.json(true) : this.results.csv();

    this.dependencies.getDisplayElement().replaceChildren(dataContainer);
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

  private addInteractionRecord(event: InteractionEvent) {
    const record: InteractionRecord = { event, ...this.dependencies.getProgress() };
    this.interactionRecords.push(record);
    this.dependencies.onInteractionRecordAdded(record);
  }

  createInteractionListeners() {
    // blur event capture
    window.addEventListener("blur", () => {
      this.addInteractionRecord("blur");
    });

    // focus event capture
    window.addEventListener("focus", () => {
      this.addInteractionRecord("focus");
    });

    // fullscreen change capture
    const onFullscreenChange = () => {
      this.addInteractionRecord(
        // @ts-expect-error
        document.isFullScreen ||
          // @ts-expect-error
          document.webkitIsFullScreen ||
          // @ts-expect-error
          document.mozIsFullScreen ||
          document.fullscreenElement
          ? "fullscreenenter"
          : "fullscreenexit"
      );
    };
    document.addEventListener("fullscreenchange", onFullscreenChange);
    document.addEventListener("mozfullscreenchange", onFullscreenChange);
    document.addEventListener("webkitfullscreenchange", onFullscreenChange);
  }
}
