import mobx from "mobx";
import { store } from "../../store-decorator";
import { inject, injectable } from "inversify";
import { AudioStore } from "../audio/audio-store";
import { VisibilityStore } from "../visibility/visibility-store";
import { GameFlowState, GameFlowStore } from "../../features/game-flow/game-flow-store";


@injectable()
@store("BackgroundMusicStore")
export class BackgroundMusicStore {
    @inject(AudioStore)
    audioStore: AudioStore;

    @inject(VisibilityStore)
    visibilityStore: VisibilityStore;

    @inject(GameFlowStore)
    gameFlowStore: GameFlowStore;
    
    constructor() {
        mobx.makeAutoObservable(this);
    }

    get isPlaying() {
        return this.isPlayingFlowState(this.gameFlowStore.data.state) && this.isAudioAllowed();
    }

    isAudioAllowed() {
        return !this.audioStore.muted && !this.audioStore.browserBlocked && this.visibilityStore.isVisible;
    }

    isPlayingFlowState(state: GameFlowState) {
        return [GameFlowState.Prebet, GameFlowState.Result, GameFlowState.HalfTime].includes(state);
    }
}
