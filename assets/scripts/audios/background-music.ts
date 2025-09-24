import { _decorator, AudioSource, Component } from "cc";
import Observer from "observer";
import { AudioStore } from "./audio-store";
import { GameFlowState, GameFlowStore } from "../features/game-flow/game-flow-store";

const { ccclass, property } = _decorator;
const { observer, render } = Observer;

@ccclass
@observer
export class BackgroundMusic extends Component {
  @property(AudioSource)
  audioSource: AudioSource = null;

  playing = false;
  muted = false;

  play() {
    if (!this.muted && this.playing && !this.audioSource.playing) {
      this.audioSource.play();
    }
  }

  pause() {
    this.audioSource.pause();
  }

  @render(AudioStore, (store) => ({
    muted: store.muted,
    browserBlocked: store.browserBlocked,
  }))
  syncMuted({
    muted,
    browserBlocked,
  }: {
    muted: boolean;
    browserBlocked: boolean;
  }) {
    this.muted = muted || browserBlocked;

    if (this.muted) {
      this.pause();
    } else {
      this.play();
    }
  }

  @render(GameFlowStore, (store) => store.data.state)
  renderEventData(state: GameFlowState) {
    switch (state) {
      case GameFlowState.Prebet:
      case GameFlowState.Result:
      case GameFlowState.HalfTime:
        this.playing = true;
        this.play();
        break;
      case GameFlowState.Streaming:
        this.playing = false;
        this.pause();
        break;
    }
  }
}
