import { inject, injectable } from "inversify";
import { BaseHandlerImpl } from "../base/base-handler";
import { PreloadVideoData, PreloadVideoStore } from "./preload-video-store";
import { featureHandler } from "../../handler-registry";

@injectable()
@featureHandler
export class PreloadVideoHandler extends BaseHandlerImpl<PreloadVideoData> {
    name = "preloadVideo";

    @inject(PreloadVideoStore) 
    readonly store: PreloadVideoStore
  
}