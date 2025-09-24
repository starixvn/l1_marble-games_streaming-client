import mobx from "mobx";

export interface BaseStore<T> {
    data: T | null;
    update(data: T): void;
}

export abstract class BaseStoreImpl<T> implements BaseStore<T> {
    data: T | null = null;

    constructor() {
        mobx.makeObservable(this,{
            data: mobx.observable,
            update: mobx.action,
        })
    }

    public update(data: T) {
        this.data = data;
    }
}