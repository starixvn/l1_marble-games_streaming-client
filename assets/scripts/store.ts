import mobx from "mobx";
import { store } from "./store-decorator";

@store("Store")
export class Store {
  constructor() {
    mobx.makeAutoObservable(this);
  }

  eventId: string | null = null;

  game: string | null = null;

  language = "en-US";

  operator = "common";

  init(location: typeof globalThis.location) {
    const params = new URLSearchParams(location.search);
    const token = params.get("token");
    const decodedToken = atob(token);
    const decodedParams = new URLSearchParams(decodedToken);

    this.game = decodedParams.get("game") || null;
    this.language = decodedParams.get("language") || "en-US";
    this.operator = decodedParams.get("operator") || "common";
    this.eventId = decodedParams.get("event") || null;
  }

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
