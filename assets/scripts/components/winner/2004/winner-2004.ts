import { _decorator } from "cc";
import { t } from "db://i18n/LanguageData";
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

  protected setLabelKey(key: string) {
    if (t(key) === "") {
      this.homeTextLabel._key = `${this.operator}.${this.winner}`;
      this.awayTextLabel._key = `${this.operator}.${this.winner}`;
    } else {
      this.homeTextLabel._key = key;
      this.awayTextLabel._key = key;
    }
  }
}
