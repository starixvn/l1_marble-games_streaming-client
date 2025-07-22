import { _decorator, Label } from "cc";
import Observer from "observer";
import { SplashStore } from "./splash-store";
import { Stage } from "./stage";

const { ccclass, property, menu } = _decorator;
const { observer, render } = Observer;

@ccclass
@menu("Stages/SplashStage")
@observer
export class SplashStage extends Stage {
  @property(Label)
  label: Label = null;

  @render(SplashStore, (store) => store.label)
  syncLabelContent(text: string) {
    if (this.label) {
      this.label.string = text;
    }
  }
}
