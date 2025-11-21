import { _decorator, CCInteger, Node } from "cc";
import { PreBet } from "db://assets/scripts/components/prebet/prebet";
import Observer from "observer";
import {
  AnimationPresentTeamName,
  PresentTeam,
} from "../present-team/present-team";
const { ccclass, property } = _decorator;
const { observer, render } = Observer;

@ccclass("PreBet")
@observer
export class PreBet2004 extends PreBet {
  @property(Node)
  containerAnimation: Node = null;

  @property(Node)
  backgroundImage: Node = null;

  @property(CCInteger)
  durationMillisecondsAnimation = 3000;

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
      this.durationMillisecondsAnimation / 1000
    );
  }
}
