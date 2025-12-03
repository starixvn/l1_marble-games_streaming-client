import { _decorator, AudioClip, AudioSource, Component } from "cc";
import Observer from "observer";
import { SfxStore } from "../../local-stores/sfx/sfx-store";
const { ccclass, property } = _decorator;

const { observer, render } = Observer;

@ccclass("SfxContainer")
@observer
export class SfxContainer extends Component {
  @property(AudioSource)
  audioSource: AudioSource = null;

  @render(
    SfxStore,
    (store) => ({
      playingSfx: store.playingSfx,
    }),
    {
      fireImmediately: false,
    }
  )
  syncSfx({ playingSfx }: { playingSfx: AudioClip[] }) {
    if (!playingSfx) {
      return;
    }

    playingSfx.forEach((sfx) => {
      this.audioSource.clip = sfx;
      this.audioSource.playOneShot(sfx);
    });
  }
}
