import {
  _decorator,
  Component,
  error,
  instantiate,
  log,
  Node,
  Prefab,
  resources,
} from "cc";
import { init } from "db://i18n/LanguageData";
import { Container } from "inversify";
import mobx from "mobx";
import Observer from "observer";

import { handlerRegistry } from "./handler-registry";
import { GameStore } from "./local-stores/game/game-store";
import { ReplayHandler } from "./local-stores/replay/replay-handler";
import { ServerSentEventHandler } from "./server-sent-event/server-sent-event-handler";
import { Store } from "./store";
import { handleWindowMessage } from "./store-decorator";

const { ccclass, property } = _decorator;
const { observer, handle, render } = Observer;

const container = new Container({
  autobind: true,
  defaultScope: "Singleton",
});

handlerRegistry.bindAll(container);

Observer.configure({
  default: {
    mobx,
    container: { resolve: (ctor) => container.get(ctor, { autobind: true }) },
  },
});

window.addEventListener("message", handleWindowMessage(container));

@ccclass
@observer
export class Startup extends Component {
  @property(Node)
  private readonly infoLayer: Node = null;

  @render(Store, (store) => store.language)
  initLanguage(language: string) {
    log("initLanguage---", language);
    init(language);
  }

  @render(Store, (store) => store.game)
  public loadGame(game: string | null) {
    if (!game) {
      return;
    }
    console.log("load streaming ", game);
    this.loadStreaming();
  }

  @render(Store, (store) => store.eventId)
  public loadEventId(eventId: string | null) {
    if (!eventId) {
      return;
    }
    console.log("load replay");
    this.loadReplay();
  }

  @render(GameStore, (store) => store.data.gameId)
  public openGame(gameId: string) {
    if (!gameId) {
      return;
    }
    resources.load(`games/${gameId}`, Prefab, this.onLoadedInfoLayer());
  }

  @handle(ServerSentEventHandler, (handler) => handler.connect())
  private loadStreaming() {
    // trigger handler, no need function body
  }

  @handle(ReplayHandler, (handler) => handler.connect())
  private loadReplay() {
    // trigger handler, no need function body
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
}
