import { inject } from "inversify";
import { featureHandler } from "../../handler-registry";
import { BaseHandlerImpl } from "../base/base-handler";
import { STopTimerData, StopTimerStore } from "./stop-timer-store";

@featureHandler
export class StopTimerHandler extends BaseHandlerImpl<STopTimerData> {
  name = "stopTimer";

  @inject(StopTimerStore)
  set store(store: StopTimerStore) {
    this._store = store;
  }
}
