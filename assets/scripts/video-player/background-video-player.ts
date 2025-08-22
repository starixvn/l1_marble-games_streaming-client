import { _decorator, Component } from "cc";
import Hls from "hls.js";
import Observer from "observer";
import { VideoStore } from "./video-store";
import { Phase, VideoStatus } from "../streaming/streaming-type";
import { IntroStore } from "../intro/intro-store";
import { HLSPreloadedVideoPlayer } from "./preloaded-hls-player";

const { ccclass } = _decorator;
const { observer, render } = Observer;

@ccclass("BackgroundVideoPlayer")
@observer
export class BackgroundVideoPlayer extends Component {
  private hlsPlayer: HLSPreloadedVideoPlayer = null;

  private get initialized() {
    return !!this.hlsPlayer?.initialized;
  }

  private _introUrl: string = "";

  currentTime = 0;

  @render(IntroStore, (store) => store.url)
  setIntroUrl(url: string) {
    this._introUrl = url;
    this.hlsPlayer.preload(url);
  }

  @render(IntroStore, (store) => ({
    currentTime: store.currentTime,
    status: store.status,
  }))
  playIntro({ currentTime, status }: { currentTime: number; status: VideoStatus }) {
    if (status === VideoStatus.Playing) {
      this.hlsPlayer.load(this._introUrl);
      this.currentTime = currentTime;
      this.syncCurrentTime();
      this.hlsPlayer.play();
    }
  }

  @render(VideoStore, (store) => store.url)
  load(url: string) {
    this.hlsPlayer.preload(url);
    this.hlsPlayer.load(url);
  }

  @render(VideoStore, (store) => ({
    phase: store.currentPhase,
    videoLiveTime: store.videoLiveTime,
    halfIndex: store.halfIndex,
  }))
  playVideo({ phase, videoLiveTime }: { phase: Phase; videoLiveTime: number; halfIndex: number }) {
    if (phase === Phase.UpdateVideoInfo) {
      this.hlsPlayer.preload(this._introUrl);
      this.currentTime = videoLiveTime;
      this.syncCurrentTime();
      this.hlsPlayer.play();
    }
  }

  private get bandwidthEstimate() {
    return this.hlsPlayer?.bandwidthEstimate ?? 0;
  }

  pause() {
    if (this.initialized) {
      this.hlsPlayer.pause();
    }
  }

  set muted(value: boolean) {
    this.hlsPlayer.muted = value;
  }

  get level() {
    return this.hlsPlayer?.currentLevel ?? 0;
  }

  protected lateUpdate(dt: number): void {
    this.currentTime += dt;
  }

  onLoad() {
    this.initialize();
  }

  protected onDestroy(): void {
    this.stop();
  }

  stop() {
    if (this.initialized) {
      this.hlsPlayer.removeEventListener(
        "timeupdate",
        this.syncCurrentTime.bind(this)
      );

      this.hlsPlayer.off(Hls.Events.ERROR);
      this.hlsPlayer.destroy();
    }
  }

  private syncCurrentTime() {
    this.node.emit("syncNativeCurrentTime", this.hlsPlayer.currentTime);
    const needSync =
      this.currentTime >= 0 &&
      Math.abs(this.currentTime - this.hlsPlayer.currentTime) > 1;

    if (this.initialized && needSync) {
      this.hlsPlayer.currentTime = this.currentTime;
    }
  }

  private initialize() {
    this.hlsPlayer = new HLSPreloadedVideoPlayer();
    this.hlsPlayer.init();

    this.hlsPlayer.addEventListener("timeupdate", this.syncCurrentTime.bind(this));

    Object.values(Hls.Events).forEach((event) => {
      this.hlsPlayer.addEventListener(event, this.node.emit.bind(this.node));
    });
  }
}
