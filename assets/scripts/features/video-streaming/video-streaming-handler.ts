import { BaseHandlerImpl } from "../base/base-handler";
import { featureHandler } from "../../handler-registry";
import { inject } from "inversify";
import {
  VideoStreamingData,
  VideoStreamingStore,
} from "./video-streaming-store";

@featureHandler
export class VideoStreamingHandler extends BaseHandlerImpl<VideoStreamingData> {
  name = "videoStreaming";

  @inject(VideoStreamingStore)
  set store(store: VideoStreamingStore) {
    this._store = store;
  }

  public override update(data: VideoStreamingData) {
    const currentTime = data.currentTime / 1000;
    super.update({
      ...data,
      currentTime: currentTime,
    });
  }
}
