import { _decorator, Component, Label } from "cc";
import Observer from "observer";
import { TimeStore } from "./time-store";
import { t } from "db://i18n/LanguageData";

const { ccclass, property, menu } = _decorator;
const { render, observer } = Observer;

@ccclass
@menu("Time/Time")
@observer
export class Time extends Component {
  @property(Label)
  private halfLabel: Label = null;

  @property(Label)
  private minutesLabel: Label = null;

  @property(Label)
  private secondsLabel: Label = null;

  minutes = 0;
  seconds = 0;
  paused = true;

  protected update(dt: number): void {
    this.updateSecondTimer();
  }

  @render(TimeStore, (store) => store.paused)
  private syncPaused(paused: boolean) {
    this.paused = paused;
  }

  @render(TimeStore, (store) => store.matchLiveTime)
  private syncMatchLiveTime(matchLiveTime: number) {
    this.minutes = matchLiveTime;
    this.seconds = 0;
    this.secondsLabel.string = "00";
    this.minutesLabel.string = this.minutes.toString().padStart(2, "0") + ":";
  }

  @render(TimeStore, (store) => store.halfIndex)
  private syncHalf(halfIndex: number) {
    this.halfLabel.string =
      halfIndex === 0 ? t("Common.1st_half") : t("Common.2nd_half");
  }

  updateSecondTimer() {
    if (!this.paused) {
      if (this.seconds < 59) {
        this.seconds += 1;
      }

      this.secondsLabel.string = this.seconds.toString().padStart(2, "0");
    } else {
      this.seconds = 0;
      this.secondsLabel.string = "00";
    }
  }
}
