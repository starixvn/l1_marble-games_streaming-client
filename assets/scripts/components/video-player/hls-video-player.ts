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
  private _intentionallyMuted = false;
  private _onPlayStateChanged: (play: boolean) => void = () => {};
  private _onHlsLoaded: () => void = () => {};
  private _onHlsPlayed: () => void = () => {};

  constructor(options: HLSVideoPlayerOptions) {
    this._id = options.id;
  }

  get id() {
    return this._id;
  }

  set onPlayStateChanged(value: (play: boolean) => void) {
    this._onPlayStateChanged = value;
  }

  set onHlsLoaded(value: () => void) {
    this._onHlsLoaded = value;
  }

  set onHlsPlayed(value: () => void) {
    this._onHlsPlayed = value;
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
  
  get currentTime() {
    return this._video.currentTime;
  }

  get url() {
    return this._url;
  }


  get currentLevel() {
    return this._hls.currentLevel;
  }

  get bandwidthEstimate() {
    return this._hls.bandwidthEstimate;
  }
  
  set muted(value: boolean) {
    this._intentionallyMuted = value;
    this._video.muted = value;
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
    this.registerVisibilityChangeEvent();
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
        this._onPlayStateChanged(false);
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

  addEventListener(event: string, listener: (...args: any[]) => void) {
    this._video.addEventListener(event, listener);
  }

  removeEventListener(event: string, listener: (...args: any[]) => void) {
    this._video.removeEventListener(event, listener);
  }

  on(event: keyof HlsListeners, listener: (...args: any[]) => void) {
    this._hls.on(event, listener);
  }

  destroy() {
    this._hls.detachMedia();
    this._hls.destroy();
    DOMBackgroundVideo.removeVideoElement(this._id);
    this.unregisterVisibilityChangeEvent();
  }

  private playWithRetry(retry = 0, maxRetry = 3) {
    this._video.play().then(() => {
      this._onPlayStateChanged(true);
    }).catch(() => {
      if (retry < maxRetry) {
        this.playWithRetry(retry + 1, maxRetry);
      }
    });
  }

  private registerVisibilityChangeEvent() {
    document.addEventListener("visibilitychange", this.handleVisibilityChange.bind(this));
  }

  private unregisterVisibilityChangeEvent() {
    document.removeEventListener("visibilitychange", this.handleVisibilityChange.bind(this));
  }

  private handleVisibilityChange() {
    if (!this.initialized) {
      return;
    }

    if (document.hidden) {
      this._video.muted = true;
      return;
    }

    this._video.muted = this._intentionallyMuted;
  }
}