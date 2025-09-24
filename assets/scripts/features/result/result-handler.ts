import { inject,injectable } from "inversify";
import { BaseHandlerImpl } from "../base/base-handler";
import { ResultData, ResultStore } from "./result-store";
import { featureHandler } from "../../handler-registry";

@injectable()
@featureHandler
export class ResultHandler extends BaseHandlerImpl<ResultData> {
    name = "result";
    @inject(ResultStore) 
    readonly store: ResultStore;

    override update(data: ResultData): void {
        super.update(data);
        console.log(`sync result data: ${JSON.stringify(data)}`);
    }
}