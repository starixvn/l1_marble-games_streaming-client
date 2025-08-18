import mobx from "mobx";
import { store } from "./store-decorator";

@store("Store")
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
    let host = window.location.host;

    if (host.includes("localhost")) {
      host = "mgtv.lumigame.com";
    }

    const root = host.split(".").slice(-2).join(".");
    const domain = `mgstreaming.${root}`;

    return `https://${domain}/live/${this.game}`;
  }
}
