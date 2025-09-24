import { _decorator, Component, Enum } from "cc";
import { Team } from "./team";

const { ccclass, property, menu } = _decorator;

@ccclass
@menu("Team/Icon")
export class Icon extends Component {
  @property({ type: Enum(Team) })
  team: Team = Team.HOME;
}
