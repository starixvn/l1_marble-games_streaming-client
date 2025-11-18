import { _decorator, Node, sp } from "cc";
import { AnimationUtils } from "db://assets/scripts/common/utils";
import { Replay } from "db://assets/scripts/components/replay/replay";
import {
  type LiveScoreData,
  LiveScoreStore,
} from "db://assets/scripts/features/live-score/live-score-store";
import {
  FeatureStage,
  StageWatcher,
} from "db://assets/scripts/watchers/stages/stage-watcher";
import Observer from "observer";
const { ccclass, property } = _decorator;

const { observer, render } = Observer;

enum AnimationName {
  AfterGoal = "aftergoal-in",
  AfterGoalEffect = "show",
  TransitionIn = "transition3s",
}

@ccclass("Replay2004")
@observer
export class Replay2004 extends Replay {
  @property(sp.Skeleton)
  afterGoalSpine: sp.Skeleton = null;

  @property(sp.Skeleton)
  afterGoalEffectSpine: sp.Skeleton = null;

  protected isHomeScoreChanged = false;
  protected readonly durationAnimNode = 0.2;
  protected readonly durationAfterGoal = 1.5;
  private _currentStage = FeatureStage.Unknown;

  async onLoad() {
    super.onLoad();
    const nodes: Node[] = [];
    this.afterGoalSpine?.node && nodes.push(this.afterGoalSpine?.node);
    this.afterGoalEffectSpine?.node &&
      nodes.push(this.afterGoalEffectSpine?.node);
    this?.info && nodes.push(this?.info);
    this.setStatusNodes(nodes, false);
  }

  @render(LiveScoreStore, (store) => store.data)
  protected async syncScoreData(data: LiveScoreData) {
    this.isHomeScoreChanged = data?.isHomeScoreChanged;
    if (
      data?.homeScore > 0 ||
      (data?.awayScore > 0 && this._currentStage === FeatureStage.Streaming)
    ) {
      this?.info &&
        AnimationUtils.fadeInAndActivate(this.info, this.durationAnimNode);
    }
  }

  @render(StageWatcher, (stageWatcher) => stageWatcher.stage)
  protected async syncStage(stage: FeatureStage) {
    this._currentStage = stage;
    if (stage === FeatureStage.EventDetailChange) {
      this.setStatusNodes(
        [this.afterGoalSpine?.node, this.afterGoalEffectSpine?.node],
        false
      );

      await this.playAfterGoalAnimation();
    }
  }

  protected async playAfterGoalAnimation() {
    this?.info &&
      AnimationUtils.fadeOutAndDeactivate(this.info, this.durationAnimNode);
    AnimationUtils.fadeInAndActivate(
      this.afterGoalSpine?.node,
      this.durationAnimNode
    );
    AnimationUtils.fadeInAndActivate(
      this.afterGoalEffectSpine?.node,
      this.durationAnimNode
    );
    this?.afterGoalEffectSpine &&
      AnimationUtils.playSpine(
        this.afterGoalEffectSpine,
        AnimationName.AfterGoalEffect,
        true
      );
    this?.afterGoalSpine &&
      AnimationUtils.playSpine(
        this.afterGoalSpine,
        AnimationName.AfterGoal,
        false,
        this.durationAfterGoal
      );
  }
}
