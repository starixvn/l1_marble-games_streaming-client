import { _decorator, Node } from "cc";
import Observer from "observer";
import { StreamingStore } from "../streaming/streaming-store";
import { Stage } from "./stage";
import { LocalizedLabel } from "db://i18n/LocalizedLabel";
import { Store } from "../store";
import { t } from "db://i18n/LanguageData";
import type { Result } from "../streaming/streaming-type";

const { render, observer } = Observer;

const { ccclass, property, menu } = _decorator;

@ccclass
@menu("Stages/Result Stage")
@observer
export class ResultStage extends Stage {
  @property(Node)
  private readonly home: Node = null;

  @property(Node)
  private readonly away: Node = null;

  @property(LocalizedLabel)
  private readonly label: LocalizedLabel = null;

  private result: Result = null;
  private homeCode = "";
  private awayCode = "";
  private operator = "";

  @render(StreamingStore, (store) => store.result)
  private updateResult(result: Result) {
    this.result = result;

    this.render();
  }

  @render(Store, (store) => store.operator)
  private syncOperator(operator: string) {
    this.operator = operator;

    this.render();
  }

  @render(StreamingStore, (store) => ({
    homeCode: store.eventData.homeTeam,
    awayCode: store.eventData.awayTeam,
  }))
  private updateHomeCode(data: { homeCode: string; awayCode: string }) {
    this.homeCode = data.homeCode;
    this.awayCode = data.awayCode;

    this.render();
  }

  private render() {
    const isDraw = this.result === "D" || this.result === null;

    if (isDraw) {
      this.home.active = false;
      this.away.active = false;
      return;
    }

    const homeWin = this.result === "H";

    const winner = homeWin ? this.homeCode : this.awayCode;

    this.home.active = homeWin;
    this.away.active = !homeWin;

    const key = getWinnerKey(this.operator, winner);

    if (t(key) === "") {
      this.label._key = `Common.${winner}`;
    } else {
      this.label._key = key;
    }
  }
}

function getWinnerKey(operator: string, winner: string) {
  return `${operator}.${winner}`;
}
