import { inject } from "inversify";
import { BaseHandlerImpl } from "../base/base-handler";
import { PreloadVideoData, PreloadVideoStore } from "./preload-video-store";
import { featureHandler } from "../../handler-registry";

@featureHandler
export class PreloadVideoHandler extends BaseHandlerImpl<PreloadVideoData> {
    name = "preloadVideo";

    @inject(PreloadVideoStore) 
    set store(store: PreloadVideoStore) {
        this._store = store;
    }
}