import mobx from "mobx";

export class ScoreStore {
  constructor() {
    mobx.makeAutoObservable(this);
  }

  home = 0;
  away = 0;

  get scoreInText() {
    return `${this.home} - ${this.away}`;
  }

  previousHome = 0;
  previousAway = 0;

  get previousScoreInText() {
    return `${this.previousHome} - ${this.previousAway}`;
  }
}
