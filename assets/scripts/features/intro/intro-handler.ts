import { inject } from "inversify";
import { BaseHandlerImpl } from "../base/base-handler";
import { IntroData, IntroStore } from "./intro-store";
import { featureHandler } from "../../handler-registry";

@featureHandler
export class IntroHandler extends BaseHandlerImpl<IntroData> {
  name = "intro";

  @inject(IntroStore)
  set store(store: IntroStore) {
    this._store = store;
  }
}
