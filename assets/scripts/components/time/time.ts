import { _decorator, Component, Label } from "cc";
import Observer from "observer";
import { t } from "db://i18n/LanguageData";
import {
  type GameFlowData,
  GameFlowState,
  GameFlowStore,
} from "../../features/game-flow/game-flow-store";
import {
  type VideoStreamingData,
  VideoStreamingStore,
} from "../../features/video-streaming/video-streaming-store";
import {
  type CurrentEventData,
  CurrentEventStore,
} from "../../features/current-event/current-event-store";
import { gameSettings } from "../../game-settings";
import { Store } from "../../store";

const { ccclass, property, menu } = _decorator;
const { render, observer } = Observer;

const SPLIT_SECONDS_PER_SECOND = 60;

@ccclass
@menu("Time/Time")
@observer
export class Time extends Component {
  @property(Label)
  halfLabel: Label = null;

  @property(Label)
  minutesLabel: Label = null;

  @property(Label)
  secondsLabel: Label = null;

  private _timeToStream = 0;
  private _halfIndex = 0;

  game = "";
  seconds = 0;
  splitSeconds = 0;
  paused = true;
  videoDuration = gameSettings.videoDuration.default;

  protected update(dt: number): void {
    this.updateSecondTimer();
  }

  @render(Store, (store) => store.game)
  syncGame(game: string) {
    this.game = game;
    this.videoDuration =
      gameSettings.videoDuration[game] || gameSettings.videoDuration.default;
  }

  @render(GameFlowStore, (store) => store.data)
  syncPaused(data: GameFlowData) {
    this.paused = data.state !== GameFlowState.Streaming;
  }

  @render(VideoStreamingStore, (store) => store.data)
  syncMatchLiveTime(data: VideoStreamingData) {
    this._timeToStream = data.timeToStream;
  }

  @render(CurrentEventStore, (store) => store.data)
  syncHalf(data: CurrentEventData) {
    this._halfIndex = data.phase;
    this.halfLabel.string =
      this._halfIndex === 0 ? t("Common.1st_half") : t("Common.2nd_half");
  }

  private updateSecondTimer() {
    if (this.paused) {
      this.splitSeconds = 0;
      this.seconds = this._halfIndex * gameSettings.halfDuration;
      this.ensureMatchTimeValid();
      this.updateDisplayUI();
      return;
    }

    const currentTime = (Date.now() - this._timeToStream) / 1000;

    const relativeMatchTime =
      (currentTime / this.videoDuration) * gameSettings.halfDuration;
    const relativeMatchTimeWithHalf =
      this._halfIndex * gameSettings.halfDuration + relativeMatchTime;

    this.seconds = Math.floor(relativeMatchTimeWithHalf);
    this.splitSeconds = Math.floor(
      this.getDecimal(relativeMatchTimeWithHalf) * SPLIT_SECONDS_PER_SECOND
    );

    this.ensureMatchTimeValid();
    this.updateDisplayUI();
  }

  private updateDisplayUI() {
    this.secondsLabel.string = this.splitSeconds.toString().padStart(2, "0");
    this.minutesLabel.string = this.seconds.toString().padStart(2, "0") + ":";
  }

  private ensureMatchTimeValid() {
    if (this.seconds >= this.getMaxMatchTime()) {
      this.seconds = this.getMaxMatchTime();
      this.splitSeconds = 0;
    }
  }

  private getMaxMatchTime() {
    return (this._halfIndex + 1) * gameSettings.halfDuration;
  }

  private getDecimal(value: number) {
    return value - Math.trunc(value);
  }
}
