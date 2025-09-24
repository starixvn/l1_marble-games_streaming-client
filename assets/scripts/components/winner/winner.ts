import { _decorator, Component, Node } from "cc";
import Observer from "observer";
import { LocalizedLabel } from "db://i18n/LocalizedLabel";
import { Store } from "../../store";
import { t } from "db://i18n/LanguageData";
import { type TeamNameData, TeamNameStore } from "../../features/team-name/team-name-store";
import { type ResultData, ResultStore } from "../../features/result/result-store";

const { render, observer } = Observer;

const { ccclass, property, menu } = _decorator;

@ccclass
@menu("Winner")
@observer
export class Winner extends Component {
  @property(Node)
  private readonly home: Node = null;

  @property(Node)
  private readonly away: Node = null;

  @property(LocalizedLabel)
  private readonly label: LocalizedLabel = null;

  private homeCode = "";
  private awayCode = "";
  private operator = "Common";
  private winner = "";

  
  @render(TeamNameStore, (store) => store.data)
  syncTeamName(data: TeamNameData) {
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
    const homeScore = Object.values(data.result).reduce((acc, curr) => acc + curr.homeScore, 0);
    const awayScore = Object.values(data.result).reduce((acc, curr) => acc + curr.awayScore, 0);

    this.winner = homeScore >= awayScore
      ? this.homeCode
      : this.awayCode;

    this.render();
  }

  private render() {
    const homeWin = this.winner === this.homeCode;

    this.home.active = homeWin;
    this.away.active = !homeWin;

    const key = getWinnerKey(this.operator, this.winner);
    console.log(`get winner key operator : ${this.operator}, winner: ${this.winner}, key: ${key}`)

    if (t(key) === "") {
      this.label._key = `${this.operator}.${this.winner}`;
    } else {
      this.label._key = key;
    }
  }
}

function getWinnerKey(operator: string, winner: string) {
  return `Common.${winner}`;
}
