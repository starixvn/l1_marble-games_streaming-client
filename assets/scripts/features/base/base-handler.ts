import { BaseStoreImpl } from "./base-store";

export interface BaseHandler<T> {
    name: string;
    handle(data: Record<string, any>): void;
    update(data: T): void;
}

export abstract class BaseHandlerImpl<T> implements BaseHandler<T> {
    abstract name: string;

    protected _store: BaseStoreImpl<T>;

    get store(): BaseStoreImpl<T> {
        return this._store;
    }

    set store(store: BaseStoreImpl<T>) {
        this._store = store;
    }

    public handle(data: T): void {
        const value = data[this.name];
        if (value) {
            this.update(value);
        }
    }

    public update(data: T) {
        this._store.update(data);
    }
}