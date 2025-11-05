import { _decorator } from "cc";
import { LocalizedLabel } from "db://i18n/LocalizedLabel";
import { Winner } from "../winner";

const { ccclass, property } = _decorator;

@ccclass
export class Winner2004 extends Winner {
  @property({ type: LocalizedLabel, override: true, visible: false })
  label: LocalizedLabel = null;

  @property(LocalizedLabel)
  homeTextLabel: LocalizedLabel = null;

  @property(LocalizedLabel)
  awayTextLabel: LocalizedLabel = null;

  protected override setLabelKey(key: string) {
    this.homeTextLabel._key = key;
    this.awayTextLabel._key = key;
  }
}
