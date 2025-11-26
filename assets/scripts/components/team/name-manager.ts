import { _decorator, Component, Enum, Label, log } from "cc";
import { t } from "db://i18n/LanguageData";
import { LocalizedLabel } from "db://i18n/LocalizedLabel";
import Observer from "observer";
import {
  type TeamNameData,
  TeamNameStore,
} from "../../features/team-name/team-name-store";
import { Store } from "../../store";
import { Name } from "./name";
import { Team } from "./team";

const { ccclass, property, menu } = _decorator;
const { render, observer } = Observer;

@ccclass
@menu("Team/NameManager")
@observer
export class NameManager extends Component {
  @property({ type: Enum(Team) })
  team: Team = Team.HOME;

  @property([Name])
  targets: Name[] = [];

  private longLabels: LocalizedLabel[] = [];
  private shortLabels: Label[] = [];
  private operator = "";

  @render(Store, (store) => store.operator)
  private syncOperator(operator: string) {
    log("syncOperator---", operator);
    this.operator = operator;
  }

  @render(TeamNameStore, (store) => store.data)
  syncTeamName(data: TeamNameData) {
    if (this.team === Team.HOME && data.homeTeamName) {
      this.name = data.homeTeamName;
    } else if (this.team === Team.AWAY && data.awayTeamName) {
      this.name = data.awayTeamName;
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
        label.key = `common.${value}`;
      } else {
        label.key = key;
      }

      label.updateLabel();
    }

    for (const label of this.shortLabels) {
      label.string = name;
    }
  }
}
