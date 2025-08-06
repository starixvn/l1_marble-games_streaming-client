import { _decorator, Component, game } from "cc";
import Observer from "observer";
import { BackgroundVideoPlayer } from "./background-video-player";
import { initializeAudio } from "./dom-audio-checker";
import { AudioStore } from "../audios/audio-store";

const { ccclass, requireComponent } = _decorator;
const { observer, render, handle } = Observer;

@ccclass("BackgroundVideoSoundControl")
@requireComponent(BackgroundVideoPlayer)
@observer
export class BackgroundVideoSoundControl extends Component {
  private videoPlayer: BackgroundVideoPlayer;

  onLoad(): void {
    initializeAudio(() => {
      this.setBrowserBlocked(false);
    });

    this.videoPlayer = this.node.getComponent(BackgroundVideoPlayer);

    const canvas = game.canvas;
    canvas.addEventListener("touchstart", this.onTouch.bind(this));
    canvas.addEventListener("mousedown", this.onTouch.bind(this));
  }

  onTouch() {
    this.setBrowserBlocked(false);
  }

  @handle(AudioStore, (store, browserBlocked: boolean) =>
    store.setBrowserBlocked(browserBlocked)
  )
  private setBrowserBlocked(browserBlocked: boolean) {
    return browserBlocked;
  }

  @render(AudioStore, (store) => ({
    muted: store.muted,
    browserBlocked: store.browserBlocked,
  }))
  private syncAudioMuted({
    muted,
    browserBlocked,
  }: {
    muted: boolean;
    browserBlocked: boolean;
  }) {
    this.videoPlayer.muted = muted || browserBlocked;
  }
}
