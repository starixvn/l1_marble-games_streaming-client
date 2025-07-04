import { injectable } from "inversify";
import mobx from "mobx";

@injectable()
export class VideoStore {
  constructor() {
    mobx.makeAutoObservable(this);
  }

  url: string = "";

  muted: boolean = false;

  setUrl(url: string) {
    this.url = url;
  }

  setMuted(muted: boolean) {
    this.muted = muted;
  }
}
