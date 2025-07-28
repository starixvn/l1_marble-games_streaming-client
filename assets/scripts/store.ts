import mobx from "mobx";

export class Store {
  constructor() {
    const params = new URLSearchParams(window.location.search);

    this.game = params.get("game") || "default";
    this.language = params.get("language") || "en-US";
    this.operator = params.get("operator") || "common";

    mobx.makeAutoObservable(this);
  }

  game = "default";

  language = "en-US";

  operator = "common";
}
