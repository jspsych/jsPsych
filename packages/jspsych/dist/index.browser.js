var jsPsychModule = (function (exports) {
	'use strict';

	var commonjsGlobal = typeof globalThis !== 'undefined' ? globalThis : typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};

	function getDefaultExportFromCjs (x) {
		return x && x.__esModule && Object.prototype.hasOwnProperty.call(x, 'default') ? x['default'] : x;
	}

	// Gets all non-builtin properties up the prototype chain
	const getAllProperties = object => {
		const properties = new Set();

		do {
			for (const key of Reflect.ownKeys(object)) {
				properties.add([object, key]);
			}
		} while ((object = Reflect.getPrototypeOf(object)) && object !== Object.prototype);

		return properties;
	};

	var autoBind = (self, {include, exclude} = {}) => {
		const filter = key => {
			const match = pattern => typeof pattern === 'string' ? key === pattern : pattern.test(key);

			if (include) {
				return include.some(match);
			}

			if (exclude) {
				return !exclude.some(match);
			}

			return true;
		};

		for (const [object, key] of getAllProperties(self.constructor.prototype)) {
			if (key === 'constructor' || !filter(key)) {
				continue;
			}

			const descriptor = Reflect.getOwnPropertyDescriptor(object, key);
			if (descriptor && typeof descriptor.value === 'function') {
				self[key] = self[key].bind(self);
			}
		}

		return self;
	};

	var autoBind$1 = /*@__PURE__*/getDefaultExportFromCjs(autoBind);

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

	class MultiplayerError extends Error {
	  constructor(code, message, participantId) {
	    super(`MultiplayerAPI: ${message}`);
	    this.name = "MultiplayerError";
	    this.code = code;
	    if (participantId !== void 0) {
	      this.participantId = participantId;
	    }
	  }
	}

	function cyrb128(str) {
	  let h1 = 1779033703;
	  let h2 = 3144134277;
	  let h3 = 1013904242;
	  let h4 = 2773480762;
	  for (let i = 0; i < str.length; i++) {
	    const k = str.charCodeAt(i);
	    h1 = h2 ^ Math.imul(h1 ^ k, 597399067);
	    h2 = h3 ^ Math.imul(h2 ^ k, 2869860233);
	    h3 = h4 ^ Math.imul(h3 ^ k, 951274213);
	    h4 = h1 ^ Math.imul(h4 ^ k, 2716044179);
	  }
	  h1 = Math.imul(h3 ^ h1 >>> 18, 597399067);
	  h2 = Math.imul(h4 ^ h2 >>> 22, 2869860233);
	  h3 = Math.imul(h1 ^ h3 >>> 17, 951274213);
	  h4 = Math.imul(h2 ^ h4 >>> 19, 2716044179);
	  h1 ^= h2 ^ h3 ^ h4;
	  h2 ^= h1;
	  h3 ^= h1;
	  h4 ^= h1;
	  return [h1 >>> 0, h2 >>> 0, h3 >>> 0, h4 >>> 0];
	}
	function sfc32(a, b, c, d) {
	  return () => {
	    const t = (a + b | 0) + d | 0;
	    d = d + 1 | 0;
	    a = b ^ b >>> 9;
	    b = c + (c << 3) | 0;
	    c = c << 21 | c >>> 11;
	    c = c + t | 0;
	    return (t >>> 0) / 4294967296;
	  };
	}
	const WARM_UP = 15;
	function assertKey(key) {
	  if (typeof key !== "string" || key === "") {
	    throw new TypeError(
	      "MultiplayerAPI: random values need a non-empty string key that names what they are for."
	    );
	  }
	}
	function assertArray(array) {
	  if (!Array.isArray(array)) {
	    throw new TypeError("MultiplayerAPI: expected an array.");
	  }
	}
	class SharedRandom {
	  constructor(seed) {
	    this.seed = seed;
	  }
	  /**
	   * A fresh generator for one call. The method name is part of the hash so
	   * that, for example, random("x") and shuffle("x", ...) aren't correlated.
	   */
	  generator(method, key) {
	    const next = sfc32(...cyrb128(JSON.stringify([this.seed, method, key])));
	    for (let i = 0; i < WARM_UP; i++) {
	      next();
	    }
	    return next;
	  }
	  /** A float in [0, 1). */
	  random(key) {
	    assertKey(key);
	    return this.generator("random", key)();
	  }
	  /** An integer from `lower` to `upper`, inclusive. */
	  randomInt(key, lower, upper) {
	    assertKey(key);
	    if (!Number.isSafeInteger(lower) || !Number.isSafeInteger(upper)) {
	      throw new TypeError("MultiplayerAPI: randomInt() bounds must be integers.");
	    }
	    if (upper < lower) {
	      throw new RangeError("MultiplayerAPI: randomInt() upper bound must be at least the lower.");
	    }
	    return lower + Math.floor(this.generator("randomInt", key)() * (upper - lower + 1));
	  }
	  /** A shuffled copy of `array`. The array itself is left unchanged. */
	  shuffle(key, array) {
	    assertKey(key);
	    assertArray(array);
	    const next = this.generator("shuffle", key);
	    const result = [...array];
	    for (let i = result.length - 1; i > 0; i--) {
	      const j = Math.floor(next() * (i + 1));
	      [result[i], result[j]] = [result[j], result[i]];
	    }
	    return result;
	  }
	  /** `size` items drawn from `array` without replacement, in random order. */
	  sample(key, array, size) {
	    assertKey(key);
	    assertArray(array);
	    if (!Number.isSafeInteger(size) || size < 0 || size > array.length) {
	      throw new RangeError(
	        "MultiplayerAPI: sample() size must be an integer from 0 to the array's length."
	      );
	    }
	    const next = this.generator("sample", key);
	    const result = [...array];
	    for (let i = 0; i < size; i++) {
	      const j = i + Math.floor(next() * (result.length - i));
	      [result[i], result[j]] = [result[j], result[i]];
	    }
	    return result.slice(0, size);
	  }
	}

	const MAX_TIMEOUT = 2 ** 31 - 1;
	const MAX_NOTIFY_ROUNDS = 100;
	const DEFAULT_DROPOUT_TIMEOUT = 1e4;
	const RETRY_DELAY_MIN = 250;
	const RETRY_DELAY_MAX = 1e4;
	const PROTOCOL_VERSION = 1;
	function parseTimeout(value, name) {
	  if (value === null || value === void 0) {
	    return null;
	  }
	  if (typeof value !== "number" || Number.isNaN(value) || value <= 0) {
	    throw new TypeError(
	      `MultiplayerAPI: ${name} must be a positive number of milliseconds, or null for none.`
	    );
	  }
	  return value > MAX_TIMEOUT ? null : value;
	}
	function deepFreeze(value) {
	  if (value !== null && typeof value === "object" && !Object.isFrozen(value)) {
	    Object.freeze(value);
	    for (const child of Object.values(value)) {
	      deepFreeze(child);
	    }
	  }
	  return value;
	}
	function fromJson(json) {
	  return deepFreeze(JSON.parse(json));
	}
	function isRecord(value) {
	  return value !== null && typeof value === "object" && !Array.isArray(value);
	}
	function isIdList(value) {
	  return Array.isArray(value) && value.every((id) => typeof id === "string");
	}
	function sortedIds(ids) {
	  return [...new Set(ids)].sort();
	}
	const META_KEY = "$mp";
	function parseSlot(raw) {
	  if (!isRecord(raw)) {
	    return null;
	  }
	  const meta = raw[META_KEY];
	  if (!isRecord(meta) || typeof meta.v !== "number" || typeof meta.instance !== "string" || typeof meta.epoch !== "number") {
	    return null;
	  }
	  const scopes = {};
	  if (isRecord(raw.scopes)) {
	    for (const [name, data] of Object.entries(raw.scopes)) {
	      if (isRecord(data) && name !== "__proto__") scopes[name] = data;
	    }
	  }
	  return {
	    meta: {
	      v: meta.v,
	      instance: meta.instance,
	      epoch: meta.epoch,
	      left: isIdList(meta.left) ? meta.left : void 0
	    },
	    session: isRecord(raw.session) ? raw.session : void 0,
	    scopes
	  };
	}
	function scopeData(slot, scope) {
	  if (scope === null) {
	    return slot.session;
	  }
	  return Object.prototype.hasOwnProperty.call(slot.scopes, scope) ? slot.scopes[scope] : void 0;
	}
	function assertRecord(data) {
	  if (!isRecord(data)) {
	    throw new TypeError("MultiplayerAPI: data must be a plain object of JSON values.");
	  }
	}
	class MultiplayerSession {
	  constructor(connection, options, identity) {
	    this.connection = connection;
	    this.options = options;
	    this.identity = identity;
	    this.currentStatus = "connected";
	    /** Why the session closed; pending and later waits reject with it. */
	    this.closeReason = null;
	    /** Memoized so overlapping disconnect() calls close the connection once. */
	    this.closing = null;
	    /** JSON of the adapter's latest getAll(), to skip reads that change nothing. */
	    this.remoteJson = "{}";
	    /** JSON of every other participant's data, without bookkeeping, to tell whether it changed. */
	    this.remoteDataJson = "{}";
	    /** Every other participant's data and bookkeeping, frozen. */
	    this.slots = {};
	    /**
	     * This participant's own data. The session is its source of truth: writes change it at once
	     * and the backend is brought up to date after.
	     */
	    this.own = { scopes: {} };
	    /** Participants this one has seen leave, sent to the group. */
	    this.ownLeft = [];
	    /** Bumped whenever the bookkeeping changes, so a push of older bookkeeping doesn't count. */
	    this.metaVersion = 0;
	    /** True when the backend is known to hold the current data and bookkeeping. */
	    this.slotConfirmed = true;
	    /** Frozen view of each scope's data that readers have asked for, rebuilt on every change. */
	    this.views = /* @__PURE__ */ new Map();
	    this.presenceData = {};
	    /** Frozen snapshot of the group's membership. */
	    this.groupData = Object.freeze({ size: null, members: [], sealed: false });
	    /**
	     * When the adapter forms groups, everyone it has ever reported as a member; only their data is
	     * shown. It only grows, so a member who leaves before the group is sealed keeps the data they
	     * shared. Null when the adapter doesn't form groups.
	     */
	    this.memberFilter = null;
	    /**
	     * Every member the adapter has reported since it sealed the group. Non-null means the group is
	     * sealed. It only grows, so a sealed group never becomes unsealed and nobody drops off the
	     * roster, even if the backend stops listing them.
	     */
	    this.roster = null;
	    /** Memoized so overlapping sealGroup() calls ask the backend once. */
	    this.sealing = null;
	    this.presenceStatus = /* @__PURE__ */ new Map();
	    this.awayTimers = /* @__PURE__ */ new Map();
	    /** Each participant's page load, as last seen while they were connected. */
	    this.knownInstance = /* @__PURE__ */ new Map();
	    /**
	     * Each absent participant's bookkeeping as of when they dropped out (null if they had none).
	     * They count as back only after a write made since then.
	     */
	    this.dropMeta = /* @__PURE__ */ new Map();
	    /** False until open() announces this page load; nothing is pushed before then. */
	    this.announced = false;
	    /** True once other participants may have seen this one drop out. */
	    this.hasBeenAway = false;
	    /** Callbacks to researcher code, run once the session's state is settled. */
	    this.events = [];
	    this.listeners = /* @__PURE__ */ new Set();
	    this.notifying = false;
	    this.notifyAgain = false;
	    /** True when own data or bookkeeping has changed since it was last handed to the connection. */
	    this.hasUnsentChanges = false;
	    /** True while sendLatest() is running. */
	    this.sending = false;
	    /** Callers whose writes will go out with the next push. */
	    this.queued = [];
	    /** Callers whose writes are in the push currently in flight. */
	    this.inFlight = null;
	    this.retryDelay = 0;
	    /** Set once a run of failures has been reported as an error, so it's reported once. */
	    this.reportedStuck = false;
	    autoBind$1(this);
	    this.participantId = connection.participantId;
	    if (typeof connection.sessionId !== "string" || connection.sessionId === "") {
	      throw new TypeError(
	        "MultiplayerAPI: the adapter's connection must have a non-empty sessionId."
	      );
	    }
	    this.sessionId = connection.sessionId;
	    const { randomSeed } = options;
	    if (randomSeed !== void 0 && typeof randomSeed !== "string") {
	      throw new TypeError("MultiplayerAPI: randomSeed must be a string.");
	    }
	    this.rng = new SharedRandom(randomSeed ?? this.sessionId);
	    this.hasBeenAway = identity.epoch > 0;
	    this.dropoutTimeout = options.dropoutTimeout === void 0 ? DEFAULT_DROPOUT_TIMEOUT : parseTimeout(options.dropoutTimeout, "dropoutTimeout");
	    this.reconnectTimeout = parseTimeout(options.reconnectTimeout, "reconnectTimeout");
	    const previous = parseSlot(this.readRemote()[this.participantId]);
	    if (previous) {
	      this.own = { session: previous.session, scopes: previous.scopes };
	      this.ownLeft = previous.meta.left ?? [];
	    }
	    this.ownJson = JSON.stringify(this.own);
	    this.own = fromJson(this.ownJson);
	    this.restarted = previous !== null && previous.meta.instance !== identity.instance;
	    this.readSlots();
	    this.refreshGroup();
	    this.refreshPresence();
	    this.refreshGroup();
	    this.rebuild();
	    this.events = [];
	  }
	  /**
	   * Connect with an adapter. Once `signal` is aborted this rejects, but only after any
	   * connection the adapter opened has been closed.
	   */
	  static async open(adapter, signal, options, identity) {
	    const cancelled = () => new MultiplayerError("cancelled", "connect() was cancelled before it finished.");
	    if (signal.aborted) {
	      throw cancelled();
	    }
	    let session;
	    let connection;
	    try {
	      connection = await adapter.connect({
	        signal,
	        onChange: () => session?.handleChange(),
	        onStatus: (status) => session?.handleStatus(status),
	        onResumed: () => session?.handleResumed()
	      });
	    } catch (e) {
	      throw signal.aborted ? cancelled() : e;
	    }
	    const closeQuietly = async () => {
	      try {
	        await connection.disconnect();
	      } catch (e) {
	        console.error("MultiplayerAPI: adapter disconnect threw", e);
	      }
	    };
	    if (signal.aborted) {
	      await closeQuietly();
	      throw cancelled();
	    }
	    try {
	      session = new MultiplayerSession(connection, options, identity);
	    } catch (e) {
	      await closeQuietly();
	      throw e;
	    }
	    session.announce();
	    return session;
	  }
	  /** This client's connection status. */
	  get status() {
	    return this.currentStatus;
	  }
	  get isClosed() {
	    return this.currentStatus === "closed";
	  }
	  // ---------------------------------------------------------------- reading
	  /** Every participant's data in a scope. The object is frozen and shared, so don't modify it. */
	  getAll(scope) {
	    let view = this.views.get(scope);
	    if (!view) {
	      const data = {};
	      for (const [id, slot] of Object.entries(this.slots)) {
	        const value = scopeData(slot, scope);
	        if (value !== void 0 && (!this.memberFilter || this.memberFilter.has(id))) {
	          data[id] = value;
	        }
	      }
	      const mine = scopeData(this.own, scope);
	      if (mine !== void 0) {
	        data[this.participantId] = mine;
	      }
	      view = Object.freeze(data);
	      this.views.set(scope, view);
	    }
	    return view;
	  }
	  /** One participant's data in a scope, or undefined if they haven't written any. Frozen. */
	  get(participantId, scope) {
	    return this.getAll(scope)[participantId];
	  }
	  /** The presence status of every participant seen in the session, including this one. Frozen. */
	  presence() {
	    return this.presenceData;
	  }
	  /** The group's size, members, and whether it is sealed. Frozen. */
	  group() {
	    return this.groupData;
	  }
	  // ---------------------------------------------------------- randomness
	  random(key) {
	    return this.rng.random(key);
	  }
	  randomInt(key, lower, upper) {
	    return this.rng.randomInt(key, lower, upper);
	  }
	  shuffle(key, array) {
	    return this.rng.shuffle(key, array);
	  }
	  sample(key, array, size) {
	    return this.rng.sample(key, array, size);
	  }
	  // ---------------------------------------------------------------- writing
	  /**
	   * Shallow-merge data into this participant's data in a scope. Top-level keys in `data` replace
	   * the existing ones, other keys are kept, and a key set to undefined is removed. Reads reflect
	   * the change at once; the promise resolves when the backend confirms a push that includes it.
	   */
	  update(data, scope) {
	    this.assertOpen();
	    assertRecord(data);
	    return this.write(scope, { ...scopeData(this.own, scope), ...data });
	  }
	  /** Replace this participant's data in a scope. */
	  replace(data, scope) {
	    this.assertOpen();
	    assertRecord(data);
	    return this.write(scope, data);
	  }
	  /** Throw if the session can't be written to any more. */
	  assertOpen() {
	    if (this.isClosed) {
	      throw this.closeReason?.code === "connection_lost" ? this.closeReason : new MultiplayerError("not_connected", "this session was disconnected.");
	    }
	  }
	  /**
	   * Queue the new data for sending, then show it to readers. A write that doesn't change the
	   * data sends and notifies nothing, so a subscriber that writes the same value on every
	   * notification can't start a loop.
	   */
	  write(scope, data) {
	    const next = scope === null ? { session: data, scopes: this.own.scopes } : { session: this.own.session, scopes: { ...this.own.scopes, [scope]: data } };
	    const json = JSON.stringify(next);
	    if (json === this.ownJson) {
	      if (this.inFlight && !this.hasUnsentChanges) {
	        return new Promise((resolve, reject) => this.inFlight.push({ resolve, reject }));
	      }
	      if (this.slotConfirmed) {
	        return Promise.resolve();
	      }
	      const promise2 = this.enqueue();
	      this.requestSend();
	      return promise2;
	    }
	    this.own = fromJson(json);
	    this.ownJson = json;
	    this.slotConfirmed = false;
	    const promise = this.enqueue();
	    this.requestSend();
	    this.rebuild();
	    this.notify();
	    return promise;
	  }
	  enqueue() {
	    return new Promise((resolve, reject) => this.queued.push({ resolve, reject }));
	  }
	  /**
	   * Push this page's identity with a new epoch, so the group can tell that this participant is
	   * (back) on this page load. Runs on connect and whenever the connection recovers.
	   */
	  announce() {
	    if (this.isClosed) {
	      return;
	    }
	    this.identity.epoch++;
	    this.announced = true;
	    this.sendMeta();
	  }
	  /** Push the bookkeeping so the group sees it. */
	  sendMeta() {
	    if (this.isClosed) {
	      return;
	    }
	    this.metaVersion++;
	    this.slotConfirmed = false;
	    if (this.announced) {
	      this.requestSend();
	    }
	  }
	  /** What gets pushed: this participant's data plus the bookkeeping. */
	  payload() {
	    const meta = {
	      v: PROTOCOL_VERSION,
	      instance: this.identity.instance,
	      epoch: this.identity.epoch
	    };
	    if (this.ownLeft.length > 0) {
	      meta.left = [...this.ownLeft];
	    }
	    const payload = { [META_KEY]: meta, scopes: this.own.scopes };
	    if (this.own.session !== void 0) {
	      payload.session = this.own.session;
	    }
	    return deepFreeze(payload);
	  }
	  /** Start the sender if it's idle; a running sender picks up the change itself. */
	  requestSend() {
	    this.hasUnsentChanges = true;
	    if (this.sending) {
	      return;
	    }
	    if (this.retryTimer !== void 0) {
	      clearTimeout(this.retryTimer);
	      this.retryTimer = void 0;
	    }
	    void this.sendLatest();
	  }
	  /**
	   * Push the latest data, one push at a time, until the backend has caught up. Writes made
	   * during a push go out together in the next one, so values that are replaced before they are
	   * sent are skipped. A failed push is retried with backoff; its callers keep waiting until a
	   * push succeeds or the session closes.
	   */
	  async sendLatest() {
	    this.sending = true;
	    try {
	      while (this.hasUnsentChanges && !this.isClosed) {
	        const callers = this.queued;
	        const json = this.ownJson;
	        const metaVersion = this.metaVersion;
	        this.queued = [];
	        this.inFlight = callers;
	        this.hasUnsentChanges = false;
	        try {
	          await this.connection.push(this.payload());
	          if (json === this.ownJson && metaVersion === this.metaVersion) {
	            this.slotConfirmed = true;
	          }
	          this.retryDelay = 0;
	          this.reportedStuck = false;
	          for (const caller of callers) caller.resolve();
	        } catch (e) {
	          if (this.isClosed) {
	            return;
	          }
	          if (this.retryDelay === 0) {
	            console.warn("MultiplayerAPI: a write failed and will be retried", e);
	          }
	          this.queued = [...callers, ...this.queued];
	          this.scheduleRetry();
	          if (this.retryDelay === RETRY_DELAY_MAX && !this.reportedStuck) {
	            this.reportedStuck = true;
	            console.error(
	              "MultiplayerAPI: writes have been failing for a while, so the group isn't seeing this participant's data. The last error was:",
	              e
	            );
	          }
	          return;
	        } finally {
	          if (this.inFlight === callers) {
	            this.inFlight = null;
	          }
	        }
	      }
	    } finally {
	      this.sending = false;
	    }
	  }
	  scheduleRetry() {
	    this.retryDelay = Math.min(
	      this.retryDelay === 0 ? RETRY_DELAY_MIN : this.retryDelay * 2,
	      RETRY_DELAY_MAX
	    );
	    this.retryTimer = window.setTimeout(() => {
	      this.retryTimer = void 0;
	      this.requestSend();
	    }, this.retryDelay);
	  }
	  // ---------------------------------------------------------------- listening
	  /**
	   * Call `callback` with the current state now, and again after every change. Returns a
	   * function that removes the subscription.
	   */
	  subscribe(callback, options) {
	    const { signal, scope, trialBound } = options;
	    const listener = { callback, active: true, scope, trialBound };
	    const unsubscribe = () => {
	      listener.active = false;
	      this.listeners.delete(listener);
	      signal?.removeEventListener("abort", unsubscribe);
	    };
	    if (signal?.aborted) {
	      listener.active = false;
	      return unsubscribe;
	    }
	    if (!this.isClosed) {
	      this.listeners.add(listener);
	      signal?.addEventListener("abort", unsubscribe, { once: true });
	    }
	    this.deliver(listener);
	    return unsubscribe;
	  }
	  /**
	   * Resolve with the scope's data once `condition` returns true. Checks the current state first,
	   * so it resolves at once if the condition already holds. A throwing condition rejects the wait.
	   */
	  wait(condition, options) {
	    const { signal, participants = [], scope, trialBound } = options;
	    let timeout;
	    try {
	      timeout = parseTimeout(options.timeout, "timeout");
	      if (!isIdList(participants)) {
	        throw new TypeError("MultiplayerAPI: participants must be an array of participant IDs.");
	      }
	    } catch (e) {
	      return Promise.reject(e);
	    }
	    return new Promise((resolve, reject) => {
	      let timer;
	      const finish = (outcome) => {
	        if (!listener.active) {
	          return;
	        }
	        listener.active = false;
	        this.listeners.delete(listener);
	        if (timer !== void 0) clearTimeout(timer);
	        signal?.removeEventListener("abort", onAbort);
	        outcome();
	      };
	      const cancel = (error) => finish(() => reject(error));
	      const onAbort = () => cancel(new MultiplayerError("cancelled", "wait() was cancelled by its signal."));
	      const listener = {
	        active: true,
	        scope,
	        trialBound,
	        cancel,
	        callback: (data, presence, group) => {
	          let met;
	          try {
	            met = condition(data, presence, group);
	          } catch (e) {
	            finish(() => reject(e));
	            return;
	          }
	          if (met) {
	            finish(() => resolve(data));
	            return;
	          }
	          const gone = participants.find((id) => presence[id] === "left");
	          if (gone !== void 0) {
	            cancel(
	              new MultiplayerError(
	                "participant_left",
	                `wait() failed because participant ${gone} left the session.`,
	                gone
	              )
	            );
	          }
	        }
	      };
	      if (signal?.aborted) {
	        reject(new MultiplayerError("cancelled", "wait() was cancelled by its signal."));
	        return;
	      }
	      this.deliver(listener);
	      if (!listener.active) {
	        return;
	      }
	      if (this.isClosed) {
	        cancel(this.closeReason);
	        return;
	      }
	      this.listeners.add(listener);
	      signal?.addEventListener("abort", onAbort, { once: true });
	      if (timeout !== null) {
	        timer = window.setTimeout(
	          () => cancel(new MultiplayerError("timeout", `wait() timed out after ${timeout}ms.`)),
	          timeout
	        );
	      }
	    });
	  }
	  // ---------------------------------------------------------------- group
	  /**
	   * Ask the backend to stop letting new participants join, so the group is sealed with the
	   * members it has now. Resolves once the backend confirms, and at once if the group is already
	   * sealed.
	   */
	  async sealGroup() {
	    this.assertOpen();
	    if (this.groupData.sealed) {
	      return;
	    }
	    if (typeof this.connection.sealGroup !== "function") {
	      throw new MultiplayerError("unsupported", "this adapter can't seal groups.");
	    }
	    if (!this.sealing) {
	      const sealing = Promise.resolve().then(() => this.connection.sealGroup());
	      this.sealing = sealing;
	      sealing.finally(() => {
	        if (this.sealing === sealing) this.sealing = null;
	      }).catch(() => {
	      });
	    }
	    await this.sealing;
	    this.handleChange();
	  }
	  /** Resolve with the group's state once it is sealed. */
	  async waitForGroup(options) {
	    if (typeof this.connection.group !== "function") {
	      throw new MultiplayerError(
	        "unsupported",
	        "this adapter doesn't form groups, so waitForGroup() would never resolve. Wait for a number of participants with wait() instead."
	      );
	    }
	    await this.wait((_data, _presence, group) => group.sealed, { ...options, participants: [] });
	    return this.groupData;
	  }
	  // ---------------------------------------------------------------- lifetimes
	  /**
	   * Remove subscriptions and reject pending waits with a `cancelled` error: those bound to the
	   * trial that just ended, or all of them. The connection stays open.
	   */
	  cancelListeners(which) {
	    this.cancelMatching(
	      (listener) => which === "all" || listener.trialBound,
	      new MultiplayerError(
	        "cancelled",
	        which === "all" ? "the experiment ended before the wait finished." : "the trial ended before the wait finished."
	      )
	    );
	  }
	  cancelMatching(matches, error) {
	    for (const listener of [...this.listeners]) {
	      if (!matches(listener)) continue;
	      if (listener.cancel) {
	        listener.cancel(error);
	      } else {
	        listener.active = false;
	        this.listeners.delete(listener);
	      }
	    }
	  }
	  deliver(listener) {
	    if (!listener.active) {
	      return;
	    }
	    const data = this.getAll(listener.scope);
	    if (listener.cancel) {
	      listener.callback(data, this.presenceData, this.groupData);
	      return;
	    }
	    try {
	      listener.callback(data, this.presenceData, this.groupData);
	    } catch (e) {
	      console.error("MultiplayerAPI: subscriber callback threw", e);
	    }
	  }
	  /**
	   * Deliver the current state to every listener. A change made by a listener starts another
	   * round after this one, instead of a nested one, so each listener sees snapshots in order.
	   */
	  notify() {
	    if (this.notifying) {
	      this.notifyAgain = true;
	      return;
	    }
	    this.notifying = true;
	    let rounds = 0;
	    try {
	      do {
	        if (++rounds > MAX_NOTIFY_ROUNDS) {
	          console.error(
	            `MultiplayerAPI: stopped notifying after ${MAX_NOTIFY_ROUNDS} rounds because subscribers changed the data every time they were notified`
	          );
	          break;
	        }
	        this.notifyAgain = false;
	        for (const listener of [...this.listeners]) {
	          this.deliver(listener);
	        }
	      } while (this.notifyAgain);
	    } finally {
	      this.notifying = false;
	    }
	  }
	  /** Drop the cached views and rebuild the presence snapshot. */
	  rebuild() {
	    this.views.clear();
	    const self = {
	      connected: "connected",
	      reconnecting: "away",
	      closed: "left"
	    };
	    this.presenceData = Object.freeze({
	      ...Object.fromEntries(this.presenceStatus),
	      [this.participantId]: self[this.currentStatus]
	    });
	  }
	  // ---------------------------------------------------------------- adapter events
	  readRemote() {
	    const raw = this.connection.getAll();
	    return isRecord(raw) ? raw : {};
	  }
	  /** Re-read everyone else's data from the adapter. Returns whether their data changed. */
	  readSlots() {
	    let json;
	    try {
	      json = JSON.stringify(this.readRemote());
	    } catch (e) {
	      console.error("MultiplayerAPI: could not read the adapter's session data", e);
	      return false;
	    }
	    if (json === this.remoteJson) {
	      return false;
	    }
	    this.remoteJson = json;
	    const slots = {};
	    for (const [id, raw] of Object.entries(fromJson(json))) {
	      if (id === this.participantId || id === "__proto__") continue;
	      const slot = parseSlot(raw);
	      if (slot) slots[id] = slot;
	    }
	    this.slots = slots;
	    const dataJson = JSON.stringify(
	      Object.entries(slots).map(([id, slot]) => [id, slot.session, slot.scopes])
	    );
	    if (dataJson === this.remoteDataJson) {
	      return false;
	    }
	    this.remoteDataJson = dataJson;
	    return true;
	  }
	  handleChange() {
	    if (this.isClosed) {
	      return;
	    }
	    const dataChanged = this.readSlots();
	    const groupChanged = this.refreshGroup();
	    const presenceChanged = this.refreshPresence();
	    const membersChanged = presenceChanged && this.refreshGroup();
	    if (this.isEvicted()) {
	      void this.close(
	        new MultiplayerError(
	          "connection_lost",
	          "the rest of the group counted this participant as having left."
	        )
	      );
	      return;
	    }
	    if (dataChanged || groupChanged || presenceChanged || membersChanged) {
	      this.rebuild();
	      this.notify();
	    }
	    this.flushEvents();
	  }
	  handleStatus(status) {
	    if (this.isClosed || status === this.currentStatus) {
	      return;
	    }
	    if (status === "closed") {
	      void this.close(
	        new MultiplayerError("connection_lost", "the connection to the backend was lost.")
	      );
	      return;
	    }
	    this.currentStatus = status;
	    if (status === "reconnecting") {
	      this.hasBeenAway = true;
	      this.clearAwayTimers();
	      if (this.reconnectTimeout !== null) {
	        this.reconnectTimer = window.setTimeout(() => {
	          void this.close(
	            new MultiplayerError(
	              "connection_lost",
	              `gave up reconnecting after ${this.reconnectTimeout}ms.`
	            )
	          );
	        }, this.reconnectTimeout);
	      }
	    } else {
	      this.clearReconnectTimer();
	      for (const [id, presence] of this.presenceStatus) {
	        if (presence === "away") this.startAwayTimer(id);
	      }
	      this.readSlots();
	      this.refreshGroup();
	      this.refreshPresence();
	      if (this.isEvicted()) {
	        void this.close(
	          new MultiplayerError(
	            "connection_lost",
	            "the rest of the group counted this participant as having left."
	          )
	        );
	        return;
	      }
	      this.announce();
	    }
	    this.rebuild();
	    this.notify();
	    this.reportStatus();
	    this.flushEvents();
	  }
	  handleResumed() {
	    if (this.isClosed) {
	      return;
	    }
	    this.hasBeenAway = true;
	    this.announce();
	  }
	  reportStatus() {
	    try {
	      this.options.onStatusChange?.(this.currentStatus);
	    } catch (e) {
	      console.error("MultiplayerAPI: onStatusChange threw", e);
	    }
	  }
	  // ---------------------------------------------------------------- presence
	  /**
	   * Compare the adapter's connected list with what we know, starting or stopping dropout
	   * clocks, and adopt departures other participants have seen. Returns whether any presence
	   * status changed.
	   */
	  refreshPresence() {
	    if (this.currentStatus !== "connected") {
	      return false;
	    }
	    let connectedNow;
	    try {
	      connectedNow = new Set(this.connection.connectedParticipants());
	    } catch (e) {
	      console.error("MultiplayerAPI: could not read the adapter's connected participants", e);
	      return false;
	    }
	    const ids = /* @__PURE__ */ new Set([
	      ...connectedNow,
	      ...Object.keys(this.slots).filter((id) => !this.memberFilter || this.memberFilter.has(id)),
	      ...this.presenceStatus.keys(),
	      ...this.roster ?? []
	    ]);
	    ids.delete(this.participantId);
	    let changed = false;
	    for (const id of ids) {
	      const current = this.presenceStatus.get(id);
	      if (current === "left") {
	        continue;
	      }
	      const meta = this.slots[id]?.meta;
	      if (!connectedNow.has(id)) {
	        if (current === void 0 || current === "connected") {
	          this.presenceStatus.set(id, "away");
	          this.dropMeta.set(id, meta ?? null);
	          this.startAwayTimer(id);
	          changed = true;
	        }
	        continue;
	      }
	      if (current === void 0) {
	        this.presenceStatus.set(id, "connected");
	        if (meta) this.knownInstance.set(id, meta.instance);
	        changed = true;
	      } else if (current === "connected") {
	        const known = this.knownInstance.get(id);
	        if (meta && known !== void 0 && meta.instance !== known) {
	          this.markLeft(id);
	          changed = true;
	        } else if (meta) {
	          this.knownInstance.set(id, meta.instance);
	        }
	      } else if (meta) {
	        const drop = this.dropMeta.get(id) ?? null;
	        if (drop && meta.instance !== drop.instance) {
	          this.markLeft(id);
	          changed = true;
	        } else if (!drop || meta.epoch > drop.epoch) {
	          this.presenceStatus.set(id, "connected");
	          this.clearAwayTimer(id);
	          this.dropMeta.delete(id);
	          this.knownInstance.set(id, meta.instance);
	          changed = true;
	        }
	      }
	    }
	    for (const [declarer, slot] of Object.entries(this.slots)) {
	      if (this.presenceStatus.get(declarer) !== "connected") continue;
	      for (const id of slot.meta.left ?? []) {
	        if (this.presenceStatus.get(id) === "away") {
	          this.markLeft(id);
	          changed = true;
	        }
	      }
	    }
	    return changed;
	  }
	  /**
	   * Whether a connected participant has told the group that this one left. Only believed when
	   * the others may really have seen this participant drop out.
	   */
	  isEvicted() {
	    if (!this.hasBeenAway && !this.restarted) {
	      return false;
	    }
	    return Object.entries(this.slots).some(
	      ([declarer, slot]) => this.presenceStatus.get(declarer) === "connected" && (slot.meta.left ?? []).includes(this.participantId)
	    );
	  }
	  /** A participant is gone for good. Tell the group and the researcher. */
	  markLeft(id) {
	    this.presenceStatus.set(id, "left");
	    this.clearAwayTimer(id);
	    this.dropMeta.delete(id);
	    if (!this.ownLeft.includes(id)) {
	      this.ownLeft = [...this.ownLeft, id];
	      this.sendMeta();
	    }
	    this.events.push(() => this.options.onParticipantLeft?.(id));
	  }
	  /** Run queued researcher callbacks, after the session's state and snapshots are settled. */
	  flushEvents() {
	    for (const event of this.events.splice(0)) {
	      try {
	        event();
	      } catch (e) {
	        console.error("MultiplayerAPI: onParticipantLeft threw", e);
	      }
	    }
	  }
	  startAwayTimer(id) {
	    this.clearAwayTimer(id);
	    if (this.dropoutTimeout !== null) {
	      this.awayTimers.set(
	        id,
	        window.setTimeout(() => {
	          this.awayTimers.delete(id);
	          if (this.isClosed || this.presenceStatus.get(id) !== "away") {
	            return;
	          }
	          this.markLeft(id);
	          this.rebuild();
	          this.notify();
	          this.flushEvents();
	        }, this.dropoutTimeout)
	      );
	    }
	  }
	  clearAwayTimer(id) {
	    const timer = this.awayTimers.get(id);
	    if (timer !== void 0) {
	      clearTimeout(timer);
	      this.awayTimers.delete(id);
	    }
	  }
	  clearAwayTimers() {
	    for (const timer of this.awayTimers.values()) {
	      clearTimeout(timer);
	    }
	    this.awayTimers.clear();
	  }
	  clearReconnectTimer() {
	    if (this.reconnectTimer !== void 0) {
	      clearTimeout(this.reconnectTimer);
	      this.reconnectTimer = void 0;
	    }
	  }
	  // ---------------------------------------------------------------- group state
	  /** The adapter's report of the group, or undefined if it has none or it is malformed. */
	  readAdapterGroup() {
	    if (typeof this.connection.group !== "function") {
	      return void 0;
	    }
	    let reported;
	    try {
	      reported = this.connection.group();
	    } catch (e) {
	      console.error("MultiplayerAPI: could not read the adapter's group", e);
	      return void 0;
	    }
	    if (reported === null || typeof reported !== "object" || !Array.isArray(reported.members)) {
	      console.error("MultiplayerAPI: the adapter's group() returned", reported);
	      return void 0;
	    }
	    const { size } = reported;
	    return {
	      size: Number.isInteger(size) && size > 0 ? size : null,
	      members: reported.members.map(String),
	      sealed: reported.sealed === true
	    };
	  }
	  /** Work out the group's state from the adapter, or from presence. Returns whether it changed. */
	  refreshGroup() {
	    const reported = this.readAdapterGroup();
	    if (!reported && typeof this.connection.group === "function") {
	      return false;
	    }
	    let next;
	    if (reported) {
	      if (reported.sealed || this.roster) {
	        this.roster ??= /* @__PURE__ */ new Set([this.participantId]);
	        if (reported.sealed) {
	          for (const id of reported.members) this.roster.add(id);
	        }
	      }
	      next = {
	        size: reported.size ?? this.groupData.size,
	        members: sortedIds(this.roster ?? [...reported.members, this.participantId]),
	        sealed: this.roster !== null
	      };
	    } else {
	      next = {
	        size: null,
	        members: sortedIds([this.participantId, ...this.presenceStatus.keys()]),
	        sealed: false
	      };
	    }
	    if (reported) {
	      this.memberFilter ??= /* @__PURE__ */ new Set();
	      for (const id of next.members) this.memberFilter.add(id);
	    } else {
	      this.memberFilter = null;
	    }
	    if (JSON.stringify(next) === JSON.stringify(this.groupData)) {
	      return false;
	    }
	    this.groupData = deepFreeze(next);
	    this.views.clear();
	    return true;
	  }
	  // ---------------------------------------------------------------- closing
	  /**
	   * Close the connection. Subscribers are called one last time, then removed. Pending waits
	   * reject with a `cancelled` error and unsent writes reject. Reads keep returning the last
	   * snapshot.
	   */
	  disconnect() {
	    return this.close(new MultiplayerError("cancelled", "the session was disconnected."));
	  }
	  close(reason) {
	    if (!this.closing) {
	      const lost = reason.code === "connection_lost";
	      this.currentStatus = "closed";
	      this.closeReason = reason;
	      this.clearAwayTimers();
	      this.clearReconnectTimer();
	      if (this.retryTimer !== void 0) {
	        clearTimeout(this.retryTimer);
	        this.retryTimer = void 0;
	      }
	      const disconnecting = (async () => this.connection.disconnect())();
	      this.closing = lost ? disconnecting.catch((e) => console.error("MultiplayerAPI: adapter disconnect threw", e)) : disconnecting;
	      const writeError = lost ? reason : new MultiplayerError("cancelled", "disconnect() was called before this write was sent.");
	      const unsent = [...this.inFlight ?? [], ...this.queued];
	      this.inFlight = null;
	      this.queued = [];
	      this.hasUnsentChanges = false;
	      for (const caller of unsent) {
	        caller.reject(writeError);
	      }
	      this.rebuild();
	      this.notify();
	      this.cancelMatching(() => true, reason);
	      this.reportStatus();
	    }
	    return this.closing;
	  }
	}

	var _a;
	const DEFAULT_CONNECT_TIMEOUT = 2e4;
	const timelineHooks = Symbol("multiplayer timeline hooks");
	_a = timelineHooks;
	class MultiplayerAPI {
	  constructor() {
	    /** The latest session, open or closed. Closed sessions still answer reads. */
	    this.session = null;
	    this.connecting = null;
	    /** The running trial's scope name, or null between trials. */
	    this.trialScope = null;
	    /** The IDs to add to each row of jsPsych's data, or null when not recording them. */
	    this.recordedIds = null;
	    /**
	     * This page load's identity, shared by every session opened from it, so the group can tell a
	     * reconnect of this page from a reload.
	     */
	    this.identity = {
	      instance: Math.random().toString(36).slice(2) + Date.now().toString(36),
	      epoch: 0
	    };
	    /** Called by jsPsych as its timeline runs. */
	    this[_a] = {
	      /** A trial is starting; its calls use `scope` by default. */
	      trialStarted: (scope) => {
	        this.session?.cancelListeners("trial");
	        this.trialScope = scope;
	      },
	      /** The trial's result is in: end its subscriptions and waits. */
	      trialEnded: () => {
	        this.session?.cancelListeners("trial");
	      },
	      /** The trial's on_finish has run; later calls use the session scope. */
	      trialFinished: () => {
	        this.session?.cancelListeners("trial");
	        this.trialScope = null;
	      },
	      /** The experiment finished or was aborted: end every subscription and wait. */
	      experimentEnded: () => {
	        this.session?.cancelListeners("all");
	        this.trialScope = null;
	      },
	      /** Properties to add to a trial's data row, or null for none. */
	      dataProperties: () => this.recordedIds
	    };
	    autoBind$1(this);
	  }
	  /** This participant's ID within the group. Null until connect() resolves. */
	  get participantId() {
	    return this.session?.participantId ?? null;
	  }
	  /** The group session's ID, the same for every participant in the group. Null until connect() resolves. */
	  get sessionId() {
	    return this.session?.sessionId ?? null;
	  }
	  /**
	   * True when this participant reloaded or reopened the study after joining the group: their
	   * experiment restarted, the group has moved on, and the others count them as having left.
	   */
	  get restarted() {
	    return this.session?.restarted ?? false;
	  }
	  /** This participant's connection status. Null until connect() resolves; `closed` after disconnect(). */
	  get status() {
	    return this.session?.status ?? null;
	  }
	  /** The session to read from: the latest one, even if it has closed. */
	  readable() {
	    if (!this.session) {
	      throw new MultiplayerError(
	        "not_connected",
	        "connect() must be called with an adapter before using multiplayer methods."
	      );
	    }
	    return this.session;
	  }
	  /** The session to write to, which must still be open. */
	  writable() {
	    const session = this.readable();
	    session.assertOpen();
	    return session;
	  }
	  /** The scope a call uses: null for the session scope, or the running trial's. */
	  scopeOf(options) {
	    const scope = options?.scope;
	    if (scope === void 0) {
	      return this.trialScope;
	    }
	    if (scope === "session") {
	      return null;
	    }
	    if (scope === "trial") {
	      if (this.trialScope === null) {
	        throw new TypeError('MultiplayerAPI: scope "trial" can only be used during a trial.');
	      }
	      return this.trialScope;
	    }
	    throw new TypeError('MultiplayerAPI: scope must be "trial" or "session".');
	  }
	  /**
	   * Open a session with a backend adapter. Must be called (and awaited) before jsPsych.run().
	   * Rejects if a session is already open or connecting; a closed session can be replaced.
	   */
	  async connect(adapter, options = {}) {
	    if (this.connecting || this.session && this.session.status !== "closed") {
	      throw new Error(
	        "MultiplayerAPI: connect() has already been called. Call disconnect() first before connecting again."
	      );
	    }
	    const { signal, connectTimeout, recordIds = true, ...sessionOptions } = options;
	    const timeout = connectTimeout === void 0 ? DEFAULT_CONNECT_TIMEOUT : parseTimeout(connectTimeout, "connectTimeout");
	    const controller = new AbortController();
	    const abort = () => controller.abort();
	    if (signal?.aborted) {
	      abort();
	    } else {
	      signal?.addEventListener("abort", abort, { once: true });
	    }
	    let timedOut = false;
	    const timer = timeout === null ? void 0 : window.setTimeout(() => {
	      timedOut = true;
	      controller.abort();
	    }, timeout);
	    const connecting = {
	      controller,
	      attempt: MultiplayerSession.open(adapter, controller.signal, sessionOptions, this.identity)
	    };
	    this.connecting = connecting;
	    try {
	      const session = await connecting.attempt;
	      if (controller.signal.aborted) {
	        await session.disconnect().catch(() => {
	        });
	        throw new MultiplayerError("cancelled", "connect() was cancelled before it finished.");
	      }
	      this.session = session;
	      this.recordedIds = recordIds ? {
	        multiplayer_participant_id: session.participantId,
	        multiplayer_session_id: session.sessionId
	      } : null;
	    } catch (e) {
	      if (timedOut) {
	        throw new MultiplayerError("timeout", `connect() timed out after ${timeout}ms.`);
	      }
	      throw e;
	    } finally {
	      clearTimeout(timer);
	      signal?.removeEventListener("abort", abort);
	      if (this.connecting === connecting) {
	        this.connecting = null;
	      }
	    }
	  }
	  /**
	   * Close the current session, or cancel a connect() that is still pending. Resolves once the
	   * adapter has closed the connection. Reads keep returning the last state.
	   */
	  async disconnect() {
	    const connecting = this.connecting;
	    const session = this.session;
	    this.connecting = null;
	    if (connecting) {
	      connecting.controller.abort();
	      const abandoned = await connecting.attempt.catch(() => null);
	      await abandoned?.disconnect().catch((e) => {
	        console.error("MultiplayerAPI: adapter disconnect threw", e);
	      });
	    }
	    await session?.disconnect();
	  }
	  /**
	   * Shallow-merge data into this participant's data: top-level keys in `data` replace the same
	   * keys, other keys are kept, and a key set to undefined is removed. Everyone sees the change;
	   * the promise resolves once the backend has it.
	   */
	  async update(data, options) {
	    return this.writable().update(data, this.scopeOf(options));
	  }
	  /** Replace this participant's data in the scope with `data`, dropping every key it omits. */
	  async replace(data, options) {
	    return this.writable().replace(data, this.scopeOf(options));
	  }
	  /** Every participant's data in the scope, keyed by participant ID. Frozen; don't modify it. */
	  getAll(options) {
	    return this.readable().getAll(this.scopeOf(options));
	  }
	  /** One participant's data in the scope, or undefined if they haven't written any. Frozen. */
	  get(participantId, options) {
	    return this.readable().get(participantId, this.scopeOf(options));
	  }
	  /** The presence status of every participant seen in the session. Frozen. */
	  presence() {
	    return this.readable().presence();
	  }
	  /** The group's size, members, and whether it is sealed. Frozen. */
	  group() {
	    return this.readable().group();
	  }
	  /**
	   * Stop new participants from joining, sealing the group with the members it has now. Rejects
	   * with an `unsupported` MultiplayerError if the adapter can't seal groups.
	   */
	  async sealGroup() {
	    return this.writable().sealGroup();
	  }
	  /** Resolve with the group's state once it is sealed. */
	  async waitForGroup(options = {}) {
	    return this.readable().waitForGroup({
	      timeout: options.timeout,
	      signal: options.signal,
	      scope: null,
	      trialBound: this.trialScope !== null
	    });
	  }
	  /**
	   * Call `callback(data, presence, group)` now and after every change to the scope's data,
	   * presence, or the group. A subscription made during a trial ends with the trial, unless it
	   * uses `scope: "session"`, which lasts until the experiment ends.
	   */
	  subscribe(callback, options = {}) {
	    const scope = this.scopeOf(options);
	    return this.readable().subscribe(callback, {
	      scope,
	      signal: options.signal,
	      trialBound: scope !== null
	    });
	  }
	  /**
	   * Resolve with the scope's data once `condition(data, presence, group)` returns true. A wait
	   * made during a trial is cancelled when the trial ends, unless it uses `scope: "session"`.
	   */
	  async wait(condition, options = {}) {
	    if (options === null || typeof options !== "object") {
	      throw new TypeError(
	        "MultiplayerAPI: wait()'s second argument must be an options object, e.g. { timeout: 5000 }."
	      );
	    }
	    const scope = this.scopeOf(options);
	    return this.readable().wait(condition, {
	      scope,
	      signal: options.signal,
	      timeout: options.timeout,
	      participants: options.participants,
	      trialBound: scope !== null
	    });
	  }
	  /**
	   * A float in [0, 1) that is the same for every participant who asks with the same `key`.
	   * Asking again with the same key returns the same value.
	   */
	  random(key) {
	    return this.readable().random(key);
	  }
	  /** An integer from `lower` to `upper`, inclusive, shared like random(). */
	  randomInt(key, lower, upper) {
	    return this.readable().randomInt(key, lower, upper);
	  }
	  /** A shuffled copy of `array`, in the same order for every participant who uses `key`. */
	  shuffle(key, array) {
	    return this.readable().shuffle(key, array);
	  }
	  /** `size` items drawn from `array` without replacement, shared like shuffle(). */
	  sample(key, array, size) {
	    return this.readable().sample(key, array, size);
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
	    autoBind$1(this);
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
	    ...[keyboardListenerAPI, timeoutAPI, mediaAPI, simulationAPI].map((object) => autoBind$1(object))
	  );
	}

	var alea$1 = {exports: {}};

	alea$1.exports;

	(function (module) {
		// A port of an algorithm by Johannes Baagøe <baagoe@baagoe.com>, 2010
		// http://baagoe.com/en/RandomMusings/javascript/
		// https://github.com/nquinlan/better-random-numbers-for-javascript-mirror
		// Original work is under MIT license -

		// Copyright (C) 2010 by Johannes Baagøe <baagoe@baagoe.org>
		//
		// Permission is hereby granted, free of charge, to any person obtaining a copy
		// of this software and associated documentation files (the "Software"), to deal
		// in the Software without restriction, including without limitation the rights
		// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
		// copies of the Software, and to permit persons to whom the Software is
		// furnished to do so, subject to the following conditions:
		//
		// The above copyright notice and this permission notice shall be included in
		// all copies or substantial portions of the Software.
		//
		// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
		// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
		// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
		// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
		// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
		// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
		// THE SOFTWARE.



		(function(global, module, define) {

		function Alea(seed) {
		  var me = this, mash = Mash();

		  me.next = function() {
		    var t = 2091639 * me.s0 + me.c * 2.3283064365386963e-10; // 2^-32
		    me.s0 = me.s1;
		    me.s1 = me.s2;
		    return me.s2 = t - (me.c = t | 0);
		  };

		  // Apply the seeding algorithm from Baagoe.
		  me.c = 1;
		  me.s0 = mash(' ');
		  me.s1 = mash(' ');
		  me.s2 = mash(' ');
		  me.s0 -= mash(seed);
		  if (me.s0 < 0) { me.s0 += 1; }
		  me.s1 -= mash(seed);
		  if (me.s1 < 0) { me.s1 += 1; }
		  me.s2 -= mash(seed);
		  if (me.s2 < 0) { me.s2 += 1; }
		  mash = null;
		}

		function copy(f, t) {
		  t.c = f.c;
		  t.s0 = f.s0;
		  t.s1 = f.s1;
		  t.s2 = f.s2;
		  return t;
		}

		function impl(seed, opts) {
		  var xg = new Alea(seed),
		      state = opts && opts.state,
		      prng = xg.next;
		  prng.int32 = function() { return (xg.next() * 0x100000000) | 0; };
		  prng.double = function() {
		    return prng() + (prng() * 0x200000 | 0) * 1.1102230246251565e-16; // 2^-53
		  };
		  prng.quick = prng;
		  if (state) {
		    if (typeof(state) == 'object') copy(state, xg);
		    prng.state = function() { return copy(xg, {}); };
		  }
		  return prng;
		}

		function Mash() {
		  var n = 0xefc8249d;

		  var mash = function(data) {
		    data = String(data);
		    for (var i = 0; i < data.length; i++) {
		      n += data.charCodeAt(i);
		      var h = 0.02519603282416938 * n;
		      n = h >>> 0;
		      h -= n;
		      h *= n;
		      n = h >>> 0;
		      h -= n;
		      n += h * 0x100000000; // 2^32
		    }
		    return (n >>> 0) * 2.3283064365386963e-10; // 2^-32
		  };

		  return mash;
		}


		if (module && module.exports) {
		  module.exports = impl;
		} else {
		  this.alea = impl;
		}

		})(
		  commonjsGlobal,
		  module); 
	} (alea$1));

	var aleaExports = alea$1.exports;
	var seedrandom$3 = /*@__PURE__*/getDefaultExportFromCjs(aleaExports);

	var xor128$1 = {exports: {}};

	xor128$1.exports;

	(function (module) {
		// A Javascript implementaion of the "xor128" prng algorithm by
		// George Marsaglia.  See http://www.jstatsoft.org/v08/i14/paper

		(function(global, module, define) {

		function XorGen(seed) {
		  var me = this, strseed = '';

		  me.x = 0;
		  me.y = 0;
		  me.z = 0;
		  me.w = 0;

		  // Set up generator function.
		  me.next = function() {
		    var t = me.x ^ (me.x << 11);
		    me.x = me.y;
		    me.y = me.z;
		    me.z = me.w;
		    return me.w ^= (me.w >>> 19) ^ t ^ (t >>> 8);
		  };

		  if (seed === (seed | 0)) {
		    // Integer seed.
		    me.x = seed;
		  } else {
		    // String seed.
		    strseed += seed;
		  }

		  // Mix in string seed, then discard an initial batch of 64 values.
		  for (var k = 0; k < strseed.length + 64; k++) {
		    me.x ^= strseed.charCodeAt(k) | 0;
		    me.next();
		  }
		}

		function copy(f, t) {
		  t.x = f.x;
		  t.y = f.y;
		  t.z = f.z;
		  t.w = f.w;
		  return t;
		}

		function impl(seed, opts) {
		  var xg = new XorGen(seed),
		      state = opts && opts.state,
		      prng = function() { return (xg.next() >>> 0) / 0x100000000; };
		  prng.double = function() {
		    do {
		      var top = xg.next() >>> 11,
		          bot = (xg.next() >>> 0) / 0x100000000,
		          result = (top + bot) / (1 << 21);
		    } while (result === 0);
		    return result;
		  };
		  prng.int32 = xg.next;
		  prng.quick = prng;
		  if (state) {
		    if (typeof(state) == 'object') copy(state, xg);
		    prng.state = function() { return copy(xg, {}); };
		  }
		  return prng;
		}

		if (module && module.exports) {
		  module.exports = impl;
		} else {
		  this.xor128 = impl;
		}

		})(
		  commonjsGlobal,
		  module); 
	} (xor128$1));

	var xor128Exports = xor128$1.exports;

	var xorwow$1 = {exports: {}};

	xorwow$1.exports;

	(function (module) {
		// A Javascript implementaion of the "xorwow" prng algorithm by
		// George Marsaglia.  See http://www.jstatsoft.org/v08/i14/paper

		(function(global, module, define) {

		function XorGen(seed) {
		  var me = this, strseed = '';

		  // Set up generator function.
		  me.next = function() {
		    var t = (me.x ^ (me.x >>> 2));
		    me.x = me.y; me.y = me.z; me.z = me.w; me.w = me.v;
		    return (me.d = (me.d + 362437 | 0)) +
		       (me.v = (me.v ^ (me.v << 4)) ^ (t ^ (t << 1))) | 0;
		  };

		  me.x = 0;
		  me.y = 0;
		  me.z = 0;
		  me.w = 0;
		  me.v = 0;

		  if (seed === (seed | 0)) {
		    // Integer seed.
		    me.x = seed;
		  } else {
		    // String seed.
		    strseed += seed;
		  }

		  // Mix in string seed, then discard an initial batch of 64 values.
		  for (var k = 0; k < strseed.length + 64; k++) {
		    me.x ^= strseed.charCodeAt(k) | 0;
		    if (k == strseed.length) {
		      me.d = me.x << 10 ^ me.x >>> 4;
		    }
		    me.next();
		  }
		}

		function copy(f, t) {
		  t.x = f.x;
		  t.y = f.y;
		  t.z = f.z;
		  t.w = f.w;
		  t.v = f.v;
		  t.d = f.d;
		  return t;
		}

		function impl(seed, opts) {
		  var xg = new XorGen(seed),
		      state = opts && opts.state,
		      prng = function() { return (xg.next() >>> 0) / 0x100000000; };
		  prng.double = function() {
		    do {
		      var top = xg.next() >>> 11,
		          bot = (xg.next() >>> 0) / 0x100000000,
		          result = (top + bot) / (1 << 21);
		    } while (result === 0);
		    return result;
		  };
		  prng.int32 = xg.next;
		  prng.quick = prng;
		  if (state) {
		    if (typeof(state) == 'object') copy(state, xg);
		    prng.state = function() { return copy(xg, {}); };
		  }
		  return prng;
		}

		if (module && module.exports) {
		  module.exports = impl;
		} else {
		  this.xorwow = impl;
		}

		})(
		  commonjsGlobal,
		  module); 
	} (xorwow$1));

	var xorwowExports = xorwow$1.exports;

	var xorshift7$1 = {exports: {}};

	xorshift7$1.exports;

	(function (module) {
		// A Javascript implementaion of the "xorshift7" algorithm by
		// François Panneton and Pierre L'ecuyer:
		// "On the Xorgshift Random Number Generators"
		// http://saluc.engr.uconn.edu/refs/crypto/rng/panneton05onthexorshift.pdf

		(function(global, module, define) {

		function XorGen(seed) {
		  var me = this;

		  // Set up generator function.
		  me.next = function() {
		    // Update xor generator.
		    var X = me.x, i = me.i, t, v;
		    t = X[i]; t ^= (t >>> 7); v = t ^ (t << 24);
		    t = X[(i + 1) & 7]; v ^= t ^ (t >>> 10);
		    t = X[(i + 3) & 7]; v ^= t ^ (t >>> 3);
		    t = X[(i + 4) & 7]; v ^= t ^ (t << 7);
		    t = X[(i + 7) & 7]; t = t ^ (t << 13); v ^= t ^ (t << 9);
		    X[i] = v;
		    me.i = (i + 1) & 7;
		    return v;
		  };

		  function init(me, seed) {
		    var j, X = [];

		    if (seed === (seed | 0)) {
		      // Seed state array using a 32-bit integer.
		      X[0] = seed;
		    } else {
		      // Seed state using a string.
		      seed = '' + seed;
		      for (j = 0; j < seed.length; ++j) {
		        X[j & 7] = (X[j & 7] << 15) ^
		            (seed.charCodeAt(j) + X[(j + 1) & 7] << 13);
		      }
		    }
		    // Enforce an array length of 8, not all zeroes.
		    while (X.length < 8) X.push(0);
		    for (j = 0; j < 8 && X[j] === 0; ++j);
		    if (j == 8) X[7] = -1; else X[j];

		    me.x = X;
		    me.i = 0;

		    // Discard an initial 256 values.
		    for (j = 256; j > 0; --j) {
		      me.next();
		    }
		  }

		  init(me, seed);
		}

		function copy(f, t) {
		  t.x = f.x.slice();
		  t.i = f.i;
		  return t;
		}

		function impl(seed, opts) {
		  if (seed == null) seed = +(new Date);
		  var xg = new XorGen(seed),
		      state = opts && opts.state,
		      prng = function() { return (xg.next() >>> 0) / 0x100000000; };
		  prng.double = function() {
		    do {
		      var top = xg.next() >>> 11,
		          bot = (xg.next() >>> 0) / 0x100000000,
		          result = (top + bot) / (1 << 21);
		    } while (result === 0);
		    return result;
		  };
		  prng.int32 = xg.next;
		  prng.quick = prng;
		  if (state) {
		    if (state.x) copy(state, xg);
		    prng.state = function() { return copy(xg, {}); };
		  }
		  return prng;
		}

		if (module && module.exports) {
		  module.exports = impl;
		} else {
		  this.xorshift7 = impl;
		}

		})(
		  commonjsGlobal,
		  module); 
	} (xorshift7$1));

	var xorshift7Exports = xorshift7$1.exports;

	var xor4096$1 = {exports: {}};

	xor4096$1.exports;

	(function (module) {
		// A Javascript implementaion of Richard Brent's Xorgens xor4096 algorithm.
		//
		// This fast non-cryptographic random number generator is designed for
		// use in Monte-Carlo algorithms. It combines a long-period xorshift
		// generator with a Weyl generator, and it passes all common batteries
		// of stasticial tests for randomness while consuming only a few nanoseconds
		// for each prng generated.  For background on the generator, see Brent's
		// paper: "Some long-period random number generators using shifts and xors."
		// http://arxiv.org/pdf/1004.3115v1.pdf
		//
		// Usage:
		//
		// var xor4096 = require('xor4096');
		// random = xor4096(1);                        // Seed with int32 or string.
		// assert.equal(random(), 0.1520436450538547); // (0, 1) range, 53 bits.
		// assert.equal(random.int32(), 1806534897);   // signed int32, 32 bits.
		//
		// For nonzero numeric keys, this impelementation provides a sequence
		// identical to that by Brent's xorgens 3 implementaion in C.  This
		// implementation also provides for initalizing the generator with
		// string seeds, or for saving and restoring the state of the generator.
		//
		// On Chrome, this prng benchmarks about 2.1 times slower than
		// Javascript's built-in Math.random().

		(function(global, module, define) {

		function XorGen(seed) {
		  var me = this;

		  // Set up generator function.
		  me.next = function() {
		    var w = me.w,
		        X = me.X, i = me.i, t, v;
		    // Update Weyl generator.
		    me.w = w = (w + 0x61c88647) | 0;
		    // Update xor generator.
		    v = X[(i + 34) & 127];
		    t = X[i = ((i + 1) & 127)];
		    v ^= v << 13;
		    t ^= t << 17;
		    v ^= v >>> 15;
		    t ^= t >>> 12;
		    // Update Xor generator array state.
		    v = X[i] = v ^ t;
		    me.i = i;
		    // Result is the combination.
		    return (v + (w ^ (w >>> 16))) | 0;
		  };

		  function init(me, seed) {
		    var t, v, i, j, w, X = [], limit = 128;
		    if (seed === (seed | 0)) {
		      // Numeric seeds initialize v, which is used to generates X.
		      v = seed;
		      seed = null;
		    } else {
		      // String seeds are mixed into v and X one character at a time.
		      seed = seed + '\0';
		      v = 0;
		      limit = Math.max(limit, seed.length);
		    }
		    // Initialize circular array and weyl value.
		    for (i = 0, j = -32; j < limit; ++j) {
		      // Put the unicode characters into the array, and shuffle them.
		      if (seed) v ^= seed.charCodeAt((j + 32) % seed.length);
		      // After 32 shuffles, take v as the starting w value.
		      if (j === 0) w = v;
		      v ^= v << 10;
		      v ^= v >>> 15;
		      v ^= v << 4;
		      v ^= v >>> 13;
		      if (j >= 0) {
		        w = (w + 0x61c88647) | 0;     // Weyl.
		        t = (X[j & 127] ^= (v + w));  // Combine xor and weyl to init array.
		        i = (0 == t) ? i + 1 : 0;     // Count zeroes.
		      }
		    }
		    // We have detected all zeroes; make the key nonzero.
		    if (i >= 128) {
		      X[(seed && seed.length || 0) & 127] = -1;
		    }
		    // Run the generator 512 times to further mix the state before using it.
		    // Factoring this as a function slows the main generator, so it is just
		    // unrolled here.  The weyl generator is not advanced while warming up.
		    i = 127;
		    for (j = 4 * 128; j > 0; --j) {
		      v = X[(i + 34) & 127];
		      t = X[i = ((i + 1) & 127)];
		      v ^= v << 13;
		      t ^= t << 17;
		      v ^= v >>> 15;
		      t ^= t >>> 12;
		      X[i] = v ^ t;
		    }
		    // Storing state as object members is faster than using closure variables.
		    me.w = w;
		    me.X = X;
		    me.i = i;
		  }

		  init(me, seed);
		}

		function copy(f, t) {
		  t.i = f.i;
		  t.w = f.w;
		  t.X = f.X.slice();
		  return t;
		}
		function impl(seed, opts) {
		  if (seed == null) seed = +(new Date);
		  var xg = new XorGen(seed),
		      state = opts && opts.state,
		      prng = function() { return (xg.next() >>> 0) / 0x100000000; };
		  prng.double = function() {
		    do {
		      var top = xg.next() >>> 11,
		          bot = (xg.next() >>> 0) / 0x100000000,
		          result = (top + bot) / (1 << 21);
		    } while (result === 0);
		    return result;
		  };
		  prng.int32 = xg.next;
		  prng.quick = prng;
		  if (state) {
		    if (state.X) copy(state, xg);
		    prng.state = function() { return copy(xg, {}); };
		  }
		  return prng;
		}

		if (module && module.exports) {
		  module.exports = impl;
		} else {
		  this.xor4096 = impl;
		}

		})(
		  commonjsGlobal,                                     // window object or global
		  module); 
	} (xor4096$1));

	var xor4096Exports = xor4096$1.exports;

	var tychei$1 = {exports: {}};

	tychei$1.exports;

	(function (module) {
		// A Javascript implementaion of the "Tyche-i" prng algorithm by
		// Samuel Neves and Filipe Araujo.
		// See https://eden.dei.uc.pt/~sneves/pubs/2011-snfa2.pdf

		(function(global, module, define) {

		function XorGen(seed) {
		  var me = this, strseed = '';

		  // Set up generator function.
		  me.next = function() {
		    var b = me.b, c = me.c, d = me.d, a = me.a;
		    b = (b << 25) ^ (b >>> 7) ^ c;
		    c = (c - d) | 0;
		    d = (d << 24) ^ (d >>> 8) ^ a;
		    a = (a - b) | 0;
		    me.b = b = (b << 20) ^ (b >>> 12) ^ c;
		    me.c = c = (c - d) | 0;
		    me.d = (d << 16) ^ (c >>> 16) ^ a;
		    return me.a = (a - b) | 0;
		  };

		  /* The following is non-inverted tyche, which has better internal
		   * bit diffusion, but which is about 25% slower than tyche-i in JS.
		  me.next = function() {
		    var a = me.a, b = me.b, c = me.c, d = me.d;
		    a = (me.a + me.b | 0) >>> 0;
		    d = me.d ^ a; d = d << 16 ^ d >>> 16;
		    c = me.c + d | 0;
		    b = me.b ^ c; b = b << 12 ^ d >>> 20;
		    me.a = a = a + b | 0;
		    d = d ^ a; me.d = d = d << 8 ^ d >>> 24;
		    me.c = c = c + d | 0;
		    b = b ^ c;
		    return me.b = (b << 7 ^ b >>> 25);
		  }
		  */

		  me.a = 0;
		  me.b = 0;
		  me.c = 2654435769 | 0;
		  me.d = 1367130551;

		  if (seed === Math.floor(seed)) {
		    // Integer seed.
		    me.a = (seed / 0x100000000) | 0;
		    me.b = seed | 0;
		  } else {
		    // String seed.
		    strseed += seed;
		  }

		  // Mix in string seed, then discard an initial batch of 64 values.
		  for (var k = 0; k < strseed.length + 20; k++) {
		    me.b ^= strseed.charCodeAt(k) | 0;
		    me.next();
		  }
		}

		function copy(f, t) {
		  t.a = f.a;
		  t.b = f.b;
		  t.c = f.c;
		  t.d = f.d;
		  return t;
		}
		function impl(seed, opts) {
		  var xg = new XorGen(seed),
		      state = opts && opts.state,
		      prng = function() { return (xg.next() >>> 0) / 0x100000000; };
		  prng.double = function() {
		    do {
		      var top = xg.next() >>> 11,
		          bot = (xg.next() >>> 0) / 0x100000000,
		          result = (top + bot) / (1 << 21);
		    } while (result === 0);
		    return result;
		  };
		  prng.int32 = xg.next;
		  prng.quick = prng;
		  if (state) {
		    if (typeof(state) == 'object') copy(state, xg);
		    prng.state = function() { return copy(xg, {}); };
		  }
		  return prng;
		}

		if (module && module.exports) {
		  module.exports = impl;
		} else {
		  this.tychei = impl;
		}

		})(
		  commonjsGlobal,
		  module); 
	} (tychei$1));

	var tycheiExports = tychei$1.exports;

	var seedrandom$2 = {exports: {}};

	/*
	Copyright 2019 David Bau.

	Permission is hereby granted, free of charge, to any person obtaining
	a copy of this software and associated documentation files (the
	"Software"), to deal in the Software without restriction, including
	without limitation the rights to use, copy, modify, merge, publish,
	distribute, sublicense, and/or sell copies of the Software, and to
	permit persons to whom the Software is furnished to do so, subject to
	the following conditions:

	The above copyright notice and this permission notice shall be
	included in all copies or substantial portions of the Software.

	THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
	EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
	MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
	IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
	CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
	TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
	SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

	*/

	(function (module) {
		(function (global, pool, math) {
		//
		// The following constants are related to IEEE 754 limits.
		//

		var width = 256,        // each RC4 output is 0 <= x < 256
		    chunks = 6,         // at least six RC4 outputs for each double
		    digits = 52,        // there are 52 significant digits in a double
		    rngname = 'random', // rngname: name for Math.random and Math.seedrandom
		    startdenom = math.pow(width, chunks),
		    significance = math.pow(2, digits),
		    overflow = significance * 2,
		    mask = width - 1,
		    nodecrypto;         // node.js crypto module, initialized at the bottom.

		//
		// seedrandom()
		// This is the seedrandom function described above.
		//
		function seedrandom(seed, options, callback) {
		  var key = [];
		  options = (options == true) ? { entropy: true } : (options || {});

		  // Flatten the seed string or build one from local entropy if needed.
		  var shortseed = mixkey(flatten(
		    options.entropy ? [seed, tostring(pool)] :
		    (seed == null) ? autoseed() : seed, 3), key);

		  // Use the seed to initialize an ARC4 generator.
		  var arc4 = new ARC4(key);

		  // This function returns a random double in [0, 1) that contains
		  // randomness in every bit of the mantissa of the IEEE 754 value.
		  var prng = function() {
		    var n = arc4.g(chunks),             // Start with a numerator n < 2 ^ 48
		        d = startdenom,                 //   and denominator d = 2 ^ 48.
		        x = 0;                          //   and no 'extra last byte'.
		    while (n < significance) {          // Fill up all significant digits by
		      n = (n + x) * width;              //   shifting numerator and
		      d *= width;                       //   denominator and generating a
		      x = arc4.g(1);                    //   new least-significant-byte.
		    }
		    while (n >= overflow) {             // To avoid rounding up, before adding
		      n /= 2;                           //   last byte, shift everything
		      d /= 2;                           //   right using integer math until
		      x >>>= 1;                         //   we have exactly the desired bits.
		    }
		    return (n + x) / d;                 // Form the number within [0, 1).
		  };

		  prng.int32 = function() { return arc4.g(4) | 0; };
		  prng.quick = function() { return arc4.g(4) / 0x100000000; };
		  prng.double = prng;

		  // Mix the randomness into accumulated entropy.
		  mixkey(tostring(arc4.S), pool);

		  // Calling convention: what to return as a function of prng, seed, is_math.
		  return (options.pass || callback ||
		      function(prng, seed, is_math_call, state) {
		        if (state) {
		          // Load the arc4 state from the given state if it has an S array.
		          if (state.S) { copy(state, arc4); }
		          // Only provide the .state method if requested via options.state.
		          prng.state = function() { return copy(arc4, {}); };
		        }

		        // If called as a method of Math (Math.seedrandom()), mutate
		        // Math.random because that is how seedrandom.js has worked since v1.0.
		        if (is_math_call) { math[rngname] = prng; return seed; }

		        // Otherwise, it is a newer calling convention, so return the
		        // prng directly.
		        else return prng;
		      })(
		  prng,
		  shortseed,
		  'global' in options ? options.global : (this == math),
		  options.state);
		}

		//
		// ARC4
		//
		// An ARC4 implementation.  The constructor takes a key in the form of
		// an array of at most (width) integers that should be 0 <= x < (width).
		//
		// The g(count) method returns a pseudorandom integer that concatenates
		// the next (count) outputs from ARC4.  Its return value is a number x
		// that is in the range 0 <= x < (width ^ count).
		//
		function ARC4(key) {
		  var t, keylen = key.length,
		      me = this, i = 0, j = me.i = me.j = 0, s = me.S = [];

		  // The empty key [] is treated as [0].
		  if (!keylen) { key = [keylen++]; }

		  // Set up S using the standard key scheduling algorithm.
		  while (i < width) {
		    s[i] = i++;
		  }
		  for (i = 0; i < width; i++) {
		    s[i] = s[j = mask & (j + key[i % keylen] + (t = s[i]))];
		    s[j] = t;
		  }

		  // The "g" method returns the next (count) outputs as one number.
		  (me.g = function(count) {
		    // Using instance members instead of closure state nearly doubles speed.
		    var t, r = 0,
		        i = me.i, j = me.j, s = me.S;
		    while (count--) {
		      t = s[i = mask & (i + 1)];
		      r = r * width + s[mask & ((s[i] = s[j = mask & (j + t)]) + (s[j] = t))];
		    }
		    me.i = i; me.j = j;
		    return r;
		    // For robust unpredictability, the function call below automatically
		    // discards an initial batch of values.  This is called RC4-drop[256].
		    // See http://google.com/search?q=rsa+fluhrer+response&btnI
		  })(width);
		}

		//
		// copy()
		// Copies internal state of ARC4 to or from a plain object.
		//
		function copy(f, t) {
		  t.i = f.i;
		  t.j = f.j;
		  t.S = f.S.slice();
		  return t;
		}
		//
		// flatten()
		// Converts an object tree to nested arrays of strings.
		//
		function flatten(obj, depth) {
		  var result = [], typ = (typeof obj), prop;
		  if (depth && typ == 'object') {
		    for (prop in obj) {
		      try { result.push(flatten(obj[prop], depth - 1)); } catch (e) {}
		    }
		  }
		  return (result.length ? result : typ == 'string' ? obj : obj + '\0');
		}

		//
		// mixkey()
		// Mixes a string seed into a key that is an array of integers, and
		// returns a shortened string seed that is equivalent to the result key.
		//
		function mixkey(seed, key) {
		  var stringseed = seed + '', smear, j = 0;
		  while (j < stringseed.length) {
		    key[mask & j] =
		      mask & ((smear ^= key[mask & j] * 19) + stringseed.charCodeAt(j++));
		  }
		  return tostring(key);
		}

		//
		// autoseed()
		// Returns an object for autoseeding, using window.crypto and Node crypto
		// module if available.
		//
		function autoseed() {
		  try {
		    var out;
		    if (nodecrypto && (out = nodecrypto.randomBytes)) {
		      // The use of 'out' to remember randomBytes makes tight minified code.
		      out = out(width);
		    } else {
		      out = new Uint8Array(width);
		      (global.crypto || global.msCrypto).getRandomValues(out);
		    }
		    return tostring(out);
		  } catch (e) {
		    var browser = global.navigator,
		        plugins = browser && browser.plugins;
		    return [+new Date, global, plugins, global.screen, tostring(pool)];
		  }
		}

		//
		// tostring()
		// Converts an array of charcodes to a string
		//
		function tostring(a) {
		  return String.fromCharCode.apply(0, a);
		}

		//
		// When seedrandom.js is loaded, we immediately mix a few bits
		// from the built-in RNG into the entropy pool.  Because we do
		// not want to interfere with deterministic PRNG state later,
		// seedrandom will not call math.random on its own again after
		// initialization.
		//
		mixkey(math.random(), pool);

		//
		// Nodejs and AMD support: export the implementation as a module using
		// either convention.
		//
		if (module.exports) {
		  module.exports = seedrandom;
		  // When in node.js, try using crypto package for autoseeding.
		  try {
		    nodecrypto = require('crypto');
		  } catch (ex) {}
		} else {
		  // When included as a plain script, set up Math.seedrandom global.
		  math['seed' + rngname] = seedrandom;
		}


		// End anonymous scope, and pass initial values.
		})(
		  // global: `self` in browsers (including strict mode and web workers),
		  // otherwise `this` in Node and other environments
		  (typeof self !== 'undefined') ? self : commonjsGlobal,
		  [],     // pool: entropy pool starts empty
		  Math    // math: package containing random, pow, and seedrandom
		); 
	} (seedrandom$2));

	var seedrandomExports = seedrandom$2.exports;

	// A library of seedable RNGs implemented in Javascript.
	//
	// Usage:
	//
	// var seedrandom = require('seedrandom');
	// var random = seedrandom(1); // or any seed.
	// var x = random();       // 0 <= x < 1.  Every bit is random.
	// var x = random.quick(); // 0 <= x < 1.  32 bits of randomness.

	// alea, a 53-bit multiply-with-carry generator by Johannes Baagøe.
	// Period: ~2^116
	// Reported to pass all BigCrush tests.
	var alea = aleaExports;

	// xor128, a pure xor-shift generator by George Marsaglia.
	// Period: 2^128-1.
	// Reported to fail: MatrixRank and LinearComp.
	var xor128 = xor128Exports;

	// xorwow, George Marsaglia's 160-bit xor-shift combined plus weyl.
	// Period: 2^192-2^32
	// Reported to fail: CollisionOver, SimpPoker, and LinearComp.
	var xorwow = xorwowExports;

	// xorshift7, by François Panneton and Pierre L'ecuyer, takes
	// a different approach: it adds robustness by allowing more shifts
	// than Marsaglia's original three.  It is a 7-shift generator
	// with 256 bits, that passes BigCrush with no systmatic failures.
	// Period 2^256-1.
	// No systematic BigCrush failures reported.
	var xorshift7 = xorshift7Exports;

	// xor4096, by Richard Brent, is a 4096-bit xor-shift with a
	// very long period that also adds a Weyl generator. It also passes
	// BigCrush with no systematic failures.  Its long period may
	// be useful if you have many generators and need to avoid
	// collisions.
	// Period: 2^4128-2^32.
	// No systematic BigCrush failures reported.
	var xor4096 = xor4096Exports;

	// Tyche-i, by Samuel Neves and Filipe Araujo, is a bit-shifting random
	// number generator derived from ChaCha, a modern stream cipher.
	// https://eden.dei.uc.pt/~sneves/pubs/2011-snfa2.pdf
	// Period: ~2^127
	// No systematic BigCrush failures reported.
	var tychei = tycheiExports;

	// The original ARC4-based prng included in this library.
	// Period: ~2^1600
	var sr = seedrandomExports;

	sr.alea = alea;
	sr.xor128 = xor128;
	sr.xorwow = xorwow;
	sr.xorshift7 = xorshift7;
	sr.xor4096 = xor4096;
	sr.tychei = tychei;

	var seedrandom$1 = sr;

	var seedrandom = seedrandom$1;

	var wordList = [
	  // Borrowed from xkcd password generator which borrowed it from wherever
	  "ability","able","aboard","about","above","accept","accident","according",
	  "account","accurate","acres","across","act","action","active","activity",
	  "actual","actually","add","addition","additional","adjective","adult","adventure",
	  "advice","affect","afraid","after","afternoon","again","against","age",
	  "ago","agree","ahead","aid","air","airplane","alike","alive",
	  "all","allow","almost","alone","along","aloud","alphabet","already",
	  "also","although","am","among","amount","ancient","angle","angry",
	  "animal","announced","another","answer","ants","any","anybody","anyone",
	  "anything","anyway","anywhere","apart","apartment","appearance","apple","applied",
	  "appropriate","are","area","arm","army","around","arrange","arrangement",
	  "arrive","arrow","art","article","as","aside","ask","asleep",
	  "at","ate","atmosphere","atom","atomic","attached","attack","attempt",
	  "attention","audience","author","automobile","available","average","avoid","aware",
	  "away","baby","back","bad","badly","bag","balance","ball",
	  "balloon","band","bank","bar","bare","bark","barn","base",
	  "baseball","basic","basis","basket","bat","battle","be","bean",
	  "bear","beat","beautiful","beauty","became","because","become","becoming",
	  "bee","been","before","began","beginning","begun","behavior","behind",
	  "being","believed","bell","belong","below","belt","bend","beneath",
	  "bent","beside","best","bet","better","between","beyond","bicycle",
	  "bigger","biggest","bill","birds","birth","birthday","bit","bite",
	  "black","blank","blanket","blew","blind","block","blood","blow",
	  "blue","board","boat","body","bone","book","border","born",
	  "both","bottle","bottom","bound","bow","bowl","box","boy",
	  "brain","branch","brass","brave","bread","break","breakfast","breath",
	  "breathe","breathing","breeze","brick","bridge","brief","bright","bring",
	  "broad","broke","broken","brother","brought","brown","brush","buffalo",
	  "build","building","built","buried","burn","burst","bus","bush",
	  "business","busy","but","butter","buy","by","cabin","cage",
	  "cake","call","calm","came","camera","camp","can","canal",
	  "cannot","cap","capital","captain","captured","car","carbon","card",
	  "care","careful","carefully","carried","carry","case","cast","castle",
	  "cat","catch","cattle","caught","cause","cave","cell","cent",
	  "center","central","century","certain","certainly","chain","chair","chamber",
	  "chance","change","changing","chapter","character","characteristic","charge","chart",
	  "check","cheese","chemical","chest","chicken","chief","child","children",
	  "choice","choose","chose","chosen","church","circle","circus","citizen",
	  "city","class","classroom","claws","clay","clean","clear","clearly",
	  "climate","climb","clock","close","closely","closer","cloth","clothes",
	  "clothing","cloud","club","coach","coal","coast","coat","coffee",
	  "cold","collect","college","colony","color","column","combination","combine",
	  "come","comfortable","coming","command","common","community","company","compare",
	  "compass","complete","completely","complex","composed","composition","compound","concerned",
	  "condition","congress","connected","consider","consist","consonant","constantly","construction",
	  "contain","continent","continued","contrast","control","conversation","cook","cookies",
	  "cool","copper","copy","corn","corner","correct","correctly","cost",
	  "cotton","could","count","country","couple","courage","course","court",
	  "cover","cow","cowboy","crack","cream","create","creature","crew",
	  "crop","cross","crowd","cry","cup","curious","current","curve",
	  "customs","cut","cutting","daily","damage","dance","danger","dangerous",
	  "dark","darkness","date","daughter","dawn","day","dead","deal",
	  "dear","death","decide","declared","deep","deeply","deer","definition",
	  "degree","depend","depth","describe","desert","design","desk","detail",
	  "determine","develop","development","diagram","diameter","did","die","differ",
	  "difference","different","difficult","difficulty","dig","dinner","direct","direction",
	  "directly","dirt","dirty","disappear","discover","discovery","discuss","discussion",
	  "disease","dish","distance","distant","divide","division","do","doctor",
	  "does","dog","doing","doll","dollar","done","donkey","door",
	  "dot","double","doubt","down","dozen","draw","drawn","dream",
	  "dress","drew","dried","drink","drive","driven","driver","driving",
	  "drop","dropped","drove","dry","duck","due","dug","dull",
	  "during","dust","duty","each","eager","ear","earlier","early",
	  "earn","earth","easier","easily","east","easy","eat","eaten",
	  "edge","education","effect","effort","egg","eight","either","electric",
	  "electricity","element","elephant","eleven","else","empty","end","enemy",
	  "energy","engine","engineer","enjoy","enough","enter","entire","entirely",
	  "environment","equal","equally","equator","equipment","escape","especially","essential",
	  "establish","even","evening","event","eventually","ever","every","everybody",
	  "everyone","everything","everywhere","evidence","exact","exactly","examine","example",
	  "excellent","except","exchange","excited","excitement","exciting","exclaimed","exercise",
	  "exist","expect","experience","experiment","explain","explanation","explore","express",
	  "expression","extra","eye","face","facing","fact","factor","factory",
	  "failed","fair","fairly","fall","fallen","familiar","family","famous",
	  "far","farm","farmer","farther","fast","fastened","faster","fat",
	  "father","favorite","fear","feathers","feature","fed","feed","feel",
	  "feet","fell","fellow","felt","fence","few","fewer","field",
	  "fierce","fifteen","fifth","fifty","fight","fighting","figure","fill",
	  "film","final","finally","find","fine","finest","finger","finish",
	  "fire","fireplace","firm","first","fish","five","fix","flag",
	  "flame","flat","flew","flies","flight","floating","floor","flow",
	  "flower","fly","fog","folks","follow","food","foot","football",
	  "for","force","foreign","forest","forget","forgot","forgotten","form",
	  "former","fort","forth","forty","forward","fought","found","four",
	  "fourth","fox","frame","free","freedom","frequently","fresh","friend",
	  "friendly","frighten","frog","from","front","frozen","fruit","fuel",
	  "full","fully","fun","function","funny","fur","furniture","further",
	  "future","gain","game","garage","garden","gas","gasoline","gate",
	  "gather","gave","general","generally","gentle","gently","get","getting",
	  "giant","gift","girl","give","given","giving","glad","glass",
	  "globe","go","goes","gold","golden","gone","good","goose",
	  "got","government","grabbed","grade","gradually","grain","grandfather","grandmother",
	  "graph","grass","gravity","gray","great","greater","greatest","greatly",
	  "green","grew","ground","group","grow","grown","growth","guard",
	  "guess","guide","gulf","gun","habit","had","hair","half",
	  "halfway","hall","hand","handle","handsome","hang","happen","happened",
	  "happily","happy","harbor","hard","harder","hardly","has","hat",
	  "have","having","hay","he","headed","heading","health","heard",
	  "hearing","heart","heat","heavy","height","held","hello","help",
	  "helpful","her","herd","here","herself","hidden","hide","high",
	  "higher","highest","highway","hill","him","himself","his","history",
	  "hit","hold","hole","hollow","home","honor","hope","horn",
	  "horse","hospital","hot","hour","house","how","however","huge",
	  "human","hundred","hung","hungry","hunt","hunter","hurried","hurry",
	  "hurt","husband","ice","idea","identity","if","ill","image",
	  "imagine","immediately","importance","important","impossible","improve","in","inch",
	  "include","including","income","increase","indeed","independent","indicate","individual",
	  "industrial","industry","influence","information","inside","instance","instant","instead",
	  "instrument","interest","interior","into","introduced","invented","involved","iron",
	  "is","island","it","its","itself","jack","jar","jet",
	  "job","join","joined","journey","joy","judge","jump","jungle",
	  "just","keep","kept","key","kids","kill","kind","kitchen",
	  "knew","knife","know","knowledge","known","label","labor","lack",
	  "lady","laid","lake","lamp","land","language","large","larger",
	  "largest","last","late","later","laugh","law","lay","layers",
	  "lead","leader","leaf","learn","least","leather","leave","leaving",
	  "led","left","leg","length","lesson","let","letter","level",
	  "library","lie","life","lift","light","like","likely","limited",
	  "line","lion","lips","liquid","list","listen","little","live",
	  "living","load","local","locate","location","log","lonely","long",
	  "longer","look","loose","lose","loss","lost","lot","loud",
	  "love","lovely","low","lower","luck","lucky","lunch","lungs",
	  "lying","machine","machinery","mad","made","magic","magnet","mail",
	  "main","mainly","major","make","making","man","managed","manner",
	  "manufacturing","many","map","mark","market","married","mass","massage",
	  "master","material","mathematics","matter","may","maybe","me","meal",
	  "mean","means","meant","measure","meat","medicine","meet","melted",
	  "member","memory","men","mental","merely","met","metal","method",
	  "mice","middle","might","mighty","mile","military","milk","mill",
	  "mind","mine","minerals","minute","mirror","missing","mission","mistake",
	  "mix","mixture","model","modern","molecular","moment","money","monkey",
	  "month","mood","moon","more","morning","most","mostly","mother",
	  "motion","motor","mountain","mouse","mouth","move","movement","movie",
	  "moving","mud","muscle","music","musical","must","my","myself",
	  "mysterious","nails","name","nation","national","native","natural","naturally",
	  "nature","near","nearby","nearer","nearest","nearly","necessary","neck",
	  "needed","needle","needs","negative","neighbor","neighborhood","nervous","nest",
	  "never","new","news","newspaper","next","nice","night","nine",
	  "no","nobody","nodded","noise","none","noon","nor","north",
	  "nose","not","note","noted","nothing","notice","noun","now",
	  "number","numeral","nuts","object","observe","obtain","occasionally","occur",
	  "ocean","of","off","offer","office","officer","official","oil",
	  "old","older","oldest","on","once","one","only","onto",
	  "open","operation","opinion","opportunity","opposite","or","orange","orbit",
	  "order","ordinary","organization","organized","origin","original","other","ought",
	  "our","ourselves","out","outer","outline","outside","over","own",
	  "owner","oxygen","pack","package","page","paid","pain","paint",
	  "pair","palace","pale","pan","paper","paragraph","parallel","parent",
	  "park","part","particles","particular","particularly","partly","parts","party",
	  "pass","passage","past","path","pattern","pay","peace","pen",
	  "pencil","people","per","percent","perfect","perfectly","perhaps","period",
	  "person","personal","pet","phrase","physical","piano","pick","picture",
	  "pictured","pie","piece","pig","pile","pilot","pine","pink",
	  "pipe","pitch","place","plain","plan","plane","planet","planned",
	  "planning","plant","plastic","plate","plates","play","pleasant","please",
	  "pleasure","plenty","plural","plus","pocket","poem","poet","poetry",
	  "point","pole","police","policeman","political","pond","pony","pool",
	  "poor","popular","population","porch","port","position","positive","possible",
	  "possibly","post","pot","potatoes","pound","pour","powder","power",
	  "powerful","practical","practice","prepare","present","president","press","pressure",
	  "pretty","prevent","previous","price","pride","primitive","principal","principle",
	  "printed","private","prize","probably","problem","process","produce","product",
	  "production","program","progress","promised","proper","properly","property","protection",
	  "proud","prove","provide","public","pull","pupil","pure","purple",
	  "purpose","push","put","putting","quarter","queen","question","quick",
	  "quickly","quiet","quietly","quite","rabbit","race","radio","railroad",
	  "rain","raise","ran","ranch","range","rapidly","rate","rather",
	  "raw","rays","reach","read","reader","ready","real","realize",
	  "rear","reason","recall","receive","recent","recently","recognize","record",
	  "red","refer","refused","region","regular","related","relationship","religious",
	  "remain","remarkable","remember","remove","repeat","replace","replied","report",
	  "represent","require","research","respect","rest","result","return","review",
	  "rhyme","rhythm","rice","rich","ride","riding","right","ring",
	  "rise","rising","river","road","roar","rock","rocket","rocky",
	  "rod","roll","roof","room","root","rope","rose","rough",
	  "round","route","row","rubbed","rubber","rule","ruler","run",
	  "running","rush","sad","saddle","safe","safety","said","sail",
	  "sale","salmon","salt","same","sand","sang","sat","satellites",
	  "satisfied","save","saved","saw","say","scale","scared","scene",
	  "school","science","scientific","scientist","score","screen","sea","search",
	  "season","seat","second","secret","section","see","seed","seeing",
	  "seems","seen","seldom","select","selection","sell","send","sense",
	  "sent","sentence","separate","series","serious","serve","service","sets",
	  "setting","settle","settlers","seven","several","shade","shadow","shake",
	  "shaking","shall","shallow","shape","share","sharp","she","sheep",
	  "sheet","shelf","shells","shelter","shine","shinning","ship","shirt",
	  "shoe","shoot","shop","shore","short","shorter","shot","should",
	  "shoulder","shout","show","shown","shut","sick","sides","sight",
	  "sign","signal","silence","silent","silk","silly","silver","similar",
	  "simple","simplest","simply","since","sing","single","sink","sister",
	  "sit","sitting","situation","six","size","skill","skin","sky",
	  "slabs","slave","sleep","slept","slide","slight","slightly","slip",
	  "slipped","slope","slow","slowly","small","smaller","smallest","smell",
	  "smile","smoke","smooth","snake","snow","so","soap","social",
	  "society","soft","softly","soil","solar","sold","soldier","solid",
	  "solution","solve","some","somebody","somehow","someone","something","sometime",
	  "somewhere","son","song","soon","sort","sound","source","south",
	  "southern","space","speak","special","species","specific","speech","speed",
	  "spell","spend","spent","spider","spin","spirit","spite","split",
	  "spoken","sport","spread","spring","square","stage","stairs","stand",
	  "standard","star","stared","start","state","statement","station","stay",
	  "steady","steam","steel","steep","stems","step","stepped","stick",
	  "stiff","still","stock","stomach","stone","stood","stop","stopped",
	  "store","storm","story","stove","straight","strange","stranger","straw",
	  "stream","street","strength","stretch","strike","string","strip","strong",
	  "stronger","struck","structure","struggle","stuck","student","studied","studying",
	  "subject","substance","success","successful","such","sudden","suddenly","sugar",
	  "suggest","suit","sum","summer","sun","sunlight","supper","supply",
	  "support","suppose","sure","surface","surprise","surrounded","swam","sweet",
	  "swept","swim","swimming","swing","swung","syllable","symbol","system",
	  "table","tail","take","taken","tales","talk","tall","tank",
	  "tape","task","taste","taught","tax","tea","teach","teacher",
	  "team","tears","teeth","telephone","television","tell","temperature","ten",
	  "tent","term","terrible","test","than","thank","that","thee",
	  "them","themselves","then","theory","there","therefore","these","they",
	  "thick","thin","thing","think","third","thirty","this","those",
	  "thou","though","thought","thousand","thread","three","threw","throat",
	  "through","throughout","throw","thrown","thumb","thus","thy","tide",
	  "tie","tight","tightly","till","time","tin","tiny","tip",
	  "tired","title","to","tobacco","today","together","told","tomorrow",
	  "tone","tongue","tonight","too","took","tool","top","topic",
	  "torn","total","touch","toward","tower","town","toy","trace",
	  "track","trade","traffic","trail","train","transportation","trap","travel",
	  "treated","tree","triangle","tribe","trick","tried","trip","troops",
	  "tropical","trouble","truck","trunk","truth","try","tube","tune",
	  "turn","twelve","twenty","twice","two","type","typical","uncle",
	  "under","underline","understanding","unhappy","union","unit","universe","unknown",
	  "unless","until","unusual","up","upon","upper","upward","us",
	  "use","useful","using","usual","usually","valley","valuable","value",
	  "vapor","variety","various","vast","vegetable","verb","vertical","very",
	  "vessels","victory","view","village","visit","visitor","voice","volume",
	  "vote","vowel","voyage","wagon","wait","walk","wall","want",
	  "war","warm","warn","was","wash","waste","watch","water",
	  "wave","way","we","weak","wealth","wear","weather","week",
	  "weigh","weight","welcome","well","went","were","west","western",
	  "wet","whale","what","whatever","wheat","wheel","when","whenever",
	  "where","wherever","whether","which","while","whispered","whistle","white",
	  "who","whole","whom","whose","why","wide","widely","wife",
	  "wild","will","willing","win","wind","window","wing","winter",
	  "wire","wise","wish","with","within","without","wolf","women",
	  "won","wonder","wonderful","wood","wooden","wool","word","wore",
	  "work","worker","world","worried","worry","worse","worth","would",
	  "wrapped","write","writer","writing","written","wrong","wrote","yard",
	  "year","yellow","yes","yesterday","yet","you","young","younger",
	  "your","yourself","youth","zero","zebra","zipper","zoo","zulu"
	];

	function words(options) {
	  // initalize random number generator for words if options.seed is provided
	  const random = options?.seed ? new seedrandom(options.seed) : null;

	  function word() {
	    if (options && options.maxLength > 1) {
	      return generateWordWithMaxLength();
	    } else {
	      return generateRandomWord();
	    }
	  }

	  function generateWordWithMaxLength() {
	    var rightSize = false;
	    var wordUsed;
	    while (!rightSize) {  
	      wordUsed = generateRandomWord();
	      if(wordUsed.length <= options.maxLength) {
	        rightSize = true;
	      }

	    }
	    return wordUsed;
	  }

	  function generateRandomWord() {
	    return wordList[randInt(wordList.length)];
	  }

	  // random int as seeded by options.seed if applicable, or Math.random() otherwise
	  function randInt(lessThan) {
	    const r = random ? random() : Math.random();
	    return Math.floor(r * lessThan);
	  }

	  // No arguments = generate one word
	  if (typeof(options) === 'undefined') {
	    return word();
	  }

	  // Just a number = return that many words
	  if (typeof(options) === 'number') {
	    options = { exactly: options };
	  }

	  // options supported: exactly, min, max, join
	  if (options.exactly) {
	    options.min = options.exactly;
	    options.max = options.exactly;
	  }
	  
	  // not a number = one word par string
	  if (typeof(options.wordsPerString) !== 'number') {
	    options.wordsPerString = 1;
	  }

	  //not a function = returns the raw word
	  if (typeof(options.formatter) !== 'function') {
	    options.formatter = (word) => word;
	  }

	  //not a string = separator is a space
	  if (typeof(options.separator) !== 'string') {
	    options.separator = ' ';
	  }

	  var total = options.min + randInt(options.max + 1 - options.min);
	  var results = [];
	  var token = '';
	  var relativeIndex = 0;

	  for (var i = 0; (i < total * options.wordsPerString); i++) {
	    if (relativeIndex === options.wordsPerString - 1) {
	      token += options.formatter(word(), relativeIndex);
	    }
	    else {
	      token += options.formatter(word(), relativeIndex) + options.separator;
	    }
	    relativeIndex++;
	    if ((i + 1) % options.wordsPerString === 0) {
	      results.push(token);
	      token = ''; 
	      relativeIndex = 0;
	    }
	   
	  }
	  if (typeof options.join === 'string') {
	    results = results.join(options.join);
	  }

	  return results;
	}

	var randomWords$1 = words;
	// Export the word list as it is often useful
	words.wordList = wordList;

	var rw = /*@__PURE__*/getDefaultExportFromCjs(randomWords$1);

	function setSeed(seed = Math.random().toString()) {
	  Math.random = seedrandom$3(seed);
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
	  /**
	   * The name of this trial's part of the multiplayer shared data: the `multiplayer_scope`
	   * parameter, or else the trial's position in the timeline. Each timeline counts every child
	   * it runs, across repetitions and loops, so the position is the same for every participant
	   * running the same timeline, even when a conditional timeline runs for some and not others.
	   */
	  getMultiplayerScope() {
	    const named = this.getParameterValue("multiplayer_scope");
	    if (named !== void 0 && named !== null) {
	      if (typeof named !== "string" && typeof named !== "number" || named === "") {
	        throw new TypeError("multiplayer_scope must be a non-empty string or a number.");
	      }
	      return String(named);
	    }
	    const path = [];
	    let node = this;
	    while (node.parent) {
	      path.unshift(node.parent.children.indexOf(node));
	      node = node.parent;
	    }
	    return `#${path.join(".")}`;
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
	        this.multiplayer[timelineHooks].trialStarted(trial.getMultiplayerScope());
	        this.options.on_trial_start(trial.trialObject);
	        this.getDisplayContainerElement().focus();
	        this.getDisplayElement().scrollTop = 0;
	      },
	      onTrialResultAvailable: (trial) => {
	        this.multiplayer[timelineHooks].trialEnded();
	        const result = trial.getResult();
	        if (result) {
	          Object.assign(result, this.multiplayer[timelineHooks].dataProperties());
	          result.time_elapsed = this.getTotalTime();
	          this.data.write(trial);
	        }
	      },
	      onTrialFinished: (trial) => {
	        this.multiplayer[timelineHooks].trialFinished();
	        const result = trial.getResult();
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
	      ...options
	    };
	    this.options = options;
	    autoBind$1(this);
	    if (window.location.protocol == "file:" && (options.override_safe_mode === false || typeof options.override_safe_mode === "undefined")) {
	      options.use_webaudio = false;
	      this.isFileProtocolUsed = true;
	      console.warn(
	        "jsPsych detected that it is running via the file:// protocol and not on a web server. To prevent issues with cross-origin requests, Web Audio and video preloading have been disabled. If you would like to override this setting, you can set 'override_safe_mode' to 'true' in initJsPsych. For more information, see: https://www.jspsych.org/overview/running-experiments"
	      );
	    }
	    this.data = new JsPsychData(this.dataDependencies);
	    this.multiplayer = new MultiplayerAPI();
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
	    try {
	      await this.timeline.run();
	    } finally {
	      this.multiplayer[timelineHooks].experimentEnded();
	    }
	    await Promise.resolve(this.options.on_finish(this.data.get()));
	    if (this.endMessage) {
	      this.getDisplayElement().innerHTML = this.endMessage;
	    }
	    this.data.removeInteractionListeners();
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
	  abortExperiment(endMessage, data = {}) {
	    this.endMessage = endMessage;
	    this.timeline.abort();
	    this.pluginAPI.cancelAllKeyboardResponses();
	    this.pluginAPI.clearAllTimeouts();
	    this.multiplayer[timelineHooks].experimentEnded();
	    this.finishTrial(data);
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

	exports.DataCollection = DataCollection;
	exports.JsPsych = JsPsych;
	exports.MultiplayerError = MultiplayerError;
	exports.ParameterType = ParameterType;
	exports.initJsPsych = initJsPsych;

	return exports;

})({});
var initJsPsych = jsPsychModule.initJsPsych;
//# sourceMappingURL=https://unpkg.com/jspsych@8.2.3/dist/index.browser.js.map
