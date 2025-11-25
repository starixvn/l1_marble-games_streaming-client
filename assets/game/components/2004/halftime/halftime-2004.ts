import { _decorator } from "cc";
import { FunctionUtils } from "db://assets/scripts/common/utils";
import { PhaseTransition } from "db://assets/scripts/components/phase-transition/phase-transition";
import {
  AnimationPresentTeamName,
  PresentTeam,
} from "../present-team/present-team";
const { ccclass } = _decorator;

@ccclass("HalfTime2004")
export class HalfTime2004 extends PhaseTransition {
  protected presentTeam: PresentTeam = null;

  onLoad() {
    super.onLoad();
    this.presentTeam = this.containerAnimation.getComponent(PresentTeam);
  }

  override async handleStatic() {
    super.handleStatic();
    this.presentTeam?.playSpineStatic(AnimationPresentTeamName.HaftTime);
  }

  override async handleDynamic() {
    this.presentTeam?.playSpine(
      AnimationPresentTeamName.HaftTime,
      FunctionUtils.msToSeconds(this.durationMillisecondsAnimation)
    );
  }
}
