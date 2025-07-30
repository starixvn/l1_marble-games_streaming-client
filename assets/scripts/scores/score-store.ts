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

  update(data: { home: number; away: number }) {
    this.home = data.home;
    this.away = data.away;
  }

  updatePrevious(data: { home: number; away: number }) {
    this.previousHome = data.home;
    this.previousAway = data.away;
  }
}
