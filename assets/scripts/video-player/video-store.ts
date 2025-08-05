import { inject, injectable } from "inversify";
import mobx from "mobx";
import { StreamingStore } from "../streaming/streaming-store";
import { Phase } from "../streaming/streaming-type";
@injectable()
export class VideoStore {
  @inject(StreamingStore) private readonly streamingStore: StreamingStore;

  constructor() {
    mobx.makeAutoObservable(this);
  }

  url: string = "";

  videoLiveTime = 0;

  muted: boolean = false;

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
