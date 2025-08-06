import { _decorator, Component, Toggle } from "cc";
import Observer from "observer";
import { AudioStore } from "./audio-store";

const { ccclass, property } = _decorator;
const { observer, render, handle } = Observer;

@ccclass
@observer
export class SoundToggle extends Component {
  @property(Toggle)
  soundToggle: Toggle = null;

  onToggleSound() {
    const muted = !this.soundToggle.isChecked;

    this.setMuted(muted);
  }

  @handle(AudioStore, (store, muted: boolean) => store.setMuted(muted))
  private setMuted(muted: boolean) {
    return muted;
  }
}
