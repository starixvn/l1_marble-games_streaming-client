import mobx from "mobx";
import { store } from "../../store-decorator";
import { inject, injectable } from "inversify";
import { AudioStore } from "../audio/audio-store";
import { VisibilityStore } from "../visibility/visibility-store";
import {
  GameFlowState,
  GameFlowStore,
} from "../../features/game-flow/game-flow-store";

@injectable()
@store("BackgroundMusicStore")
export class BackgroundMusicStore {
  private _audioStore: AudioStore;
  private _visibilityStore: VisibilityStore;
  private _gameFlowStore: GameFlowStore;

  @inject(AudioStore)
  set audioStore(store: AudioStore) {
    this._audioStore = store;
  }

  get audioStore(): AudioStore {
    return this._audioStore;
  }

  @inject(VisibilityStore)
  set visibilityStore(store: VisibilityStore) {
    this._visibilityStore = store;
  }

  get visibilityStore(): VisibilityStore {
    return this._visibilityStore;
  }

  @inject(GameFlowStore)
  set gameFlowStore(store: GameFlowStore) {
    this._gameFlowStore = store;
  }

  get gameFlowStore(): GameFlowStore {
    return this._gameFlowStore;
  }

  constructor() {
    mobx.makeAutoObservable(this);
  }

  get isPlaying() {
    return (
      this.isPlayingFlowState(this.gameFlowStore.data.state) &&
      this.isAudioAllowed()
    );
  }

  isAudioAllowed() {
    return (
      !this.audioStore.muted &&
      !this.audioStore.browserBlocked &&
      this.visibilityStore.isVisible
    );
  }

  isPlayingFlowState(state: GameFlowState) {
    return [
      GameFlowState.Prebet,
      GameFlowState.Result,
      GameFlowState.PhaseChange,
    ].includes(state);
  }
}
