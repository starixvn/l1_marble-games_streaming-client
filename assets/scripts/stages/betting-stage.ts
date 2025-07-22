import { _decorator, Label } from "cc";
import Observer from "observer";
import { BettingStore } from "./betting-store";
import { Stage } from "./stage";

const { ccclass, property, menu } = _decorator;
const { observer, render } = Observer;

@ccclass
@menu("Stages/BettingStage")
@observer
export class BettingStage extends Stage {
  @property(Label)
  label: Label = null;

  @render(BettingStore, (store) => store.label)
  syncLabelContent(text: string) {
    if (this.label) {
      this.label.string = text;
    }
  }
}
