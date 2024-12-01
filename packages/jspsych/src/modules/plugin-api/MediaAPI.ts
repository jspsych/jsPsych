import { ParameterType } from "../../modules/plugins";
import { unique } from "../utils";
import { AudioPlayer } from "./AudioPlayer";

const preloadParameterTypes = <const>[
  ParameterType.AUDIO,
  ParameterType.IMAGE,
  ParameterType.VIDEO,
];
type PreloadType = typeof preloadParameterTypes[number];

type CallbackLoad = (filepath: string) => void;
type CallbackError = (callback_error: any) => void;

export class MediaAPI {
  constructor(public useWebaudio: boolean) {
    if (
      this.useWebaudio &&
      typeof window !== "undefined" &&
      typeof window.AudioContext !== "undefined"
    ) {
      this.context = new AudioContext();
    }
  }

  // video //
  private video_buffers = {};
  getVideoBuffer(videoID: string) {
    if (videoID.startsWith("blob:")) {
      this.video_buffers[videoID] = videoID;
    }
    return this.video_buffers[videoID];
  }

  // audio //
  private context: AudioContext = null;
  private audio_buffers = [];

  audioContext(): AudioContext {
    if (this.context && this.context.state !== "running") {
      this.context.resume();
    }
    return this.context;
  }

  async getAudioPlayer(audioID: string): Promise<AudioPlayer> {
    if (this.audio_buffers[audioID] instanceof AudioPlayer) {
      return this.audio_buffers[audioID];
    } else {
      this.audio_buffers[audioID] = new AudioPlayer(audioID, {
        useWebAudio: this.useWebaudio,
        audioContext: this.context,
      });
      await this.audio_buffers[audioID].load();
      return this.audio_buffers[audioID];
    }
  }

  // preloading stimuli //
  private preload_requests = [];

  private img_cache = {};

  preloadAudio(
    files,
    callback_complete = () => {},
    callback_load: CallbackLoad = () => {},
    callback_error: CallbackError = () => {}
  ) {
    files = unique(files.flat());

    let n_loaded = 0;

    if (files.length == 0) {
      callback_complete();
      return;
    }

    for (const file of files) {
      // check if file was already loaded
      if (this.audio_buffers[file] instanceof AudioPlayer) {
        n_loaded++;
        callback_load(file);
        if (n_loaded == files.length) {
          callback_complete();
        }
      } else {
        this.audio_buffers[file] = new AudioPlayer(file, {
          useWebAudio: this.useWebaudio,
          audioContext: this.context,
        });
        this.audio_buffers[file]
          .load()
          .then(() => {
            n_loaded++;
            callback_load(file);
            if (n_loaded == files.length) {
              callback_complete();
            }
          })
          .catch((e) => {
            callback_error(e);
          });
      }
    }
  }

  preloadImages(
    images,
    callback_complete = () => {},
    callback_load: CallbackLoad = () => {},
    callback_error: CallbackError = () => {}
  ) {
    // flatten the images array
    images = unique(images.flat());

    let n_loaded = 0;

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
    callback_load: CallbackLoad = () => {},
    callback_error: CallbackError = () => {}
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
      request.onload = () => {
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
      request.onerror = (e) => {
        let err: ProgressEvent | string = e;
        if (request.status == 404) {
          err = "404";
        }
        callback_error({ source: video, error: err });
      };
      request.onloadend = () => {
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
