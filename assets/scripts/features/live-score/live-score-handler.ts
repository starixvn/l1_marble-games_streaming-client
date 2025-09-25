import { inject } from "inversify";
import { BaseHandlerImpl } from "../base/base-handler";
import { LiveScoreData, LiveScoreStore } from "./live-score-store";
import { featureHandler } from "../../handler-registry";

@featureHandler
export class LiveScoreHandler extends BaseHandlerImpl<LiveScoreData> {
    name = "liveScore";

    @inject(LiveScoreStore) 
    set store(store: LiveScoreStore) {
        this._store = store;
    }
}