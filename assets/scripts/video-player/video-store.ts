import { injectable } from "inversify";
import mobx from "mobx";

@injectable()
export class VideoStore {
  constructor() {
    mobx.makeAutoObservable(this);
  }

  url: string = "";

  setUrl(url: string) {
    this.url = url;
  }
}
