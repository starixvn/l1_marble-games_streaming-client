import { _decorator, Component, find, log, Node, sp } from "cc";
import Observer from "observer";
import { AnimationUtils } from "../../common/utils";
import {
  type LiveScoreData,
  LiveScoreStore,
} from "../../features/live-score/live-score-store";
import {
  FeatureStage,
  StageWatcher,
} from "../../watchers/stages/stage-watcher";
import { BackgroundVideoPlayer } from "../video-player/background-video-player";
const { ccclass, property } = _decorator;

const { observer, render } = Observer;

enum AnimationName {
  GoalAway = "Goal-Away",
  GoalHome = "Goal-Home",
  AfterGoal = "aftergoal-in",
  AfterGoalEffect = "show",
  Transition = "transition",
}

@ccclass("Replay")
@observer
export class Replay extends Component {
  @property(sp.Skeleton)
  transitionSpine: sp.Skeleton = null;

  @property(sp.Skeleton)
  goalSpine: sp.Skeleton = null;

  @property(sp.Skeleton)
  afterGoalSpine: sp.Skeleton = null;

  @property(sp.Skeleton)
  afterGoalEffectSpine: sp.Skeleton = null;

  protected backgroundVideoPlayer: BackgroundVideoPlayer = null;
  protected isHomeScoreChanged = false;
  protected readonly durationDelayAfterGoal = 0.5;
  protected readonly durationDelayShowReplay = 3;

  async onLoad() {
    AnimationUtils.delayTime(0.2);
    console.log("replay onLoad--");
    this.initBackgroundVideoPlayer();
    this.setNodesActive(
      [
        this.transitionSpine.node,
        this.goalSpine.node,
        this.afterGoalSpine.node,
        this.afterGoalEffectSpine.node,
      ],
      false
    );
  }

  initBackgroundVideoPlayer() {
    const canvas = find("Canvas");
    const backgroundVideoPlayer = canvas?.getComponentInChildren(
      BackgroundVideoPlayer
    );
    this.backgroundVideoPlayer = backgroundVideoPlayer;
    log("init backgroundVideoPlayer", backgroundVideoPlayer);
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
      await AnimationUtils.delayTime(this.durationDelayShowReplay);
      this.playGoalAnimation();
      this.playAfterGoalAnimation();
      return;
    }

    this.inActiveAnimations();
  }

  protected async playTransitionAnimation() {
    this.setNodeAction(this.transitionSpine.node, true);
    await AnimationUtils.playSpine(
      this.transitionSpine,
      AnimationName.Transition,
      false,
      1
    );

    this.setNodeAction(this.transitionSpine.node, false);
  }

  protected async playReplayVideo() {
    this.backgroundVideoPlayer?.playReplay();
  }

  protected async playGoalAnimation() {
    this.setNodeAction(this.goalSpine.node, true);
    await AnimationUtils.playSpine(
      this.goalSpine,
      this.isHomeScoreChanged ? AnimationName.GoalHome : AnimationName.GoalAway,
      false,
      2
    );
    this.setNodeAction(this.goalSpine.node, false);
  }

  protected async playAfterGoalAnimation() {
    await AnimationUtils.delayTime(this.durationDelayAfterGoal);
    this.setNodeAction(this.afterGoalSpine.node, true);
    this.setNodeAction(this.afterGoalEffectSpine.node, true);
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

  protected setNodesActive(nodes: Node[], active: boolean) {
    nodes?.forEach((node) => this.setNodeAction(node, active));
  }

  setNodeAction(node: Node, active: boolean) {
    node && (node.active = active);
  }
}
