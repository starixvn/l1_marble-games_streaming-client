import { inject, injectable } from "inversify";
import { BaseHandlerImpl } from "../base/base-handler";
import { LiveScoreData, LiveScoreStore } from "./live-score-store";
import { featureHandler } from "../../handler-registry";

@injectable()
@featureHandler
export class LiveScoreHandler extends BaseHandlerImpl<LiveScoreData> {
    name = "liveScore";
    @inject(LiveScoreStore) 
    readonly store: LiveScoreStore
}