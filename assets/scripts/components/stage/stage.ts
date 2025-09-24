import { _decorator, Component, Enum } from "cc";
import { FeatureStage } from "../../watchers/stages/stage-watcher";

const { ccclass, menu, property } = _decorator;

@ccclass
@menu("Stages/Stage")
export class Stage extends Component {
    @property({ type: Enum(FeatureStage) })
    stageName: FeatureStage = FeatureStage.Unknown;
}
