import { store } from "../../store-decorator";
import { injectable } from "inversify";
import { BaseStoreImpl } from "../base/base-store";

export interface LiveScoreData {
    homeScore: number;
    awayScore: number;
}

@injectable()
@store("LiveScoreStore")
export class LiveScoreStore extends BaseStoreImpl<LiveScoreData> {}