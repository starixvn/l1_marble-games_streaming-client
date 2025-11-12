import { _decorator, sp } from "cc";
import { AnimationUtils, SoundUtils } from "db://assets/scripts/common/utils";
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

const { observer, render, handle } = Observer;

enum AnimationName {
  GoalAway = "Goal-Away",
  GoalHome = "Goal-Home",
  AfterGoal = "aftergoal-in",
  AfterGoalEffect = "show",
  TransitionIn = "transition",
}

enum SoundName {
  GOAL = "goal_01",
}

@ccclass("Replay2004")
@observer
export class Replay2004 extends Replay {
  @property(sp.Skeleton)
  goalSpine: sp.Skeleton = null;

  @property(sp.Skeleton)
  afterGoalSpine: sp.Skeleton = null;

  @property(sp.Skeleton)
  afterGoalEffectSpine: sp.Skeleton = null;

  protected isHomeScoreChanged = false;
  protected readonly durationAnimGoal = 3;
  protected readonly durationAnimNode = 0.2;
  protected readonly durationDelayAfterGoal = 0.4;

  async onLoad() {
    super.onLoad();
    this.setNodesActive(
      [
        this.goalSpine.node,
        this.afterGoalSpine.node,
        this.afterGoalEffectSpine.node,
        this.info,
      ],
      false
    );
  }

  @render(LiveScoreStore, (store) => store.data)
  syncScoreData(data: LiveScoreData) {
    this.isHomeScoreChanged = data?.isHomeScoreChanged;
  }

  @render(StageWatcher, (stageWatcher) => stageWatcher.stage)
  protected async syncStage(stage: FeatureStage) {
    const isActive = stage === FeatureStage.EventDetailChange;
    if (isActive) {
      await this.playTransitionAnimation();
      this.playReplayVideo();
      await this.playGoalAnimation();
      await this.playAfterGoalAnimation();
      return;
    }

    this.inActiveAnimations();
  }

  protected async playTransitionAnimation() {
    this.playSfx(SoundUtils.getCommentPath() + SoundName.GOAL);
    this.setStatusNode(this.transitionSpine.node, true);

    await AnimationUtils.playSpine(
      this.transitionSpine,
      AnimationName.TransitionIn,
      false
    );

    this.setStatusNode(this.transitionSpine.node, false);
  }

  protected async playReplayVideo() {
    this.backgroundVideoPlayer?.playReplay();
    AnimationUtils.fadeInAndActivate(this.info, this.durationAnimNode);
  }

  protected async playGoalAnimation() {
    this.setStatusNode(this.goalSpine.node, true);
    await AnimationUtils.playSpine(
      this.goalSpine,
      this.isHomeScoreChanged ? AnimationName.GoalHome : AnimationName.GoalAway,
      false,
      this.durationAnimGoal
    );

    AnimationUtils.fadeInAndActivate(
      this.goalSpine.node,
      this.durationAnimNode
    );
  }

  protected async playAfterGoalAnimation() {
    await AnimationUtils.delayTime(this.durationDelayAfterGoal);
    AnimationUtils.fadeOutAndDeactivate(this.info, this.durationAnimNode);
    this.setStatusNode(this.afterGoalSpine.node, true);
    this.setStatusNode(this.afterGoalEffectSpine.node, true);
    AnimationUtils.playSpine(
      this.afterGoalEffectSpine,
      AnimationName.AfterGoalEffect,
      true
    );
    AnimationUtils.playSpine(
      this.afterGoalSpine,
      AnimationName.AfterGoal,
      false
    );
  }

  inActiveAnimations() {
    this.setNodesActive(
      [
        this.goalSpine.node,
        this.afterGoalSpine.node,
        this.afterGoalEffectSpine.node,
      ],
      false
    );
  }
}
