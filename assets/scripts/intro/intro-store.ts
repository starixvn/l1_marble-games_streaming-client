import {injectable } from "inversify";
import mobx from "mobx";
import { store } from "../store-decorator";
import { VideoStatus } from "../streaming/streaming-type";


@injectable()
@store("IntroStore")
export class IntroStore {
  constructor() {
    mobx.makeAutoObservable(this);
  }

  url = "";
  currentTime = 0;
  status: VideoStatus = VideoStatus.Stopped;

  setUrl(url: string) {
    this.url = url;
  }

  update(data: {
    currentTime: number;
    status: VideoStatus;
  }) {
    this.currentTime = data.currentTime;
    this.status = data.status;
  }
}