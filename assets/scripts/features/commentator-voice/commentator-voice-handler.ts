import { inject } from "inversify";
import { featureHandler } from "../../handler-registry";
import { BaseHandlerImpl } from "../base/base-handler";
import { CommentatorVoiceData, CommentatorVoiceStore } from "./commentator-voice-store";

@featureHandler
export class CommentatorVoiceHandler extends BaseHandlerImpl<CommentatorVoiceData> {
    name = "commentatorVoice";

    @inject(CommentatorVoiceStore) 
    set store(store: CommentatorVoiceStore) {
        this._store = store;
    }
}