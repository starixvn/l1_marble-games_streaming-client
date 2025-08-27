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

  play = false;

  url = "";
  halfIndex = 0;

  videoLiveTime = 0;

  defaultBackgroundEnabled = false;

  currentPhase: Phase;

  enableDefaultBackground(enable: boolean) {
    this.defaultBackgroundEnabled = enable;
  }

  setPlay(play: boolean) {
    this.play = play;
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

  updateHalfIndex(halfIndex: number) {
    this.halfIndex = halfIndex;
  }

  updateVideoTime(videoLiveTimeMs: number) {
    this.videoLiveTime = videoLiveTimeMs / 1000;
  }

  updateCurrentPhase(currentPhase: Phase) {
    this.currentPhase = currentPhase;
  }

  update(data: { videoLiveTimeMs: number; currentPhase: Phase; url: string; halfIndex: number }) {
    this.updateVideoTime(data.videoLiveTimeMs);
    this.updateCurrentPhase(data.currentPhase);
    this.updateUrlFromEventData(data.url);
    this.updateHalfIndex(data.halfIndex);
  }
}
