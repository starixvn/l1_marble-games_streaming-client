import { _decorator, Component } from "cc";
import Observer from "observer";
import { VisibilityStore } from "../../local-stores/visibility/visibility-store";
import { inject } from "inversify";

const { ccclass } = _decorator;
const { observer } = Observer;

@observer
@ccclass("VisiblityControl")
export class VisibilityControl extends Component {

    @inject(VisibilityStore)
    visibilityStore: VisibilityStore;

    constructor() {
        super();
    }

    override onLoad() {
        document.addEventListener("visibilitychange", this.onVisibilityChange.bind(this));
    }

    onDestroy() {
        super.onDestroy();
        document.removeEventListener("visibilitychange", this.onVisibilityChange);
    }

    onVisibilityChange() {
        this.visibilityStore.setVisible(document.visibilityState === "visible");
    }
}