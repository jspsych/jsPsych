import jsPsych from "./";
import { flatten, unique } from "./utils";

// keyboard listeners //

let keyboard_listeners = [];

let held_keys = {};

function root_keydown_listener(e) {
  for (var i = 0; i < keyboard_listeners.length; i++) {
    keyboard_listeners[i].fn(e);
  }
  held_keys[e.key] = true;
}

function root_keyup_listener(e) {
  held_keys[e.key] = false;
}

export function reset(root_element) {
  keyboard_listeners = [];
  held_keys = {};
  root_element.removeEventListener("keydown", root_keydown_listener);
  root_element.removeEventListener("keyup", root_keyup_listener);
}

export function createKeyboardEventListeners(root_element) {
  root_element.addEventListener("keydown", root_keydown_listener);
  root_element.addEventListener("keyup", root_keyup_listener);
}

export function getKeyboardResponse(parameters) {
  //parameters are: callback_function, valid_responses, rt_method, persist, audio_context, audio_context_start_time, allow_held_key

  parameters.rt_method =
    typeof parameters.rt_method === "undefined" ? "performance" : parameters.rt_method;
  if (parameters.rt_method != "performance" && parameters.rt_method != "audio") {
    console.log(
      'Invalid RT method specified in getKeyboardResponse. Defaulting to "performance" method.'
    );
    parameters.rt_method = "performance";
  }

  var start_time;
  if (parameters.rt_method == "performance") {
    start_time = performance.now();
  } else if (parameters.rt_method === "audio") {
    start_time = parameters.audio_context_start_time;
  }

  var case_sensitive =
    typeof jsPsych.initSettings().case_sensitive_responses === "undefined"
      ? false
      : jsPsych.initSettings().case_sensitive_responses;

  var listener_id;

  var listener_function = function (e) {
    var key_time;
    if (parameters.rt_method == "performance") {
      key_time = performance.now();
    } else if (parameters.rt_method === "audio") {
      key_time = parameters.audio_context.currentTime;
    }
    var rt = key_time - start_time;

    // overiding via parameters for testing purposes.
    var minimum_valid_rt = parameters.minimum_valid_rt;
    if (!minimum_valid_rt) {
      minimum_valid_rt = jsPsych.initSettings().minimum_valid_rt || 0;
    }

    var rt_ms = rt;
    if (parameters.rt_method == "audio") {
      rt_ms = rt_ms * 1000;
    }
    if (rt_ms < minimum_valid_rt) {
      return;
    }

    var valid_response = false;
    if (typeof parameters.valid_responses === "undefined") {
      valid_response = true;
    } else if (parameters.valid_responses == jsPsych.ALL_KEYS) {
      valid_response = true;
    } else if (parameters.valid_responses != jsPsych.NO_KEYS) {
      if (parameters.valid_responses.includes(e.key)) {
        valid_response = true;
      }
      if (!case_sensitive) {
        var valid_lower = parameters.valid_responses.map(function (v) {
          return v.toLowerCase();
        });
        var key_lower = e.key.toLowerCase();
        if (valid_lower.includes(key_lower)) {
          valid_response = true;
        }
      }
    }

    // check if key was already held down
    if (
      (typeof parameters.allow_held_key === "undefined" || !parameters.allow_held_key) &&
      valid_response
    ) {
      if (typeof held_keys[e.key] !== "undefined" && held_keys[e.key] == true) {
        valid_response = false;
      }
      if (
        !case_sensitive &&
        typeof held_keys[e.key.toLowerCase()] !== "undefined" &&
        held_keys[e.key.toLowerCase()] == true
      ) {
        valid_response = false;
      }
    }

    if (valid_response) {
      // if this is a valid response, then we don't want the key event to trigger other actions
      // like scrolling via the spacebar.
      e.preventDefault();
      var key = e.key;
      if (!case_sensitive) {
        key = key.toLowerCase();
      }
      parameters.callback_function({
        key: key,
        rt: rt_ms,
      });

      if (keyboard_listeners.includes(listener_id)) {
        if (!parameters.persist) {
          // remove keyboard listener
          cancelKeyboardResponse(listener_id);
        }
      }
    }
  };

  // create listener id object
  listener_id = {
    type: "keydown",
    fn: listener_function,
  };

  // add this keyboard listener to the list of listeners
  keyboard_listeners.push(listener_id);

  return listener_id;
}

