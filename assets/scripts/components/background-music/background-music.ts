import { _decorator, AudioSource, Component } from "cc";
import Observer from "observer";
import { BackgroundMusicStore } from "../../local-stores/background-music/background-music-store";
const { ccclass, property } = _decorator;
const { observer, render } = Observer;

@ccclass
@observer
export class BackgroundMusic extends Component {
  @property(AudioSource)
  audioSource: AudioSource = null;

  isPlaying = false;

  @render(BackgroundMusicStore, (store) => store.isPlaying)
  renderEventData(isPlaying: boolean) {
    this.isPlaying = isPlaying;
    if (isPlaying) {
      this.play();
      return;
    }
    this.pause();
  }

  play() {
    if (this.audioSource.playing || !this.isPlaying) {
      return;
    }
    this.audioSource.play();
  }

  pause() {
    this.audioSource.stop();
  }
}
