import { injectable } from "inversify";
import mobx from "mobx";

@injectable()
export class VideoStore {
  constructor() {
    mobx.makeAutoObservable(this);
  }

  url: string = "";

  videoLiveTime = 0;

  muted: boolean = false;

  defaultBackgroundEnabled: boolean = false;

  enableDefaultBackground(enable: boolean) {
    this.defaultBackgroundEnabled = enable;
  }

  setUrl(url: string) {
    this.url = url;
  }

  updateUrlFromEventData(url: string) {
    if (!url) {
      this.url = "";
      return;
    }

    this.url = url;
  }

  updateVideoTime(videoLiveTimeMs: number) {
    this.videoLiveTime = videoLiveTimeMs / 1000;
  }

  setMuted(muted: boolean) {
    this.muted = muted;
  }
}
