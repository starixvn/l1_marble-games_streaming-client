import { injectable } from "inversify";
import { store } from "../../store-decorator";
import { BaseStoreImpl } from "../base/base-store";

export interface LiveScoreData {
  homeScore: number;
  awayScore: number;
  isHomeScoreChanged?: boolean;
}

@injectable()
@store("LiveScoreStore")
export class LiveScoreStore extends BaseStoreImpl<LiveScoreData> {}