export function cancelKeyboardResponse(listener) {
  // remove the listener from the list of listeners
  if (keyboard_listeners.includes(listener)) {
    keyboard_listeners.splice(keyboard_listeners.indexOf(listener), 1);
  }
}

export function cancelAllKeyboardResponses() {
  keyboard_listeners = [];
}

export function convertKeyCharacterToKeyCode(character) {
  console.warn(
    "Warning: The jsPsych.pluginAPI.convertKeyCharacterToKeyCode function will be removed in future jsPsych releases. " +
      "We recommend removing this function and using strings to identify/compare keys."
  );
  var code;
  character = character.toLowerCase();
  if (typeof keylookup[character] !== "undefined") {
    code = keylookup[character];
  }
  return code;
}

export function convertKeyCodeToKeyCharacter(code) {
  console.warn(
    "Warning: The jsPsych.pluginAPI.convertKeyCodeToKeyCharacter function will be removed in future jsPsych releases. " +
      "We recommend removing this function and using strings to identify/compare keys."
  );
  for (var i in Object.keys(keylookup)) {
    if (keylookup[Object.keys(keylookup)[i]] == code) {
      return Object.keys(keylookup)[i];
    }
  }
  return undefined;
}

export function compareKeys(key1, key2) {
  if (Number.isFinite(key1) || Number.isFinite(key2)) {
    // if either value is a numeric keyCode, then convert both to numeric keyCode values and compare (maintained for backwards compatibility)
    if (typeof key1 == "string") {
      key1 = convertKeyCharacterToKeyCode(key1);
    }
    if (typeof key2 == "string") {
      key2 = convertKeyCharacterToKeyCode(key2);
    }
    return key1 == key2;
  } else if (typeof key1 === "string" && typeof key2 === "string") {
    // if both values are strings, then check whether or not letter case should be converted before comparing (case_sensitive_responses in jsPsych.init)
    var case_sensitive =
      typeof jsPsych.initSettings().case_sensitive_responses === "undefined"
        ? false
        : jsPsych.initSettings().case_sensitive_responses;
    if (case_sensitive) {
      return key1 == key2;
    } else {
      return key1.toLowerCase() == key2.toLowerCase();
    }
  } else if (
    (key1 === null && (typeof key2 === "string" || Number.isFinite(key2))) ||
    (key2 === null && (typeof key1 === "string" || Number.isFinite(key1)))
  ) {
    return false;
  } else if (key1 === null && key2 === null) {
    return true;
  } else {
    console.error(
      "Error in jsPsych.pluginAPI.compareKeys: arguments must be numeric key codes, key strings, or null."
    );
    return undefined;
  }
}

