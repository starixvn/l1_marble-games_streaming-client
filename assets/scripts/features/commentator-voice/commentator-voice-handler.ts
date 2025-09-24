import { inject, injectable } from "inversify";
import { featureHandler } from "../../handler-registry";
import { BaseHandlerImpl } from "../base/base-handler";
import { CommentatorVoiceData, CommentatorVoiceStore } from "./commentator-voice-store";

@injectable()
@featureHandler
export class CommentatorVoiceHandler extends BaseHandlerImpl<CommentatorVoiceData> {
    @inject(CommentatorVoiceStore) 
    readonly store: CommentatorVoiceStore;

    name = "commentatorVoice";
}