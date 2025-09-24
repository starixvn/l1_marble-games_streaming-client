import { Container, Newable } from "inversify";
import { BaseHandler } from "../features/base/base-handler";

export const HANDLER_TYPES = Symbol.for("Handler");

class HandlerRegistry {
    private readonly handlers: Array<Newable<BaseHandler<any>>> = [];

    register(handlerConstructor: Newable<BaseHandler<any>>) {
        this.handlers.push(handlerConstructor);
    }

    bindAll(container: Container) {
        this.handlers.forEach(handler => {
            container.bind(HANDLER_TYPES).to(handler);
        });
    }

    getAll() {
        return [...this.handlers];
    }
}

export const handlerRegistry = new HandlerRegistry();

export function featureHandler<T extends Newable<BaseHandler<any>>>(constructor: T): T {
    handlerRegistry.register(constructor);
    return constructor;
}
