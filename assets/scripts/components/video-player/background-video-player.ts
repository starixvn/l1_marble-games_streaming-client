import { _decorator, Component, log } from "cc";
import Hls from "hls.js";
import Observer from "observer";
import { FunctionUtils, SoundUtils } from "../../common/utils";
import {
  type GameFlowData,
  GameFlowState,
  GameFlowStore,
} from "../../features/game-flow/game-flow-store";
import { type IntroData, IntroStore } from "../../features/intro/intro-store";
import { PreloadVideoStore } from "../../features/preload-video/preload-video-store";
import { VideoStreamingStore } from "../../features/video-streaming/video-streaming-store";
import { BackgroundStore } from "../../local-stores/background/background-store";
import { SfxStore } from "../../local-stores/sfx/sfx-store";
import {
  FeatureStage,
  StageWatcher,
} from "../../watchers/stages/stage-watcher";
import { HLSPreloadedVideoPlayer } from "./preloaded-hls-player";

const { ccclass } = _decorator;
const { observer, render, handle } = Observer;

enum SoundName {
  WHISTLE_START = "whistle_start",
}

export enum BackgroundVideoPlayerEvent {
  VIDEO_ENDED = "videoEnded",
  SYNC_NATIVE_CURRENT_TIME = "syncNativeCurrentTime",
  SYNC_DURATION = "syncDuration",
}

@ccclass("BackgroundVideoPlayer")
@observer
export class BackgroundVideoPlayer extends Component {
  public currentTime = 0;
  private hlsPlayer: HLSPreloadedVideoPlayer = null;
  private introData: IntroData = {
    prebet: "",
    halftime: "",
  };
  private readonly delayShowIntro = 3000;

  private get initialized() {
    return !!this.hlsPlayer?.initialized;
  }

  @render(StageWatcher, (watcher) => watcher.stage)
  syncPlayVideo(stage: FeatureStage) {
    if (stage !== FeatureStage.Intro && stage !== FeatureStage.Streaming) {
      this.showBackground(true);
      this.pause();
    }
  }

  @render(GameFlowStore, (store) => store.data)
  preloadAndPlayIntro(gameFlowData: GameFlowData) {
    const state = gameFlowData.state;
    if (!this.isValidIntroState(state)) {
      return;
    }

    const videoLink = this.getIntroVideoLink(state);
    if (!this.isValidVideoLink(videoLink)) {
      return;
    }

    const currentStateTimeMs = gameFlowData?.currentStateTimeMs ?? 0;
    const waitingTimeToPlayIntro =
      FunctionUtils.calculateWaitingTimeMilliseconds(
        currentStateTimeMs,
        this.delayShowIntro
      );

    log("preloadAndPlayIntro-------", state, waitingTimeToPlayIntro);

    this.handleIntroPlayback(
      videoLink,
      currentStateTimeMs,
      waitingTimeToPlayIntro
    );
  }

  private isValidIntroState(state: GameFlowState | undefined): boolean {
    return (
      state === GameFlowState.PhaseChange || state === GameFlowState.Prebet
    );
  }

  private getIntroVideoLink(state: GameFlowState): string {
    if (state === GameFlowState.Prebet) {
      return this.introData.prebet ?? "";
    }
    if (state === GameFlowState.PhaseChange) {
      return this.introData.halftime ?? "";
    }

    return "";
  }

  private isValidVideoLink(videoLink: string): boolean {
    return videoLink && videoLink !== "";
  }

  private handleIntroPlayback(
    videoLink: string,
    currentStateTimeMs: number,
    waitingTimeToPlayIntro: number
  ): void {
    this.hlsPlayer.preload(videoLink);

    this.scheduleOnce(() => {
      this.showBackground(false);
      this.playIntro({
        videoLink,
        currentTime: currentStateTimeMs + waitingTimeToPlayIntro,
      });
    }, FunctionUtils.msToSeconds(waitingTimeToPlayIntro));
  }

  playIntro({
    videoLink,
    currentTime,
  }: {
    videoLink: string;
    currentTime: number;
  }) {
    this.hlsPlayer.stopPreload();
    this.hlsPlayer.load(videoLink);
    this.currentTime = FunctionUtils.msToSeconds(currentTime);
    this.play();
    this.syncCurrentTime();
  }

