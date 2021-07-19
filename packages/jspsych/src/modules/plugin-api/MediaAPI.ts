import { flatten, unique } from "../utils";

export class MediaAPI {
  constructor(private useWebaudio: boolean, private webaudioContext: AudioContext) {}

  // video //
  private video_buffers = {};
  getVideoBuffer(videoID) {
    return this.video_buffers[videoID];
  }

  // audio //
  private context = null;
  private audio_buffers = [];

  initAudio() {
    this.context = this.useWebaudio ? this.webaudioContext : null;
  }

  audioContext() {
    if (this.context !== null) {
      if (this.context.state !== "running") {
        this.context.resume();
      }
    }
    return this.context;
  }

  getAudioBuffer(audioID) {
    return new Promise(function (resolve, reject) {
      // check whether audio file already preloaded
      if (
        typeof this.audio_buffers[audioID] == "undefined" ||
        this.audio_buffers[audioID] == "tmp"
      ) {
        // if audio is not already loaded, try to load it
        this.preloadAudio(
          [audioID],
          () => {
            resolve(this.audio_buffers[audioID]);
          },
          () => {},
          (e) => {
            reject(e.error);
          }
        );
      } else {
        // audio is already loaded
        resolve(this.audio_buffers[audioID]);
      }
    });
  }

  // preloading stimuli //

  private preloads = [];
  private preload_requests = [];

  private img_cache = {};

  preloadAudio(files, callback_complete, callback_load, callback_error) {
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

    const load_audio_file_webaudio = (source, count = 1) => {
      var request = new XMLHttpRequest();
      request.open("GET", source, true);
      request.responseType = "arraybuffer";
      request.onload = () => {
        this.context.decodeAudioData(
          request.response,
          (buffer) => {
            this.audio_buffers[source] = buffer;
            n_loaded++;
            loadfn(source);
            if (n_loaded == files.length) {
              finishfn();
            }
          },
          (e) => {
            errorfn({ source: source, error: e });
          }
        );
      };
      request.onerror = function (e) {
        var err: ProgressEvent | string = e;
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
      this.preload_requests.push(request);
    };

    function load_audio_file_html5audio(source, count = 1) {
      var audio = new Audio();
      const handleCanPlayThrough = () => {
        this.audio_buffers[source] = audio;
        n_loaded++;
        loadfn(source);
        if (n_loaded == files.length) {
          finishfn();
        }
        audio.removeEventListener("canplaythrough", handleCanPlayThrough);
      };
      audio.addEventListener("canplaythrough", handleCanPlayThrough);
      audio.addEventListener("error", function handleError(e) {
        errorfn({ source: audio.src, error: e });
        audio.removeEventListener("error", handleError);
      });
      audio.addEventListener("abort", function handleAbort(e) {
        errorfn({ source: audio.src, error: e });
        audio.removeEventListener("abort", handleAbort);
      });
      audio.src = source;
      this.preload_requests.push(audio);
    }

    for (var i = 0; i < files.length; i++) {
      var bufferID = files[i];
      if (typeof this.audio_buffers[bufferID] !== "undefined") {
        n_loaded++;
        loadfn(bufferID);
        if (n_loaded == files.length) {
          finishfn();
        }
      } else {
        this.audio_buffers[bufferID] = "tmp";
        if (this.audioContext() !== null) {
          load_audio_file_webaudio(bufferID);
        } else {
          load_audio_file_html5audio(bufferID);
        }
      }
    }
  }

  preloadImages(images, callback_complete, callback_load, callback_error) {
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

    for (var i = 0; i < images.length; i++) {
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

      img.src = images[i];

      this.img_cache[images[i]] = img;
      this.preload_requests.push(img);
    }
  }

  preloadVideo(video, callback_complete, callback_load, callback_error) {
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

    for (var i = 0; i < video.length; i++) {
      const video_buffers = this.video_buffers;

      //based on option 4 here: http://dinbror.dk/blog/how-to-preload-entire-html5-video-before-play-solved/
      var request = new XMLHttpRequest();
      request.open("GET", video[i], true);
      request.responseType = "blob";
      request.onload = function () {
        if (this.status === 200 || this.status === 0) {
          var videoBlob = this.response;
          video_buffers[video[i]] = URL.createObjectURL(videoBlob); // IE10+
          n_loaded++;
          loadfn(video[i]);
          if (n_loaded === video.length) {
            finishfn();
          }
        }
      };
      request.onerror = function (e) {
        var err: ProgressEvent | string = e;
        if (this.status == 404) {
          err = "404";
        }
        errorfn({ source: video[i], error: err });
      };
      request.onloadend = function (e) {
        if (this.status == 404) {
          errorfn({ source: video[i], error: "404" });
        }
      };
      request.send();
      this.preload_requests.push(request);
    }
  }

  registerPreload(plugin_name, parameter, media_type) {
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

    this.preloads.push(preload);
  }

  getAutoPreloadList(timeline_description: any[]) {
    function getTrialsOfTypeFromTimelineDescription(td, target_type, inherited_type?) {
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

    // list of items to preload
    var images = [];
    var audio = [];
    var video = [];

    // construct list
    for (var i = 0; i < this.preloads.length; i++) {
      var type = this.preloads[i].plugin;
      var param = this.preloads[i].parameter;
      var media = this.preloads[i].media_type;

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

  cancelPreloads() {
    for (var i = 0; i < this.preload_requests.length; i++) {
      this.preload_requests[i].onload = function () {};
      this.preload_requests[i].onerror = function () {};
      this.preload_requests[i].oncanplaythrough = function () {};
      this.preload_requests[i].onabort = function () {};
    }
    this.preload_requests = [];
  }
}
