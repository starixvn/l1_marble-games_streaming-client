import mobx from "mobx";
import { store } from "./store-decorator";

@store("Store")
export class Store {
  constructor() {
    const params = new URLSearchParams(globalThis.location.search);

    this.game = params.get("game") || null;
    this.language = params.get("language") || "en-US";
    this.operator = params.get("operator") || "common";
    this.eventId = params.get("eventId") || null;

    mobx.makeAutoObservable(this);
  }

  eventId: string | null = null;

  game: string | null = null;

  language = "en-US";

  operator = "common";

  get replayUrl() {
    let host = globalThis.location.host;

    if (host.includes("localhost")) {
      host = "mgtv.lumigame.com";
    }

    const root = host.split(".").slice(-2).join(".");
    const domain = `mgstreaming.${root}`;

    return `https://${domain}/replay/${this.eventId}`;
  }

  get serverUrl() {
    let host = globalThis.location.host;

    if (host.includes("localhost")) {
      host = "mgtv.lumigame.com";
    }

    const root = host.split(".").slice(-2).join(".");
    const domain = `mgstreaming.${root}`;

    return `https://${domain}/live/${this.game}`;
  }
}
