import { injectable } from "inversify";
import { store } from "../../store-decorator";
import { BaseStoreImpl } from "../base/base-store";

export interface CommentatorVoiceData {
    fileName: string;
}

@injectable()
@store("CommentatorVoiceStore")
export class CommentatorVoiceStore extends BaseStoreImpl<CommentatorVoiceData> {

}