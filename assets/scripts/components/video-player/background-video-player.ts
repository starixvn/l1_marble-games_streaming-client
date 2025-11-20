import { _decorator, Component } from "cc";
import Hls from "hls.js";
import Observer from "observer";
import { SoundUtils } from "../../common/utils";
import { PreloadVideoStore } from "../../features/preload-video/preload-video-store";
import { VideoStreamingStore } from "../../features/video-streaming/video-streaming-store";
import { BackgroundStore } from "../../local-stores/background/background-store";
import { SfxStore } from "../../local-stores/sfx/sfx-store";
import {
  FeatureStage,
  StageWatcher,
} from "../../watchers/stages/stage-watcher";
import { HLSPreloadedVideoPlayer } from "./preloaded-hls-player";
import { type IntroData, IntroStore } from "../../features/intro/intro-store";
import {
  type GameFlowData,
  GameFlowState,
  GameFlowStore,
} from "../../features/game-flow/game-flow-store";

const { ccclass } = _decorator;
const { observer, render, handle } = Observer;

enum SoundName {
  WHISTLE_START = "whistle_start",
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
  private delayShowIntro = 3000;

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
    const currentIntroTimeMs =
      gameFlowData.currentStateTimeMs - this.delayShowIntro;

    const waitingTimeToPlayIntro =
      currentIntroTimeMs < 0 ? Math.abs(currentIntroTimeMs) : 0;

    if (
      state === GameFlowState.Prebet &&
      this.introData.prebet &&
      this.introData.prebet !== ""
    ) {
      this.hlsPlayer.preload(this.introData.prebet);

      setTimeout(() => {
        this.showBackground(false);
        this.playIntro({
          videoLink: this.introData.prebet,
          currentTime: currentIntroTimeMs + waitingTimeToPlayIntro,
        });
      }, waitingTimeToPlayIntro);

      return;
    }

    if (
      state === GameFlowState.PhaseChange &&
      this.introData.halftime &&
      this.introData.halftime !== ""
    ) {
      this.hlsPlayer.preload(this.introData.halftime);
      setTimeout(() => {
        this.showBackground(false);
        this.playIntro({
          videoLink: this.introData.halftime,
          currentTime: currentIntroTimeMs + waitingTimeToPlayIntro,
        });
      }, waitingTimeToPlayIntro);
      return;
    }
  }

  playIntro({
    videoLink,
    currentTime,
  }: {
    videoLink: string;
    currentTime: number;
  }) {
    console.log("playIntro", videoLink, currentTime);
    this.hlsPlayer.stopPreload();
    this.hlsPlayer.load(videoLink);
    this.currentTime = currentTime;
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

    this.hlsPlayer.onPlayStateChanged = (play: boolean) => {
      this.showBackground(!play);
    };

    this.hlsPlayer.addEventListener(
      "timeupdate",
      this.syncCurrentTime.bind(this)
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
