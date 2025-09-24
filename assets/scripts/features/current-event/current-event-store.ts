import { injectable } from "inversify";
import { BaseStoreImpl } from "../base/base-store";
import { store } from "../../store-decorator";

export interface CurrentEventData {
    event: number,
    eventDetailIndex: number,
    phase: number;
}

@injectable()
@store("CurrentEventStore")
export class CurrentEventStore extends BaseStoreImpl<CurrentEventData> {

}