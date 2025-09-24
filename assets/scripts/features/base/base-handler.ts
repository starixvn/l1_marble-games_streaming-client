import { BaseStoreImpl } from "./base-store";

export interface BaseHandler<T> {
    name: string;
    handle(data: Record<string, any>): void;
    update(data: T): void;
}

export abstract class BaseHandlerImpl<T> implements BaseHandler<T> {
    abstract name: string;

    abstract readonly store: BaseStoreImpl<T>;

    public handle(data: T): void {
        const value = data[this.name];
        if (value) {
            this.update(value);
        }
    }

    public update(data: T) {
        this.store.update(data);
    }

}