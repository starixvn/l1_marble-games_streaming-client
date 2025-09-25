import { inject } from "inversify";
import { BaseHandlerImpl } from "../base/base-handler";
import { ResultData, ResultStore } from "./result-store";
import { featureHandler } from "../../handler-registry";

@featureHandler
export class ResultHandler extends BaseHandlerImpl<ResultData> {
    name = "result";

    @inject(ResultStore) 
    set store(store: ResultStore) {
        this._store = store;
    }
}