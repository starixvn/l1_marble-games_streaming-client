import { injectable, multiInject } from "inversify";
import { HANDLER_TYPES } from "../handler-registry";
import { BaseHandler } from "../features/base/base-handler";



@injectable()
export class FeatureHandler {
    private _handlers: BaseHandler<any>[];

    @multiInject(HANDLER_TYPES) 
    set handlers(handlers: BaseHandler<any>[]) {
        this._handlers = handlers;
    }

    get handlers(): BaseHandler<any>[] {
        return this._handlers;
    }
 
    update(data: Record<string, any> ) {
        this.handlers.forEach(handler => {
            handler.handle(data);
        });
    }
}