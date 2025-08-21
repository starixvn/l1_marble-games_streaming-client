import Hls, { HlsListeners } from "hls.js";
import { DOMBackgroundVideo } from "./dom-background-video";

export interface HLSVideoPlayerOptions {
  id: string;
}

export class HLSVideoPlayer {
  private readonly _id: string;
  private _hls: Hls = null;
  private _video: HTMLVideoElement = null;
  private _url = "";

  constructor(options: HLSVideoPlayerOptions) {
    this._id = options.id;
  }

  get id() {
    return this._id;
  }

  get video() {
    return this._video;
  }

  get initialized() {
    return !!this._hls && !!this._video;
  }

  set currentTime(value: number) {
    if (this.initialized) {
      this._video.currentTime = value;
    }
  }

  get url() {
    return this._url;
  }

  get currentTime() {
    return this._video.currentTime;
  }

  get currentLevel() {
    return this._hls.currentLevel;
  }

  get bandwidthEstimate() {
    return this._hls.bandwidthEstimate;
  }

  init() {
    this._video = DOMBackgroundVideo.createOrLoadVideoElement(this._id);
    if (!Hls.isSupported()) {
      throw new Error("Hls.js is not supported.");
    };

    this._hls = new Hls({
      startLevel: -1,
      capLevelToPlayerSize: true,
      lowLatencyMode: true,
      liveSyncDuration: 0.9,
      liveMaxLatencyDuration: 1,
      enableWorker: false,
    });

    this._hls.attachMedia(this._video);
  }

  load(url: string, options: {
    play?: boolean;
  } = {
    play: false,
  }) {
    if (url && this._url !== url) {
      this._url = url;
      this._hls.loadSource(this._url);
      if (!options.play) {
        this._video.pause();
      }
    }
  }

  play() {
    if (this.initialized) {
      this.playWithRetry(0, 3);
    }
  }

  pause() {
    if (this.initialized) {
      this._video.pause();
    }
  }

  off(event: keyof HlsListeners) {
    this._hls.off(event);
  }

  set muted(value: boolean) {
    this._video.muted = value;
  }

  addEventListener(event: string, listener: (...args: any[]) => void) {
    this._video.addEventListener(event, listener);
  }

  removeEventListener(event: string, listener: (...args: any[]) => void) {
    this._video.removeEventListener(event, listener);
  }

  destroy() {
    this._hls.detachMedia();
    this._hls.destroy();
    DOMBackgroundVideo.removeVideoElement(this._id);
  }

  private playWithRetry(retry = 0, maxRetry = 3) {
    this._video.play().catch(() => {
      if (retry < maxRetry) {
        this.playWithRetry(retry + 1, maxRetry);
      }
    });
  }
}