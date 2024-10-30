export interface AudioPlayerOptions {
  useWebAudio: boolean;
  audioContext?: AudioContext;
}

export interface AudioPlayerInterface {
  load(): Promise<void>;
  play(): void;
  stop(): void;
  addEventListener(eventName: string, callback: EventListenerOrEventListenerObject): void;
  removeEventListener(eventName: string, callback: EventListenerOrEventListenerObject): void;
}

export class AudioPlayer implements AudioPlayerInterface {
  private audio: HTMLAudioElement | AudioBufferSourceNode;
  private webAudioBuffer: AudioBuffer;
  private audioContext: AudioContext | null;
  private useWebAudio: boolean;
  private src: string;

  constructor(src: string, options: AudioPlayerOptions = { useWebAudio: false }) {
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
      // If audio is not HTMLAudioElement, it must be a WebAudio API object, so create a source node.
      if (!this.audio) this.audio = this.getAudioSourceNode(this.webAudioBuffer);
      this.audio.start();
    }
  }

  stop() {
    if (this.audio instanceof HTMLAudioElement) {
      this.audio.pause();
      this.audio.currentTime = 0;
    } else {
      this.audio!.stop();
      // Regenerate source node for audio since the previous one is stopped and unusable.
      this.audio = this.getAudioSourceNode(this.webAudioBuffer);
    }
  }

  addEventListener(eventName: string, callback: EventListenerOrEventListenerObject) {
    // If WebAudio buffer exists but source node doesn't, create it.
    if (!this.audio && this.webAudioBuffer)
      this.audio = this.getAudioSourceNode(this.webAudioBuffer);
    this.audio.addEventListener(eventName, callback);
  }

  removeEventListener(eventName: string, callback: EventListenerOrEventListenerObject) {
    // If WebAudio buffer exists but source node doesn't, create it.
    if (!this.audio && this.webAudioBuffer)
      this.audio = this.getAudioSourceNode(this.webAudioBuffer);
    this.audio.removeEventListener(eventName, callback);
  }

  private getAudioSourceNode(audioBuffer: AudioBuffer): AudioBufferSourceNode {
    const source = this.audioContext!.createBufferSource();
    source.buffer = audioBuffer;
    source.connect(this.audioContext!.destination);
    return source;
  }

  private async preloadWebAudio(src: string): Promise<AudioBuffer> {
    const buffer = await fetch(src);
    const arrayBuffer = await buffer.arrayBuffer();
    const audioBuffer = await this.audioContext!.decodeAudioData(arrayBuffer);
    const source = this.audioContext!.createBufferSource();
    source.buffer = audioBuffer;
    source.connect(this.audioContext!.destination);
    return audioBuffer;
  }

  private async preloadHTMLAudio(src: string): Promise<HTMLAudioElement> {
    return new Promise<HTMLAudioElement>((resolve, reject) => {
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
