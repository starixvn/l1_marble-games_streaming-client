import { _decorator, Component, Label } from "cc";
import Observer from "observer";
import {
  type LiveScoreData,
  LiveScoreStore,
} from "../../features/live-score/live-score-store";

const { render, observer } = Observer;

const { ccclass, property } = _decorator;

@ccclass
@observer
export class LiveScore extends Component {
  @property(Label)
  scoreLabel: Label = null;

  @render(LiveScoreStore, (store) => store.data)
  syncScore(data: LiveScoreData) {
    this.scoreLabel.string = `${data?.homeScore ?? 0} - ${
      data?.awayScore ?? 0
    }`;
  }
}
