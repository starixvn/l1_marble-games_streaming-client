import { HlsListeners } from "hls.js";
import { DOMBackgroundVideo, GenericBackgroundVideoEvents } from "./dom-background-video";
import { HLSVideoPlayer } from "./hls-video-player";


interface BackgroundSwitchEventData {
  url: string;
}


export class HLSPreloadedVideoPlayer {
  private readonly _preloadPlayer: HLSVideoPlayer = null;
  private readonly _videoPlayer: HLSVideoPlayer = null;
  private _onPlayStateChanged: (play: boolean) => void = () => {};
  private _onHlsLoaded: () => void = () => {};
  private _onHlsPlayed: () => void = () => {};

  constructor() {
    this._preloadPlayer = new HLSVideoPlayer({ id: "PreloadVideo" });
    this._videoPlayer = new HLSVideoPlayer({ id: "VideoBackground" });
  }

  get initialized() {
    return this._preloadPlayer.initialized && this._videoPlayer.initialized;
  }

  get bandwidthEstimate() {
    return this._videoPlayer.bandwidthEstimate;
  }

  get currentLevel() {
    return this._videoPlayer.currentLevel;
  }

  set currentTime(value: number) {
    this._videoPlayer.currentTime = value;
  }

  get currentTime() {
    return this._videoPlayer.currentTime;
  }

  set muted(value: boolean) {
    this._videoPlayer.muted = value;
  }

  get url() {
    return this._videoPlayer.url;
  }

  addEventListener(event: string, listener: (...args: any[]) => void) {
    this._videoPlayer.addEventListener(event, listener);
  }

  removeEventListener(event: string, listener: (...args: any[]) => void) {
    this._videoPlayer.removeEventListener(event, listener);
  }

  off(event: keyof HlsListeners) {
    this._videoPlayer.off(event);
  }
  
  init() {
    this._preloadPlayer.init();
    this._videoPlayer.init();

    DOMBackgroundVideo.applyConfig(this._preloadPlayer.id, {
      hidden: true,
      muted: true,
    });

    DOMBackgroundVideo.applyConfig(this._videoPlayer.id, {
      hidden: false,
      muted: false,
    });

    this._preloadPlayer.muted = true;

    DOMBackgroundVideo.genericEventNotifier.addEventListener(GenericBackgroundVideoEvents.SWITCH_BACKGROUND, (event: CustomEvent<BackgroundSwitchEventData>) => {
      const { url } = event.detail;
      DOMBackgroundVideo.changeBackground(this._videoPlayer.id, url);
    });
    DOMBackgroundVideo.toFront(this._videoPlayer.id);
    this._videoPlayer.onPlayStateChanged = (play: boolean) => {
      this._onPlayStateChanged(play);
    };

    this._videoPlayer.onHlsLoaded = () => {
      this._onHlsLoaded();
    };

    this._videoPlayer.onHlsPlayed = () => {
      this._onHlsPlayed();
    };
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

  preload(url: string) {
    this._preloadPlayer.load(url, { play: true });
  }

  load(url: string) {
    this._videoPlayer.load(url, { play: false });
  }

  play() {
    this._videoPlayer.play();
  }

  pause() {
    this._videoPlayer.pause();
  }
  
  destroy() {
    this._preloadPlayer.destroy();
    this._videoPlayer.destroy();
  }
}