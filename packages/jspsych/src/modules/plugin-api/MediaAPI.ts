import { unique } from "../utils";

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
    return new Promise((resolve, reject) => {
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

  preloadAudio(
    files,
    callback_complete = () => {},
    callback_load = (filepath) => {},
    callback_error = (error_msg) => {}
  ) {
    files = unique(files.flat());

    let n_loaded = 0;

    if (files.length == 0) {
      callback_complete();
      return;
    }

    const load_audio_file_webaudio = (source, count = 1) => {
      const request = new XMLHttpRequest();
      request.open("GET", source, true);
      request.responseType = "arraybuffer";
      request.onload = () => {
        this.context.decodeAudioData(
          request.response,
          (buffer) => {
            this.audio_buffers[source] = buffer;
            n_loaded++;
            callback_load(source);
            if (n_loaded == files.length) {
              callback_complete();
            }
          },
          (e) => {
            callback_error({ source: source, error: e });
          }
        );
      };
      request.onerror = function (e) {
        let err: ProgressEvent | string = e;
        if (this.status == 404) {
          err = "404";
        }
        callback_error({ source: source, error: err });
      };
      request.onloadend = function (e) {
        if (this.status == 404) {
          callback_error({ source: source, error: "404" });
        }
      };
      request.send();
      this.preload_requests.push(request);
    };

    function load_audio_file_html5audio(source, count = 1) {
      const audio = new Audio();
      const handleCanPlayThrough = () => {
        this.audio_buffers[source] = audio;
        n_loaded++;
        callback_load(source);
        if (n_loaded == files.length) {
          callback_complete();
        }
        audio.removeEventListener("canplaythrough", handleCanPlayThrough);
      };
      audio.addEventListener("canplaythrough", handleCanPlayThrough);
      audio.addEventListener("error", function handleError(e) {
        callback_error({ source: audio.src, error: e });
        audio.removeEventListener("error", handleError);
      });
      audio.addEventListener("abort", function handleAbort(e) {
        callback_error({ source: audio.src, error: e });
        audio.removeEventListener("abort", handleAbort);
      });
      audio.src = source;
      this.preload_requests.push(audio);
    }

    for (const file of files) {
      if (typeof this.audio_buffers[file] !== "undefined") {
        n_loaded++;
        callback_load(file);
        if (n_loaded == files.length) {
          callback_complete();
        }
      } else {
        this.audio_buffers[file] = "tmp";
        if (this.audioContext() !== null) {
          load_audio_file_webaudio(file);
        } else {
          load_audio_file_html5audio(file);
        }
      }
    }
  }

  preloadImages(
    images,
    callback_complete = () => {},
    callback_load = (filepath) => {},
    callback_error = (error_msg) => {}
  ) {
    // flatten the images array
    images = unique(images.flat());

    var n_loaded = 0;

    if (images.length === 0) {
      callback_complete();
      return;
    }

    for (var i = 0; i < images.length; i++) {
      var img = new Image();

      img.onload = function () {
        n_loaded++;
        callback_load(img.src);
        if (n_loaded === images.length) {
          callback_complete();
        }
      };

      img.onerror = function (e) {
        callback_error({ source: img.src, error: e });
      };

      img.src = images[i];

      this.img_cache[images[i]] = img;
      this.preload_requests.push(img);
    }
  }

  preloadVideo(
    videos,
    callback_complete = () => {},
    callback_load = (filepath) => {},
    callback_error = (error_msg) => {}
  ) {
    // flatten the video array
    videos = unique(videos.flat());

    let n_loaded = 0;

    if (videos.length === 0) {
      callback_complete();
      return;
    }

    for (const video of videos) {
      const video_buffers = this.video_buffers;

      //based on option 4 here: http://dinbror.dk/blog/how-to-preload-entire-html5-video-before-play-solved/
      const request = new XMLHttpRequest();
      request.open("GET", video, true);
      request.responseType = "blob";
      request.onload = function () {
        if (this.status === 200 || this.status === 0) {
          const videoBlob = this.response;
          video_buffers[video] = URL.createObjectURL(videoBlob); // IE10+
          n_loaded++;
          callback_load(video);
          if (n_loaded === videos.length) {
            callback_complete();
          }
        }
      };
      request.onerror = function (e) {
        let err: ProgressEvent | string = e;
        if (this.status == 404) {
          err = "404";
        }
        callback_error({ source: video, error: err });
      };
      request.onloadend = function (e) {
        if (this.status == 404) {
          callback_error({ source: video, error: "404" });
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
            images = images.concat([trials[j][param]].flat());
          } else if (media === "audio") {
            audio = audio.concat([trials[j][param]].flat());
          } else if (media === "video") {
            video = video.concat([trials[j][param]].flat());
          }
        }
      }
    }

    images = unique(images.flat());
    audio = unique(audio.flat());
    video = unique(video.flat());

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
