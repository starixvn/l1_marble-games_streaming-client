import mobx from "mobx";
import { store } from "./store-decorator";

@store("Store")
export class Store {
  constructor() {
    mobx.makeAutoObservable(this);
    this.init(globalThis.location);
    this.loadFeature();
  }

  get isReplay() {
    return this.eventId !== null;
  }

  eventId: string | null = null;

  game: string | null = null;

  language = "en-US";

  operator = "common";

  features: Record<string, boolean> = {};

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

  async loadFeature() {
    try {
      const response = await fetch(this.operatorConfigurationURL);
      const operators = await response.json();
      const features = Object.assign(
        {},
        operators.features.common,
        operators.features[this.operator]
      );

      this.features = features;
    } catch (error) {
      console.log("loadFeature error---", error);
    }
  }

  get replayUrl() {
    const root = this.host.split(".").slice(-2).join(".");
    const domain = `mgstreaming.${root}`;

    return `https://${domain}/replay/${this.eventId}`;
  }

  get serverUrl() {
    const root = this.host.split(".").slice(-2).join(".");
    const domain = `mgstreaming.${root}`;

    return `https://${domain}/live/${this.game}`;
  }

  get operatorConfigurationURL() {
    return `https://${this.host}/shared-resource/operators.json`;
  }

  get host() {
    let host = globalThis.location.host;

    if (host.includes("localhost")) {
      host = "streaming-client.lumigame.com";
    }

    return host;
  }
}
