import { store } from "../../store-decorator";
import { injectable } from "inversify";
import { BaseStoreImpl } from "../base/base-store";

export type VideoStreamingData = {
    videoLink: string;
    timeToStream: number;
    currentTime: number;
    phaseIndex: number
}

@injectable()
@store("VideoStreamingStore")
export class VideoStreamingStore extends BaseStoreImpl<VideoStreamingData> {
    data: VideoStreamingData = {
        videoLink: "",
        timeToStream: 0,
        currentTime: 0,
        phaseIndex: 0
    }
}