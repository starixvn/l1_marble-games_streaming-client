import { _decorator, Component } from "cc";
import Observer from "observer";
import { Store } from "../../store";
import { SfxStore } from "../../local-stores/sfx/sfx-store";
import { CommentatorVoiceStore } from "../../features/commentator-voice/commentator-voice-store";

const { ccclass } = _decorator;
const { observer, render, handle } = Observer;

@ccclass('CommentatorVoice')
@observer
export class CommentatorVoice extends Component {

    private readonly basePath = "audios/commentator-voices/";
    private languageAndOpetatorPath = "common/en-US/";

    @render(Store, (store) => ({
        language: store.language,
        operator: store.operator,
    }), {
        fireImmediately: false
    })
    syncLanguageAndOperator(language: string, operator: string) {
        this.languageAndOpetatorPath = `${operator}/${language}/`;
    }

    @render(CommentatorVoiceStore, (store) => ({
        fileName: store.data.fileName,
    }), {
        fireImmediately: false
    })
    syncPlayingVoice({ fileName }: { fileName: string }) {

        if (!fileName || fileName === "") {
            return;
        }
        const eventName = fileName.split("_")[0];
        const fullPath = `${this.basePath}${this.languageAndOpetatorPath}${eventName}/${fileName}`;
        this.playSfx(fullPath);
    }

    @handle(SfxStore, (store, sfx: string) => store.playSfx(sfx))
    private playSfx(sfx: string) {
        return sfx;
    }

} 