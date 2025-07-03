import { _decorator, Component, game } from "cc";
import Observer from "observer";
import { BackgroundVideoPlayer } from "./background-video-player";

const { ccclass, requireComponent } = _decorator;
const { observer } = Observer;

@ccclass("BackgroundVideoSoundControl")
@requireComponent(BackgroundVideoPlayer)
@observer
export class BackgroundVideoSoundControl extends Component {
  private videoPlayer: BackgroundVideoPlayer;
  private touched = false;
  onLoad(): void {
    this.videoPlayer = this.node.getComponent(BackgroundVideoPlayer);

    const canvas = game.canvas;
    canvas.addEventListener("touchstart", this.onTouch.bind(this));
    canvas.addEventListener("mousedown", this.onMouse.bind(this));
  }

  private updateMusicStatus(musicEnable: boolean) {
    this.syncMuted(!musicEnable);
    if (this.touched) {
      this.videoPlayer.setNativeMuted();
    }
  }

  onMouse() {
    this.touched = true;
    this.videoPlayer.setNativeMuted();
  }

  onTouch() {
    this.touched = true;
    this.videoPlayer.setNativeMuted();
  }

  private syncMuted(isMute = false) {
    this.videoPlayer.muted = isMute;
  }
}
