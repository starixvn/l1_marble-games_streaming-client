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

const SECONDS_PER_MINUTE = 60;

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

  private _streamingPhaseTime = 0;
  private _phaseIndex = 0;

  game = "";
  minutes = 0;
  seconds = 0;
  paused = true;
  videoDuration = gameSettings.videoDuration.default;

  protected update(dt: number): void {
    this._streamingPhaseTime += dt;
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
    this._streamingPhaseTime = data.streamingPhaseTime / 1000;
  }

  @render(CurrentEventStore, (store) => store.data)
  syncHalf(data: CurrentEventData) {
    this._phaseIndex = data.phase;
    this.halfLabel.string =
      this._phaseIndex === 0 ? t("Common.1st_half") : t("Common.2nd_half");
  }

  private updateSecondTimer() {
    if (this.paused) {
      this.seconds = 0;
      this.ensureMatchTimeValid();
      this.updateDisplayUI();
      return;
    }

    const relativePhaseTime =
      (this._streamingPhaseTime / this.videoDuration) *
      gameSettings.phaseDuration;

    const relativeMatchTime =
      this._phaseIndex * gameSettings.phaseDuration + relativePhaseTime;

    this.minutes = Math.floor(relativeMatchTime);
    this.seconds = Math.floor(
      this.getDecimal(relativeMatchTime) * SECONDS_PER_MINUTE
    );

    this.ensureMatchTimeValid();
    this.updateDisplayUI();
  }

  private updateDisplayUI() {
    this.secondsLabel.string = this.seconds.toString().padStart(2, "0");
    this.minutesLabel.string = this.minutes.toString().padStart(2, "0") + ":";
  }

  private ensureMatchTimeValid() {
    if (this.minutes >= this.getMaxMatchTime()) {
      this.minutes = this.getMaxMatchTime();
      this.seconds = 0;
    }
  }

  private getMaxMatchTime() {
    return (this._phaseIndex + 1) * gameSettings.phaseDuration;
  }

  private getDecimal(value: number) {
    return value - Math.trunc(value);
  }
}
