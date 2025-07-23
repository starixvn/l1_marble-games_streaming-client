import mobx from "mobx";

export class Store {
  constructor() {
    const params = new URLSearchParams(window.location.search);

    this.game = params.get("game") || "default";
    this.language = params.get("language") || "en";
    this.operator = params.get("operator") || "saba-sports";

    mobx.makeAutoObservable(this);
  }

  game = "default";

  language = "en";

  operator = "default";
}
