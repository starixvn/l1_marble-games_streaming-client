import { _decorator, CCBoolean, CCString, Component, Label } from "cc";
import { t } from "db://i18n/LanguageData";
import Observer from "observer";
import { type LiveScoreData, LiveScoreStore } from "../../features/live-score/live-score-store";
import { type ResultData, ResultStore } from "../../features/result/result-store";

const { ccclass, property, menu } = _decorator;
const { render, observer } = Observer;

@ccclass
@menu("Scores/Score")
@observer
export class Score extends Component {

  private previousHome = 0;
  private previousAway = 0;
  private home = 0;
  private away = 0;

  @property(Label)
  private label: Label = null;

  @property(CCString)
  private readonly prefix = "";

  @property(CCBoolean)
  private readonly isPreviousScore = false;

  private score = "";

  private previousScore = "";

  @render(ResultStore, (store) => store.data)
  syncResult(data: ResultData) {
    this.previousHome =  data?.result[0]?.homeScore ?? 0;
    this.previousAway = data?.result[0]?.awayScore ?? 0;

    this.previousScore = `${this.previousHome} - ${this.previousAway}`;
  }

  @render(LiveScoreStore, (store) => store.data)
  syncScore(data: LiveScoreData) {
    this.home = data.homeScore;
    this.away = data.awayScore;
    this.score = `${this.home} - ${this.away}`;

    this.render();
  }

  protected render(): void {
    const score = this.isPreviousScore ? this.previousScore : this.score;

    if (this.prefix) {
      const prefix = t(this.prefix);

      this.label.string = `${prefix}: ${score}`;
    } else {
      this.label.string = score;
    }
  }

  onFocusInEditor(): void {
    this.label = this.node.getComponent(Label);
  }
}
