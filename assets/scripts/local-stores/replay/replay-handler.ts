import { inject, injectable } from "inversify";
import { Store } from "../../store";
import { ReplayPayload, ReplayStore } from "./replay-store";

@injectable()
export class ReplayHandler {
    private _store: Store;
    private _replayStore: ReplayStore;
    
    @inject(ReplayStore)
    set replayStore(replayStore: ReplayStore) {
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
        const json: ReplayPayload = await response.json();
        this._replayStore.update(json);
    }
}
