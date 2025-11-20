import { inject, injectable } from "inversify";
import {
  GameFlowState,
  GameFlowStore,
} from "../../features/game-flow/game-flow-store";

export enum FeatureStage {
  Unknown,
  Prebet,
  Streaming,
  EventDetailChange,
  PhaseChange,
  Result,
  Intro,
}

@injectable()
export class StageWatcher {
  private _gameFlowStore: GameFlowStore;

  @inject(GameFlowStore)
  set gameFlowStore(store: GameFlowStore) {
    this._gameFlowStore = store;
  }

  get gameFlowStore(): GameFlowStore {
    return this._gameFlowStore;
  }

  private readonly stageMapper = new Map<GameFlowState, FeatureStage>([
    [GameFlowState.Prebet, FeatureStage.Prebet],
    [GameFlowState.Streaming, FeatureStage.Streaming],
    [GameFlowState.EventDetailChange, FeatureStage.EventDetailChange],
    [GameFlowState.PhaseChange, FeatureStage.PhaseChange],
    [GameFlowState.Result, FeatureStage.Result],
    [GameFlowState.Unknown, FeatureStage.Unknown],
  ]);

  get stage() {
    return (
      this.stageMapper.get(this.gameFlowStore.data.state) ??
      FeatureStage.Unknown
    );
  }

  get isVideoPlaying() {
    return (
      this.stage === FeatureStage.Intro || this.stage === FeatureStage.Streaming
    );
  }
}
