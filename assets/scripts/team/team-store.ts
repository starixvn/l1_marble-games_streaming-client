import mobx from "mobx";
import { store } from "../store-decorator";

@store("TeamStore")
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
