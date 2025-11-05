import { inject } from "inversify";
import { featureHandler } from "../../handler-registry";
import { BaseHandlerImpl } from "../base/base-handler";
import { LiveScoreData, LiveScoreStore } from "./live-score-store";

@featureHandler
export class LiveScoreHandler extends BaseHandlerImpl<LiveScoreData> {
  private _previous: LiveScoreData | null = null;
  name = "liveScore";

  @inject(LiveScoreStore)
  set store(store: LiveScoreStore) {
    this._store = store;
  }

  public override update(data: LiveScoreData) {
    const previous = this._previous;
    const isHomeScoreChanged = previous
      ? data.homeScore !== previous.homeScore
      : false;
    super.update({
      ...data,
      ...(previous ? { isHomeScoreChanged } : {}),
    });
    this._previous = data;
  }
}
