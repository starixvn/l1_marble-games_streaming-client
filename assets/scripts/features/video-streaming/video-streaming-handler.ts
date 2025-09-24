import { BaseHandlerImpl } from "../base/base-handler";
import { featureHandler } from "../../handler-registry";
import { inject, injectable } from "inversify";
import { VideoStreamingData, VideoStreamingStore } from "./video-streaming-store";

@injectable()
@featureHandler
export class VideoStreamingHandler extends BaseHandlerImpl<VideoStreamingData> {
    name = "videoStreaming";

    @inject(VideoStreamingStore) 
    readonly store: VideoStreamingStore
  

    public override update(data: VideoStreamingData) {
        const currentTime = (Date.now() - data.timeToStream) / 1000;
        super.update({
            ...data,
            currentTime: currentTime
        });
    }
}