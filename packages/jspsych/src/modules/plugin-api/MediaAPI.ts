import { ParameterType } from "../../modules/plugins";
import { flatten, unique } from "../utils";

const preloadParameterTypes = <const>[
  ParameterType.AUDIO,
  ParameterType.IMAGE,
  ParameterType.VIDEO,
];
type PreloadType = typeof preloadParameterTypes[number];

export class MediaAPI {
  constructor(private useWebaudio: boolean, private webaudioContext?: AudioContext) {}

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

  private preloadMap = new Map<string, Record<string, PreloadType>>();

  getAutoPreloadList(timeline_description: any[]) {
    /** Map each preload parameter type to a set of paths to be preloaded */
    const preloadPaths = Object.fromEntries(
      preloadParameterTypes.map((type) => [type, new Set<string>()])
    );

    const traverseTimeline = (node, inheritedTrialType?) => {
      const isTimeline = typeof node.timeline !== "undefined";

      if (isTimeline) {
        for (const childNode of node.timeline) {
          traverseTimeline(childNode, node.type ?? inheritedTrialType);
        }
      } else if ((node.type ?? inheritedTrialType)?.info) {
        // node is a trial with type.info set

        // Get the plugin name and parameters object from the info object
        const { name: pluginName, parameters } = (node.type ?? inheritedTrialType).info;

        // Extract parameters to be preloaded and their types from parameter info if this has not
        // yet been done for `pluginName`
        if (!this.preloadMap.has(pluginName)) {
          this.preloadMap.set(
            pluginName,
            Object.fromEntries(
              Object.entries<any>(parameters)
                // Filter out parameter entries with media types and a non-false `preload` option
                .filter(
                  ([_name, { type, preload }]) =>
                    preloadParameterTypes.includes(type) && (preload ?? true)
                )
                // Map each entry's value to its parameter type
                .map(([name, { type }]) => [name, type])
            )
          );
        }

        // Add preload paths from this trial
        for (const [parameterName, parameterType] of Object.entries(
          this.preloadMap.get(pluginName)
        )) {
          const parameterValue = node[parameterName];
          const elements = preloadPaths[parameterType];

          if (typeof parameterValue === "string") {
            elements.add(parameterValue);
          } else if (Array.isArray(parameterValue)) {
            for (const element of flatten(parameterValue)) {
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
      video: [...preloadPaths[ParameterType.VIDEO]],
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
