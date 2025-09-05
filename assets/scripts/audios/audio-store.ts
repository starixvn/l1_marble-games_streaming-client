import { injectable } from "inversify";
import mobx from "mobx";
import { store } from "../store-decorator";
import "../commentators-voices/commentator-voice-store";

@injectable()
@store("AudioStore")
export class AudioStore {
  constructor() {
    mobx.makeAutoObservable(this);
  }

  muted = false;
  browserBlocked = true;
 
  setMuted(muted: boolean) {
    this.muted = muted;
  }

  setBrowserBlocked(browserBlocked: boolean) {
    this.browserBlocked = browserBlocked;
  }
}
