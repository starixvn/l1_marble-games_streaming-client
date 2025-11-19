import { _decorator, Component, sp } from "cc";
import {
  FeatureStage,
  StageWatcher,
} from "db://assets/scripts/watchers/stages/stage-watcher";
import Observer from "observer";
const { ccclass, property } = _decorator;
const { observer, render } = Observer;

enum AnimationName {
  PreBetIn = "prebet-in",
  HaftTimeIn = "ingame-in",
  FullTimeIn = "settle-in",
  DrawIn = "draw",
}

@ccclass("SpineManager")
@observer
export class SpineManager extends Component {
  @property(sp.Skeleton)
  preBetSpine: sp.Skeleton = null;

  @property(sp.Skeleton)
  haftTimeSpine: sp.Skeleton = null;

  @property(sp.Skeleton)
  fullTimeSpine: sp.Skeleton = null;

  @property(sp.Skeleton)
  drawSpine: sp.Skeleton = null;

  @render(StageWatcher, (stageWatcher) => stageWatcher.stage)
  protected async syncStage(stage: FeatureStage) {
    switch (stage) {
      case FeatureStage.Prebet:
        this.preBetSpine?.setAnimation(0, AnimationName.PreBetIn, false);
        break;
      case FeatureStage.PhaseChange:
        this.haftTimeSpine?.setAnimation(0, AnimationName.HaftTimeIn, false);
        break;
      case FeatureStage.Result:
        this.fullTimeSpine?.setAnimation(0, AnimationName.FullTimeIn, false);
        this.drawSpine?.setAnimation(0, AnimationName.DrawIn, false);
        break;
    }
  }
}
