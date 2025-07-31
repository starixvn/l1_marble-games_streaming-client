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

  @render(TimeStore, (store) => store.matchLiveTime)
  private syncMatchLiveTime(matchLiveTime: number) {
    const minutes = Math.floor(matchLiveTime / 1000);
    const seconds = Math.floor((matchLiveTime % 1000) / 10);

    this.minutesLabel.string = minutes.toString().padStart(2, "0") + ":";
    this.secondsLabel.string = seconds.toString().padStart(2, "0");
  }

  @render(TimeStore, (store) => store.halfIndex)
  private syncHalf(halfIndex: number) {
    this.halfLabel.string =
      halfIndex === 0 ? t("Common.1st_half") : t("Common.2nd_half");
  }
}
