import { injectable } from "inversify";
import mobx from "mobx";

@injectable()
export class AudioStore {
  constructor() {
    mobx.makeAutoObservable(this);
  }

  muted: boolean = false;
  browserBlocked: boolean = true;

  setMuted(muted: boolean) {
    this.muted = muted;
  }

  setBrowserBlocked(browserBlocked: boolean) {
    this.browserBlocked = browserBlocked;
  }
}
