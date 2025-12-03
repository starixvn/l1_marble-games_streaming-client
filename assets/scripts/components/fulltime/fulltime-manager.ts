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
import { SfxStore } from "../../local-stores/sfx/sfx-store";

const { ccclass, property, menu } = _decorator;

const { render, observer, handle } = Observer;

export enum FullTimeDisplayStatus {
  Result,
  Winner,
  Draw,
  None,
}

@ccclass
@menu("FulltimeManager")
@observer
export class FulltimeManager extends Component {
  protected status: FullTimeDisplayStatus = FullTimeDisplayStatus.None;

  @property(Node)
  result: Node = null;

  @property(Node)
  winner: Node = null;

  @property(Node)
  draw: Node = null;

  @property(CCInteger)
  timeToDisplayResult = 5;

  isDraw = false;
  protected currentPhase = 0;
  protected durationAppear = 0.5;
  protected gameId = "";
  protected gameFlowData: GameFlowData | null = null;

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
      this.scheduleAutoHideNode(FunctionUtils.msToSeconds(data.durationMs));
      this.status = FullTimeDisplayStatus.Result;
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
    this.status = FullTimeDisplayStatus.Result;
    this.updateUI();
    this.scheduleOnce(this.displayResult.bind(this), this.timeToDisplayResult);
  }

  displayResult() {
    this.status = this.isDraw
      ? FullTimeDisplayStatus.Draw
      : FullTimeDisplayStatus.Winner;
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
      [FullTimeDisplayStatus.Result, this.result],
      [FullTimeDisplayStatus.Winner, this.winner],
      [FullTimeDisplayStatus.Draw, this.draw],
    ];

    for (const [status, node] of statusNodePairs) {
      const isActive = status === this.status;
      if (isActive) {
        AnimationUtils.fadeInAndActivate(node, this.durationAppear);
        this.gameFlowData?.state === GameFlowState.Result &&
          this.handlePlaySfx();
      } else {
        AnimationUtils.fadeOutAndDeactivate(node, 0);
      }
    }
  }

  private cleanup() {
    this.unschedule(this.displayResult);
  }

  protected scheduleAutoHideNode(duration: number) {
    this.scheduleOnce(() => {
      AnimationUtils.fadeOutAndDeactivate(this.getNodeActive(), 1);
    }, duration - 1);
  }

  protected getNodeActive() {
    switch (this.status) {
      case FullTimeDisplayStatus.Result:
        return this.result;
      case FullTimeDisplayStatus.Winner:
        return this.winner;
      case FullTimeDisplayStatus.Draw:
        return this.draw;

      default:
        return null;
    }
  }

  protected handlePlaySfx() {}

  @handle(SfxStore, (store, sfx: string) => store.playSfx(sfx))
  protected playSfx(sfx: string) {
    return sfx;
  }

  @render(GameFlowStore, (store) => store.data)
  preloadAndPlayIntro(gameFlowData: GameFlowData) {
    if (!gameFlowData) {
      return;
    }
    this.gameFlowData = gameFlowData;
  }
}
