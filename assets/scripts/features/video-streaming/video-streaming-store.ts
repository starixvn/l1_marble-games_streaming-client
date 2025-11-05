import { injectable } from "inversify";
import { store } from "../../store-decorator";
import { BaseStoreImpl } from "../base/base-store";

export type VideoStreamingData = {
  videoLink: string;
  timeToStream: number;
  currentTime: number;
  streamingPhaseTime: number;
  phaseIndex: number;
  durationInSeconds?: number;
};

@injectable()
@store("VideoStreamingStore")
export class VideoStreamingStore extends BaseStoreImpl<VideoStreamingData> {
  data: VideoStreamingData = {
    videoLink: "",
    streamingPhaseTime: 0,
    timeToStream: 0,
    currentTime: 0,
    phaseIndex: 0,
    durationInSeconds: 0,
  };
}
