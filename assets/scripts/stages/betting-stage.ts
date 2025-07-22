import { _decorator } from "cc";
import Observer from "observer";
import { BettingStore } from "./betting-store";
import { LabelStage } from "./label-stage";

const { ccclass, menu } = _decorator;
const { observer, render } = Observer;

@ccclass
@menu("Stages/BettingStage")
@observer
export class BettingStage extends LabelStage {
  @render(BettingStore, (store) => store.label)
  syncLabelContent(text: string) {
    super.syncLabelContent(text);
  }
}
