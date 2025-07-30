import { _decorator, Component, Enum, Label } from "cc";
import { t } from "db://i18n/LanguageData";
import { LocalizedLabel } from "db://i18n/LocalizedLabel";
import Observer from "observer";
import { Store } from "../store";
import { Name } from "./name";
import { Team } from "./team";
import { TeamStore } from "./team-store";

const { ccclass, property, menu } = _decorator;
const { render, observer } = Observer;

@ccclass
@menu("Team/NameManager")
@observer
export class NameManager extends Component {
  @property({ type: Enum(Team) })
  team: Team = Team.HOME;

  @property([Name])
  private targets: Name[] = [];

  private longLabels: LocalizedLabel[] = [];
  private shortLabels: Label[] = [];
  private operator = "";

  @render(Store, (store) => store.operator)
  private syncOperator(operator: string) {
    this.operator = operator;
  }

  @render(TeamStore, (store) => ({ home: store.home, away: store.away }))
  private syncTeamName({ home, away }: TeamStore) {
    if (this.team === Team.HOME && home) {
      this.name = home;
    } else if (this.team === Team.AWAY && away) {
      this.name = away;
    }
  }

  onLoad() {
    this.longLabels = this.targets
      .filter((target) => !target.short)
      .map((target) => target.getComponent(LocalizedLabel));
    this.shortLabels = this.targets
      .filter((target) => target.short)
      .map((target) => target.getComponent(Label));
  }

  set name(value: string) {
    const name = value.split("_")[1].toUpperCase();

    for (const label of this.longLabels) {
      const key = `${this.operator}.${value}`;

      if (t(key) === "") {
        label.key = `Common.${value}`;
      } else {
        label.key = key;
      }
    }

    for (const label of this.shortLabels) {
      label.string = name;
    }
  }

  onFocusInEditor(): void {
    const names = this.node.getComponentsInChildren(Name);

    this.targets = names.filter((name) => name.team === this.team);
  }
}
