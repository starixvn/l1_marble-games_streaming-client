import { _decorator, Label, sp } from "cc";
import { AnimationUtils } from "db://assets/scripts/common/utils/animation-utils";
import { Score } from "db://assets/scripts/components/scores/score";
import {
  type LiveScoreData,
  LiveScoreStore,
} from "db://assets/scripts/features/live-score/live-score-store";
import Observer from "observer";

const { render, observer } = Observer;

const { ccclass, property } = _decorator;

@ccclass("ScoreSpine")
export class ScoreSpine extends Score {
  @property({ type: Label, visible: false, override: true })
  protected label: Label = null;

  @property(sp.Skeleton)
  protected homeSpine: sp.Skeleton = null;

  @property(sp.Skeleton)
  protected awaySpine: sp.Skeleton = null;

  @render(LiveScoreStore, (store) => store.data)
  override async syncScore(data: LiveScoreData) {
    this.delayUpdateScore > 0 &&
      (await AnimationUtils.delayTime(this.delayUpdateScore));

    const newHome = data?.homeScore ?? 0;
    const newAway = data?.awayScore ?? 0;

    if (this.home !== newHome) {
      this.home = newHome;
      this.setHome(this.home);
    }

    if (this.away !== newAway) {
      this.away = newAway;
      this.setAway(this.away);
    }
  }

  setHome(home: number) {
    this.homeSpine.setAnimation(0, `score ${home}`, false);
  }

  setAway(away: number) {
    this.awaySpine.setAnimation(0, `score ${away}`, false);
  }
}
