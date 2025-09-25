import {
  _decorator,
  Component,
  error,
  instantiate,
  Node,
  Prefab,
  resources,
} from "cc";
import { init } from "db://i18n/LanguageData";
import { Container } from "inversify";
import mobx from "mobx";
import Observer from "observer";

import { Store } from "./store";
import { handleWindowMessage } from "./store-decorator";
import { ServerSentEventHandler } from "./server-sent-event/server-sent-event-handler";
import { handlerRegistry } from "./handler-registry";

const { ccclass, property } = _decorator;
const { observer, handle, render } = Observer;

const container = new Container({
  autobind: true,
  defaultScope: "Singleton",
});

handlerRegistry.bindAll(container);


Observer.configure({
  default: { mobx, container: { resolve: (ctor) => container.get(ctor, { autobind: true}) } },
});

window.addEventListener("message", handleWindowMessage(container));

@ccclass
@observer
export class Startup extends Component {

  @property(Node)
  private readonly infoLayer: Node = null;

  @render(Store, (store) => store.language)
  initLanguage(language: string) {
    init(language);
  }

  @render(Store, (store) => store.game)
  public loadGame(game: string) {
    resources.load(`games/${game}`, Prefab, this.onLoadedInfoLayer());
    this.loadStreaming();
  }

  @handle(ServerSentEventHandler, (handler) => handler.connect())
  private loadStreaming() {
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
