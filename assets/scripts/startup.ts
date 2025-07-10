import {
  _decorator,
  Component,
  error,
  instantiate,
  Node,
  Prefab,
  resources,
} from "cc";
import { Container } from "inversify";
import mobx from "mobx";
import Observer from "observer";

const { ccclass, property } = _decorator;
const { observer } = Observer;

const container = new Container({
  autobind: true,
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
  }

  private loadInfoLayer() {
    const params = new URLSearchParams(window.location.search);
    const gameId = params.get("game");
    const loadDefault = () =>
      resources.load(
        "games/default",
        Prefab,
        this.onLoadedInfoLayer(loadDefault),
      );

    if (!gameId) {
      loadDefault();

      return;
    }

    resources.load(
      `games/${gameId}`,
      Prefab,
      this.onLoadedInfoLayer(loadDefault),
    );
  }

  private onLoadedInfoLayer(fallback: () => void = undefined) {
    return (err: Error, prefab: Prefab) => {
      if (err) {
        error(err);

        fallback && fallback();

        return;
      }

      const info = instantiate(prefab);

      this.infoLayer.removeAllChildren();
      this.infoLayer.addChild(info);
    };
  }
}
