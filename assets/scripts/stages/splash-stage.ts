import { _decorator } from "cc";
import Observer from "observer";
import { LabelStage } from "./label-stage";
import { SplashStore } from "./splash-store";

const { ccclass, menu } = _decorator;
const { observer, render } = Observer;

@ccclass
@menu("Stages/SplashStage")
@observer
export class SplashStage extends LabelStage {
  @render(SplashStore, (store) => store.label)
  syncLabelContent(text: string) {
    super.syncLabelContent(text);
  }
}
