import mobx from "mobx";
import { Phase } from "../streaming/streaming-type";
import { gameSettings } from "../game-settings";
import { store } from "../store-decorator";

@store("TimeStore")
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
        `sync matchLiveTime from ${this.matchLiveTime} to ${matchLiveTime}`,
      );
      this.matchLiveTime = matchLiveTime;
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

    if (this.isTimerPaused()) {
      this.pause();
    }
  }

  countUp() {
    if (!this.paused) {
      this.increaseMatchLiveTime();

      if (this.isTimerPaused()) {
        this.pause();
      }
    }
  }

  isTimerPaused() {
    return (
      (this.halfIndex === 0 &&
        this.matchLiveTime === gameSettings.halfDuration) ||
      this.matchLiveTime === gameSettings.halfDuration * 2
    );
  }

  increaseMatchLiveTime() {
    if (!this.isTimerPaused()) {
      this.matchLiveTime += 1;
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
