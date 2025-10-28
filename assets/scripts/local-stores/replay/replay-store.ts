import { store } from "../../store-decorator";
import mobx from "mobx";

export interface ReplayPayload {
	meta: ReplayMeta;
	payload: ReplayItem[]
}
 
export interface ReplayMeta {
    fromTime: number;
    gameId: string;
}

export interface ReplayItem {
    time: number;
    payload: Record<string, object>;
}

@store("ReplayStore")
export class ReplayStore {
    replayData: ReplayPayload | null = null;

    constructor() {
        mobx.makeAutoObservable(this);
    }

    update(data: ReplayPayload) {
        this.replayData = data;
    }
}