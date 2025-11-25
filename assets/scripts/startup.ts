import {
  _decorator,
  Component,
  error,
  Game,
  game,
  instantiate,
  log,
  Node,
  Prefab,
  resources,
  Tween,
} from "cc";
import { Container } from "inversify";
import mobx from "mobx";
import Observer from "observer";

import { init } from "db://i18n/LanguageData";
import { handlerRegistry } from "./handler-registry";
import { GameStore } from "./local-stores/game/game-store";
import { ReplayMatchHandler } from "./local-stores/replay-match/replay-match-handler";
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

  protected enableEventShowHideGame = true;
  protected enableReloadGame = false;

  onLoad() {
    this.registerEventShowHideGame();
  }

  onDestroy() {
    this.clearEventShowHideGame();
  }

  protected registerEventShowHideGame() {
    if (!this.enableEventShowHideGame) {
      return;
    }
    game.on(Game.EVENT_HIDE, this.onHideGame, this);
    game.on(Game.EVENT_SHOW, this.onShowGame, this);
  }

  protected clearEventShowHideGame() {
    game.off(Game.EVENT_HIDE, this.onHideGame, this);
    game.off(Game.EVENT_SHOW, this.onShowGame, this);
  }

  onHideGame() {
    this.unscheduleAllCallbacks();
    Tween.stopAll();
  }

  onShowGame() {
    this.enableReloadGame && window.location.reload();
  }

  @render(Store, (store) => store.features.ENABLE_RELOAD_GAME)
  private renderEnableReloadGame(enabled: boolean) {
    this.enableReloadGame = enabled;
  }

  @render(Store, (store) => store.language)
  initLanguage(language: string) {
    log("initLanguage---", language);
    init(language);
  }

  @render(Store, (store) => store.isReplay)
  initIsReplay(isReplay: boolean) {
    if (isReplay) {
      this.loadReplayMatch();
      return;
    }
    this.loadStreaming();
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

  @handle(ReplayMatchHandler, (handler) => handler.connect())
  private loadReplayMatch() {
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
