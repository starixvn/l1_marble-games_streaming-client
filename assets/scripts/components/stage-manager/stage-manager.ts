import { _decorator, CCInteger, Component } from "cc";
import Observer from "observer";
import { AnimationUtils } from "../../common/utils";
import {
  FeatureStage,
  StageWatcher,
} from "../../watchers/stages/stage-watcher";
import { Stage } from "../stage/stage";
const { ccclass, menu, property } = _decorator;
const { observer, render } = Observer;

@ccclass
@menu("Stages/StageManager")
@observer
export class StageManager extends Component {
  @property(Stage)
  targets: Stage[] = [];

  @property(CCInteger)
  fadeInDuration = 0.5;

  @property(CCInteger)
  fadeOutDuration = 0.2;

  @render(StageWatcher, (stageWatcher) => stageWatcher.stage)
  syncStage(stage: FeatureStage) {
    const enablingTargets = this.targets.filter(
      (target) => target.stageName === stage
    );
    const disablingTargets = this.targets.filter(
      (target) => target.stageName !== stage
    );

    for (const target of enablingTargets) {
      AnimationUtils.fadeInAndActivate(target.node, this.fadeInDuration);
    }

    for (const target of disablingTargets) {
      AnimationUtils.fadeOutAndDeactivate(target.node, this.fadeOutDuration);
    }
  }
}
