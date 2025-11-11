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

  init(location: typeof globalThis.location) {
    const params = new URLSearchParams(location.search);
    const token = params.get("token");
    const decodedToken = atob(token);
    const decodedParams = new URLSearchParams(decodedToken);

    const gameFromToken = decodedParams.get("game");
    const languageFromToken = decodedParams.get("language");
    const operatorFromToken = decodedParams.get("operator");
    const eventIdFromToken = decodedParams.get("event");

    const gameFromParam = params.get("game");
    const languageFromParam = params.get("language");
    const operatorFromParam = params.get("operator");
    const eventIdFromParam = params.get("event");

    this.game = gameFromToken ?? gameFromParam ?? null;
    this.language = languageFromToken ?? languageFromParam ?? "en-US";
    this.operator = operatorFromToken ?? operatorFromParam ?? "common";
    this.eventId = eventIdFromToken ?? eventIdFromParam ?? null;
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
