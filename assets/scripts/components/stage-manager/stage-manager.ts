import Observer from "observer";
import { _decorator, Component } from "cc";
import { Stage } from "../stage/stage";
import {
  FeatureStage,
  StageWatcher,
} from "../../watchers/stages/stage-watcher";
const { ccclass, menu, property } = _decorator;
const { observer, render } = Observer;

const STAGE_MAPPING = {
  [FeatureStage.Prebet]: "prebetting",
  [FeatureStage.Streaming]: "streaming",
  [FeatureStage.PhaseChange]: "halftime",
  [FeatureStage.Result]: "result",
  [FeatureStage.Intro]: "intro",
  [FeatureStage.Unknown]: "unknown",
};

@ccclass
@menu("Stages/StageManager")
@observer
export class StageManager extends Component {
  @property(Stage)
  targets: Stage[] = [];

  @render(StageWatcher, (stageWatcher) => stageWatcher.stage)
  syncStage(stage: FeatureStage) {
    const enablingTargets = this.targets.filter(
      (target) => target.stageName === stage
    );
    const disablingTargets = this.targets.filter(
      (target) => target.stageName !== stage
    );

    for (const target of enablingTargets) {
      target.node.active = true;
    }

    for (const target of disablingTargets) {
      target.node.active = false;
    }
  }
}
