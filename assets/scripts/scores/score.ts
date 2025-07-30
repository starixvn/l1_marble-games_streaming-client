import { _decorator, CCBoolean, CCString, Component, Label } from "cc";
import { t } from "db://i18n/LanguageData";
import Observer from "observer";
import { ScoreStore } from "./score-store";

const { ccclass, property, menu } = _decorator;
const { render, observer } = Observer;

@ccclass
@menu("Scores/Score")
@observer
export class Score extends Component {
  @property(Label)
  private label: Label = null;

  @property(CCString)
  private prefix: string = "";

  @property(CCBoolean)
  private isPreviousScore = false;

  private score = "";

  private previousScore = "";

  @render(ScoreStore, (store) => store.scoreInText)
  private syncScore(text: string) {
    this.score = text;

    this.render();
  }

  @render(ScoreStore, (store) => store.previousScoreInText)
  private syncPreviousScore(text: string) {
    this.previousScore = text;

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
