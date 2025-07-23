import { _decorator } from "cc";
import { LocalizedLabel } from "db://i18n/LocalizedLabel";
import { Stage } from "./stage";

const { ccclass, property, menu } = _decorator;

@ccclass
@menu("Stages/HalftimeStage")
export class HalftimeStage extends Stage {
  @property(LocalizedLabel)
  label: LocalizedLabel = null;

  syncLabelContent(text: string) {
    if (this.label) {
      this.label.key = text;
    }
  }

  onFocusInEditor(): void {
    const label = this.getComponentInChildren(LocalizedLabel);

    if (label) {
      this.label = label;
    }
  }
}