var keylookup = {
  backspace: 8,
  tab: 9,
  enter: 13,
  shift: 16,
  ctrl: 17,
  alt: 18,
  pause: 19,
  capslock: 20,
  esc: 27,
  space: 32,
  spacebar: 32,
  " ": 32,
  pageup: 33,
  pagedown: 34,
  end: 35,
  home: 36,
  leftarrow: 37,
  uparrow: 38,
  rightarrow: 39,
  downarrow: 40,
  insert: 45,
  delete: 46,
  0: 48,
  1: 49,
  2: 50,
  3: 51,
  4: 52,
  5: 53,
  6: 54,
  7: 55,
  8: 56,
  9: 57,
  a: 65,
  b: 66,
  c: 67,
  d: 68,
  e: 69,
  f: 70,
  g: 71,
  h: 72,
  i: 73,
  j: 74,
  k: 75,
  l: 76,
  m: 77,
  n: 78,
  o: 79,
  p: 80,
  q: 81,
  r: 82,
  s: 83,
  t: 84,
  u: 85,
  v: 86,
  w: 87,
  x: 88,
  y: 89,
  z: 90,
  "0numpad": 96,
  "1numpad": 97,
  "2numpad": 98,
  "3numpad": 99,
  "4numpad": 100,
  "5numpad": 101,
  "6numpad": 102,
  "7numpad": 103,
  "8numpad": 104,
  "9numpad": 105,
  multiply: 106,
  plus: 107,
  minus: 109,
  decimal: 110,
  divide: 111,
  f1: 112,
  f2: 113,
  f3: 114,
  f4: 115,
  f5: 116,
  f6: 117,
  f7: 118,
  f8: 119,
  f9: 120,
  f10: 121,
  f11: 122,
  f12: 123,
  "=": 187,
  ",": 188,
  ".": 190,
  "/": 191,
  "`": 192,
  "[": 219,
  "\\": 220,
  "]": 221,
};

// timeout registration

var timeout_handlers = [];

export function setTimeout(callback, delay) {
  var handle = window.setTimeout(callback, delay);
  timeout_handlers.push(handle);
  return handle;
}

export function clearAllTimeouts() {
  for (var i = 0; i < timeout_handlers.length; i++) {
    clearTimeout(timeout_handlers[i]);
  }
  timeout_handlers = [];
}

// video //
var video_buffers = {};
export function getVideoBuffer(videoID) {
  return video_buffers[videoID];
}

// audio //
var context = null;
var audio_buffers = [];

export function initAudio() {
  context = jsPsych.initSettings().use_webaudio === true ? jsPsych.webaudio_context : null;
}

export function audioContext() {
  if (context !== null) {
    if (context.state !== "running") {
      context.resume();
    }
  }
  return context;
}

export function getAudioBuffer(audioID) {
  return new Promise(function (resolve, reject) {
    // check whether audio file already preloaded
    if (typeof audio_buffers[audioID] == "undefined" || audio_buffers[audioID] == "tmp") {
      // if audio is not already loaded, try to load it
      function complete() {
        resolve(audio_buffers[audioID]);
      }
      function error(e) {
        reject(e.error);
      }
      preloadAudio([audioID], complete, function () {}, error);
    } else {
      // audio is already loaded
      resolve(audio_buffers[audioID]);
    }
  });
}

// preloading stimuli //

var preloads = [];
var preload_requests = [];

var img_cache = {};

