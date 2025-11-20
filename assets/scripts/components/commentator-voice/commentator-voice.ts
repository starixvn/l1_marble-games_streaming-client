import { _decorator, Component } from "cc";
import Observer from "observer";
import { CommentatorVoiceStore } from "../../features/commentator-voice/commentator-voice-store";
import { SfxStore } from "../../local-stores/sfx/sfx-store";
import { Store } from "../../store";

const { ccclass } = _decorator;
const { observer, render, handle } = Observer;

@ccclass("CommentatorVoice")
@observer
export class CommentatorVoice extends Component {
  private readonly basePath = "audios/commentator-voices/";
  private languagePath = "en-US/";

  @render(Store, (store) => store.language)
  syncLanguageAndOperator(language: string) {
    this.languagePath = `${language}/`;
  }

  @render(
    CommentatorVoiceStore,
    (store) => ({
      fileName: store.data.fileName,
    }),
    {
      fireImmediately: false,
    }
  )
  syncPlayingVoice({ fileName }: { fileName: string }) {
    if (!fileName || fileName === "") {
      return;
    }
    const eventName = fileName.split("_")[0];
    const fullPath = `${this.basePath}${this.languagePath}${eventName}/${fileName}`;
    this.playSfx(fullPath);
  }

  @handle(SfxStore, (store, sfx: string) => store.playSfx(sfx))
  private playSfx(sfx: string) {
    return sfx;
  }
}
