import autoBind from 'auto-bind';
import rw from 'random-words';
import seedrandom from 'seedrandom/lib/alea.js';

var version = "8.2.3";

class ExtensionManager {
  constructor(dependencies, extensionsConfiguration) {
    this.dependencies = dependencies;
    this.extensionsConfiguration = extensionsConfiguration;
    this.extensions = Object.fromEntries(
      extensionsConfiguration.map((extension) => [
        ExtensionManager.getExtensionNameByClass(extension.type),
        this.dependencies.instantiateExtension(extension.type)
      ])
    );
  }
  static getExtensionNameByClass(extensionClass) {
    return extensionClass["info"].name;
  }
  getExtensionInstanceByClass(extensionClass) {
    return this.extensions[ExtensionManager.getExtensionNameByClass(extensionClass)];
  }
  async initializeExtensions() {
    await Promise.all(
      this.extensionsConfiguration.map(({ type, params = {} }) => {
        this.getExtensionInstanceByClass(type).initialize(params);
        const extensionInfo = type["info"];
        if (!("version" in extensionInfo) && !("data" in extensionInfo)) {
          console.warn(
            extensionInfo["name"],
            "is missing the 'version' and 'data' fields. Please update extension as 'version' and 'data' will be required in v9. See https://www.jspsych.org/latest/developers/extension-development/ for more details."
          );
        } else if (!("version" in extensionInfo)) {
          console.warn(
            extensionInfo["name"],
            "is missing the 'version' field. Please update extension as 'version' will be required in v9. See https://www.jspsych.org/latest/developers/extension-development/ for more details."
          );
        } else if (!("data" in extensionInfo)) {
          console.warn(
            extensionInfo["name"],
            "is missing the 'data' field. Please update extension as 'data' will be required in v9. See https://www.jspsych.org/latest/developers/extension-development/ for more details."
          );
        }
      })
    );
  }
  onStart(trialExtensionsConfiguration = []) {
    for (const { type, params } of trialExtensionsConfiguration) {
      this.getExtensionInstanceByClass(type)?.on_start(params);
    }
  }
  onLoad(trialExtensionsConfiguration = []) {
    for (const { type, params } of trialExtensionsConfiguration) {
      this.getExtensionInstanceByClass(type)?.on_load(params);
    }
  }
  async onFinish(trialExtensionsConfiguration = []) {
    const results = await Promise.all(
      trialExtensionsConfiguration.map(
        ({ type, params }) => Promise.resolve(this.getExtensionInstanceByClass(type)?.on_finish(params))
      )
    );
    const extensionInfos = trialExtensionsConfiguration.length ? {
      extension_type: trialExtensionsConfiguration.map(({ type }) => type["info"].name),
      extension_version: trialExtensionsConfiguration.map(({ type }) => type["info"].version)
    } : {};
    results.unshift(extensionInfos);
    return Object.assign({}, ...results);
  }
}

function unique(arr) {
  return [...new Set(arr)];
}
function deepCopy(obj) {
  if (!obj) return obj;
  let out;
  if (Array.isArray(obj)) {
    out = [];
    for (const x of obj) {
      out.push(deepCopy(x));
    }
    return out;
  } else if (typeof obj === "object" && obj !== null) {
    out = {};
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        out[key] = deepCopy(obj[key]);
      }
    }
    return out;
  } else {
    return obj;
  }
}
function deepMerge(obj1, obj2) {
  let merged = {};
  for (const key in obj1) {
    if (obj1.hasOwnProperty(key)) {
      if (typeof obj1[key] === "object" && obj2.hasOwnProperty(key)) {
        merged[key] = deepMerge(obj1[key], obj2[key]);
      } else {
        merged[key] = obj1[key];
      }
    }
  }
  for (const key in obj2) {
    if (obj2.hasOwnProperty(key)) {
      if (!merged.hasOwnProperty(key)) {
        merged[key] = obj2[key];
      } else if (typeof obj2[key] === "object") {
        merged[key] = deepMerge(merged[key], obj2[key]);
      } else {
        merged[key] = obj2[key];
      }
    }
  }
  return merged;
}

var utils = /*#__PURE__*/Object.freeze({
  __proto__: null,
  deepCopy: deepCopy,
  deepMerge: deepMerge,
  unique: unique
});

class DataColumn {
  constructor(values = []) {
    this.values = values;
  }
  sum() {
    let s = 0;
    for (const v of this.values) {
      s += v;
    }
    return s;
  }
  mean() {
    let sum = 0;
    let count = 0;
    for (const value of this.values) {
      if (typeof value !== "undefined" && value !== null) {
        sum += value;
        count++;
      }
    }
    if (count === 0) {
      return void 0;
    }
    return sum / count;
  }
  median() {
    if (this.values.length === 0) {
      return void 0;
    }
    const numbers = this.values.slice(0).sort(function(a, b) {
      return a - b;
    });
    const middle = Math.floor(numbers.length / 2);
    const isEven = numbers.length % 2 === 0;
    return isEven ? (numbers[middle] + numbers[middle - 1]) / 2 : numbers[middle];
  }
  min() {
    return Math.min.apply(null, this.values);
  }
  max() {
    return Math.max.apply(null, this.values);
  }
  count() {
    return this.values.length;
  }
  variance() {
    const mean = this.mean();
    let sum_square_error = 0;
    for (const x of this.values) {
      sum_square_error += Math.pow(x - mean, 2);
    }
    const mse = sum_square_error / (this.values.length - 1);
    return mse;
  }
  sd() {
    const mse = this.variance();
    const rmse = Math.sqrt(mse);
    return rmse;
  }
  frequencies() {
    const unique = {};
    for (const x of this.values) {
      if (typeof unique[x] === "undefined") {
        unique[x] = 1;
      } else {
        unique[x]++;
      }
    }
    return unique;
  }
  all(eval_fn) {
    for (const x of this.values) {
      if (!eval_fn(x)) {
        return false;
      }
    }
    return true;
  }
  subset(eval_fn) {
    const out = [];
    for (const x of this.values) {
      if (eval_fn(x)) {
        out.push(x);
      }
    }
    return new DataColumn(out);
  }
}

