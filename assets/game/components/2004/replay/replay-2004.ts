import { _decorator, Node, sp } from "cc";
import { AnimationUtils, SoundUtils } from "db://assets/scripts/common/utils";
import { Replay } from "db://assets/scripts/components/replay/replay";
import {
  type LiveScoreData,
  LiveScoreStore,
} from "db://assets/scripts/features/live-score/live-score-store";
import { VideoStreamingStore } from "db://assets/scripts/features/video-streaming/video-streaming-store";
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
  TransitionIn = "transition3s",
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

  @property(Node)
  infoStreaming: Node = null;

  protected isHomeScoreChanged = false;
  protected readonly durationAnimGoal = 3;
  protected readonly durationAnimNode = 0.2;
  protected readonly durationTransition = 3;
  protected readonly durationAfterGoal = 2;
  protected readonly delayShowReplay = 0.5;
  private _preloadDurationSeconds = 0;
  private _currentStage = FeatureStage.Unknown;

  async onLoad() {
    super.onLoad();
    let nodes: Node[] = [];
    this.goalSpine?.node && nodes.push(this.goalSpine?.node);
    this.afterGoalSpine?.node && nodes.push(this.afterGoalSpine?.node);
    this.afterGoalEffectSpine?.node &&
      nodes.push(this.afterGoalEffectSpine?.node);
    this?.info && nodes.push(this?.info);
    this.setStatusNodes(nodes, false);
  }

  @render(VideoStreamingStore, (store) => store.data.preloadDurationMs)
  playVideo(preloadDurationMs: number) {
    this._preloadDurationSeconds = preloadDurationMs / 1000;
  }

  @render(LiveScoreStore, (store) => store.data)
  protected async syncScoreData(data: LiveScoreData) {
    this.isHomeScoreChanged = data?.isHomeScoreChanged;
    if (
      data?.homeScore > 0 ||
      (data?.awayScore > 0 && this._currentStage === FeatureStage.Streaming)
    ) {
      AnimationUtils.delayTime(this.delayShowReplay);
      this?.infoStreaming && this.setStatusNode(this.infoStreaming, false);
      this.playSfx(SoundUtils.getCommentPath() + SoundName.GOAL);
      this?.info &&
        AnimationUtils.fadeInAndActivate(this.info, this.durationAnimNode);
      await this.playGoalAnimation();
      this.setStatusNodes([this?.info, this.goalSpine?.node], false);
    }
  }

  @render(StageWatcher, (stageWatcher) => stageWatcher.stage)
  protected async syncStage(stage: FeatureStage) {
    this._currentStage = stage;
    if (stage === FeatureStage.EventDetailChange) {
      this.setStatusNodes(
        [
          this.goalSpine?.node,
          this.afterGoalSpine?.node,
          this.afterGoalEffectSpine?.node,
        ],
        false
      );
      this.scheduleRunTransition();
      await this.playTransitionAnimation();
      await this.playAfterGoalAnimation();
    }
    if (stage === FeatureStage.Streaming) {
      this?.infoStreaming && this.setStatusNode(this.infoStreaming, true);
    }
  }

  protected scheduleRunTransition() {
    if (
      this.durationTransition +
        this.durationAfterGoal +
        this.durationTransition <=
      this._preloadDurationSeconds
    ) {
      this.scheduleOnce(() => {
        this.setStatusNode(this.afterGoalSpine?.node, false);
        this.setStatusNode(this.afterGoalEffectSpine?.node, false);
        this.playTransitionAnimation();
      }, this._preloadDurationSeconds - this.durationTransition);
    }
  }

  protected async playTransitionAnimation() {
    this.setStatusNode(this.transitionSpine?.node, true);

    this?.transitionSpine &&
      (await AnimationUtils.playSpine(
        this.transitionSpine,
        AnimationName.TransitionIn,
        false,
        this.durationTransition
      ));

    this?.transitionSpine &&
      this.setStatusNode(this.transitionSpine?.node, false);
  }

  protected async playGoalAnimation() {
    this.setStatusNode(this.goalSpine?.node, true);
    this?.goalSpine &&
      (await AnimationUtils.playSpine(
        this.goalSpine,
        this.isHomeScoreChanged
          ? AnimationName.GoalHome
          : AnimationName.GoalAway,
        false,
        this.durationAnimGoal
      ));

    this?.goalSpine &&
      AnimationUtils.fadeInAndActivate(
        this?.goalSpine?.node,
        this.durationAnimNode
      );
  }

  protected async playAfterGoalAnimation() {
    this?.info &&
      AnimationUtils.fadeOutAndDeactivate(this.info, this.durationAnimNode);
    this.setStatusNode(this.afterGoalSpine?.node, true);
    this.setStatusNode(this.afterGoalEffectSpine?.node, true);
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
