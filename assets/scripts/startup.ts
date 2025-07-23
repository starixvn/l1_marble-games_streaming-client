import {
  _decorator,
  Component,
  error,
  instantiate,
  Node,
  Prefab,
  resources,
} from "cc";
import mobx from "mobx";
import { Container } from "inversify";
import { IconManager } from "./team/icon-manager";
import { Team } from "./team/team";
import { NameManager } from "./team/name-manager";
import { StageManager } from "./stages/stage-manager";
import { StreamingHandler } from "./streaming/streaming-handler";
import { StreamingStore } from "./streaming/streaming-store";
import Observer from "observer";
import { init } from "db://i18n/LanguageData";

const { ccclass, property } = _decorator;
const { observer, handle, render } = Observer;

const container = new Container({
  autoBindInjectable: true,
  defaultScope: "Singleton",
});

Observer.configure({
  default: { mobx, container: { resolve: (ctor) => container.get(ctor) } },
});

@ccclass
@observer
export class Startup extends Component {
  @property(Node)
  private infoLayer: Node = null;

  protected start(): void {
    this.loadInfoLayer();

    setInterval(() => {
      this.test();
    }, 1000);
  }

  private loadInfoLayer() {
    const params = new URLSearchParams(window.location.search);
    const theme = params.get("theme");
    const language = params.get("language");
    const path = `themes/${theme || "default"}`;

    init(language || "en");

    resources.load(path, Prefab, this.onLoadedInfoLayer());
    this.loadStreaming(theme);
  }

  @handle(StreamingHandler, (handler, theme: string) => handler.connect(theme))
  private loadStreaming(theme: string) {
    return theme;
  }

  private onLoadedInfoLayer() {
    return (err: Error, prefab: Prefab) => {
      if (err) {
        error(err);

        return;
      }

      const info = instantiate(prefab);

      this.infoLayer.removeAllChildren();
      this.infoLayer.addChild(info);
    };
  }

  private index = 0;

  private test() {
    this.team(Team.HOME, "Atletico Madrid", "ATM", "clb_atm");
    this.team(Team.AWAY, "Benfica", "BEN", "clb_ben");

    const manager = this.infoLayer.getComponentInChildren(StageManager);

    if (!manager) {
      return;
    }

    manager.index = this.index;

    this.index++;
  }

  @render(StreamingStore, (store) => ({
    currentPhase: store.eventData?.currentPhase,
    currentHalf: store.eventData?.currentHalf,
    eventID: store.eventData?.eventID,
  }))
  private renderEventData({
    currentPhase,
    currentHalf,
    eventID,
  }: {
    currentPhase: string;
    currentHalf: number;
    eventID: number;
  }) {
    console.log("render event data", currentPhase, currentHalf, eventID);
  }

  private team(team: Team, name: string, shortName: string, icon: string) {
    const nameManager = this.infoLayer
      .getComponentsInChildren(NameManager)
      .find((manager) => manager.team === team);
    const iconManager = this.infoLayer
      .getComponentsInChildren(IconManager)
      .find((manager) => manager.team === team);

    if (!nameManager || !iconManager) {
      return;
    }

    nameManager.name = name;
    nameManager.shortName = shortName;
    iconManager.name = icon;
  }
}
