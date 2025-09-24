import { injectable, multiInject } from "inversify";
import { HANDLER_TYPES } from "../handler-registry";
import { BaseHandler } from "../features/base/base-handler";

@injectable()
export class FeatureHandler {
    @multiInject(HANDLER_TYPES) 
    private readonly handlers: BaseHandler<any>[]
 
    update(data: Record<string, any>) {
        this.handlers.forEach(handler => {
            handler.handle(data);
        });
    }
}