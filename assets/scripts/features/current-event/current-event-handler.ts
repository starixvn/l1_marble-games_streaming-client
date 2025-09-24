import { inject, injectable } from "inversify";
import { featureHandler } from "../../handler-registry";
import { BaseHandlerImpl } from "../base/base-handler";
import { CurrentEventData, CurrentEventStore } from "./current-event-store";

@injectable()
@featureHandler
export class CurrentEventHandler extends BaseHandlerImpl<CurrentEventData> {
    name = "currentEvent";

    @inject(CurrentEventStore) 
    set store(store: CurrentEventStore) {
        super.store = store;
    }
}