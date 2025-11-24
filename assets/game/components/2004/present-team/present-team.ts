import { _decorator, Component, sp } from "cc";
import { AnimationUtils } from "db://assets/scripts/common/utils";
const { ccclass, property } = _decorator;

export enum AnimationPresentTeamName {
  AfterGoalIn = "aftergoal-in",
  HaftTime = "ingame-in",
  PrebetIn = "prebet-in",
  SettleIn = "settle-in",
}

@ccclass("PresentTeam")
export class PresentTeam extends Component {
  @property(sp.Skeleton)
  effectPresentTeamSpine: sp.Skeleton = null;

  @property(sp.Skeleton)
  presentTeamSpine: sp.Skeleton = null;

  playSpineStatic(animationName: AnimationPresentTeamName) {
    this.presentTeamSpine &&
      AnimationUtils.playSpine(this.presentTeamSpine, animationName, false, 0);
  }

  playSpine(
    animationName: AnimationPresentTeamName,
    duration: number,
    isLoop = false
  ) {
    this.presentTeamSpine &&
      AnimationUtils.playSpine(
        this.presentTeamSpine,
        animationName,
        isLoop,
        duration
      );
  }
}
