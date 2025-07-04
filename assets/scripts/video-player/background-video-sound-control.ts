import { _decorator, Component, game } from "cc";
import Observer from "observer";
import { BackgroundVideoPlayer } from "./background-video-player";
import { canPlayAudio, initializeAudio } from "./dom-audio-checker";
import { VideoStore } from "./video-store";

const { ccclass, requireComponent } = _decorator;
const { observer, render } = Observer;

@ccclass("BackgroundVideoSoundControl")
@requireComponent(BackgroundVideoPlayer)
@observer
export class BackgroundVideoSoundControl extends Component {
  private videoPlayer: BackgroundVideoPlayer;
  private muted = false;

  @render(VideoStore, (store) => ({ muted: store.muted, video: store.url }))
  private async setMuted({ muted }: { muted: boolean }) {
    this.muted = muted;

    const canPlay = await canPlayAudio();

    if (canPlay) {
      this.videoPlayer.muted = this.muted;
    }
  }

  onLoad(): void {
    initializeAudio(() => {
      this.videoPlayer.muted = this.muted;
    });

    this.videoPlayer = this.node.getComponent(BackgroundVideoPlayer);

    const canvas = game.canvas;
    canvas.addEventListener("touchstart", this.onTouch.bind(this));
    canvas.addEventListener("mousedown", this.onTouch.bind(this));
  }

  onTouch() {
    this.videoPlayer.muted = this.muted;
  }
}