export function preloadAudio(files, callback_complete, callback_load, callback_error) {
  files = flatten(files);
  files = unique(files);

  var n_loaded = 0;
  var loadfn = typeof callback_load === "undefined" ? function () {} : callback_load;
  var finishfn = typeof callback_complete === "undefined" ? function () {} : callback_complete;
  var errorfn = typeof callback_error === "undefined" ? function () {} : callback_error;

  if (files.length == 0) {
    finishfn();
    return;
  }

  function load_audio_file_webaudio(source, count) {
    count = count || 1;
    var request = new XMLHttpRequest();
    request.open("GET", source, true);
    request.responseType = "arraybuffer";
    request.onload = function () {
      context.decodeAudioData(
        request.response,
        function (buffer) {
          audio_buffers[source] = buffer;
          n_loaded++;
          loadfn(source);
          if (n_loaded == files.length) {
            finishfn();
          }
        },
        function (e) {
          errorfn({ source: source, error: e });
        }
      );
    };
    request.onerror = function (e) {
      var err = e;
      if (this.status == 404) {
        err = "404";
      }
      errorfn({ source: source, error: err });
    };
    request.onloadend = function (e) {
      if (this.status == 404) {
        errorfn({ source: source, error: "404" });
      }
    };
    request.send();
    preload_requests.push(request);
  }

  function load_audio_file_html5audio(source, count) {
    count = count || 1;
    var audio = new Audio();
    audio.addEventListener("canplaythrough", function handleCanPlayThrough() {
      audio_buffers[source] = audio;
      n_loaded++;
      loadfn(source);
      if (n_loaded == files.length) {
        finishfn();
      }
      audio.removeEventListener("canplaythrough", handleCanPlayThrough);
    });
    audio.addEventListener("error", function handleError(e) {
      errorfn({ source: audio.src, error: e });
      audio.removeEventListener("error", handleError);
    });
    audio.addEventListener("abort", function handleAbort(e) {
      errorfn({ source: audio.src, error: e });
      audio.removeEventListener("abort", handleAbort);
    });
    audio.src = source;
    preload_requests.push(audio);
  }

  for (var i = 0; i < files.length; i++) {
    var bufferID = files[i];
    if (typeof audio_buffers[bufferID] !== "undefined") {
      n_loaded++;
      loadfn(bufferID);
      if (n_loaded == files.length) {
        finishfn();
      }
    } else {
      audio_buffers[bufferID] = "tmp";
      if (audioContext() !== null) {
        load_audio_file_webaudio(bufferID);
      } else {
        load_audio_file_html5audio(bufferID);
      }
    }
  }
}

export function preloadImages(images, callback_complete, callback_load, callback_error) {
  // flatten the images array
  images = flatten(images);
  images = unique(images);

  var n_loaded = 0;
  var finishfn = typeof callback_complete === "undefined" ? function () {} : callback_complete;
  var loadfn = typeof callback_load === "undefined" ? function () {} : callback_load;
  var errorfn = typeof callback_error === "undefined" ? function () {} : callback_error;

  if (images.length === 0) {
    finishfn();
    return;
  }

  function preload_image(source) {
    var img = new Image();

    img.onload = function () {
      n_loaded++;
      loadfn(img.src);
      if (n_loaded === images.length) {
        finishfn();
      }
    };

    img.onerror = function (e) {
      errorfn({ source: img.src, error: e });
    };

    img.src = source;

    img_cache[source] = img;
    preload_requests.push(img);
  }

  for (var i = 0; i < images.length; i++) {
    preload_image(images[i]);
  }
}

export function preloadVideo(video, callback_complete, callback_load, callback_error) {
  // flatten the video array
  video = flatten(video);
  video = unique(video);

  var n_loaded = 0;
  var finishfn = !callback_complete ? function () {} : callback_complete;
  var loadfn = !callback_load ? function () {} : callback_load;
  var errorfn = typeof callback_error === "undefined" ? function () {} : callback_error;

  if (video.length === 0) {
    finishfn();
    return;
  }

  function preload_video(source, count) {
    count = count || 1;
    //based on option 4 here: http://dinbror.dk/blog/how-to-preload-entire-html5-video-before-play-solved/
    var request = new XMLHttpRequest();
    request.open("GET", source, true);
    request.responseType = "blob";
    request.onload = function () {
      if (this.status === 200 || this.status === 0) {
        var videoBlob = this.response;
        video_buffers[source] = URL.createObjectURL(videoBlob); // IE10+
        n_loaded++;
        loadfn(source);
        if (n_loaded === video.length) {
          finishfn();
        }
      }
    };
    request.onerror = function (e) {
      var err = e;
      if (this.status == 404) {
        err = "404";
      }
      errorfn({ source: source, error: err });
    };
    request.onloadend = function (e) {
      if (this.status == 404) {
        errorfn({ source: source, error: "404" });
      }
    };
    request.send();
    preload_requests.push(request);
  }

  for (var i = 0; i < video.length; i++) {
    preload_video(video[i]);
  }
}

