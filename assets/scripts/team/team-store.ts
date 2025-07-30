import mobx from "mobx";

export class TeamStore {
  constructor() {
    mobx.makeAutoObservable(this);
  }

  home = "";

  away = "";
}
