import mobx from "mobx";
import { store } from "../../store-decorator";

export interface ReplayMatchPayload {
  meta: ReplayMatchMeta;
  payload: ReplayMatchItem[];
}

export interface ReplayMatchMeta {
  fromTime: number;
  gameId: string;
}

export interface ReplayMatchItem {
  time: number;
  payload: Record<string, object>;
}

@store("ReplayMatchStore")
export class ReplayMatchStore {
  replayData: ReplayMatchPayload | null = null;

  constructor() {
    mobx.makeAutoObservable(this);
  }

  update(data: ReplayMatchPayload) {
    this.replayData = data;
  }
}
