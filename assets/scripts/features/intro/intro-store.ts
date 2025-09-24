import { injectable } from "inversify";
import { BaseStoreImpl } from "../base/base-store";
import { store } from "../../store-decorator";

export interface IntroData {
    resourceServer: string;
    introTime: number;
    timeToPlay: number;
    isPlaying: boolean;
    duration: number;
}

@injectable()
@store("IntroStore")
export class IntroStore extends BaseStoreImpl<IntroData> {
    data: IntroData = {
        resourceServer: "",
        introTime: 0,
        timeToPlay: 0,
        isPlaying: false,
        duration: 0,
    };
}