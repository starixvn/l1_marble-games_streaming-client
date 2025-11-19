import { _decorator, CCInteger, Component, Node } from "cc";
import Observer from "observer";
import {
  type CurrentEventData,
  CurrentEventStore,
} from "../../features/current-event/current-event-store";
import {
  type ResultData,
  ResultStore,
} from "../../features/result/result-store";

const { ccclass, property, menu } = _decorator;

const { render, observer } = Observer;

export enum FullTimeDisplayStatus {
  Fulltime,
  Result,
  Draw,
}

@ccclass
@menu("FulltimeManager")
@observer
export class FulltimeManager extends Component {
  private status: FullTimeDisplayStatus = FullTimeDisplayStatus.Fulltime;

  @property(Node)
  fulltime: Node = null;

  @property(Node)
  result: Node = null;

  @property(Node)
  draw: Node = null;

  @property(CCInteger)
  timeToDisplayResult = 5;

  isDraw = false;

  currentPhase = 0;

  @render(CurrentEventStore, (store) => store.data)
  syncCurrentPhase(data: CurrentEventData) {
    this.currentPhase = data.phase;
  }

  @render(ResultStore, (store) => store.data)
  syncResult(data: ResultData) {
    const homeScore = Object.values(data.result).reduce(
      (acc, curr) => acc + curr.homeScore,
      0
    );
    const awayScore = Object.values(data.result).reduce(
      (acc, curr) => acc + curr.awayScore,
      0
    );
    this.isDraw = homeScore === awayScore;
  }

  protected onEnable(): void {
    this.status = FullTimeDisplayStatus.Fulltime;
    this.updateUI();
    this.scheduleOnce(this.displayResult.bind(this), this.timeToDisplayResult);
  }

  displayResult() {
    this.status = this.isDraw
      ? FullTimeDisplayStatus.Draw
      : FullTimeDisplayStatus.Result;
    this.updateUI();
  }

  protected onDisable(): void {
    this.cleanup();
  }

  protected onDestroy(): void {
    super.onDestroy();
    this.cleanup();
  }

  updateUI() {
    this.fulltime.active = this.status === FullTimeDisplayStatus.Fulltime;
    this.result.active = this.status === FullTimeDisplayStatus.Result;
    this.draw.active = this.status === FullTimeDisplayStatus.Draw;
  }

  private cleanup() {
    this.unschedule(this.displayResult);
  }
}
