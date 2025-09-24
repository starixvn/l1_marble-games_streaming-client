import { injectable } from "inversify";
import mobx from "mobx";
import { store } from "../../store-decorator";

@injectable()
@store("VisibilityStore")
export class VisibilityStore {
    constructor() {
        mobx.makeAutoObservable(this);
        document.addEventListener("visibilitychange", this.onVisibilityChange.bind(this)); 
        // we cannot use cocos onLoad on composition component because it won't be called
        // when dom hidden
    }

    isVisible = true;

    setVisible(visible: boolean) {
        this.isVisible = visible;
    }

    onVisibilityChange() {
        this.setVisible(document.visibilityState === "visible");
    }
}