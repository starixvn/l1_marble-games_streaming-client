import { injectable } from "inversify";
import mobx from "mobx";
import { store } from "../../store-decorator";

@injectable()
@store("AudioStore")
export class AudioStore {
  constructor() {
    mobx.makeAutoObservable(this);
  }

  browserBlocked = true;
  userMuted = false;

  get muted() {
    return this.browserBlocked || this.userMuted;
  }

  setMuted(muted: boolean) {
    this.userMuted = muted;
  }

  setBrowserBlocked(browserBlocked: boolean) {
    this.browserBlocked = browserBlocked;
  }
}
