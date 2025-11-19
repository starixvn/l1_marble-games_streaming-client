import { store } from "../../store-decorator";
import { injectable } from "inversify";
import { BaseStoreImpl } from "../base/base-store";

export interface STopTimerData {
  stopTimer: boolean;
}

@injectable()
@store("StopTimerStore")
export class StopTimerStore extends BaseStoreImpl<STopTimerData> {
  data: STopTimerData = {
    stopTimer: false,
  };
}
