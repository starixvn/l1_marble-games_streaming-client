import { inject, injectable } from "inversify";
import { BaseHandlerImpl } from "../base/base-handler";
import { IntroData, IntroStore } from "./intro-store";
import { featureHandler } from "../../handler-registry";

@injectable()
@featureHandler
export class IntroHandler extends BaseHandlerImpl<IntroData> {
    name = "intro";
    @inject(IntroStore) 
    readonly store: IntroStore
  
    public override update(data: IntroData) {
        const currentTime = (Date.now() - data.timeToPlay) / 1000;
        super.update({
            ...data,
            introTime: currentTime,
            isPlaying: currentTime <= data.duration
        });
    }
}