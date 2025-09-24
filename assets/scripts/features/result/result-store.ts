import { injectable } from "inversify";
import { BaseStoreImpl } from "../base/base-store";
import { store } from "../../store-decorator";

interface HalfResult {
    homeScore: number;
    awayScore: number;
}

export interface ResultData {
    result: Record<number, HalfResult>;
}

@injectable()
@store("ResultStore")
export class ResultStore extends BaseStoreImpl<ResultData> {}