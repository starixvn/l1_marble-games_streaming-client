import { _decorator } from "cc";
import { FunctionUtils } from "db://assets/scripts/common/utils";
import { PhaseTransition } from "db://assets/scripts/components/phase-transition/phase-transition";
import {
  AnimationPresentTeamName,
  PresentTeam,
} from "../present-team/present-team";
const { ccclass } = _decorator;

@ccclass("PreBet2004")
export class PreBet2004 extends PhaseTransition {
  protected presentTeam: PresentTeam = null;

  onLoad() {
    super.onLoad();
    this.presentTeam = this.containerAnimation.getComponent(PresentTeam);
  }

  override async handleStaticSpine() {
    this.presentTeam?.playSpineStatic(AnimationPresentTeamName.PrebetIn);
  }

  override async handleDynamicSpine() {
    this.presentTeam?.playSpine(
      AnimationPresentTeamName.PrebetIn,
      FunctionUtils.msToSeconds(this.durationMillisecondsAnimation)
    );
  }
}
