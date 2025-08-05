import mobx from "mobx";
import { Phase } from "../streaming/streaming-type";

export class TimeStore {
  constructor() {
    mobx.makeAutoObservable(this);
  }

  matchLiveTime = 0;
  halfIndex = 0;
  currentPhase: Phase;
  paused = true;
  runnerId: NodeJS.Timeout;

  update(data: {
    matchLiveTime: number;
    halfIndex: number;
    currentPhase: Phase;
  }) {
    this.currentPhase = data.currentPhase;

    const matchLiveTime = Math.floor(data.matchLiveTime / 1000);

    if (matchLiveTime - this.matchLiveTime > 1) {
      console.log(
        `sync matchLiveTime from ${this.matchLiveTime} to ${matchLiveTime}`
      );
      this.matchLiveTime = matchLiveTime;
    }

    if (data.currentPhase === Phase.UpdateResult) {
      this.pause();
    }

    if (data.currentPhase === Phase.UpdateVideoInfo) {
      this.play();

      if (!this.runnerId) {
        this.start();
      }
    }

    if (data.currentPhase === Phase.ScheduleEvent) {
      this.stop();
    }

    this.halfIndex = data.halfIndex;
  }

  countUp() {
    if (!this.paused) {
      {
        this.matchLiveTime += 1;

        if (
          (this.halfIndex === 0 && this.matchLiveTime === 30) ||
          this.matchLiveTime === 60
        ) {
          this.pause();
        }
      }
    }
  }

  start() {
    this.runnerId = setInterval(() => {
      this.countUp();
    }, 1000);
  }

  stop() {
    if (this.runnerId) {
      clearInterval(this.runnerId);
      this.runnerId = null;
    }

    this.resetTime();
  }

  play() {
    this.paused = false;
  }

  pause() {
    this.paused = true;
  }

  resetTime() {
    this.matchLiveTime = 0;
    this.paused = true;
  }
}
