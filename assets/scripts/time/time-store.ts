import mobx from "mobx";

export class TimeStore {
  constructor() {
    mobx.makeAutoObservable(this);
  }

  matchLiveTime = 0;
  halfIndex = 0;

  update(data: { matchLiveTime: number; halfIndex: number }) {
    this.matchLiveTime = data.matchLiveTime;
    this.halfIndex = data.halfIndex;
  }
}
