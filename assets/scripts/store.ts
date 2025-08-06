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

  get serverUrl() {
    const host = window.location.host;

    if (host.includes("localhost")) {
      return `https://streaming-service.lumigame.com/live/${this.game}`;
    }

    const root = host.split(".").slice(1).join(".");
    const domain = `mgstreaming.${root}`;

    return `https://${domain}/live/${this.game}`;
  }
}
