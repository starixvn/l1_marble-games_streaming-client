import { _decorator, CCInteger, Component, Node } from "cc";
import Observer from "observer";
import { AnimationUtils, FunctionUtils } from "../../common/utils";
import {
  type CurrentEventData,
  CurrentEventStore,
} from "../../features/current-event/current-event-store";
import {
  type GameFlowData,
  GameFlowState,
  GameFlowStore,
} from "../../features/game-flow/game-flow-store";
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
  protected currentPhase = 0;
  protected durationAppear = 0.5;

  @render(CurrentEventStore, (store) => store.data)
  syncCurrentPhase(data: CurrentEventData) {
    if (!data) {
      return;
    }

    this.currentPhase = data.phase;
  }

  @render(GameFlowStore, (store) => store.data)
  protected syncStage(data: GameFlowData | null | undefined) {
    if (!data) {
      return;
    }

    if (
      data.state === GameFlowState.Result &&
      data.durationMs != null &&
      data.durationMs > 0
    ) {
      this.scheduleAutoHideActiveNode(
        FunctionUtils.msToSeconds(data.durationMs)
      );
    }
  }

  @render(ResultStore, (store) => store.data)
  syncResult(data: ResultData) {
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
    const statusNodePairs: Array<[FullTimeDisplayStatus, Node]> = [
      [FullTimeDisplayStatus.Fulltime, this.fulltime],
      [FullTimeDisplayStatus.Result, this.result],
      [FullTimeDisplayStatus.Draw, this.draw],
    ];

    for (const [status, node] of statusNodePairs) {
      const isActive = status === this.status;
      if (isActive) {
        AnimationUtils.fadeInAndActivate(node, this.durationAppear);
      } else {
        AnimationUtils.fadeOutAndDeactivate(node, 0);
      }
    }
  }

  private cleanup() {
    this.unschedule(this.displayResult);
  }

  protected scheduleAutoHideActiveNode(duration: number) {
    this.scheduleOnce(() => {
      AnimationUtils.fadeOutAndDeactivate(this.getNodeActive(), 1);
    }, duration - 1);
  }

  protected getNodeActive() {
    switch (this.status) {
      case FullTimeDisplayStatus.Fulltime:
        return this.fulltime;
      case FullTimeDisplayStatus.Result:
        return this.result;
      case FullTimeDisplayStatus.Draw:
        return this.draw;

      default:
        return null;
    }
  }
}
