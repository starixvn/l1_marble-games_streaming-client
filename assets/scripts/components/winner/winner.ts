import { _decorator, Component, Node } from "cc";
import { LocalizedLabel } from "db://i18n/LocalizedLabel";
import Observer from "observer";
import { FunctionUtils } from "../../common/utils/function-utils";
import {
  type ResultData,
  ResultStore,
} from "../../features/result/result-store";
import {
  type TeamNameData,
  TeamNameStore,
} from "../../features/team-name/team-name-store";
import { Store } from "../../store";

const { render, observer, handle } = Observer;

const { ccclass, property, menu } = _decorator;

@ccclass
@menu("Winner")
@observer
export class Winner extends Component {
  @property(Node)
  home: Node = null;

  @property(Node)
  away: Node = null;

  @property(LocalizedLabel)
  label: LocalizedLabel = null;

  protected homeCode = "";
  protected awayCode = "";
  protected operator = "Common";
  protected winner = "";
  protected gameId = "";

  @render(TeamNameStore, (store) => store.data)
  syncTeamName(data: TeamNameData) {
    if (!data) {
      return;
    }

    this.homeCode = data.homeTeamName;
    this.awayCode = data.awayTeamName;

    this.render();
  }

  @render(Store, (store) => store.operator)
  syncOperator(operator: string) {
    this.operator = operator;

    this.render();
  }

  @render(ResultStore, (store) => store.data)
  updateWinner(data: ResultData) {
    if (!data?.result) {
      return;
    }

    const homeScore = Object.values(data.result).reduce(
      (acc, curr) => acc + curr.homeScore,
      0
    );
    const awayScore = Object.values(data.result).reduce(
      (acc, curr) => acc + curr.awayScore,
      0
    );

    this.winner = homeScore >= awayScore ? this.homeCode : this.awayCode;
    this.render();
  }

  protected render() {
    const homeWin = this.winner === this.homeCode;

    this.home.active = homeWin;
    this.away.active = !homeWin;

    const key = FunctionUtils.getLocalizedKey(this.operator, this.winner);
    this.setLabelKey(key);
  }

  protected setLabelKey(key: string) {
    this.label._key = key;
  }
}
