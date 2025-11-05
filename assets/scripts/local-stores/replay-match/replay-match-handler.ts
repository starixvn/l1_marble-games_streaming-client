import { inject, injectable } from "inversify";
import { Store } from "../../store";
import { ReplayMatchPayload, ReplayMatchStore } from "./replay-match-store";

@injectable()
export class ReplayMatchHandler {
  private _store: Store;
  private _replayStore: ReplayMatchStore;

  @inject(ReplayMatchStore)
  set replayStore(replayStore: ReplayMatchStore) {
    this._replayStore = replayStore;
  }

  @inject(Store)
  set store(store: Store) {
    this._store = store;
  }

  connect() {
    void this.fetchEventReplay();
  }

  async fetchEventReplay() {
    const response = await fetch(this._store.replayUrl);
    const json: ReplayMatchPayload = await response.json();
    this._replayStore.update(json);
  }
}
