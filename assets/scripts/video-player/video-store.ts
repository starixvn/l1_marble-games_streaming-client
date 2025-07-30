import { inject, injectable } from "inversify";
import mobx from "mobx";
import { StreamingStore } from "../streaming/streaming-store";
import { Phase } from "../streaming/streaming-type";
@injectable()
export class VideoStore {
  @inject(StreamingStore) private readonly streamingStore: StreamingStore;

  constructor() {
    mobx.makeAutoObservable(this);

    mobx.reaction(
      () => this.streamingStore?.eventData?.currentPhase,
      (currentPhase) => {
        if (currentPhase === Phase.UpdateVideoInfo) {
          this.updateUrlFromEventData();
        }
      }
    );
  }

  url: string = "";

  muted: boolean = false;

  setUrl(url: string) {
    this.url = url;
  }

  updateUrlFromEventData() {
    const currentEvent = this.streamingStore.eventData;
    const currentEventDetail = currentEvent.eventDetails[currentEvent.currentEventIndex];
    const videoName = currentEventDetail.playlist.split(`/2001/`)[1].replace(".mp4", ".m3u8");
    this.url = `https://d1aof1lwumql9k.cloudfront.net/114_STAGING/${videoName}`;
  }

  setMuted(muted: boolean) {
    this.muted = muted;
  }
}
