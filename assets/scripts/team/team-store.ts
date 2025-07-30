import mobx from "mobx";

export class TeamStore {
  constructor() {
    mobx.makeAutoObservable(this);
  }

  home = "";

  away = "";

  update(data: { home: string; away: string }) {
    this.home = data.home;
    this.away = data.away;
  }
}
