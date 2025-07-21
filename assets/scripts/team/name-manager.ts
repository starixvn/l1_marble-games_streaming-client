import { _decorator, Component, Enum, Label } from "cc";
import { Name } from "./name";
import { Team } from "./team";

const { ccclass, property, menu } = _decorator;

@ccclass
@menu("Team/NameManager")
export class NameManager extends Component {
  @property({ type: Enum(Team) })
  team: Team = Team.HOME;

  @property([Name])
  private targets: Name[] = [];

  private longLabels: Label[] = [];
  private shortLabels: Label[] = [];

  start() {
    this.longLabels = this.targets
      .filter((target) => !target.short)
      .map((target) => target.getComponent(Label));
    this.shortLabels = this.targets
      .filter((target) => target.short)
      .map((target) => target.getComponent(Label));
  }

  set name(value: string) {
    this.longLabels.forEach((label) => {
      label.string = value;
    });
  }

  set shortName(value: string) {
    this.shortLabels.forEach((label) => {
      label.string = value;
    });
  }

  onFocusInEditor(): void {
    const names = this.node.getComponentsInChildren(Name);

    this.targets = names.filter((name) => name.team === this.team);
  }
}
