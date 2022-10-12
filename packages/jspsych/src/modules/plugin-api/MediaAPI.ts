import { ParameterType } from "../../modules/plugins";
import { unique } from "../utils";

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
  getVideoBuffer(videoID: string) {
    if (videoID.startsWith("blob:")) {
      this.video_buffers[videoID] = videoID;
    }
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
      request.onerror = (e) => {
        let err: ProgressEvent | string = e;
        if (request.status == 404) {
          err = "404";
        }
        callback_error({ source: source, error: err });
      };
      request.onloadend = (e) => {
        if (request.status == 404) {
          callback_error({ source: source, error: "404" });
        }
      };
      request.send();
      this.preload_requests.push(request);
    };

    const load_audio_file_html5audio = (source, count = 1) => {
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
    };

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
      request.onload =  () => {
        if (request.status === 200 || request.status === 0) {
          const videoBlob = request.response;
          video_buffers[video] = URL.createObjectURL(videoBlob); // IE10+
          n_loaded++;
          callback_load(video);
          if (n_loaded === videos.length) {
            callback_complete();
          }
        }
      };
      request.onerror =  (e) => {
        let err: ProgressEvent | string = e;
        if (request.status == 404) {
          err = "404";
        }
        callback_error({ source: video, error: err });
      };
      request.onloadend =  (e) => {
        if (request.status == 404) {
          callback_error({ source: video, error: "404" });
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
      video: [...preloadPaths[ParameterType.VIDEO]],
    };
  }

  cancelPreloads() {
    for (const request of this.preload_requests) {
      request.onload = () => {};
      request.onerror = () => {};
      request.oncanplaythrough = () => {};
      request.onabort = () => {};
    }
    this.preload_requests = [];
  }

  private microphone_recorder: MediaRecorder = null;

  initializeMicrophoneRecorder(stream: MediaStream) {
    const recorder = new MediaRecorder(stream);
    this.microphone_recorder = recorder;
  }

  getMicrophoneRecorder(): MediaRecorder {
    return this.microphone_recorder;
  }

  private camera_stream: MediaStream = null;
  private camera_recorder: MediaRecorder = null;

  initializeCameraRecorder(stream: MediaStream, opts?: MediaRecorderOptions) {
    this.camera_stream = stream;
    const recorder = new MediaRecorder(stream, opts);
    this.camera_recorder = recorder;
  }

  getCameraStream(): MediaStream {
    return this.camera_stream;
  }

  getCameraRecorder(): MediaRecorder {
    return this.camera_recorder;
  }
}
