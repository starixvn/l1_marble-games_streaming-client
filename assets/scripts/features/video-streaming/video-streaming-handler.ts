import { FunctionUtils } from "db://assets/scripts/common/utils";
import { inject } from "inversify";
import { featureHandler } from "../../handler-registry";
import { BaseHandlerImpl } from "../base/base-handler";
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
    const currentTime = FunctionUtils.msToSeconds(data.currentTime);
    super.update({
      ...data,
      currentTime: currentTime,
    });
  }
}