function saveTextToFile(textstr, filename) {
  const blobToSave = new Blob([textstr], {
    type: "text/plain"
  });
  let blobURL = "";
  if (typeof window.webkitURL !== "undefined") {
    blobURL = window.webkitURL.createObjectURL(blobToSave);
  } else {
    blobURL = window.URL.createObjectURL(blobToSave);
  }
  const link = document.createElement("a");
  link.id = "jspsych-download-as-text-link";
  link.style.display = "none";
  link.download = filename;
  link.href = blobURL;
  link.click();
}
function JSON2CSV(objArray) {
  const array = typeof objArray != "object" ? JSON.parse(objArray) : objArray;
  let line = "";
  let result = "";
  const columns = [];
  for (const row of array) {
    for (const key in row) {
      let keyString = key + "";
      keyString = '"' + keyString.replace(/"/g, '""') + '",';
      if (!columns.includes(key)) {
        columns.push(key);
        line += keyString;
      }
    }
  }
  line = line.slice(0, -1);
  result += line + "\r\n";
  for (const row of array) {
    line = "";
    for (const col of columns) {
      let value = typeof row[col] === "undefined" ? "" : row[col];
      if (typeof value == "object") {
        value = JSON.stringify(value);
      }
      const valueString = value + "";
      line += '"' + valueString.replace(/"/g, '""') + '",';
    }
    line = line.slice(0, -1);
    result += line + "\r\n";
  }
  return result;
}
function getQueryString() {
  const a = window.location.search.substr(1).split("&");
  const b = {};
  for (let i = 0; i < a.length; ++i) {
    const p = a[i].split("=", 2);
    if (p.length == 1) b[p[0]] = "";
    else b[p[0]] = decodeURIComponent(p[1].replace(/\+/g, " "));
  }
  return b;
}

class DataCollection {
  constructor(data = []) {
    this.trials = data;
  }
  push(new_data) {
    this.trials.push(new_data);
    return this;
  }
  join(other_data_collection) {
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
    if (this.trials.length > 0) {
      Object.assign(this.trials[this.trials.length - 1], properties);
    }
    return this;
  }
  filter(filters) {
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
          if (typeof trial[key] !== "undefined" && trial[key] === filter[key]) ; else {
            match = false;
          }
        }
        if (match) {
          keep = true;
          break;
        }
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
  filterColumns(columns) {
    return new DataCollection(
      this.trials.map(
        (trial) => Object.fromEntries(columns.filter((key) => key in trial).map((key) => [key, trial[key]]))
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
      return JSON.stringify(this.trials, null, "	");
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

class JsPsychData {
  constructor(dependencies) {
    this.dependencies = dependencies;
    /** Data properties for all trials */
    this.dataProperties = {};
    this.interactionListeners = {
      blur: () => {
        this.addInteractionRecord("blur");
      },
      focus: () => {
        this.addInteractionRecord("focus");
      },
      fullscreenchange: () => {
        this.addInteractionRecord(
          // @ts-expect-error
          document.isFullScreen || // @ts-expect-error
          document.webkitIsFullScreen || // @ts-expect-error
          document.mozIsFullScreen || document.fullscreenElement ? "fullscreenenter" : "fullscreenexit"
        );
      }
    };
    this.reset();
  }
  reset() {
    this.results = new DataCollection();
    this.resultToTrialMap = /* @__PURE__ */ new WeakMap();
    this.interactionRecords = new DataCollection();
  }
  get() {
    return this.results;
  }
  getInteractionData() {
    return this.interactionRecords;
  }
  write(trial) {
    const result = trial.getResult();
    Object.assign(result, this.dataProperties);
    this.results.push(result);
    this.resultToTrialMap.set(result, trial);
  }
  addProperties(properties) {
    this.results.addToAll(properties);
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
  addInteractionRecord(event) {
    const record = { event, ...this.dependencies.getProgress() };
    this.interactionRecords.push(record);
    this.dependencies.onInteractionRecordAdded(record);
  }
  createInteractionListeners() {
    window.addEventListener("blur", this.interactionListeners.blur);
    window.addEventListener("focus", this.interactionListeners.focus);
    document.addEventListener("fullscreenchange", this.interactionListeners.fullscreenchange);
    document.addEventListener("mozfullscreenchange", this.interactionListeners.fullscreenchange);
    document.addEventListener("webkitfullscreenchange", this.interactionListeners.fullscreenchange);
  }
  removeInteractionListeners() {
    window.removeEventListener("blur", this.interactionListeners.blur);
    window.removeEventListener("focus", this.interactionListeners.focus);
    document.removeEventListener("fullscreenchange", this.interactionListeners.fullscreenchange);
    document.removeEventListener("mozfullscreenchange", this.interactionListeners.fullscreenchange);
    document.removeEventListener(
      "webkitfullscreenchange",
      this.interactionListeners.fullscreenchange
    );
  }
}

class KeyboardListenerAPI {
  constructor(getRootElement, areResponsesCaseSensitive = false, minimumValidRt = 0) {
    this.getRootElement = getRootElement;
    this.areResponsesCaseSensitive = areResponsesCaseSensitive;
    this.minimumValidRt = minimumValidRt;
    this.listeners = /* @__PURE__ */ new Set();
    this.heldKeys = /* @__PURE__ */ new Set();
    this.areRootListenersRegistered = false;
    autoBind(this);
    this.registerRootListeners();
  }
  /**
   * If not previously done and `this.getRootElement()` returns an element, adds the root key
   * listeners to that element.
   */
  registerRootListeners() {
    if (!this.areRootListenersRegistered) {
      const rootElement = this.getRootElement();
      if (rootElement) {
        rootElement.addEventListener("keydown", this.rootKeydownListener);
        rootElement.addEventListener("keyup", this.rootKeyupListener);
        this.areRootListenersRegistered = true;
      }
    }
  }
  rootKeydownListener(e) {
    for (const listener of [...this.listeners]) {
      listener(e);
    }
    this.heldKeys.add(this.toLowerCaseIfInsensitive(e.key));
  }
  toLowerCaseIfInsensitive(string) {
    return this.areResponsesCaseSensitive ? string : string.toLowerCase();
  }
  rootKeyupListener(e) {
    this.heldKeys.delete(this.toLowerCaseIfInsensitive(e.key));
  }
  isResponseValid(validResponses, allowHeldKey, key) {
    if (!allowHeldKey && this.heldKeys.has(key)) {
      return false;
    }
    if (validResponses === "ALL_KEYS") {
      return true;
    }
    if (validResponses === "NO_KEYS") {
      return false;
    }
    return validResponses.includes(key);
  }
  getKeyboardResponse({
    callback_function,
    valid_responses = "ALL_KEYS",
    rt_method = "performance",
    persist,
    audio_context,
    audio_context_start_time,
    allow_held_key = false,
    minimum_valid_rt = this.minimumValidRt
  }) {
    if (rt_method !== "performance" && rt_method !== "audio") {
      console.log(
        'Invalid RT method specified in getKeyboardResponse. Defaulting to "performance" method.'
      );
      rt_method = "performance";
    }
    const usePerformanceRt = rt_method === "performance";
    const startTime = usePerformanceRt ? performance.now() : audio_context_start_time * 1e3;
    this.registerRootListeners();
    if (!this.areResponsesCaseSensitive && typeof valid_responses !== "string") {
      valid_responses = valid_responses.map((r) => r.toLowerCase());
    }
    const listener = (e) => {
      const rt = Math.round(
        (rt_method == "performance" ? performance.now() : audio_context.currentTime * 1e3) - startTime
      );
      if (rt < minimum_valid_rt) {
        return;
      }
      const key = this.toLowerCaseIfInsensitive(e.key);
      if (this.isResponseValid(valid_responses, allow_held_key, key)) {
        e.preventDefault();
        if (!persist) {
          this.cancelKeyboardResponse(listener);
        }
        callback_function({ key: e.key, rt });
      }
    };
    this.listeners.add(listener);
    return listener;
  }
  cancelKeyboardResponse(listener) {
    this.listeners.delete(listener);
  }
  cancelAllKeyboardResponses() {
    this.listeners.clear();
  }
  compareKeys(key1, key2) {
    if (typeof key1 !== "string" && key1 !== null || typeof key2 !== "string" && key2 !== null) {
      console.error(
        "Error in jsPsych.pluginAPI.compareKeys: arguments must be key strings or null."
      );
      return void 0;
    }
    if (typeof key1 === "string" && typeof key2 === "string") {
      return this.areResponsesCaseSensitive ? key1 === key2 : key1.toLowerCase() === key2.toLowerCase();
    }
    return key1 === null && key2 === null;
  }
}

var ParameterType = /* @__PURE__ */ ((ParameterType2) => {
  ParameterType2[ParameterType2["BOOL"] = 0] = "BOOL";
  ParameterType2[ParameterType2["STRING"] = 1] = "STRING";
  ParameterType2[ParameterType2["INT"] = 2] = "INT";
  ParameterType2[ParameterType2["FLOAT"] = 3] = "FLOAT";
  ParameterType2[ParameterType2["FUNCTION"] = 4] = "FUNCTION";
  ParameterType2[ParameterType2["KEY"] = 5] = "KEY";
  ParameterType2[ParameterType2["KEYS"] = 6] = "KEYS";
  ParameterType2[ParameterType2["SELECT"] = 7] = "SELECT";
  ParameterType2[ParameterType2["HTML_STRING"] = 8] = "HTML_STRING";
  ParameterType2[ParameterType2["IMAGE"] = 9] = "IMAGE";
  ParameterType2[ParameterType2["AUDIO"] = 10] = "AUDIO";
  ParameterType2[ParameterType2["VIDEO"] = 11] = "VIDEO";
  ParameterType2[ParameterType2["OBJECT"] = 12] = "OBJECT";
  ParameterType2[ParameterType2["COMPLEX"] = 13] = "COMPLEX";
  ParameterType2[ParameterType2["TIMELINE"] = 14] = "TIMELINE";
  return ParameterType2;
})(ParameterType || {});

class AudioPlayer {
  constructor(src, options = { useWebAudio: false }) {
    this.src = src;
    this.useWebAudio = options.useWebAudio;
    this.audioContext = options.audioContext || null;
  }
  async load() {
    if (this.useWebAudio) {
      this.webAudioBuffer = await this.preloadWebAudio(this.src);
    } else {
      this.audio = await this.preloadHTMLAudio(this.src);
    }
  }
  play() {
    if (this.audio instanceof HTMLAudioElement) {
      this.audio.play();
    } else {
      if (!this.audio) this.audio = this.getAudioSourceNode(this.webAudioBuffer);
      this.audio.start();
    }
  }
  stop() {
    if (this.audio instanceof HTMLAudioElement) {
      this.audio.pause();
      this.audio.currentTime = 0;
    } else {
      this.audio.stop();
      this.audio = this.getAudioSourceNode(this.webAudioBuffer);
    }
  }
  addEventListener(eventName, callback) {
    if (!this.audio && this.webAudioBuffer)
      this.audio = this.getAudioSourceNode(this.webAudioBuffer);
    this.audio.addEventListener(eventName, callback);
  }
  removeEventListener(eventName, callback) {
    if (!this.audio && this.webAudioBuffer)
      this.audio = this.getAudioSourceNode(this.webAudioBuffer);
    this.audio.removeEventListener(eventName, callback);
  }
  getAudioSourceNode(audioBuffer) {
    const source = this.audioContext.createBufferSource();
    source.buffer = audioBuffer;
    source.connect(this.audioContext.destination);
    return source;
  }
  async preloadWebAudio(src) {
    const buffer = await fetch(src);
    const arrayBuffer = await buffer.arrayBuffer();
    const audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);
    const source = this.audioContext.createBufferSource();
    source.buffer = audioBuffer;
    source.connect(this.audioContext.destination);
    return audioBuffer;
  }
  async preloadHTMLAudio(src) {
    return new Promise((resolve, reject) => {
      const audio = new Audio(src);
      audio.addEventListener("canplaythrough", () => {
        resolve(audio);
      });
      audio.addEventListener("error", (err) => {
        reject(err);
      });
      audio.addEventListener("abort", (err) => {
        reject(err);
      });
    });
  }
}

const preloadParameterTypes = [
  ParameterType.AUDIO,
  ParameterType.IMAGE,
  ParameterType.VIDEO
];
class MediaAPI {
  constructor(useWebaudio) {
    this.useWebaudio = useWebaudio;
    // video //
    this.video_buffers = {};
    // audio //
    this.context = null;
    this.audio_buffers = [];
    // preloading stimuli //
    this.preload_requests = [];
    this.img_cache = {};
    this.preloadMap = /* @__PURE__ */ new Map();
    this.microphone_recorder = null;
    this.camera_stream = null;
    this.camera_recorder = null;
    if (this.useWebaudio && typeof window !== "undefined" && typeof window.AudioContext !== "undefined") {
      this.context = new AudioContext();
    }
  }
  getVideoBuffer(videoID) {
    if (videoID.startsWith("blob:")) {
      this.video_buffers[videoID] = videoID;
    }
    return this.video_buffers[videoID];
  }
  audioContext() {
    if (this.context && this.context.state !== "running") {
      this.context.resume();
    }
    return this.context;
  }
  async getAudioPlayer(audioID) {
    if (this.audio_buffers[audioID] instanceof AudioPlayer) {
      return this.audio_buffers[audioID];
    } else {
      this.audio_buffers[audioID] = new AudioPlayer(audioID, {
        useWebAudio: this.useWebaudio,
        audioContext: this.context
      });
      await this.audio_buffers[audioID].load();
      return this.audio_buffers[audioID];
    }
  }
  preloadAudio(files, callback_complete = () => {
  }, callback_load = (filepath) => {
  }, callback_error = (error) => {
  }) {
    files = unique(files.flat());
    let n_loaded = 0;
    if (files.length == 0) {
      callback_complete();
      return;
    }
    for (const file of files) {
      if (this.audio_buffers[file] instanceof AudioPlayer) {
        n_loaded++;
        callback_load(file);
        if (n_loaded == files.length) {
          callback_complete();
        }
      } else {
        this.audio_buffers[file] = new AudioPlayer(file, {
          useWebAudio: this.useWebaudio,
          audioContext: this.context
        });
        this.audio_buffers[file].load().then(() => {
          n_loaded++;
          callback_load(file);
          if (n_loaded == files.length) {
            callback_complete();
          }
        }).catch((e) => {
          callback_error(e);
        });
      }
    }
  }
  preloadImages(images, callback_complete = () => {
  }, callback_load = (filepath) => {
  }, callback_error = (error_msg) => {
  }) {
    images = unique(images.flat());
    var n_loaded = 0;
    if (images.length === 0) {
      callback_complete();
      return;
    }
    for (let i = 0; i < images.length; i++) {
      const img = new Image();
      const src = images[i];
      img.onload = () => {
        n_loaded++;
        callback_load(src);
        if (n_loaded === images.length) {
          callback_complete();
        }
      };
      img.onerror = (e) => {
        callback_error({ source: src, error: e });
      };
      img.src = src;
      this.img_cache[src] = img;
      this.preload_requests.push(img);
    }
  }
  preloadVideo(videos, callback_complete = () => {
  }, callback_load = (filepath) => {
  }, callback_error = (error_msg) => {
  }) {
    videos = unique(videos.flat());
    let n_loaded = 0;
    if (videos.length === 0) {
      callback_complete();
      return;
    }
    for (const video of videos) {
      const video_buffers = this.video_buffers;
      const request = new XMLHttpRequest();
      request.open("GET", video, true);
      request.responseType = "blob";
      request.onload = () => {
        if (request.status === 200 || request.status === 0) {
          const videoBlob = request.response;
          video_buffers[video] = URL.createObjectURL(videoBlob);
          n_loaded++;
          callback_load(video);
          if (n_loaded === videos.length) {
            callback_complete();
          }
        }
      };
      request.onerror = (e) => {
        let err = e;
        if (request.status == 404) {
          err = "404";
        }
        callback_error({ source: video, error: err });
      };
      request.onloadend = (e) => {
        if (request.status == 404) {
          callback_error({ source: video, error: "404" });
        }
      };
      request.send();
      this.preload_requests.push(request);
    }
  }
  getAutoPreloadList(timeline_description) {
    const preloadPaths = Object.fromEntries(
      preloadParameterTypes.map((type) => [type, /* @__PURE__ */ new Set()])
    );
    const traverseTimeline = (node, inheritedTrialType) => {
      const isTimeline = typeof node.timeline !== "undefined";
      if (isTimeline) {
        for (const childNode of node.timeline) {
          traverseTimeline(childNode, node.type ?? inheritedTrialType);
        }
      } else if ((node.type ?? inheritedTrialType)?.info) {
        const { name: pluginName, parameters } = (node.type ?? inheritedTrialType).info;
        if (!this.preloadMap.has(pluginName)) {
          this.preloadMap.set(
            pluginName,
            Object.fromEntries(
              Object.entries(parameters).filter(
                ([_name, { type, preload }]) => preloadParameterTypes.includes(type) && (preload ?? true)
              ).map(([name, { type }]) => [name, type])
            )
          );
        }
        for (const [parameterName, parameterType] of Object.entries(
          this.preloadMap.get(pluginName)
        )) {
          const parameterValue = node[parameterName];
          const elements = preloadPaths[parameterType];
          if (typeof parameterValue === "string") {
            elements.add(parameterValue);
          } else if (Array.isArray(parameterValue)) {
            for (const element of parameterValue.flat()) {
              if (typeof element === "string") {
                elements.add(element);
              }
            }
          }
        }
      }
    };
    traverseTimeline({ timeline: timeline_description });
    return {
      images: [...preloadPaths[ParameterType.IMAGE]],
      audio: [...preloadPaths[ParameterType.AUDIO]],
      video: [...preloadPaths[ParameterType.VIDEO]]
    };
  }
  cancelPreloads() {
    for (const request of this.preload_requests) {
      request.onload = () => {
      };
      request.onerror = () => {
      };
      request.oncanplaythrough = () => {
      };
      request.onabort = () => {
      };
    }
    this.preload_requests = [];
  }
  initializeMicrophoneRecorder(stream) {
    const recorder = new MediaRecorder(stream);
    this.microphone_recorder = recorder;
  }
  getMicrophoneRecorder() {
    return this.microphone_recorder;
  }
  initializeCameraRecorder(stream, opts) {
    let mimeType = this.getCompatibleMimeType() || "video/webm";
    const recorderOptions = {
      ...opts,
      mimeType
    };
    this.camera_stream = stream;
    const recorder = new MediaRecorder(stream, recorderOptions);
    this.camera_recorder = recorder;
  }
  // mimetype checking code adapted from https://github.com/lookit/lookit-jspsych/blob/develop/packages/record/src/videoConfig.ts#L673-L699
  /** returns a compatible mimetype string, or null if none from the array are supported. */
  getCompatibleMimeType() {
    const types = [
      // chrome firefox edge
      "video/webm;codecs=vp9,opus",
      "video/webm;codecs=vp8,opus",
      // general
      "video/mp4;codecs=avc1.42E01E,mp4a.40.2",
      // safari
      "video/mp4;codecs=h264,aac",
      "video/mp4;codecs=hevc,aac"
    ];
    for (const mimeType of types) {
      if (MediaRecorder.isTypeSupported(mimeType)) {
        return mimeType;
      }
    }
    return null;
  }
  getCameraStream() {
    return this.camera_stream;
  }
  getCameraRecorder() {
    return this.camera_recorder;
  }
}

class SimulationAPI {
  constructor(getDisplayContainerElement, setJsPsychTimeout) {
    this.getDisplayContainerElement = getDisplayContainerElement;
    this.setJsPsychTimeout = setJsPsychTimeout;
  }
  dispatchEvent(event) {
    this.getDisplayContainerElement().dispatchEvent(event);
  }
  /**
   * Dispatches a `keydown` event for the specified key
   * @param key Character code (`.key` property) for the key to press.
   */
  keyDown(key) {
    this.dispatchEvent(new KeyboardEvent("keydown", { key }));
  }
  /**
   * Dispatches a `keyup` event for the specified key
   * @param key Character code (`.key` property) for the key to press.
   */
  keyUp(key) {
    this.dispatchEvent(new KeyboardEvent("keyup", { key }));
  }
  /**
   * Dispatches a `keydown` and `keyup` event in sequence to simulate pressing a key.
   * @param key Character code (`.key` property) for the key to press.
   * @param delay Length of time to wait (ms) before executing action
   */
  pressKey(key, delay = 0) {
    if (delay > 0) {
      this.setJsPsychTimeout(() => {
        this.keyDown(key);
        this.keyUp(key);
      }, delay);
    } else {
      this.keyDown(key);
      this.keyUp(key);
    }
  }
  /**
   * Dispatches `mousedown`, `mouseup`, and `click` events on the target element
   * @param target The element to click
   * @param delay Length of time to wait (ms) before executing action
   */
  clickTarget(target, delay = 0) {
    if (delay > 0) {
      this.setJsPsychTimeout(() => {
        target.dispatchEvent(new MouseEvent("mousedown", { bubbles: true }));
        target.dispatchEvent(new MouseEvent("mouseup", { bubbles: true }));
        target.dispatchEvent(new MouseEvent("click", { bubbles: true }));
      }, delay);
    } else {
      target.dispatchEvent(new MouseEvent("mousedown", { bubbles: true }));
      target.dispatchEvent(new MouseEvent("mouseup", { bubbles: true }));
      target.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    }
  }
  /**
   * Sets the value of a target text input
   * @param target A text input element to fill in
   * @param text Text to input
   * @param delay Length of time to wait (ms) before executing action
   */
  fillTextInput(target, text, delay = 0) {
    if (delay > 0) {
      this.setJsPsychTimeout(() => {
        target.value = text;
      }, delay);
    } else {
      target.value = text;
    }
  }
  /**
   * Picks a valid key from `choices`, taking into account jsPsych-specific
   * identifiers like "NO_KEYS" and "ALL_KEYS".
   * @param choices Which keys are valid.
   * @returns A key selected at random from the valid keys.
   */
  getValidKey(choices) {
    const possible_keys = [
      "a",
      "b",
      "c",
      "d",
      "e",
      "f",
      "g",
      "h",
      "i",
      "j",
      "k",
      "l",
      "m",
      "n",
      "o",
      "p",
      "q",
      "r",
      "s",
      "t",
      "u",
      "v",
      "w",
      "x",
      "y",
      "z",
      "0",
      "1",
      "2",
      "3",
      "4",
      "5",
      "6",
      "7",
      "8",
      "9",
      " "
    ];
    let key;
    if (choices == "NO_KEYS") {
      key = null;
    } else if (choices == "ALL_KEYS") {
      key = possible_keys[Math.floor(Math.random() * possible_keys.length)];
    } else {
      const flat_choices = choices.flat();
      key = flat_choices[Math.floor(Math.random() * flat_choices.length)];
    }
    return key;
  }
  mergeSimulationData(default_data, simulation_options) {
    return {
      ...default_data,
      ...simulation_options?.data
    };
  }
  ensureSimulationDataConsistency(trial, data) {
    if (data.rt) {
      data.rt = Math.round(data.rt);
    }
    if (trial.trial_duration && data.rt && data.rt > trial.trial_duration) {
      data.rt = null;
      if (data.response) {
        data.response = null;
      }
      if (data.correct) {
        data.correct = false;
      }
    }
    if (trial.choices && trial.choices == "NO_KEYS") {
      if (data.rt) {
        data.rt = null;
      }
      if (data.response) {
        data.response = null;
      }
    }
    if (trial.allow_response_before_complete) {
      if (trial.sequence_reps && trial.frame_time) {
        const min_time = trial.sequence_reps * trial.frame_time * trial.stimuli.length;
        if (data.rt < min_time) {
          data.rt = null;
          data.response = null;
        }
      }
    }
  }
}

class TimeoutAPI {
  constructor() {
    this.timeout_handlers = [];
  }
  /**
   * Calls a function after a specified delay, in milliseconds.
   * @param callback The function to call after the delay.
   * @param delay The number of milliseconds to wait before calling the function.
   * @returns A handle that can be used to clear the timeout with clearTimeout.
   */
  setTimeout(callback, delay) {
    const handle = window.setTimeout(callback, delay);
    this.timeout_handlers.push(handle);
    return handle;
  }
  /**
   * Clears all timeouts that have been created with setTimeout.
   */
  clearAllTimeouts() {
    for (const handler of this.timeout_handlers) {
      clearTimeout(handler);
    }
    this.timeout_handlers = [];
  }
}

function createJointPluginAPIObject(jsPsych) {
  const settings = jsPsych.getInitSettings();
  const keyboardListenerAPI = new KeyboardListenerAPI(
    jsPsych.getDisplayContainerElement,
    settings.case_sensitive_responses,
    settings.minimum_valid_rt
  );
  const timeoutAPI = new TimeoutAPI();
  const mediaAPI = new MediaAPI(settings.use_webaudio);
  const simulationAPI = new SimulationAPI(
    jsPsych.getDisplayContainerElement,
    timeoutAPI.setTimeout.bind(timeoutAPI)
  );
  return Object.assign(
    {},
    ...[keyboardListenerAPI, timeoutAPI, mediaAPI, simulationAPI].map((object) => autoBind(object))
  );
}

function setSeed(seed = Math.random().toString()) {
  Math.random = seedrandom(seed);
  return seed;
}
function repeat(array, repetitions, unpack = false) {
  const arr_isArray = Array.isArray(array);
  const rep_isArray = Array.isArray(repetitions);
  if (!arr_isArray) {
    if (!rep_isArray) {
      array = [array];
      repetitions = [repetitions];
    } else {
      repetitions = [repetitions[0]];
      console.log(
        "Unclear parameters given to randomization.repeat. Multiple set sizes specified, but only one item exists to sample. Proceeding using the first set size."
      );
    }
  } else {
    if (!rep_isArray) {
      let reps = [];
      for (let i = 0; i < array.length; i++) {
        reps.push(repetitions);
      }
      repetitions = reps;
    } else {
      if (array.length != repetitions.length) {
        console.warn(
          "Unclear parameters given to randomization.repeat. Items and repetitions are unequal lengths. Behavior may not be as expected."
        );
        if (repetitions.length < array.length) {
          let reps = [];
          for (let i = 0; i < array.length; i++) {
            reps.push(repetitions);
          }
          repetitions = reps;
        } else {
          repetitions = repetitions.slice(0, array.length);
        }
      }
    }
  }
  let allsamples = [];
  for (let i = 0; i < array.length; i++) {
    for (let j = 0; j < repetitions[i]; j++) {
      if (array[i] == null || typeof array[i] != "object") {
        allsamples.push(array[i]);
      } else {
        allsamples.push(Object.assign({}, array[i]));
      }
    }
  }
  let out = shuffle(allsamples);
  if (unpack) {
    out = unpackArray(out);
  }
  return out;
}
function shuffle(array) {
  if (!Array.isArray(array)) {
    console.error("Argument to shuffle() must be an array.");
  }
  const copy_array = array.slice(0);
  let m = copy_array.length, t, i;
  while (m) {
    i = Math.floor(Math.random() * m--);
    t = copy_array[m];
    copy_array[m] = copy_array[i];
    copy_array[i] = t;
  }
  return copy_array;
}
function shuffleNoRepeats(arr, equalityTest) {
  if (!Array.isArray(arr)) {
    console.error("First argument to shuffleNoRepeats() must be an array.");
  }
  if (typeof equalityTest !== "undefined" && typeof equalityTest !== "function") {
    console.error("Second argument to shuffleNoRepeats() must be a function.");
  }
  if (typeof equalityTest == "undefined") {
    equalityTest = function(a, b) {
      if (a === b) {
        return true;
      } else {
        return false;
      }
    };
  }
  const random_shuffle = shuffle(arr);
  for (let i = 0; i < random_shuffle.length - 1; i++) {
    if (equalityTest(random_shuffle[i], random_shuffle[i + 1])) {
      let random_pick = Math.floor(Math.random() * (random_shuffle.length - 2)) + 1;
      while (equalityTest(random_shuffle[i + 1], random_shuffle[random_pick]) || equalityTest(random_shuffle[i + 1], random_shuffle[random_pick + 1]) || equalityTest(random_shuffle[i + 1], random_shuffle[random_pick - 1]) || equalityTest(random_shuffle[i], random_shuffle[random_pick])) {
        random_pick = Math.floor(Math.random() * (random_shuffle.length - 2)) + 1;
      }
      const new_neighbor = random_shuffle[random_pick];
      random_shuffle[random_pick] = random_shuffle[i + 1];
      random_shuffle[i + 1] = new_neighbor;
    }
  }
  return random_shuffle;
}
function shuffleAlternateGroups(arr_groups, random_group_order = false) {
  const n_groups = arr_groups.length;
  if (n_groups == 1) {
    console.warn(
      "shuffleAlternateGroups() was called with only one group. Defaulting to simple shuffle."
    );
    return shuffle(arr_groups[0]);
  }
  let group_order = [];
  for (let i = 0; i < n_groups; i++) {
    group_order.push(i);
  }
  if (random_group_order) {
    group_order = shuffle(group_order);
  }
  const randomized_groups = [];
  let min_length = null;
  for (let i = 0; i < n_groups; i++) {
    min_length = min_length === null ? arr_groups[i].length : Math.min(min_length, arr_groups[i].length);
    randomized_groups.push(shuffle(arr_groups[i]));
  }
  const out = [];
  for (let i = 0; i < min_length; i++) {
    for (let j = 0; j < group_order.length; j++) {
      out.push(randomized_groups[group_order[j]][i]);
    }
  }
  return out;
}
function sampleWithoutReplacement(arr, size) {
  if (!Array.isArray(arr)) {
    console.error("First argument to sampleWithoutReplacement() must be an array");
  }
  if (size > arr.length) {
    console.error("Cannot take a sample larger than the size of the set of items to sample.");
  }
  return shuffle(arr).slice(0, size);
}
function sampleWithReplacement(arr, size, weights) {
  if (!Array.isArray(arr)) {
    console.error("First argument to sampleWithReplacement() must be an array");
  }
  const normalized_weights = [];
  if (typeof weights !== "undefined") {
    if (weights.length !== arr.length) {
      console.error(
        "The length of the weights array must equal the length of the array to be sampled from."
      );
    }
    let weight_sum = 0;
    for (const weight of weights) {
      weight_sum += weight;
    }
    for (const weight of weights) {
      normalized_weights.push(weight / weight_sum);
    }
  } else {
    for (let i = 0; i < arr.length; i++) {
      normalized_weights.push(1 / arr.length);
    }
  }
  const cumulative_weights = [normalized_weights[0]];
  for (let i = 1; i < normalized_weights.length; i++) {
    cumulative_weights.push(normalized_weights[i] + cumulative_weights[i - 1]);
  }
  const samp = [];
  for (let i = 0; i < size; i++) {
    const rnd = Math.random();
    let index = 0;
    while (rnd > cumulative_weights[index]) {
      index++;
    }
    samp.push(arr[index]);
  }
  return samp;
}
function factorial(factors, repetitions = 1, unpack = false) {
  let design = [{}];
  for (const [factorName, factor] of Object.entries(factors)) {
    const new_design = [];
    for (const level of factor) {
      for (const cell of design) {
        new_design.push({ ...cell, [factorName]: level });
      }
    }
    design = new_design;
  }
  return repeat(design, repetitions, unpack);
}
function randomID(length = 32) {
  let result = "";
  const chars = "0123456789abcdefghjklmnopqrstuvwxyz";
  for (let i = 0; i < length; i++) {
    result += chars[Math.floor(Math.random() * chars.length)];
  }
  return result;
}
function randomInt(lower, upper) {
  if (upper < lower) {
    throw new Error("Upper boundary must be greater than or equal to lower boundary");
  }
  return lower + Math.floor(Math.random() * (upper - lower + 1));
}
function sampleBernoulli(p) {
  return Math.random() <= p ? 1 : 0;
}
function sampleNormal(mean, standard_deviation) {
  return randn_bm() * standard_deviation + mean;
}
function sampleExponential(rate) {
  return -Math.log(Math.random()) / rate;
}
function sampleExGaussian(mean, standard_deviation, rate, positive = false) {
  let s = sampleNormal(mean, standard_deviation) + sampleExponential(rate);
  if (positive) {
    while (s <= 0) {
      s = sampleNormal(mean, standard_deviation) + sampleExponential(rate);
    }
  }
  return s;
}
function randomWords(opts) {
  return rw(opts);
}
function randn_bm() {
  var u = 0, v = 0;
  while (u === 0) u = Math.random();
  while (v === 0) v = Math.random();
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
}
function unpackArray(array) {
  const out = {};
  for (const x of array) {
    for (const key of Object.keys(x)) {
      if (typeof out[key] === "undefined") {
        out[key] = [];
      }
      out[key].push(x[key]);
    }
  }
  return out;
}

var randomization = /*#__PURE__*/Object.freeze({
  __proto__: null,
  factorial: factorial,
  randomID: randomID,
  randomInt: randomInt,
  randomWords: randomWords,
  repeat: repeat,
  sampleBernoulli: sampleBernoulli,
  sampleExGaussian: sampleExGaussian,
  sampleExponential: sampleExponential,
  sampleNormal: sampleNormal,
  sampleWithReplacement: sampleWithReplacement,
  sampleWithoutReplacement: sampleWithoutReplacement,
  setSeed: setSeed,
  shuffle: shuffle,
  shuffleAlternateGroups: shuffleAlternateGroups,
  shuffleNoRepeats: shuffleNoRepeats
});

const SCHEMA_VERSION = 1;
const VIEWPORT_DEBOUNCE_MS = 100;
const MEDIA_TIME_THROTTLE_MS = 250;
const CANVAS_SNAPSHOT_MIN_INTERVAL_MS = 250;
const CANVAS_FULL_SNAPSHOT_AREA_FRACTION = 0.8;
const CANVAS_ANIMATION_MIN_INTERVAL_MS = 66;
const CANVAS_DRAW_METHODS = [
  "clearRect",
  "fillRect",
  "strokeRect",
  "fill",
  "stroke",
  "fillText",
  "strokeText",
  "drawImage",
  "putImageData"
];
class SessionRecorder {
  constructor(options) {
    this.displayElement = null;
    // Outermost layout root for the experiment. The spine in `initial_dom`
    // walks from `displayElement` up to and including this element so the
    // jsPsych layout containers (and the host's classes/attrs) are
    // captured. When unset we fall back to serializing only `displayElement`.
    this.displayContainer = null;
    this.running = false;
    this.startPerf = 0;
    this.currentTrial = null;
    this.nodeIds = /* @__PURE__ */ new WeakMap();
    this.nextNodeId = 1;
    this.mutationObserver = null;
    // Session-scope: tracks stylesheet `<style>`/`<link>` elements in
    // `<head>` so add/remove/update events can be emitted by stable id.
    this.headObserver = null;
    this.styleNodeIds = /* @__PURE__ */ new WeakMap();
    this.nextStylesheetId = 1;
    this.mouseRafScheduled = false;
    this.lastMouseX = 0;
    this.lastMouseY = 0;
    this.mouseDirty = false;
    this.scrollRafScheduled = false;
    // Pending scroll state to flush at next animation frame. Key "window"
    // refers to the document scroll; numeric keys are tracked node IDs.
    this.pendingScroll = /* @__PURE__ */ new Map();
    this.inputRafScheduled = false;
    // Latest value-per-input collected within the current animation frame.
    // Coalesced so a fast typist produces one record per RAF rather than
    // one per keystroke (matching how mouse.move is throttled).
    this.pendingInput = /* @__PURE__ */ new Map();
    this.viewportTimer = null;
    this.lastViewport = null;
    this.mediaListeners = /* @__PURE__ */ new WeakMap();
    this.mediaTimeLast = /* @__PURE__ */ new WeakMap();
    // Strong ref to currently tracked media elements so we can iterate and
    // remove their listeners when the trial ends. Cleared on detach.
    this.mediaTrackedElements = /* @__PURE__ */ new Set();
    // Strong ref to canvas elements within the current trial's display
    // subtree. Used to drive deferred snapshotting after gestures and at
    // trial end. Per-canvas throttle/dedupe state is held alongside.
    this.canvasTrackedElements = /* @__PURE__ */ new Set();
    this.canvasLastSnapshot = /* @__PURE__ */ new WeakMap();
    this.canvasLastSnapshotTime = /* @__PURE__ */ new WeakMap();
    this.canvasSnapshotScheduled = false;
    // Last full-canvas pixel buffer per tracked canvas, used to compute
    // the bounding box of changed pixels so subsequent snapshots can ship
    // only the dirty rectangle. Cleared on canvas removal and on trial
    // teardown. Absent for canvases that don't expose a 2d context (e.g.
    // WebGL) — those always emit full snapshots.
    this.canvasShadowData = /* @__PURE__ */ new WeakMap();
    this.canvasInitialSnapshotScheduled = false;
    // Set to true by the patched 2d-context draw methods whenever a
    // tracked canvas is mutated. The frame tick reads-and-clears it to
    // decide which canvases need a fresh diff.
    this.canvasDirty = /* @__PURE__ */ new WeakMap();
    // Last time the draw-detection path emitted (or attempted to emit) a
    // snapshot for each canvas. Drives `CANVAS_ANIMATION_MIN_INTERVAL_MS`
    // throttling without conflicting with the gesture-path throttle in
    // `canvasLastSnapshotTime`.
    this.canvasAnimationLastTime = /* @__PURE__ */ new WeakMap();
    this.canvasFrameLoopScheduled = false;
    // Patched draw methods on `CanvasRenderingContext2D.prototype`. We
    // restore them on `stop()` so opting in to recording does not leave
    // wrappers in place after the experiment ends, even if the recorder
    // auto-stopped due to abort or unload.
    this.canvasContextPatched = false;
    this.originalCanvasMethods = /* @__PURE__ */ new Map();
    // Reference to whatever `Math.random` was immediately before the recorder
    // started. Restored verbatim on stop so opting into recording does not
    // permanently alter `Math.random`, even if we auto-seeded.
    this.originalMathRandom = Math.random;
    this.mathRandomPatched = false;
    this.boundHandlers = [];
    this.scheduleViewportRead = () => {
      if (this.viewportTimer) clearTimeout(this.viewportTimer);
      this.viewportTimer = setTimeout(() => {
        this.viewportTimer = null;
        const v = readViewport();
        const last = this.lastViewport;
        if (!last || last.w !== v.w || last.h !== v.h || last.dpr !== v.dpr || last.scale !== v.scale || last.offset_x !== v.offset_x || last.offset_y !== v.offset_y) {
          this.lastViewport = v;
          this.recording.viewport_changes.push({ t: this.t(), ...v });
        }
      }, VIEWPORT_DEBOUNCE_MS);
    };
    // -------- input handlers --------
    this.handleMouseMove = (ev) => {
      const e = ev;
      this.lastMouseX = e.clientX;
      this.lastMouseY = e.clientY;
      this.mouseDirty = true;
      if (!this.mouseRafScheduled) {
        this.mouseRafScheduled = true;
        requestAnimationFrame(() => {
          this.mouseRafScheduled = false;
          this.flushPendingMouse();
        });
      }
    };
    this.handleScroll = (ev) => {
      const target = ev.target;
      if (target === document || target === document.documentElement || target === document.body) {
        this.pendingScroll.set("window", {
          x: window.scrollX,
          y: window.scrollY
        });
      } else if (target instanceof Element) {
        const id = this.nodeIds.get(target);
        if (id === void 0) return;
        this.pendingScroll.set(id, { x: target.scrollLeft, y: target.scrollTop });
      } else {
        return;
      }
      if (!this.scrollRafScheduled) {
        this.scrollRafScheduled = true;
        requestAnimationFrame(() => {
          this.scrollRafScheduled = false;
          this.flushPendingScroll();
        });
      }
    };
    // `input` events come from text-like form fields, textareas, and sliders.
    // Checkboxes/radios/selects also fire `input`, but they're routed through
    // `handleChangeEvent` instead so we don't double-record. The MutationObserver
    // can't see these changes — typing updates the IDL `value` property, not
    // the DOM `value` attribute.
    this.handleInputEvent = (ev) => {
      const target = ev.target;
      if (!(target instanceof Element)) return;
      if (target instanceof HTMLInputElement) {
        const t = target.type;
        if (t === "checkbox" || t === "radio" || t === "file") return;
      } else if (!(target instanceof HTMLTextAreaElement)) {
        return;
      }
      const id = this.nodeIds.get(target);
      if (id === void 0) return;
      this.pendingInput.set(id, target.value);
      if (!this.inputRafScheduled) {
        this.inputRafScheduled = true;
        requestAnimationFrame(() => {
          this.inputRafScheduled = false;
          this.flushPendingInput();
        });
      }
    };
    this.handleChangeEvent = (ev) => {
      const target = ev.target;
      if (!(target instanceof Element)) return;
      const id = this.nodeIds.get(target);
      if (id === void 0) return;
      if (target instanceof HTMLInputElement) {
        const ttype = target.type;
        if (ttype === "checkbox" || ttype === "radio") {
          this.pushEvent({ type: "input.checked", t: this.t(), node: id, checked: target.checked });
        }
      } else if (target instanceof HTMLSelectElement) {
        const values = Array.from(target.selectedOptions).map((o) => o.value);
        this.pushEvent({ type: "input.select", t: this.t(), node: id, values });
      }
    };
    this.runCanvasFrameTick = () => {
      this.canvasFrameLoopScheduled = false;
      if (!this.running) return;
      const t = this.t();
      for (const canvas of this.canvasTrackedElements) {
        if (!this.canvasDirty.get(canvas)) continue;
        const last = this.canvasAnimationLastTime.get(canvas) ?? -Infinity;
        if (t - last < CANVAS_ANIMATION_MIN_INTERVAL_MS) continue;
        this.canvasAnimationLastTime.set(canvas, t);
        this.canvasDirty.set(canvas, false);
        this.snapshotCanvas(canvas, t, true);
      }
    };
    this.jspsychVersion = options.jspsychVersion;
    this.recording = this.createBlankRecording();
  }
  createBlankRecording() {
    return {
      schema_version: SCHEMA_VERSION,
      jspsych_version: this.jspsychVersion,
      recording_started_at: "",
      recording_started_at_perf: 0,
      user_agent: typeof navigator !== "undefined" ? navigator.userAgent : "",
      viewport: { w: 0, h: 0, dpr: 1, scale: 1, offset_x: 0, offset_y: 0 },
      rng: { seed: null, math_random_patched: false },
      display_element_id: "",
      stylesheets: [],
      stylesheet_events: [],
      trials: [],
      viewport_changes: [],
      rng_calls: [],
      ended_at_perf: null,
      end_reason: null
    };
  }
  // -------- lifecycle --------
  start(displayElement, displayContainer) {
    if (this.running) return;
    if (this.recording.end_reason !== null) {
      this.recording = this.createBlankRecording();
    }
    this.running = true;
    this.displayElement = displayElement;
    this.displayContainer = displayContainer ?? null;
    this.startPerf = performance.now();
    this.recording.recording_started_at = (/* @__PURE__ */ new Date()).toISOString();
    this.recording.recording_started_at_perf = this.startPerf;
    this.recording.display_element_id = displayElement.id || "";
    this.recording.viewport = readViewport();
    this.lastViewport = { ...this.recording.viewport };
    this.currentTrial = null;
    this.resetNodeIds();
    this.styleNodeIds = /* @__PURE__ */ new WeakMap();
    this.nextStylesheetId = 1;
    this.recording.stylesheets = this.captureStylesheets();
    this.mouseDirty = false;
    this.mouseRafScheduled = false;
    this.scrollRafScheduled = false;
    this.pendingScroll.clear();
    this.inputRafScheduled = false;
    this.pendingInput.clear();
    this.canvasFrameLoopScheduled = false;
    this.canvasInitialSnapshotScheduled = false;
    this.patchMathRandom();
    this.patchCanvasContext();
    this.attachSessionListeners();
  }
  stop(reason = "finished") {
    if (!this.running) return;
    if (this.currentTrial !== null) {
      this.flushPendingMouse();
      this.flushPendingScroll();
      this.flushPendingInput();
      this.captureCanvasSnapshots(true);
      this.currentTrial.t_end = this.t();
      this.currentTrial = null;
    }
    this.detachTrialListeners();
    this.detachSessionListeners();
    this.unpatchMathRandom();
    this.unpatchCanvasContext();
    this.recording.ended_at_perf = this.t();
    this.recording.end_reason = reason;
    this.running = false;
  }
  getRecording() {
    return this.recording;
  }
  // -------- per-trial hooks --------
  onTrialStart(info) {
    this.currentTrial = {
      trial_index: info.trial_index,
      t_start: this.t(),
      t_dom_ready: null,
      t_end: null,
      plugin: info.plugin,
      initial_dom: null,
      events: [],
      trial_data: null
    };
    this.recording.trials.push(this.currentTrial);
  }
  onTrialLoad() {
    if (!this.currentTrial || !this.displayElement) return;
    this.currentTrial.t_dom_ready = this.t();
    this.resetNodeIds();
    this.currentTrial.initial_dom = this.serializeDisplaySpine(this.displayElement);
    this.attachTrialListeners();
    this.scanForMediaElements(this.displayElement);
    this.scanForCanvasElements(this.displayElement);
  }
  onTrialFinish(trialData) {
    if (!this.currentTrial) return;
    this.flushPendingMouse();
    this.flushPendingScroll();
    this.flushPendingInput();
    this.captureCanvasSnapshots(true);
    this.detachTrialListeners();
    this.currentTrial.t_end = this.t();
    this.currentTrial.trial_data = serializeJson(trialData);
    this.currentTrial = null;
  }
  // -------- session listeners (viewport, focus) --------
  attachSessionListeners() {
    this.bind(window, "resize", this.scheduleViewportRead);
    if (window.visualViewport) {
      this.bind(window.visualViewport, "resize", this.scheduleViewportRead);
      this.bind(window.visualViewport, "scroll", this.scheduleViewportRead);
    }
    this.bind(window, "focus", () => this.pushFocus("focus"));
    this.bind(window, "blur", () => this.pushFocus("blur"));
    this.bind(document, "fullscreenchange", () => {
      this.pushFocus(document.fullscreenElement ? "fullscreen.enter" : "fullscreen.exit");
    });
    if (document.head) {
      this.headObserver = new MutationObserver((records) => this.handleHeadMutations(records));
      this.headObserver.observe(document.head, {
        childList: true,
        subtree: true,
        characterData: true
      });
    }
  }
  detachSessionListeners() {
    if (this.viewportTimer) {
      clearTimeout(this.viewportTimer);
      this.viewportTimer = null;
    }
    if (this.headObserver) {
      const pending = this.headObserver.takeRecords();
      if (pending.length > 0) this.handleHeadMutations(pending);
      this.headObserver.disconnect();
      this.headObserver = null;
    }
    for (const b of this.boundHandlers) {
      b.target.removeEventListener(b.type, b.handler, b.options);
    }
    this.boundHandlers = [];
  }
  pushFocus(type) {
    this.pushEvent({ type, t: this.t() });
  }
  // -------- per-trial listeners (DOM, input, media) --------
  attachTrialListeners() {
    if (!this.displayElement) return;
    const el = this.displayElement;
    this.mutationObserver = new MutationObserver((records) => this.handleMutations(records));
    this.mutationObserver.observe(el, {
      childList: true,
      subtree: true,
      attributes: true,
      characterData: true
    });
    this.bind(window, "mousemove", this.handleMouseMove, true);
    this.bind(window, "mousedown", this.handleMouseButton("mouse.down"), true);
    this.bind(window, "mouseup", this.handleMouseButton("mouse.up"), true);
    this.bind(window, "click", this.handleMouseButton("mouse.click"), true);
    this.bind(document, "touchstart", this.handleTouch("touch.start"), {
      passive: true,
      capture: true
    });
    this.bind(document, "touchmove", this.handleTouch("touch.move"), {
      passive: true,
      capture: true
    });
    this.bind(document, "touchend", this.handleTouch("touch.end"), {
      passive: true,
      capture: true
    });
    this.bind(document, "keydown", this.handleKey("key.down"), true);
    this.bind(document, "keyup", this.handleKey("key.up"), true);
    this.bind(document, "copy", this.handleClipboard("clipboard.copy"), true);
    this.bind(document, "cut", this.handleClipboard("clipboard.cut"), true);
    this.bind(document, "paste", this.handleClipboard("clipboard.paste"), true);
    this.bind(document, "scroll", this.handleScroll, true);
    this.bind(document, "input", this.handleInputEvent, true);
    this.bind(document, "change", this.handleChangeEvent, true);
  }
  detachTrialListeners() {
    if (this.mutationObserver) {
      this.mutationObserver.disconnect();
      this.mutationObserver = null;
    }
    this.detachMediaListeners();
    this.canvasTrackedElements.clear();
    this.canvasSnapshotScheduled = false;
    this.canvasInitialSnapshotScheduled = false;
    const remaining = [];
    for (const b of this.boundHandlers) {
      if (b.trial) {
        b.target.removeEventListener(b.type, b.handler, b.options);
      } else {
        remaining.push(b);
      }
    }
    this.boundHandlers = remaining;
  }
  // -------- mutation handling --------
  handleMutations(records) {
    const t = this.t();
    for (const r of records) {
      try {
        if (r.type === "childList") {
          for (const removed of Array.from(r.removedNodes)) {
            const id = this.nodeIds.get(removed);
            if (id !== void 0) {
              this.pushEvent({ type: "dom.remove", t, node: id });
              this.releaseSubtree(removed);
            }
          }
          const parentId = this.nodeIds.get(r.target);
          if (parentId === void 0) continue;
          for (const added of Array.from(r.addedNodes)) {
            if (this.nodeIds.has(added)) continue;
            const node = this.serializeNode(added);
            if (!node) continue;
            const before = this.findTrackedSibling(added.nextSibling);
            this.pushEvent({ type: "dom.add", t, parent: parentId, before, node });
            if (added instanceof HTMLMediaElement) this.attachMediaListeners(added);
            else if (added instanceof Element) this.scanForMediaElements(added);
            if (added instanceof HTMLCanvasElement) this.trackCanvasElement(added);
            else if (added instanceof Element) this.scanForCanvasElements(added);
          }
        } else if (r.type === "attributes") {
          const id = this.nodeIds.get(r.target);
          if (id === void 0) continue;
          const name = r.attributeName;
          const target = r.target;
          const value = target.getAttribute(name);
          this.pushEvent({ type: "dom.attr", t, node: id, name, value });
        } else if (r.type === "characterData") {
          const id = this.nodeIds.get(r.target);
          if (id === void 0) continue;
          this.pushEvent({
            type: "dom.text",
            t,
            node: id,
            text: r.target.data
          });
        }
      } catch {
      }
    }
  }
  findTrackedSibling(start) {
    let cur = start;
    while (cur) {
      const id = this.nodeIds.get(cur);
      if (id !== void 0) return id;
      cur = cur.nextSibling;
    }
    return null;
  }
  releaseSubtree(node) {
    if (node instanceof HTMLCanvasElement && this.canvasTrackedElements.has(node)) {
      this.snapshotCanvas(node, this.t(), true);
      this.canvasTrackedElements.delete(node);
      this.canvasShadowData.delete(node);
    }
    if (this.nodeIds.has(node)) {
      this.nodeIds.delete(node);
    }
    if (node.hasChildNodes()) {
      for (const child of Array.from(node.childNodes)) {
        this.releaseSubtree(child);
      }
    }
  }
  // Serializes `displayElement` plus the chain of ancestors leading up
  // to (and including) `displayContainer`. The returned tree is a
  // "spine": each ancestor is captured with its tag and attributes, but
  // only the descendant on the path to `displayElement` appears as a
  // child — sibling content (e.g. unrelated body elements when
  // `display_element` is `<body>`) is intentionally omitted.
  //
  // Without this, `initial_dom` would only contain `<div class=
  // "jspsych-content">` and the trial subtree below it. The CSS that
  // vertically centers experiment content lives on the wrappers
  // (`jspsych-content-wrapper`, `jspsych-display-element`); replayers
  // need those nodes to exist for `margin: auto` and the flex column
  // to do their work.
  //
  // If no `displayContainer` was provided to `start()`, we fall back to
  // serializing only `displayElement` so existing callers don't change
  // behavior.
  serializeDisplaySpine(displayElement) {
    let root = this.serializeNode(displayElement);
    if (!root) return null;
    if (!this.displayContainer || this.displayContainer === displayElement) return root;
    let cur = displayElement.parentElement;
    while (cur) {
      root = this.wrapInElement(cur, root);
      if (cur === this.displayContainer) break;
      cur = cur.parentElement;
    }
    return root;
  }
  wrapInElement(el, child) {
    const attrs = {};
    for (const a of Array.from(el.attributes)) attrs[a.name] = a.value;
    return {
      id: this.assignId(el),
      kind: "element",
      tag: el.tagName.toLowerCase(),
      attrs,
      children: [child]
    };
  }
  serializeNode(node) {
    if (node.nodeType === Node.ELEMENT_NODE) {
      const el = node;
      const id = this.assignId(el);
      const attrs = {};
      for (const a of Array.from(el.attributes)) attrs[a.name] = a.value;
      const out = {
        id,
        kind: "element",
        tag: el.tagName.toLowerCase(),
        attrs,
        children: []
      };
      if (el instanceof HTMLCanvasElement) {
        out.canvas_size = { w: el.width, h: el.height };
      }
      if (el instanceof HTMLMediaElement) {
        out.media_src = el.currentSrc || el.src || "";
      }
      for (const child of Array.from(el.childNodes)) {
        const sc = this.serializeNode(child);
        if (sc) out.children.push(sc);
      }
      return out;
    }
    if (node.nodeType === Node.TEXT_NODE) {
      return { id: this.assignId(node), kind: "text", text: node.data };
    }
    if (node.nodeType === Node.COMMENT_NODE) {
      return { id: this.assignId(node), kind: "comment", text: node.data };
    }
    return null;
  }
  // -------- stylesheet snapshot --------
  // Captured at session start so a replayer can apply the same CSS to the
  // recorded DOM. Without this, `initial_dom` reconstructs structure but
  // not appearance — class hooks like `.jspsych-display-element` have no
  // rules to attach to.
  //
  // We walk the DOM directly (rather than just `document.styleSheets`) so
  // that <link rel="stylesheet"> tags whose sheet has not yet loaded — or
  // failed to load — are still captured by href. For each element we then
  // try to read the resolved rule text via the associated CSSStyleSheet:
  //   - <style> tags: read `cssRules` (always readable for same-document
  //     inline sheets); fall back to the element's `textContent` if rule
  //     access throws.
  //   - <link rel="stylesheet">: read `cssRules` if the sheet is loaded
  //     and same-origin (or CORS-permissive). Otherwise record `href`
  //     with `css: null` so a replayer can refetch out-of-band.
  // Each captured element is registered in `styleNodeIds` so the head
  // observer can emit remove/update events referencing the same id.
  captureStylesheets() {
    if (typeof document === "undefined") return [];
    const out = [];
    const elements = document.querySelectorAll('style, link[rel~="stylesheet"]');
    for (const el of Array.from(elements)) {
      const snap = this.snapshotStylesheetElement(el);
      if (snap) out.push(snap);
    }
    for (const sheet of Array.from(document.styleSheets)) {
      try {
        const owner = sheet.ownerNode;
        if (owner && this.styleNodeIds.has(owner)) continue;
        const css = readSheetText(sheet);
        const media = sheet.media && sheet.media.mediaText ? sheet.media.mediaText : null;
        if (sheet.href) {
          out.push({ id: this.nextStylesheetId++, kind: "link", href: sheet.href, css, media });
        } else if (css !== null) {
          out.push({ id: this.nextStylesheetId++, kind: "inline", css, media });
        }
      } catch {
      }
    }
    return out;
  }
  // Builds a snapshot for a single `<style>` or `<link rel=stylesheet>`
  // element and registers it in `styleNodeIds`. Returns null if the
  // element is not a stylesheet kind we track. Used both by the initial
  // capture and by the head observer for added nodes.
  snapshotStylesheetElement(el) {
    try {
      const sheet = el.sheet ?? null;
      const media = readMedia(el, sheet);
      if (el instanceof HTMLLinkElement) {
        if (!/(^|\s)stylesheet(\s|$)/i.test(el.rel)) return null;
        const href = el.href || el.getAttribute("href") || "";
        const id = this.nextStylesheetId++;
        this.styleNodeIds.set(el, id);
        return { id, kind: "link", href, css: sheet ? readSheetText(sheet) : null, media };
      }
      if (el instanceof HTMLStyleElement) {
        const css = (sheet ? readSheetText(sheet) : null) ?? el.textContent ?? "";
        const id = this.nextStylesheetId++;
        this.styleNodeIds.set(el, id);
        return { id, kind: "inline", css, media };
      }
    } catch {
    }
    return null;
  }
  // Reads the current resolved CSS text for a tracked `<style>` element,
  // preferring `sheet.cssRules` (which reflects rule-level edits made via
  // CSSOM) and falling back to the element's `textContent`.
  readStyleCss(el) {
    try {
      const sheet = el.sheet ?? null;
      if (sheet) {
        const text = readSheetText(sheet);
        if (text !== null) return text;
      }
    } catch {
    }
    return el.textContent ?? "";
  }
  handleHeadMutations(records) {
    const t = this.t();
    const updated = /* @__PURE__ */ new Set();
    for (const r of records) {
      try {
        if (r.type === "childList") {
          if (r.target instanceof HTMLStyleElement && this.styleNodeIds.has(r.target)) {
            updated.add(r.target);
            continue;
          }
          for (const removed of Array.from(r.removedNodes)) {
            const id = this.styleNodeIds.get(removed);
            if (id === void 0) continue;
            this.styleNodeIds.delete(removed);
            this.recording.stylesheet_events.push({ type: "stylesheet.remove", t, id });
          }
          for (const added of Array.from(r.addedNodes)) {
            if (!(added instanceof HTMLStyleElement) && !(added instanceof HTMLLinkElement)) {
              continue;
            }
            if (this.styleNodeIds.has(added)) continue;
            const snap = this.snapshotStylesheetElement(added);
            if (snap)
              this.recording.stylesheet_events.push({ type: "stylesheet.add", t, sheet: snap });
          }
        } else if (r.type === "characterData") {
          let target = r.target;
          while (target && !(target instanceof HTMLStyleElement)) {
            target = target.parentNode;
          }
          if (target && this.styleNodeIds.has(target)) {
            updated.add(target);
          }
        }
      } catch {
      }
    }
    for (const el of updated) {
      const id = this.styleNodeIds.get(el);
      if (id === void 0) continue;
      this.recording.stylesheet_events.push({
        type: "stylesheet.update",
        t,
        id,
        css: this.readStyleCss(el)
      });
    }
  }
  assignId(node) {
    let id = this.nodeIds.get(node);
    if (id === void 0) {
      id = this.nextNodeId++;
      this.nodeIds.set(node, id);
    }
    return id;
  }
  resetNodeIds() {
    this.nodeIds = /* @__PURE__ */ new WeakMap();
    this.nextNodeId = 1;
  }
  flushPendingMouse() {
    if (!this.mouseDirty) return;
    this.mouseDirty = false;
    this.pushEvent({
      type: "mouse.move",
      t: this.t(),
      x: this.lastMouseX,
      y: this.lastMouseY
    });
  }
  flushPendingInput() {
    if (this.pendingInput.size === 0) return;
    const t = this.t();
    for (const [node, value] of this.pendingInput) {
      this.pushEvent({ type: "input.value", t, node, value });
    }
    this.pendingInput.clear();
  }
  flushPendingScroll() {
    if (this.pendingScroll.size === 0) return;
    const t = this.t();
    for (const [key, pos] of this.pendingScroll) {
      if (key === "window") {
        this.pushEvent({ type: "scroll.window", t, x: pos.x, y: pos.y });
      } else {
        this.pushEvent({ type: "scroll.element", t, node: key, x: pos.x, y: pos.y });
      }
    }
    this.pendingScroll.clear();
  }
  handleMouseButton(type) {
    return (ev) => {
      const e = ev;
      this.pushEvent({
        type,
        t: this.t(),
        x: e.clientX,
        y: e.clientY,
        button: e.button,
        target: this.targetId(e.target)
      });
      if (type === "mouse.up") this.scheduleCanvasSnapshot();
    };
  }
  handleTouch(type) {
    return (ev) => {
      const e = ev;
      const touches = Array.from(e.changedTouches).map((tt) => ({
        id: tt.identifier,
        x: tt.clientX,
        y: tt.clientY
      }));
      this.pushEvent({ type, t: this.t(), touches });
      if (type === "touch.end") this.scheduleCanvasSnapshot();
    };
  }
  handleKey(type) {
    return (ev) => {
      const e = ev;
      this.pushEvent({
        type,
        t: this.t(),
        key: e.key,
        code: e.code,
        mods: { ctrl: e.ctrlKey, shift: e.shiftKey, alt: e.altKey, meta: e.metaKey },
        repeat: e.repeat,
        target: this.targetId(e.target)
      });
    };
  }
  handleClipboard(type) {
    return (ev) => {
      const e = ev;
      let text = null;
      let html = null;
      try {
        text = e.clipboardData?.getData("text/plain") ?? null;
        html = e.clipboardData?.getData("text/html") ?? null;
        if (html === "") html = null;
      } catch {
      }
      this.pushEvent({ type, t: this.t(), text, html, target: this.targetId(e.target) });
    };
  }
  targetId(target) {
    if (!target || !(target instanceof Node)) return null;
    return this.nodeIds.get(target) ?? null;
  }
  // -------- media handling --------
  scanForMediaElements(root) {
    if (root instanceof HTMLMediaElement) this.attachMediaListeners(root);
    const els = root.querySelectorAll("video, audio");
    for (const el of Array.from(els)) {
      this.attachMediaListeners(el);
    }
  }
  attachMediaListeners(media) {
    if (this.mediaListeners.has(media)) return;
    const id = this.assignId(media);
    const handler = (ev) => {
      let type;
      switch (ev.type) {
        case "play":
          type = "media.play";
          break;
        case "pause":
          type = "media.pause";
          break;
        case "ended":
          type = "media.ended";
          break;
        case "seeked":
          type = "media.seeked";
          break;
        case "timeupdate": {
          const now = performance.now();
          const last = this.mediaTimeLast.get(media) ?? 0;
          if (now - last < MEDIA_TIME_THROTTLE_MS) return;
          this.mediaTimeLast.set(media, now);
          type = "media.time";
          break;
        }
        default:
          return;
      }
      this.pushEvent({ type, t: this.t(), node: id, current_time: media.currentTime });
    };
    media.addEventListener("play", handler);
    media.addEventListener("pause", handler);
    media.addEventListener("ended", handler);
    media.addEventListener("seeked", handler);
    media.addEventListener("timeupdate", handler);
    this.mediaTrackedElements.add(media);
    this.mediaListeners.set(media, handler);
  }
  detachMediaListeners() {
    for (const media of this.mediaTrackedElements) {
      const handler = this.mediaListeners.get(media);
      if (!handler) continue;
      media.removeEventListener("play", handler);
      media.removeEventListener("pause", handler);
      media.removeEventListener("ended", handler);
      media.removeEventListener("seeked", handler);
      media.removeEventListener("timeupdate", handler);
      this.mediaListeners.delete(media);
    }
    this.mediaTrackedElements.clear();
  }
  // -------- canvas snapshotting --------
  // Walks `root` for `<canvas>` elements and registers each one for
  // snapshotting. Called on trial load and when subtrees are added
  // mid-trial via `dom.add`.
  scanForCanvasElements(root) {
    if (root instanceof HTMLCanvasElement) {
      this.trackCanvasElement(root);
      return;
    }
    const els = root.querySelectorAll("canvas");
    for (const el of Array.from(els)) {
      this.trackCanvasElement(el);
    }
  }
  trackCanvasElement(canvas) {
    this.canvasTrackedElements.add(canvas);
    this.scheduleInitialCanvasSnapshot();
  }
  // Wraps the pixel-mutating methods on `CanvasRenderingContext2D`
  // so the recorder is notified whenever a tracked canvas is drawn to.
  // The wrapper sets a per-canvas dirty flag and schedules a frame
  // tick; the original method is then called with the original `this`
  // and arguments so the wrap is invisible to plugin code. Idempotent
  // and per-instance: the originals captured here are restored on
  // `stop()`, even across nested recorder lifetimes.
  patchCanvasContext() {
    if (this.canvasContextPatched) return;
    if (typeof CanvasRenderingContext2D === "undefined") return;
    const proto = CanvasRenderingContext2D.prototype;
    const recorder = this;
    for (const method of CANVAS_DRAW_METHODS) {
      const original = proto[method];
      if (typeof original !== "function") continue;
      this.originalCanvasMethods.set(method, original);
      proto[method] = function(...args) {
        try {
          const canvas = this.canvas;
          if (canvas && recorder.canvasTrackedElements.has(canvas)) {
            recorder.canvasDirty.set(canvas, true);
            recorder.scheduleCanvasFrameTick();
          }
        } catch {
        }
        return original.apply(this, args);
      };
    }
    this.canvasContextPatched = true;
  }
  unpatchCanvasContext() {
    if (!this.canvasContextPatched) return;
    if (typeof CanvasRenderingContext2D === "undefined") return;
    const proto = CanvasRenderingContext2D.prototype;
    for (const [method, original] of this.originalCanvasMethods) {
      proto[method] = original;
    }
    this.originalCanvasMethods.clear();
    this.canvasContextPatched = false;
  }
  // Coalesces draw notifications into a single per-frame tick. Multiple
  // draw calls between two animation frames (e.g. a stroke composed of
  // many `lineTo`+`stroke` pairs) collapse to one snapshot attempt. The
  // tick does not re-schedule itself; further draws will reschedule it,
  // and quiescent canvases produce no work.
  scheduleCanvasFrameTick() {
    if (this.canvasFrameLoopScheduled) return;
    if (!this.running) return;
    this.canvasFrameLoopScheduled = true;
    requestAnimationFrame(this.runCanvasFrameTick);
  }
  // Defers an unconditional snapshot to the next animation frame so we
  // wait for any synchronous drawing during plugin setup (or during
  // user `on_load`) to commit. Distinct from `scheduleCanvasSnapshot`,
  // which respects the per-canvas throttle: initial baselines must not
  // be throttled out by an immediately preceding gesture.
  scheduleInitialCanvasSnapshot() {
    if (this.canvasInitialSnapshotScheduled) return;
    if (this.canvasTrackedElements.size === 0) return;
    this.canvasInitialSnapshotScheduled = true;
    requestAnimationFrame(() => {
      this.canvasInitialSnapshotScheduled = false;
      this.captureCanvasSnapshots(true);
    });
  }
  // Defers actual snapshotting to the next animation frame so we wait
  // until the page has had a chance to paint the post-gesture state
  // (otherwise `toDataURL` could return the canvas as it was *before*
  // the up event's listeners ran). Coalesced via a single scheduled flag
  // so a flurry of mouseups doesn't queue redundant work.
  scheduleCanvasSnapshot() {
    if (this.canvasSnapshotScheduled) return;
    if (this.canvasTrackedElements.size === 0) return;
    this.canvasSnapshotScheduled = true;
    requestAnimationFrame(() => {
      this.canvasSnapshotScheduled = false;
      this.captureCanvasSnapshots(false);
    });
  }
  // Throttles to at most one snapshot per canvas per
  // `CANVAS_SNAPSHOT_MIN_INTERVAL_MS`, and dedupes by data URL so a
  // canvas whose pixels did not actually change does not produce noise.
  // `force` bypasses the throttle for trial-end captures so the final
  // state of every canvas is always recorded.
  captureCanvasSnapshots(force) {
    if (this.canvasTrackedElements.size === 0) return;
    const now = this.t();
    for (const canvas of this.canvasTrackedElements) {
      this.snapshotCanvas(canvas, now, force);
    }
  }
  // Pushes a `canvas.snapshot` event for one canvas, applying the
  // per-canvas throttle (unless `force`). Diffs the canvas's current
  // pixels against the last shadow buffer to find the changed bounding
  // box; emits a partial snapshot when the dirty area is small and a
  // full snapshot otherwise. The first snapshot per canvas is always
  // full so subsequent partials have a baseline.
  //
  // Also called from `releaseSubtree` to capture the final pixel state
  // at the moment a canvas is removed from the trial DOM — jsPsych core
  // clears the display element via `innerHTML = ""` before
  // `onTrialFinish` runs, so a trial-end-only flush would miss it.
  snapshotCanvas(canvas, t, force) {
    const id = this.nodeIds.get(canvas);
    if (id === void 0) return;
    if (!force) {
      const last = this.canvasLastSnapshotTime.get(canvas) ?? -Infinity;
      if (t - last < CANVAS_SNAPSHOT_MIN_INTERVAL_MS) return;
    }
    const w = canvas.width;
    const h = canvas.height;
    if (w === 0 || h === 0) return;
    try {
      const ctx = getReadable2dContext(canvas);
      const shadow = this.canvasShadowData.get(canvas);
      const shadowValid = !!shadow && shadow.width === w && shadow.height === h;
      if (!ctx) {
        this.emitFullCanvasSnapshot(canvas, id, t);
        return;
      }
      if (!shadowValid) {
        const current2 = ctx.getImageData(0, 0, w, h);
        this.canvasShadowData.set(canvas, current2);
        this.emitFullCanvasSnapshot(canvas, id, t);
        return;
      }
      const current = ctx.getImageData(0, 0, w, h);
      const bbox = computeDiffBbox(shadow.data, current.data, w, h);
      if (!bbox) return;
      const fullThreshold = w * h * CANVAS_FULL_SNAPSHOT_AREA_FRACTION;
      if (bbox.w * bbox.h >= fullThreshold) {
        this.canvasShadowData.set(canvas, current);
        this.emitFullCanvasSnapshot(canvas, id, t);
        return;
      }
      const dataUrl = cropCanvasToDataURL(canvas, bbox);
      this.canvasShadowData.set(canvas, current);
      this.canvasLastSnapshotTime.set(canvas, t);
      this.pushEvent({
        type: "canvas.snapshot",
        t,
        node: id,
        data_url: dataUrl,
        region: bbox
      });
    } catch {
    }
  }
  // Emits a full-canvas snapshot, applying the same data-URL dedupe the
  // pre-diff implementation used. Useful for first captures, near-full
  // dirty regions, and canvases without a readable 2d context.
  emitFullCanvasSnapshot(canvas, id, t) {
    const dataUrl = canvas.toDataURL();
    if (this.canvasLastSnapshot.get(canvas) === dataUrl) return;
    this.canvasLastSnapshot.set(canvas, dataUrl);
    this.canvasLastSnapshotTime.set(canvas, t);
    this.pushEvent({ type: "canvas.snapshot", t, node: id, data_url: dataUrl });
  }
  // -------- RNG --------
  isNativeMathRandom(fn) {
    return /\{\s*\[native code\]\s*\}/.test(Function.prototype.toString.call(fn));
  }
  patchMathRandom() {
    if (this.mathRandomPatched) return;
    this.originalMathRandom = Math.random;
    if (this.recording.rng.seed === null && this.isNativeMathRandom(this.originalMathRandom)) {
      this.recording.rng.seed = setSeed();
    }
    const upstream = Math.random.bind(Math);
    Math.random = () => {
      const v = upstream();
      this.recording.rng_calls.push({ t: this.t(), fn: "Math.random", args: [], result: v });
      return v;
    };
    this.mathRandomPatched = true;
    this.recording.rng.math_random_patched = true;
  }
  unpatchMathRandom() {
    if (!this.mathRandomPatched) return;
    Math.random = this.originalMathRandom;
    this.mathRandomPatched = false;
  }
  // -------- helpers --------
  bind(target, type, handler, options) {
    target.addEventListener(type, handler, options);
    const trial = this.mutationObserver !== null;
    this.boundHandlers.push({ target, type, handler, options, trial });
  }
  pushEvent(ev) {
    if (this.currentTrial) this.currentTrial.events.push(ev);
  }
  t() {
    return performance.now() - this.startPerf;
  }
}
function readMedia(el, sheet) {
  const fromSheet = sheet?.media?.mediaText;
  if (fromSheet) return fromSheet;
  const attr = el.getAttribute("media");
  return attr && attr.length > 0 ? attr : null;
}
function readSheetText(sheet) {
  try {
    const rules = sheet.cssRules;
    if (!rules) return null;
    const parts = [];
    for (let i = 0; i < rules.length; i++) {
      parts.push(rules[i].cssText);
    }
    return parts.join("\n");
  } catch {
    return null;
  }
}
function getReadable2dContext(canvas) {
  try {
    const ctx = canvas.getContext("2d");
    return ctx ?? null;
  } catch {
    return null;
  }
}
function computeDiffBbox(prev, curr, w, h) {
  let top = -1;
  for (let y = 0; y < h; y++) {
    const rowStart = y * w * 4;
    const rowEnd = rowStart + w * 4;
    for (let i = rowStart; i < rowEnd; i++) {
      if (prev[i] !== curr[i]) {
        top = y;
        break;
      }
    }
    if (top !== -1) break;
  }
  if (top === -1) return null;
  let bottom = top;
  for (let y = h - 1; y > top; y--) {
    const rowStart = y * w * 4;
    const rowEnd = rowStart + w * 4;
    let dirty = false;
    for (let i = rowStart; i < rowEnd; i++) {
      if (prev[i] !== curr[i]) {
        dirty = true;
        break;
      }
    }
    if (dirty) {
      bottom = y;
      break;
    }
  }
  let left = w - 1;
  let right = 0;
  for (let y = top; y <= bottom; y++) {
    const rowStart = y * w * 4;
    for (let x = 0; x < left; x++) {
      const i = rowStart + x * 4;
      if (prev[i] !== curr[i] || prev[i + 1] !== curr[i + 1] || prev[i + 2] !== curr[i + 2] || prev[i + 3] !== curr[i + 3]) {
        left = x;
        break;
      }
    }
    for (let x = w - 1; x > right; x--) {
      const i = rowStart + x * 4;
      if (prev[i] !== curr[i] || prev[i + 1] !== curr[i + 1] || prev[i + 2] !== curr[i + 2] || prev[i + 3] !== curr[i + 3]) {
        right = x;
        break;
      }
    }
    if (left === 0 && right === w - 1) break;
  }
  return { x: left, y: top, w: right - left + 1, h: bottom - top + 1 };
}
function cropCanvasToDataURL(source, region) {
  const tmp = document.createElement("canvas");
  tmp.width = region.w;
  tmp.height = region.h;
  const tctx = tmp.getContext("2d");
  if (!tctx) return source.toDataURL();
  tctx.drawImage(source, region.x, region.y, region.w, region.h, 0, 0, region.w, region.h);
  return tmp.toDataURL();
}
function readViewport() {
  const vv = window.visualViewport;
  return {
    w: window.innerWidth,
    h: window.innerHeight,
    dpr: window.devicePixelRatio || 1,
    scale: vv?.scale ?? 1,
    offset_x: vv?.offsetLeft ?? 0,
    offset_y: vv?.offsetTop ?? 0
  };
}
function serializeJson(value, seen = /* @__PURE__ */ new WeakSet()) {
  if (value === null || value === void 0) return null;
  const t = typeof value;
  if (t === "boolean" || t === "string") return value;
  if (t === "number") return Number.isFinite(value) ? value : null;
  if (t === "function") return null;
  if (t !== "object") return null;
  if (seen.has(value)) return null;
  seen.add(value);
  if (Array.isArray(value)) return value.map((v) => serializeJson(v, seen));
  if (value instanceof Date) return value.toISOString();
  if (value instanceof Element || value instanceof Node) return null;
  const out = {};
  for (const [k, v] of Object.entries(value)) {
    out[k] = serializeJson(v, seen);
  }
  return out;
}

function turkInfo() {
  const turk = {
    previewMode: false,
    outsideTurk: false,
    hitId: "INVALID_URL_PARAMETER",
    assignmentId: "INVALID_URL_PARAMETER",
    workerId: "INVALID_URL_PARAMETER",
    turkSubmitTo: "INVALID_URL_PARAMETER"
  };
  const param = function(url, name) {
    name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
    const regexS = "[\\?&]" + name + "=([^&#]*)";
    const regex = new RegExp(regexS);
    const results = regex.exec(url);
    return results == null ? "" : results[1];
  };
  const src = param(window.location.href, "assignmentId") ? window.location.href : document.referrer;
  const keys = ["assignmentId", "hitId", "workerId", "turkSubmitTo"];
  keys.map(function(key) {
    turk[key] = unescape(param(src, key));
  });
  turk.previewMode = turk.assignmentId == "ASSIGNMENT_ID_NOT_AVAILABLE";
  turk.outsideTurk = !turk.previewMode && turk.hitId === "" && turk.assignmentId == "" && turk.workerId == "";
  return turk;
}
function submitToTurk(data) {
  const turk = turkInfo();
  const assignmentId = turk.assignmentId;
  const turkSubmitTo = turk.turkSubmitTo;
  if (!assignmentId || !turkSubmitTo) return;
  const form = document.createElement("form");
  form.method = "POST";
  form.action = turkSubmitTo + "/mturk/externalSubmit?assignmentId=" + assignmentId;
  for (const key in data) {
    if (data.hasOwnProperty(key)) {
      const hiddenField = document.createElement("input");
      hiddenField.type = "hidden";
      hiddenField.name = key;
      hiddenField.id = key;
      hiddenField.value = data[key];
      form.appendChild(hiddenField);
    }
  }
  document.body.appendChild(form);
  form.submit();
}

var turk = /*#__PURE__*/Object.freeze({
  __proto__: null,
  submitToTurk: submitToTurk,
  turkInfo: turkInfo
});

class ProgressBar {
  constructor(containerElement, message) {
    this.containerElement = containerElement;
    this.message = message;
    this._progress = 0;
    this.setupElements();
  }
  /** Adds the progress bar HTML code into `this.containerElement` */
  setupElements() {
    this.messageSpan = document.createElement("span");
    this.innerDiv = document.createElement("div");
    this.innerDiv.id = "jspsych-progressbar-inner";
    this.update();
    const outerDiv = document.createElement("div");
    outerDiv.id = "jspsych-progressbar-outer";
    outerDiv.appendChild(this.innerDiv);
    this.containerElement.appendChild(this.messageSpan);
    this.containerElement.appendChild(outerDiv);
  }
  /** Updates the progress bar according to `this.progress` */
  update() {
    this.innerDiv.style.width = this._progress * 100 + "%";
    if (typeof this.message === "function") {
      this.messageSpan.innerHTML = this.message(this._progress);
    } else {
      this.messageSpan.innerHTML = this.message;
    }
  }
  /**
   * The bar's current position as a number in the closed interval [0, 1]. Set this to update the
   * progress bar accordingly.
   */
  set progress(progress) {
    if (typeof progress !== "number" || progress < 0 || progress > 1) {
      throw new Error("jsPsych.progressBar.progress must be a number between 0 and 1");
    }
    this._progress = progress;
    this.update();
  }
  get progress() {
    return this._progress;
  }
}

class TimelineVariable {
  constructor(name) {
    this.name = name;
  }
}
const timelineDescriptionKeys = [
  "timeline",
  "timeline_variables",
  "name",
  "repetitions",
  "loop_function",
  "conditional_function",
  "randomize_order",
  "sample",
  "on_timeline_start",
  "on_timeline_finish"
];
function isTrialDescription(description) {
  return !isTimelineDescription(description);
}
function isTimelineDescription(description) {
  return Boolean(description.timeline) || Array.isArray(description);
}
var TimelineNodeStatus = /* @__PURE__ */ ((TimelineNodeStatus2) => {
  TimelineNodeStatus2[TimelineNodeStatus2["PENDING"] = 0] = "PENDING";
  TimelineNodeStatus2[TimelineNodeStatus2["RUNNING"] = 1] = "RUNNING";
  TimelineNodeStatus2[TimelineNodeStatus2["PAUSED"] = 2] = "PAUSED";
  TimelineNodeStatus2[TimelineNodeStatus2["COMPLETED"] = 3] = "COMPLETED";
  TimelineNodeStatus2[TimelineNodeStatus2["ABORTED"] = 4] = "ABORTED";
  return TimelineNodeStatus2;
})(TimelineNodeStatus || {});

class PromiseWrapper {
  constructor() {
    this.reset();
  }
  reset() {
    this.promise = new Promise((resolve) => {
      this.resolvePromise = resolve;
    });
  }
  get() {
    return this.promise;
  }
  resolve(value) {
    this.resolvePromise(value);
    this.reset();
  }
}
function isPromise(value) {
  return value && typeof value["then"] === "function";
}
function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
function parameterPathArrayToString([firstPathElement, ...remainingPathElements]) {
  let pathString = firstPathElement ?? "";
  for (const pathElement of remainingPathElements) {
    pathString += Number.isNaN(Number.parseInt(pathElement)) ? `.${pathElement}` : `[${pathElement}]`;
  }
  return pathString;
}
function isObjectOrArray(value) {
  return typeof value === "object" && value !== null;
}
class ParameterObjectPathCache {
  constructor() {
    this.cache = /* @__PURE__ */ new Map();
  }
  static lookupChild(objectOrArray, childName) {
    let doesPathExist = false;
    let childValue;
    if (Number.isNaN(Number.parseInt(childName))) {
      if (Object.hasOwn(objectOrArray, childName)) {
        doesPathExist = true;
        childValue = objectOrArray[childName];
      }
    } else {
      if (Number.parseInt(childName) < objectOrArray.length) {
        doesPathExist = true;
        childValue = objectOrArray[childName];
      }
    }
    return { doesPathExist, value: childValue };
  }
  get(path) {
    return this.cache.get(path.join("."));
  }
  has(path) {
    return this.cache.has(path.join("."));
  }
  initialize(rootObject) {
    this.rootObject = rootObject;
    this.cache.set("", rootObject);
  }
  reset() {
    this.cache.clear();
    this.cache.set("", this.rootObject);
  }
  set(path, value) {
    this.cache.set(path.join("."), value);
  }
  lookup(path) {
    if (this.has(path)) {
      return { doesPathExist: true, value: this.get(path) };
    }
    const lookupPath = (path2) => {
      const parentPath = path2.slice(0, -1);
      const childName = path2[path2.length - 1];
      if (!this.has(parentPath) && parentPath.length > 0) {
        if (!lookupPath(parentPath).doesPathExist) {
          return { doesPathExist: false };
        }
      }
      const parentValue = this.get(parentPath);
      if (!isObjectOrArray(parentValue)) {
        return { doesPathExist: false };
      }
      const lookupResult = ParameterObjectPathCache.lookupChild(parentValue, childName);
      if (lookupResult.doesPathExist) {
        this.set(path2, lookupResult.value);
      }
      return lookupResult;
    };
    return lookupPath(path);
  }
}

class TimelineNode {
  constructor(dependencies) {
    this.dependencies = dependencies;
    this.status = TimelineNodeStatus.PENDING;
    this.parameterValueCache = new ParameterObjectPathCache();
  }
  getStatus() {
    return this.status;
  }
  /**
   * Initializes the parameter value cache with `this.description`. To be called by subclass
   * constructors after setting `this.description`.
   */
  initializeParameterValueCache() {
    this.parameterValueCache.initialize(this.description);
  }
  /**
   * Resets all cached parameter values in this timeline node and all of its parents. This is
   * necessary to re-evaluate function parameters and timeline variables at each new trial.
   */
  resetParameterValueCache() {
    this.parameterValueCache.reset();
    this.parent?.resetParameterValueCache();
  }
  /**
   * Retrieves a parameter value from the description of this timeline node, recursively falling
   * back to the description of each parent timeline node unless `recursive` is set to `false`. If
   * the parameter...
   *
   * * is a timeline variable, evaluates the variable and returns the result.
   * * is not specified, returns `undefined`.
   * * is a function and `evaluateFunctions` is not set to `false`, invokes the function and returns
   *   its return value
   * * has previously been looked up, return the cached result of the previous lookup
   *
   * @param parameterPath The path of the respective parameter in the timeline node description. If
   * the path is an array, nested object properties or array items will be looked up.
   * @param options See {@link GetParameterValueOptions}
   */
  getParameterValue(parameterPath, options = {}) {
    const {
      evaluateFunctions = true,
      recursive = true,
      cacheResult = true,
      replaceResult
    } = options;
    if (typeof parameterPath === "string") {
      parameterPath = [parameterPath];
    }
    let { doesPathExist, value: result } = this.parameterValueCache.lookup(parameterPath);
    if (!doesPathExist && recursive && this.parent) {
      result = this.parent.getParameterValue(parameterPath, options);
    }
    if (typeof result === "function" && evaluateFunctions) {
      result = result();
    }
    if (result instanceof TimelineVariable) {
      result = this.evaluateTimelineVariable(result);
    }
    if (typeof replaceResult === "function") {
      result = replaceResult(result);
    }
    if (cacheResult) {
      this.parameterValueCache.set(parameterPath, result);
    }
    return result;
  }
  /**
   * Retrieves and evaluates the `data` parameter. It is different from other parameters in that
   * it's properties may be functions that have to be evaluated, and parent nodes' data parameter
   * properties are merged into the result.
   */
  getDataParameter() {
    const data = this.getParameterValue("data", { recursive: false });
    return {
      ...Object.fromEntries(
        typeof data === "object" ? Object.keys(data).map((key) => [key, this.getParameterValue(["data", key])]) : []
      ),
      ...this.parent?.getDataParameter()
    };
  }
}

class Trial extends TimelineNode {
  constructor(dependencies, description, parent) {
    super(dependencies);
    this.description = description;
    this.parent = parent;
    this.onLoad = () => {
      this.dependencies.onTrialLoad(this);
      this.runParameterCallback("on_load");
      this.dependencies.runOnLoadExtensionCallbacks(this.getParameterValue("extensions"));
    };
    this.initializeParameterValueCache();
    this.trialObject = deepCopy(description);
    this.pluginClass = this.getParameterValue("type", { evaluateFunctions: false });
    this.pluginInfo = this.pluginClass?.["info"];
    if (!this.pluginInfo) {
      throw new Error(
        "Plugin not recognized. Please provide a valid plugin using the 'type' parameter."
      );
    }
    if (!("version" in this.pluginInfo) && !("data" in this.pluginInfo)) {
      console.warn(
        this.pluginInfo["name"],
        "is missing the 'version' and 'data' fields. Please update plugin as 'version' and 'data' will be required in v9. See https://www.jspsych.org/latest/developers/plugin-development/ for more details."
      );
    } else if (!("version" in this.pluginInfo)) {
      console.warn(
        this.pluginInfo["name"],
        "is missing the 'version' field. Please update plugin as 'version' will be required in v9. See https://www.jspsych.org/latest/developers/plugin-development/ for more details."
      );
    } else if (!("data" in this.pluginInfo)) {
      console.warn(
        this.pluginInfo["name"],
        "is missing the 'data' field. Please update plugin as 'data' will be required in v9. See https://www.jspsych.org/latest/developers/plugin-development/ for more details."
      );
    }
  }
  async run() {
    this.status = TimelineNodeStatus.RUNNING;
    this.processParameters();
    this.onStart();
    this.addCssClasses();
    this.pluginInstance = this.dependencies.instantiatePlugin(this.pluginClass);
    this.result = this.processResult(await this.executeTrial());
    this.dependencies.onTrialResultAvailable(this);
    this.status = TimelineNodeStatus.COMPLETED;
    await this.onFinish();
    this.removeCssClasses();
    const gap = this.getParameterValue("post_trial_gap") ?? this.dependencies.getDefaultIti();
    if (gap !== 0 && this.dependencies.getSimulationMode() !== "data-only") {
      await delay(gap);
    }
    this.resetParameterValueCache();
  }
  async executeTrial() {
    const trialPromise = this.dependencies.finishTrialPromise.get();
    let hasTrialPromiseBeenResolved = false;
    trialPromise.then(() => {
      hasTrialPromiseBeenResolved = true;
    });
    const { trialReturnValue, hasTrialBeenSimulated } = this.invokeTrialMethod();
    let result;
    if (isPromise(trialReturnValue)) {
      result = await Promise.race([trialReturnValue, trialPromise]);
      if (hasTrialPromiseBeenResolved) {
        result = await trialPromise;
      }
    } else {
      if (!hasTrialBeenSimulated) {
        this.onLoad();
      }
      result = await trialPromise;
    }
    this.cleanupTrial();
    return result;
  }
  invokeTrialMethod() {
    const globalSimulationMode = this.dependencies.getSimulationMode();
    if (globalSimulationMode && typeof this.pluginInstance.simulate === "function") {
      const simulationOptions = this.getSimulationOptions();
      if (simulationOptions.simulate !== false) {
        return {
          hasTrialBeenSimulated: true,
          trialReturnValue: this.pluginInstance.simulate(
            this.trialObject,
            simulationOptions.mode ?? globalSimulationMode,
            simulationOptions,
            this.onLoad
          )
        };
      }
    }
    return {
      hasTrialBeenSimulated: false,
      trialReturnValue: this.pluginInstance.trial(
        this.dependencies.getDisplayElement(),
        this.trialObject,
        this.onLoad
      )
    };
  }
  /**
   * Cleanup the trial by removing the display element and removing event listeners
   */
  cleanupTrial() {
    this.dependencies.clearAllTimeouts();
    this.dependencies.getDisplayElement().innerHTML = "";
  }
  /**
   * Add the CSS classes from the `css_classes` parameter to the display element
   */
  addCssClasses() {
    const classes = this.getParameterValue("css_classes");
    const classList = this.dependencies.getDisplayElement().classList;
    if (typeof classes === "string") {
      classList.add(classes);
    } else if (Array.isArray(classes)) {
      classList.add(...classes);
    }
  }
  /**
   * Removes the provided css classes from the display element
   */
  removeCssClasses() {
    const classes = this.getParameterValue("css_classes");
    if (classes) {
      this.dependencies.getDisplayElement().classList.remove(...typeof classes === "string" ? [classes] : classes);
    }
  }
  processResult(result) {
    if (!result) {
      result = {};
    }
    for (const [parameterName, shouldParameterBeIncluded] of Object.entries(
      this.getParameterValue("save_trial_parameters") ?? {}
    )) {
      if (this.pluginInfo.parameters[parameterName]) {
        if (shouldParameterBeIncluded && !Object.hasOwn(result, parameterName)) {
          let parameterValue = this.trialObject[parameterName];
          if (typeof parameterValue === "function") {
            parameterValue = parameterValue.toString();
          }
          result[parameterName] = parameterValue;
        } else if (!shouldParameterBeIncluded && Object.hasOwn(result, parameterName)) {
          delete result[parameterName];
        }
      } else {
        console.warn(
          `Non-existent parameter "${parameterName}" specified in save_trial_parameters.`
        );
      }
    }
    result = {
      ...this.getDataParameter(),
      ...result,
      trial_type: this.pluginInfo.name,
      trial_index: this.index,
      plugin_version: this.pluginInfo["version"] ? this.pluginInfo["version"] : null
    };
    const saveTimelineVariables = this.getParameterValue("save_timeline_variables");
    if (saveTimelineVariables === true) {
      result.timeline_variables = { ...this.parent.getAllTimelineVariables() };
    } else if (Array.isArray(saveTimelineVariables)) {
      result.timeline_variables = Object.fromEntries(
        Object.entries(this.parent.getAllTimelineVariables()).filter(
          ([key, _]) => saveTimelineVariables.includes(key)
        )
      );
    }
    return result;
  }
  /**
   * Runs a callback function retrieved from a parameter value and returns its result.
   *
   * @param parameterName The name of the parameter to retrieve the callback function from.
   * @param callbackParameters The parameters (if any) to be passed to the callback function
   */
  runParameterCallback(parameterName, ...callbackParameters) {
    const callback = this.getParameterValue(parameterName, { evaluateFunctions: false });
    if (callback) {
      return callback(...callbackParameters);
    }
  }
  onStart() {
    this.dependencies.onTrialStart(this);
    this.runParameterCallback("on_start", this.trialObject);
    this.dependencies.runOnStartExtensionCallbacks(this.getParameterValue("extensions"));
  }
  async onFinish() {
    const extensionResults = await this.dependencies.runOnFinishExtensionCallbacks(
      this.getParameterValue("extensions")
    );
    Object.assign(this.result, extensionResults);
    await Promise.resolve(this.runParameterCallback("on_finish", this.getResult()));
    this.dependencies.onTrialFinished(this);
  }
  evaluateTimelineVariable(variable) {
    return this.parent?.evaluateTimelineVariable(variable);
  }
  getParameterValue(parameterPath, options = {}) {
    if (timelineDescriptionKeys.includes(
      typeof parameterPath === "string" ? parameterPath : parameterPath[0]
    )) {
      options.recursive = false;
    }
    return super.getParameterValue(parameterPath, options);
  }
  /**
   * Retrieves and evaluates the `simulation_options` parameter, considering nested properties and
   * global simulation options.
   */
  getSimulationOptions() {
    const simulationOptions = this.getParameterValue("simulation_options", {
      replaceResult: (result = {}) => {
        if (typeof result === "string") {
          const globalSimulationOptions = this.dependencies.getGlobalSimulationOptions();
          result = globalSimulationOptions[result] ?? globalSimulationOptions["default"] ?? {};
        }
        return deepMerge(
          deepCopy(this.dependencies.getGlobalSimulationOptions().default),
          deepCopy(result)
        );
      }
    });
    if (typeof simulationOptions === "undefined") {
      return {};
    }
    simulationOptions.mode = this.getParameterValue(["simulation_options", "mode"]);
    simulationOptions.simulate = this.getParameterValue(["simulation_options", "simulate"]);
    simulationOptions.data = this.getParameterValue(["simulation_options", "data"]);
    if (typeof simulationOptions.data === "object") {
      simulationOptions.data = Object.fromEntries(
        Object.keys(simulationOptions.data).map((key) => [
          key,
          this.getParameterValue(["simulation_options", "data", key])
        ])
      );
    }
    return simulationOptions;
  }
  /**
   * Returns the result object of this trial or `undefined` if the result is not yet known or the
   * `record_data` trial parameter is `false`.
   */
  getResult() {
    return this.getParameterValue("record_data") === false ? void 0 : this.result;
  }
  getResults() {
    const result = this.getResult();
    return result ? [result] : [];
  }
  /**
   * Checks that the parameters provided in the trial description align with the plugin's info
   * object, resolves missing parameter values from the parent timeline, resolves timeline variable
   * parameters, evaluates parameter functions if the expected parameter type is not `FUNCTION`, and
   * sets default values for optional parameters.
   */
  processParameters() {
    const assignParameterValues = (parameterObject, parameterInfos, parentParameterPath = []) => {
      for (const [parameterName, parameterConfig] of Object.entries(parameterInfos)) {
        const parameterPath = [...parentParameterPath, parameterName];
        let parameterValue = this.getParameterValue(parameterPath, {
          evaluateFunctions: parameterConfig.type !== ParameterType.FUNCTION,
          replaceResult: (originalResult) => {
            if (typeof originalResult === "undefined") {
              if (typeof parameterConfig.default === "undefined") {
                throw new Error(
                  `You must specify a value for the "${parameterPathArrayToString(
                    parameterPath
                  )}" parameter in the "${this.pluginInfo.name}" plugin.`
                );
              } else {
                return parameterConfig.default;
              }
            } else {
              return originalResult;
            }
          }
        });
        if (!parameterConfig.array && parameterValue !== null) {
          switch (parameterConfig.type) {
            case ParameterType.BOOL:
              if (typeof parameterValue !== "boolean") {
                const parameterPathString = parameterPathArrayToString(parameterPath);
                console.warn(
                  `A non-boolean value (\`${parameterValue}\`) was provided for the boolean parameter "${parameterPathString}" in the "${this.pluginInfo.name}" plugin.`
                );
              }
              break;
            // @ts-ignore falls through
            case ParameterType.KEYS:
              if (Array.isArray(parameterValue)) break;
            case ParameterType.STRING:
            case ParameterType.HTML_STRING:
            case ParameterType.KEY:
            case ParameterType.AUDIO:
            case ParameterType.VIDEO:
            case ParameterType.IMAGE:
              if (typeof parameterValue !== "string") {
                const parameterPathString = parameterPathArrayToString(parameterPath);
                console.warn(
                  `A non-string value (\`${parameterValue}\`) was provided for the parameter "${parameterPathString}" in the "${this.pluginInfo.name}" plugin.`
                );
              }
              break;
            case ParameterType.FLOAT:
            case ParameterType.INT:
              if (typeof parameterValue !== "number") {
                const parameterPathString = parameterPathArrayToString(parameterPath);
                console.warn(
                  `A non-numeric value (\`${parameterValue}\`) was provided for the numeric parameter "${parameterPathString}" in the "${this.pluginInfo.name}" plugin.`
                );
              }
              break;
            case ParameterType.FUNCTION:
              if (typeof parameterValue !== "function") {
                const parameterPathString = parameterPathArrayToString(parameterPath);
                console.warn(
                  `A non-function value (\`${parameterValue}\`) was provided for the function parameter "${parameterPathString}" in the "${this.pluginInfo.name}" plugin.`
                );
              }
              break;
            case ParameterType.SELECT:
              if (!parameterConfig.options) {
                const parameterPathString = parameterPathArrayToString(parameterPath);
                console.warn(
                  `The "options" array is required for the "select" parameter "${parameterPathString}" in the "${this.pluginInfo.name}" plugin.`
                );
              }
          }
          if (parameterConfig.type === ParameterType.INT && parameterValue % 1 !== 0) {
            const parameterPathString = parameterPathArrayToString(parameterPath);
            console.warn(
              `A float value (\`${parameterValue}\`) was provided for the integer parameter "${parameterPathString}" in the "${this.pluginInfo.name}" plugin. The value will be truncated to an integer.`
            );
            parameterValue = Math.trunc(parameterValue);
          }
        }
        if (parameterConfig.type === ParameterType.SELECT) {
          if (!parameterConfig.options.includes(parameterValue)) {
            const parameterPathString = parameterPathArrayToString(parameterPath);
            console.warn(
              `The value "${parameterValue}" is not a valid option for the parameter "${parameterPathString}" in the "${this.pluginInfo.name}" plugin. Valid options are: ${parameterConfig.options.join(", ")}.`
            );
          }
        }
        if (parameterConfig.array && !Array.isArray(parameterValue)) {
          const parameterPathString = parameterPathArrayToString(parameterPath);
          throw new Error(
            `A non-array value (\`${parameterValue}\`) was provided for the array parameter "${parameterPathString}" in the "${this.pluginInfo.name}" plugin. Please make sure that "${parameterPathString}" is an array.`
          );
        }
        if (parameterConfig.type === ParameterType.COMPLEX && parameterConfig.nested) {
          if (parameterConfig.array) {
            parameterValue = parameterValue.map((_, arrayIndex) => {
              const arrayElementPath = [...parameterPath, arrayIndex.toString()];
              const arrayElementValue = this.getParameterValue(arrayElementPath);
              assignParameterValues(arrayElementValue, parameterConfig.nested, arrayElementPath);
              return arrayElementValue;
            });
          } else {
            assignParameterValues(parameterValue, parameterConfig.nested, parameterPath);
          }
        }
        parameterObject[parameterName] = parameterValue;
      }
    };
    const trialObject = deepCopy(this.description);
    assignParameterValues(trialObject, this.pluginInfo.parameters);
    this.trialObject = trialObject;
  }
  getLatestNode() {
    return this;
  }
  getActiveTimelineByName(name) {
    return void 0;
  }
}

class Timeline extends TimelineNode {
  constructor(dependencies, description, parent) {
    super(dependencies);
    this.parent = parent;
    this.children = [];
    this.shouldAbort = false;
    this.resumePromise = new PromiseWrapper();
    this.description = Array.isArray(description) ? { timeline: description } : description;
    this.initializeParameterValueCache();
  }
  async run() {
    if (typeof this.index === "undefined") {
      this.index = 0;
    }
    this.status = TimelineNodeStatus.RUNNING;
    const { conditional_function, loop_function, repetitions = 1 } = this.description;
    let timelineVariableOrder = this.generateTimelineVariableOrder();
    this.setCurrentTimelineVariablesByIndex(timelineVariableOrder[0]);
    let isInitialTimelineVariableOrder = true;
    let currentLoopIterationResults;
    if (!conditional_function || conditional_function()) {
      this.onStart();
      for (let repetition = 0; repetition < repetitions; repetition++) {
        do {
          currentLoopIterationResults = [];
          if (isInitialTimelineVariableOrder) {
            isInitialTimelineVariableOrder = false;
          } else {
            timelineVariableOrder = this.generateTimelineVariableOrder();
          }
          for (const timelineVariableIndex of timelineVariableOrder) {
            this.setCurrentTimelineVariablesByIndex(timelineVariableIndex);
            for (const childNodeDescription of this.description.timeline) {
              const childNode = this.instantiateChildNode(childNodeDescription);
              const previousChild = this.currentChild;
              this.currentChild = childNode;
              childNode.index = previousChild ? previousChild.getLatestNode().index + 1 : this.index;
              await childNode.run();
              if (this.status === TimelineNodeStatus.PAUSED) {
                await this.resumePromise.get();
              }
              if (this.shouldAbort) {
                this.status = TimelineNodeStatus.ABORTED;
                return;
              }
              currentLoopIterationResults.push(...this.currentChild.getResults());
            }
          }
        } while (loop_function && loop_function(new DataCollection(currentLoopIterationResults)));
      }
      this.onFinish();
    }
    this.status = TimelineNodeStatus.COMPLETED;
  }
  onStart() {
    if (this.description.on_timeline_start) {
      this.description.on_timeline_start();
    }
  }
  onFinish() {
    if (this.description.on_timeline_finish) {
      this.description.on_timeline_finish();
    }
  }
  pause() {
    if (this.currentChild instanceof Timeline) {
      this.currentChild.pause();
    }
    this.status = TimelineNodeStatus.PAUSED;
  }
  resume() {
    if (this.status == TimelineNodeStatus.PAUSED) {
      if (this.currentChild instanceof Timeline) {
        this.currentChild.resume();
      }
      this.status = TimelineNodeStatus.RUNNING;
      this.resumePromise.resolve();
    }
  }
  /**
   * If the timeline is running or paused, aborts the timeline after the current trial has completed
   */
  abort() {
    if (this.status === TimelineNodeStatus.RUNNING || this.status === TimelineNodeStatus.PAUSED) {
      if (this.currentChild instanceof Timeline) {
        this.currentChild.abort();
      }
      this.shouldAbort = true;
      if (this.status === TimelineNodeStatus.PAUSED) {
        this.resume();
      }
    }
  }
  instantiateChildNode(childDescription) {
    const newChildNode = isTimelineDescription(childDescription) ? new Timeline(this.dependencies, childDescription, this) : new Trial(this.dependencies, childDescription, this);
    this.children.push(newChildNode);
    return newChildNode;
  }
  setCurrentTimelineVariablesByIndex(index) {
    this.currentTimelineVariables = {
      ...this.parent?.getAllTimelineVariables(),
      ...index === null ? void 0 : this.description.timeline_variables[index]
    };
  }
  /**
   * If the timeline has timeline variables, returns the order of `timeline_variables` array indices
   * to be used, according to the timeline's `sample` setting. If the timeline has no timeline
   * variables, returns `[null]`.
   */
  generateTimelineVariableOrder() {
    const timelineVariableLength = this.description.timeline_variables?.length;
    if (!timelineVariableLength) {
      return [null];
    }
    let order = [...Array(timelineVariableLength).keys()];
    const sample = this.description.sample;
    if (sample) {
      switch (sample.type) {
        case "custom":
          order = sample.fn(order);
          break;
        case "with-replacement":
          order = sampleWithReplacement(order, sample.size, sample.weights);
          break;
        case "without-replacement":
          order = sampleWithoutReplacement(order, sample.size);
          break;
        case "fixed-repetitions":
          order = repeat(order, sample.size);
          break;
        case "alternate-groups":
          order = shuffleAlternateGroups(sample.groups, sample.randomize_group_order);
          break;
        default:
          throw new Error(
            `Invalid type "${// @ts-expect-error TS doesn't have a type for `sample` in this case
            sample.type}" in timeline sample parameters. Valid options for type are "custom", "with-replacement", "without-replacement", "fixed-repetitions", and "alternate-groups"`
          );
      }
    }
    if (this.description.randomize_order) {
      order = shuffle(order);
    }
    return order;
  }
  /**
   * Returns the current values of all timeline variables, including those from parent timelines
   */
  getAllTimelineVariables() {
    return this.currentTimelineVariables;
  }
  evaluateTimelineVariable(variable) {
    if (this.currentTimelineVariables?.hasOwnProperty(variable.name)) {
      return this.currentTimelineVariables[variable.name];
    }
    throw new Error(`Timeline variable ${variable.name} not found.`);
  }
  getResults() {
    const results = [];
    for (const child of this.children) {
      if (child instanceof Trial) {
        const childResult = child.getResult();
        if (childResult) {
          results.push(childResult);
        }
      } else if (child instanceof Timeline) {
        results.push(...child.getResults());
      }
    }
    return results;
  }
  /**
   * Returns the naive progress of the timeline (as a fraction), without considering conditional or
   * loop functions.
   */
  getNaiveProgress() {
    if (this.status === TimelineNodeStatus.PENDING) {
      return 0;
    }
    const activeNode = this.getLatestNode();
    if (!activeNode) {
      return 1;
    }
    let completedTrials = activeNode.index;
    if (activeNode.getStatus() === TimelineNodeStatus.COMPLETED) {
      completedTrials++;
    }
    return Math.min(completedTrials / this.getNaiveTrialCount(), 1);
  }
  /**
   * Recursively computes the naive number of trials in the timeline, without considering
   * conditional or loop functions.
   */
  getNaiveTrialCount() {
    const getTrialCount = (description) => {
      const getTimelineArrayTrialCount = (description2) => description2.map((childDescription) => getTrialCount(childDescription)).reduce((a, b) => a + b);
      if (Array.isArray(description)) {
        return getTimelineArrayTrialCount(description);
      }
      if (isTrialDescription(description)) {
        return 1;
      }
      if (isTimelineDescription(description)) {
        let conditionCount = description.timeline_variables?.length || 1;
        switch (description.sample?.type) {
          case "with-replacement":
          case "without-replacement":
            conditionCount = description.sample.size;
            break;
          case "fixed-repetitions":
            conditionCount *= description.sample.size;
            break;
          case "alternate-groups":
            conditionCount = description.sample.groups.map((group) => group.length).reduce((a, b) => a + b, 0);
            break;
        }
        return getTimelineArrayTrialCount(description.timeline) * (description.repetitions ?? 1) * conditionCount;
      }
      return 0;
    };
    return getTrialCount(this.description);
  }
  getLatestNode() {
    return this.currentChild?.getLatestNode() ?? this;
  }
  getActiveTimelineByName(name) {
    if (this.description.name === name) {
      return this;
    }
    return this.currentChild?.getActiveTimelineByName(name);
  }
}

class JsPsych {
  constructor(options) {
    this.turk = turk;
    this.randomization = randomization;
    this.utils = utils;
    // prettier-ignore
    this.citation = {
      "apa": "de Leeuw, J. R., Gilbert, R. A., & Luchterhandt, B. (2023). jsPsych: Enabling an Open-Source Collaborative Ecosystem of Behavioral Experiments. Journal of Open Source Software, 8(85), 5351. https://doi.org/10.21105/joss.05351 ",
      "bibtex": '@article{Leeuw2023jsPsych, 	author = {de Leeuw, Joshua R. and Gilbert, Rebecca A. and Luchterhandt, Bj{\\" o}rn}, 	journal = {Journal of Open Source Software}, 	doi = {10.21105/joss.05351}, 	issn = {2475-9066}, 	number = {85}, 	year = {2023}, 	month = {may 11}, 	pages = {5351}, 	publisher = {Open Journals}, 	title = {jsPsych: Enabling an {Open}-{Source} {Collaborative} {Ecosystem} of {Behavioral} {Experiments}}, 	url = {https://joss.theoj.org/papers/10.21105/joss.05351}, 	volume = {8}, }  '
    };
    /** Options */
    this.options = {};
    /**
     * Whether the page is retrieved directly via the `file://` protocol (true) or hosted on a web
     * server (false)
     */
    this.isFileProtocolUsed = false;
    this.finishTrialPromise = new PromiseWrapper();
    this.timelineDependencies = {
      onTrialStart: (trial) => {
        this.sessionRecorder?.onTrialStart({
          trial_index: trial.index ?? -1,
          plugin: trial.pluginClass?.["info"]?.name ?? "unknown"
        });
        this.options.on_trial_start(trial.trialObject);
        this.getDisplayContainerElement().focus();
        this.getDisplayElement().scrollTop = 0;
      },
      onTrialLoad: (_trial) => {
        this.sessionRecorder?.onTrialLoad();
      },
      onTrialResultAvailable: (trial) => {
        const result = trial.getResult();
        if (result) {
          result.time_elapsed = this.getTotalTime();
          this.data.write(trial);
        }
      },
      onTrialFinished: (trial) => {
        const result = trial.getResult();
        this.sessionRecorder?.onTrialFinish(result);
        this.options.on_trial_finish(result);
        if (result) {
          this.options.on_data_update(result);
        }
        if (this.progressBar && this.options.auto_update_progress_bar) {
          this.progressBar.progress = this.timeline.getNaiveProgress();
        }
      },
      runOnStartExtensionCallbacks: (extensionsConfiguration) => this.extensionManager.onStart(extensionsConfiguration),
      runOnLoadExtensionCallbacks: (extensionsConfiguration) => this.extensionManager.onLoad(extensionsConfiguration),
      runOnFinishExtensionCallbacks: (extensionsConfiguration) => this.extensionManager.onFinish(extensionsConfiguration),
      getSimulationMode: () => this.simulationMode,
      getGlobalSimulationOptions: () => this.simulationOptions,
      instantiatePlugin: (pluginClass) => new pluginClass(this),
      getDisplayElement: () => this.getDisplayElement(),
      getDefaultIti: () => this.getInitSettings().default_iti,
      finishTrialPromise: this.finishTrialPromise,
      clearAllTimeouts: () => this.pluginAPI.clearAllTimeouts()
    };
    this.extensionManagerDependencies = {
      instantiateExtension: (extensionClass) => new extensionClass(this)
    };
    this.dataDependencies = {
      getProgress: () => ({
        time: this.getTotalTime(),
        trial: this.timeline?.getLatestNode().index ?? 0
      }),
      onInteractionRecordAdded: (record) => {
        this.options.on_interaction_data_update(record);
      },
      getDisplayElement: () => this.getDisplayElement()
    };
    options = {
      display_element: void 0,
      on_finish: () => {
      },
      on_trial_start: () => {
      },
      on_trial_finish: () => {
      },
      on_data_update: () => {
      },
      on_interaction_data_update: () => {
      },
      on_close: () => {
      },
      use_webaudio: true,
      show_progress_bar: false,
      message_progress_bar: "Completion Progress",
      auto_update_progress_bar: true,
      default_iti: 0,
      minimum_valid_rt: 0,
      experiment_width: null,
      override_safe_mode: false,
      case_sensitive_responses: false,
      extensions: [],
      record_session: false,
      ...options
    };
    this.options = options;
    if (options.record_session) {
      this.sessionRecorder = new SessionRecorder({ jspsychVersion: version });
    }
    autoBind(this);
    if (window.location.protocol == "file:" && (options.override_safe_mode === false || typeof options.override_safe_mode === "undefined")) {
      options.use_webaudio = false;
      this.isFileProtocolUsed = true;
      console.warn(
        "jsPsych detected that it is running via the file:// protocol and not on a web server. To prevent issues with cross-origin requests, Web Audio and video preloading have been disabled. If you would like to override this setting, you can set 'override_safe_mode' to 'true' in initJsPsych. For more information, see: https://www.jspsych.org/overview/running-experiments"
      );
    }
    this.data = new JsPsychData(this.dataDependencies);
    this.pluginAPI = createJointPluginAPIObject(this);
    this.extensionManager = new ExtensionManager(
      this.extensionManagerDependencies,
      options.extensions
    );
  }
  version() {
    return version;
  }
  /**
   * Starts an experiment using the provided timeline and returns a promise that is resolved when
   * the experiment is finished.
   *
   * @param timeline The timeline to be run
   */
  async run(timeline) {
    if (typeof timeline === "undefined") {
      console.error("No timeline declared in jsPsych.run(). Cannot start experiment.");
    }
    if (timeline.length === 0) {
      console.error(
        "No trials have been added to the timeline (the timeline is an empty array). Cannot start experiment."
      );
    }
    this.timeline = new Timeline(this.timelineDependencies, timeline);
    await this.prepareDom();
    await this.extensionManager.initializeExtensions();
    document.documentElement.setAttribute("jspsych", "present");
    this.experimentStartTime = /* @__PURE__ */ new Date();
    this.sessionRecorder?.start(this.getDisplayElement(), this.getDisplayContainerElement());
    try {
      await this.timeline.run();
      await Promise.resolve(this.options.on_finish(this.data.get()));
      if (this.endMessage) {
        this.getDisplayElement().innerHTML = this.endMessage;
      }
    } finally {
      this.data.removeInteractionListeners();
      this.sessionRecorder?.stop("finished");
    }
  }
  async simulate(timeline, simulation_mode = "data-only", simulation_options = {}) {
    this.simulationMode = simulation_mode;
    this.simulationOptions = simulation_options;
    await this.run(timeline);
  }
  getProgress() {
    return {
      total_trials: this.timeline?.getNaiveTrialCount(),
      current_trial_global: this.timeline?.getLatestNode().index ?? 0,
      percent_complete: this.timeline?.getNaiveProgress() * 100
    };
  }
  getStartTime() {
    return this.experimentStartTime;
  }
  getTotalTime() {
    if (!this.experimentStartTime) {
      return 0;
    }
    return (/* @__PURE__ */ new Date()).getTime() - this.experimentStartTime.getTime();
  }
  getDisplayElement() {
    return this.displayElement;
  }
  getDisplayContainerElement() {
    return this.displayContainerElement;
  }
  /**
   * Returns the high-fidelity session recording produced when `initJsPsych` is
   * called with `record_session: true`. Returns `undefined` when recording is
   * not enabled. The recording is suitable for serialization (e.g. via
   * `JSON.stringify`) and persistence alongside the trial data.
   */
  getSessionRecording() {
    return this.sessionRecorder?.getRecording();
  }
  /**
   * Returns the session recording as a gzip-compressed `Blob` with MIME type
   * `application/gzip`. Returns `undefined` when recording is not enabled.
   * Typical recordings compress 8-15x — useful when persisting alongside
   * trial data or uploading to a backend. Uses the browser's built-in
   * `CompressionStream`, so no extra dependency is bundled.
   *
   * @example Upload to a backend:
   * ```ts
   * const blob = await jsPsych.getSessionRecordingCompressed();
   * if (blob) {
   *   await fetch("/upload", { method: "POST", body: blob });
   * }
   * ```
   *
   * @example Offer the participant a download:
   * ```ts
   * const blob = await jsPsych.getSessionRecordingCompressed();
   * if (blob) {
   *   const a = document.createElement("a");
   *   a.href = URL.createObjectURL(blob);
   *   a.download = "session.json.gz";
   *   a.click();
   *   URL.revokeObjectURL(a.href);
   * }
   * ```
   *
   * @example Stash in jsPsych's data record (base64-encoded):
   * ```ts
   * const blob = await jsPsych.getSessionRecordingCompressed();
   * if (blob) {
   *   const buf = new Uint8Array(await blob.arrayBuffer());
   *   let binary = "";
   *   for (const byte of buf) binary += String.fromCharCode(byte);
   *   jsPsych.data.addProperties({ session_recording_b64: btoa(binary) });
   * }
   * ```
   */
  async getSessionRecordingCompressed() {
    const recording = this.getSessionRecording();
    if (!recording) return void 0;
    const json = JSON.stringify(recording);
    const cs = new CompressionStream("gzip");
    const writer = cs.writable.getWriter();
    writer.write(new TextEncoder().encode(json));
    writer.close();
    const reader = cs.readable.getReader();
    const chunks = [];
    for (; ; ) {
      const { done, value } = await reader.read();
      if (done) break;
      chunks.push(value);
    }
    return new Blob(chunks, { type: "application/gzip" });
  }
  abortExperiment(endMessage, data = {}) {
    this.endMessage = endMessage;
    this.timeline.abort();
    this.pluginAPI.cancelAllKeyboardResponses();
    this.pluginAPI.clearAllTimeouts();
    this.finishTrial(data);
    this.sessionRecorder?.stop("aborted");
  }
  abortCurrentTimeline() {
    let currentTimeline = this.timeline?.getLatestNode();
    if (currentTimeline instanceof Trial) {
      currentTimeline = currentTimeline.parent;
    }
    if (currentTimeline instanceof Timeline) {
      currentTimeline.abort();
    }
  }
  /**
   * Aborts a named timeline. The timeline must be currently running in order to abort it.
   *
   * @param name The name of the timeline to abort. Timelines can be given names by setting the `name` parameter in the description of the timeline.
   */
  abortTimelineByName(name) {
    const timeline = this.timeline?.getActiveTimelineByName(name);
    if (timeline) {
      timeline.abort();
    }
  }
  getCurrentTrial() {
    const activeNode = this.timeline?.getLatestNode();
    if (activeNode instanceof Trial) {
      return activeNode.description;
    }
    return void 0;
  }
  getInitSettings() {
    return this.options;
  }
  timelineVariable(variableName) {
    return new TimelineVariable(variableName);
  }
  evaluateTimelineVariable(variableName) {
    return this.timeline?.getLatestNode()?.evaluateTimelineVariable(new TimelineVariable(variableName));
  }
  pauseExperiment() {
    this.timeline?.pause();
  }
  resumeExperiment() {
    this.timeline?.resume();
  }
  getSafeModeStatus() {
    return this.isFileProtocolUsed;
  }
  getTimeline() {
    return this.timeline?.description.timeline;
  }
  /**
   * Prints out a string containing citations for the jsPsych library and all input plugins/extensions in the specified format.
   * If called without input, prints citation for jsPsych library.
   *
   * @param plugins The plugins/extensions to generate citations for. Always prints the citation for the jsPsych library at the top.
   * @param format The desired output citation format. Currently supports "apa" and "bibtex".
   * @returns String containing citations separated with newline character.
   */
  getCitations(plugins = [], format = "apa") {
    const formatOptions = ["apa", "bibtex"];
    format = format.toLowerCase();
    if (!Array.isArray(plugins)) {
      throw new Error("Expected array of plugins/extensions");
    } else if (!formatOptions.includes(format)) {
      throw new Error("Unsupported citation format");
    } else {
      const jsPsychCitation = this.citation[format];
      const citationSet = /* @__PURE__ */ new Set([jsPsychCitation]);
      for (const plugin of plugins) {
        try {
          const pluginCitation = plugin["info"].citations[format];
          citationSet.add(pluginCitation);
        } catch {
          console.error(`${plugin} does not have citation in ${format} format.`);
        }
      }
      const citationList = Array.from(citationSet).join("\n");
      return citationList;
    }
  }
  get extensions() {
    return this.extensionManager?.extensions ?? {};
  }
  async prepareDom() {
    if (document.readyState !== "complete") {
      await new Promise((resolve) => {
        window.addEventListener("load", resolve);
      });
    }
    const options = this.options;
    if (typeof options.display_element === "undefined") {
      let body = document.body;
      if (!body) {
        body = document.createElement("body");
        document.documentElement.appendChild(body);
      }
      document.querySelector("html").style.height = "100%";
      body.style.margin = "0px";
      body.style.height = "100%";
      body.style.width = "100%";
      options.display_element = body;
    } else {
      const display = options.display_element instanceof Element ? options.display_element : document.querySelector("#" + options.display_element);
      if (display === null) {
        console.error("The display_element specified in initJsPsych() does not exist in the DOM.");
      } else {
        options.display_element = display;
      }
    }
    const contentElement = document.createElement("div");
    contentElement.id = "jspsych-content";
    const contentWrapperElement = document.createElement("div");
    contentWrapperElement.className = "jspsych-content-wrapper";
    contentWrapperElement.appendChild(contentElement);
    this.displayContainerElement = options.display_element;
    this.displayContainerElement.appendChild(contentWrapperElement);
    this.displayElement = contentElement;
    if (options.experiment_width !== null) {
      this.displayElement.style.width = options.experiment_width + "px";
    }
    options.display_element.tabIndex = 0;
    this.displayContainerElement.classList.add("jspsych-display-element");
    this.displayElement.classList.add("jspsych-content");
    this.data.createInteractionListeners();
    window.addEventListener("beforeunload", options.on_close);
    if (this.options.show_progress_bar) {
      const progressBarContainer = document.createElement("div");
      progressBarContainer.id = "jspsych-progressbar-container";
      this.progressBar = new ProgressBar(progressBarContainer, this.options.message_progress_bar);
      this.getDisplayContainerElement().insertAdjacentElement("afterbegin", progressBarContainer);
    }
  }
  finishTrial(data) {
    this.finishTrialPromise.resolve(data);
  }
}

class MigrationError extends Error {
  constructor(message = "The global `jsPsych` variable is no longer available in jsPsych v7.") {
    super(
      `${message} Please follow the migration guide at https://www.jspsych.org/7.0/support/migration-v7/ to update your experiment.`
    );
    this.name = "MigrationError";
  }
}
window.jsPsych = {
  get init() {
    throw new MigrationError("`jsPsych.init()` was replaced by `initJsPsych()` in jsPsych v7.");
  },
  get data() {
    throw new MigrationError();
  },
  get randomization() {
    throw new MigrationError();
  },
  get turk() {
    throw new MigrationError();
  },
  get pluginAPI() {
    throw new MigrationError();
  },
  get ALL_KEYS() {
    throw new MigrationError(
      'jsPsych.ALL_KEYS was replaced by the "ALL_KEYS" string in jsPsych v7.'
    );
  },
  get NO_KEYS() {
    throw new MigrationError('jsPsych.NO_KEYS was replaced by the "NO_KEYS" string in jsPsych v7.');
  }
};

if (typeof window !== "undefined" && window.hasOwnProperty("webkitAudioContext") && !window.hasOwnProperty("AudioContext")) {
  window.AudioContext = webkitAudioContext;
}
function initJsPsych(options) {
  const jsPsych = new JsPsych(options);
  const migrationMessages = {
    init: "`jsPsych.init()` was replaced by `initJsPsych()` in jsPsych v7.",
    ALL_KEYS: 'jsPsych.ALL_KEYS was replaced by the "ALL_KEYS" string in jsPsych v7.',
    NO_KEYS: 'jsPsych.NO_KEYS was replaced by the "NO_KEYS" string in jsPsych v7.',
    // Getter functions that were renamed
    currentTimelineNodeID: "`currentTimelineNodeID()` was renamed to `getCurrentTimelineNodeID()` in jsPsych v7.",
    progress: "`progress()` was renamed to `getProgress()` in jsPsych v7.",
    startTime: "`startTime()` was renamed to `getStartTime()` in jsPsych v7.",
    totalTime: "`totalTime()` was renamed to `getTotalTime()` in jsPsych v7.",
    currentTrial: "`currentTrial()` was renamed to `getCurrentTrial()` in jsPsych v7.",
    initSettings: "`initSettings()` was renamed to `getInitSettings()` in jsPsych v7.",
    allTimelineVariables: "`allTimelineVariables()` was renamed to `getAllTimelineVariables()` in jsPsych v7."
  };
  Object.defineProperties(
    jsPsych,
    Object.fromEntries(
      Object.entries(migrationMessages).map(([key, message]) => [
        key,
        {
          get() {
            throw new MigrationError(message);
          }
        }
      ])
    )
  );
  return jsPsych;
}

export { DataCollection, JsPsych, ParameterType, initJsPsych };
//# sourceMappingURL=index.js.map