export function registerPreload(plugin_name, parameter, media_type) {
  if (["audio", "image", "video"].indexOf(media_type) === -1) {
    console.error(
      "Invalid media_type parameter for jsPsych.pluginAPI.registerPreload. Please check the plugin file."
    );
  }

  var preload = {
    plugin: plugin_name,
    parameter: parameter,
    media_type: media_type,
  };

  preloads.push(preload);
}

export function getAutoPreloadList(timeline_description) {
  function getTrialsOfTypeFromTimelineDescription(td, target_type, inherited_type) {
    var trials = [];

    for (var i = 0; i < td.length; i++) {
      var node = td[i];
      if (Array.isArray(node.timeline)) {
        if (typeof node.type !== "undefined") {
          inherited_type = node.type;
        }
        trials = trials.concat(
          getTrialsOfTypeFromTimelineDescription(node.timeline, target_type, inherited_type)
        );
      } else {
        if (typeof node.type !== "undefined" && node.type.info.name == target_type) {
          trials.push(node);
        }
        if (typeof node.type == "undefined" && inherited_type.info.name == target_type) {
          trials.push(Object.assign({}, { type: target_type }, node));
        }
      }
    }

    return trials;
  }

  if (typeof timeline_description == "undefined") {
    timeline_description = jsPsych.initSettings().timeline;
  }

  // list of items to preload
  var images = [];
  var audio = [];
  var video = [];

  // construct list
  for (var i = 0; i < preloads.length; i++) {
    var type = preloads[i].plugin;
    var param = preloads[i].parameter;
    var media = preloads[i].media_type;

    var trials = getTrialsOfTypeFromTimelineDescription(timeline_description, type);
    for (var j = 0; j < trials.length; j++) {
      if (typeof trials[j][param] == "undefined") {
        console.warn("jsPsych failed to auto preload one or more files:");
        console.warn("no parameter called " + param + " in plugin " + type);
      } else if (typeof trials[j][param] !== "function") {
        if (media === "image") {
          images = images.concat(flatten([trials[j][param]]));
        } else if (media === "audio") {
          audio = audio.concat(flatten([trials[j][param]]));
        } else if (media === "video") {
          video = video.concat(flatten([trials[j][param]]));
        }
      }
    }
  }

  images = unique(flatten(images));
  audio = unique(flatten(audio));
  video = unique(flatten(video));

  // remove any nulls false values
  images = images.filter(function (x) {
    return x != false && x != null;
  });
  audio = audio.filter(function (x) {
    return x != false && x != null;
  });
  video = video.filter(function (x) {
    return x != false && x != null;
  });

  return {
    images,
    audio,
    video,
  };
}

export function cancelPreloads() {
  for (var i = 0; i < preload_requests.length; i++) {
    preload_requests[i].onload = function () {};
    preload_requests[i].onerror = function () {};
    preload_requests[i].oncanplaythrough = function () {};
    preload_requests[i].onabort = function () {};
  }
  preload_requests = [];
}

/**
 * Allows communication with user hardware through our custom Google Chrome extension + native C++ program
 * @param		{object}	mess	The message to be passed to our extension, see its documentation for the expected members of this object.
 * @author	Daniel Rivas
 *
 */
export function hardware(mess) {
  //since Chrome extension content-scripts do not share the javascript environment with the page script that loaded jspsych,
  //we will need to use hacky methods like communicating through DOM events.
  var jspsychEvt = new CustomEvent("jspsych", { detail: mess });
  document.dispatchEvent(jspsychEvt);
  //And voila! it will be the job of the content script injected by the extension to listen for the event and do the appropriate actions.
}

/** {boolean} Indicates whether this instance of jspsych has opened a hardware connection through our browser extension */
export let hardwareConnected = false;

//it might be useful to open up a line of communication from the extension back to this page script,
//again, this will have to pass through DOM events. For now speed is of no concern so I will use jQuery
document.addEventListener("jspsych-activate", function (evt) {
  hardwareConnected = true;
});
