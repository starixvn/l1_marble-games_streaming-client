import { _decorator, CCBoolean, Component, Enum } from "cc";
import { Team } from "./team";

const { ccclass, property, menu } = _decorator;

@ccclass
@menu("Team/Name")
export class Name extends Component {
  @property({ type: Enum(Team) })
  team: Team = Team.HOME;

  @property(CCBoolean)
  short = false;
}
