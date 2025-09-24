import { store } from "../../store-decorator";
import { injectable } from "inversify";
import { BaseStoreImpl } from "../base/base-store";

export interface PreloadVideoData {
    videoLink: string;
}

@injectable()
@store("PreloadVideoStore")
export class PreloadVideoStore extends BaseStoreImpl<PreloadVideoData> {
    data: PreloadVideoData = {
        videoLink: "",
    }
}
