import { inject } from "inversify";
import { featureHandler } from "../../handler-registry";
import { BaseHandlerImpl } from "../base/base-handler";
import { CurrentEventData, CurrentEventStore } from "./current-event-store";

@featureHandler
export class CurrentEventHandler extends BaseHandlerImpl<CurrentEventData> {
    name = "currentEvent";

    @inject(CurrentEventStore) 
    set store(store: CurrentEventStore) {
        this._store = store;
    }
}