import { injectable } from "inversify";
import mobx from "mobx";
import { store } from "../store-decorator";
import { Phase } from "../streaming/streaming-type";

@injectable()
@store("VideoStore")
export class VideoStore {
  constructor() {
    mobx.makeAutoObservable(this);
  }

  url = "";

  videoLiveTime = 0;

  defaultBackgroundEnabled = false;

  currentPhase: Phase;

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

  updateCurrentPhase(currentPhase: Phase) {
    this.currentPhase = currentPhase;
  }

  update(data: { videoLiveTimeMs: number; currentPhase: Phase; url: string }) {
    this.updateVideoTime(data.videoLiveTimeMs);
    this.updateCurrentPhase(data.currentPhase);
    this.updateUrlFromEventData(data.url);
  }
}
