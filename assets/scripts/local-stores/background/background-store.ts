import mobx from "mobx";

export class BackgroundStore {
    constructor() {
        mobx.makeAutoObservable(this);
    }

    isShowingBackground = false;

    showBackground(show: boolean) {
        this.isShowingBackground = show;
    }
}