  @render(PreloadVideoStore, (store) => store.data.videoLink)
  setPreloadVideoLink(videoLink: string) {
    if (videoLink) {
      this.hlsPlayer.preload(videoLink);
    }
  }

  @render(IntroStore, (store) => store.data)
  setIntroData(introData: IntroData) {
    this.introData = introData;
  }

  @render(VideoStreamingStore, (store) => ({
    videoLink: store.data.videoLink,
    currentTime: store.data.currentTime,
  }))
  playVideo({
    videoLink,
    currentTime,
  }: {
    videoLink: string;
    currentTime: number;
    videoLengthMs: number;
  }) {
    if (videoLink && videoLink !== "") {
      this.hlsPlayer.stopPreload();
      this.hlsPlayer.load(videoLink);
      this.currentTime = currentTime;
      this.play();
      this.syncCurrentTime();
    }
  }

  pause() {
    if (this.initialized) {
      this.hlsPlayer.pause();
    }
  }

  play() {
    if (this.initialized) {
      this.hlsPlayer.currentTime = this.currentTime;
      this.hlsPlayer.play();
      this.playSfx(SoundUtils.getCommentPath() + SoundName.WHISTLE_START);
      this.showBackground(true);
    }
  }

  set muted(value: boolean) {
    this.hlsPlayer.muted = value;
  }

  get level() {
    return this.hlsPlayer?.currentLevel ?? 0;
  }

  get duration() {
    return this.hlsPlayer?.duration ?? 0;
  }

  protected update(dt: number): void {
    if (this.initialized) {
      this.currentTime += dt;
    }
  }

  onLoad() {
    this.initialize();
  }

  protected onDestroy(): void {
    this.stop();
    this.unscheduleAllCallbacks();
  }

  stop() {
    if (this.initialized) {
      this.hlsPlayer.removeEventListener(
        "timeupdate",
        this.syncCurrentTime.bind(this)
      );

      this.hlsPlayer.removeEventListener("ended", this.onVideoEnded.bind(this));

      this.hlsPlayer.removeEventListener(
        "loadedmetadata",
        this.onLoadMetadata.bind(this)
      );

      this.hlsPlayer.off(Hls.Events.ERROR);
      this.hlsPlayer.destroy();
    }
  }

  private syncCurrentTime() {
    this.node.emit(
      BackgroundVideoPlayerEvent.SYNC_NATIVE_CURRENT_TIME,
      this.hlsPlayer.currentTime
    );

    const needSync =
      this.currentTime >= 0 &&
      Math.abs(this.currentTime - this.hlsPlayer.currentTime) > 1;

    if (this.initialized && needSync) {
      this.hlsPlayer.currentTime = this.currentTime;
    }
  }

  private onVideoEnded() {
    this.node.emit(BackgroundVideoPlayerEvent.VIDEO_ENDED);
  }

  private onLoadMetadata() {
    this.node.emit(
      BackgroundVideoPlayerEvent.SYNC_DURATION,
      this.hlsPlayer.duration
    );
  }

  private initialize() {
    this.hlsPlayer = new HLSPreloadedVideoPlayer();
    this.hlsPlayer.init();

    this.hlsPlayer.onPlayStateChanged = (play: boolean) => {
      this.showBackground(!play);
    };

    this.hlsPlayer.addEventListener(
      "timeupdate",
      this.syncCurrentTime.bind(this)
    );

    this.hlsPlayer.addEventListener("ended", this.onVideoEnded.bind(this));

    this.hlsPlayer.addEventListener(
      "loadedmetadata",
      this.onLoadMetadata.bind(this)
    );

    Object.values(Hls.Events).forEach((event) => {
      this.hlsPlayer.addEventListener(event, this.node.emit.bind(this.node));
    });
  }

  @handle(BackgroundStore, (store, data: boolean) => store.showBackground(data))
  showBackground(isShown: boolean) {
    return isShown;
  }

  @handle(SfxStore, (store, sfx: string) => store.playSfx(sfx))
  protected playSfx(sfx: string) {
    return sfx;
  }
}
