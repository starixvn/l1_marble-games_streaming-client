import { injectable } from "inversify";
import { store } from "../../store-decorator";
import { BaseStoreImpl } from "../base/base-store";

export enum GameFlowState {
  Unknown = "Unknown",
  Prebet = "Prebet",
  Streaming = "Streaming",
  EventDetailChange = "EventDetailChange",
  Result = "Result",
  PhaseChange = "PhaseChange",
}

export interface GameFlowData {
  state: GameFlowState;
  durationMs?: number;
}

@injectable()
@store("GameFlowStore")
export class GameFlowStore extends BaseStoreImpl<GameFlowData> {
  data: GameFlowData = {
    state: GameFlowState.Unknown,
  };
}
