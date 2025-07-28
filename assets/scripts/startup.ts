import { _decorator, Component, error, instantiate, Node, Prefab, resources } from "cc";
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
import { Store } from "./store";
import type { EventData } from "./streaming/streaming-type";

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
    setInterval(() => {
      this.test();
    }, 1000);
  }

  @render(Store, (store) => store.language)
  private initLanguage(language: string) {
    init(language);
  }

  @render(Store, (store) => store.game)
  private loadGame(game: string) {
    resources.load(`games/${game}`, Prefab, this.onLoadedInfoLayer());

    this.loadStreaming(game);
  }

  @handle(StreamingHandler, (handler, game: string) => handler.connect(game))
  private loadStreaming(game: string) {
    return game;
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
    const teams = [
      "clb_atm",
      "clb_boc",
      "clb_bvb",
      "clb_che",
      "clb_fcb",
      "clb_int",
      "clb_juv",
      "clb_mci",
      "clb_mty",
      "clb_pal",
      "clb_por",
      "clb_psg",
      "clb_riv",
      "clb_rma",
      "clb_slb",
    ];

    this.team(Team.HOME, teams[this.index % teams.length]);
    this.team(Team.AWAY, teams[(this.index + 1) % teams.length]);

    const manager = this.infoLayer.getComponentInChildren(StageManager);

    if (!manager) {
      return;
    }

    manager.index = this.index;

    this.index++;
  }

  @render(StreamingStore, (store) => store.eventData)
  private renderEventData(eventData: EventData) {
    if (!eventData?.eventId) {
      return;
    }

    let homeScore = 0;
    let awayScore = 0;

    eventData.liveScores.forEach((score) => {
      const [home, away] = score.split(":");
      homeScore += parseInt(home);
      awayScore += parseInt(away);
    });

    const results = eventData.eventDetails.map((detail) => detail.result);

    console.log(`home team: ${eventData.homeTeam}, away team: ${eventData.awayTeam}`);
    console.log(`event id: ${eventData.eventId}, current half: ${eventData.currentEventIndex + 1}`);
    console.log(`live scores: ${homeScore}:${awayScore}`);
    console.log(`results: ${JSON.stringify(results)}`);
    console.log(`match live time ms: ${eventData.matchLiveTimeMs}`);
    console.log(`current phase: ${eventData.currentPhase}`);
  }

  private team(team: Team, name: string) {
    const nameManager = this.infoLayer.getComponentsInChildren(NameManager).find((manager) => manager.team === team);
    const iconManager = this.infoLayer.getComponentsInChildren(IconManager).find((manager) => manager.team === team);

    if (!nameManager || !iconManager) {
      return;
    }

    nameManager.name = name;
    iconManager.name = name;
  }
}
