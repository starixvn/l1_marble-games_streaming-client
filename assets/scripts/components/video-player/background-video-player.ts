import { _decorator, Component } from "cc";
import Hls from "hls.js";
import Observer from "observer";
import { SoundUtils } from "../../common/utils";
import { PreloadVideoStore } from "../../features/preload-video/preload-video-store";
import { VideoStreamingStore } from "../../features/video-streaming/video-streaming-store";
import { BackgroundStore } from "../../local-stores/background/background-store";
import { GameStore } from "../../local-stores/game/game-store";
import { SfxStore } from "../../local-stores/sfx/sfx-store";
import { Store } from "../../store";
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

@ccclass("BackgroundVideoPlayer")
@observer
export class BackgroundVideoPlayer extends Component {
  private hlsPlayer: HLSPreloadedVideoPlayer = null;

  private get initialized() {
    return !!this.hlsPlayer?.initialized;
  }

  private readonly _introUrl = "";
  private _operator = "";
  private _game = "";

  @render(StageWatcher, (watcher) => watcher.stage)
  syncPlayVideo(stage: FeatureStage) {
    if (stage !== FeatureStage.Intro && stage !== FeatureStage.Streaming) {
      this.showBackground(true);
      this.pause();
    }
  }

  currentTime = 0;

  @render(Store, (store) => ({
    operator: store.operator,
  }))
  setStoreInfo({ operator }: { operator: string }) {
    this._operator = operator;
  }

  @render(GameStore, (store) => store.data.gameId)
  setGameId(gameId: string) {
    this._game = gameId;
  }

  @render(PreloadVideoStore, (store) => store.data.videoLink)
  setPreloadVideoLink(videoLink: string) {
    if (videoLink) {
      this.hlsPlayer.preload(videoLink);
    }
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
      if (play && this._introUrl && this._introUrl !== "") {
        this.showBackground(false);
        this.hlsPlayer.preload(this._introUrl);
      }
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
  showBackground(play: boolean) {
    return play;
  }

  @handle(SfxStore, (store, sfx: string) => store.playSfx(sfx))
  protected playSfx(sfx: string) {
    return sfx;
  }
}
