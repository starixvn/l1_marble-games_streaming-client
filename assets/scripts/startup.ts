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
import Observer from "observer";
import { Container } from "inversify";
import { VideoStore } from "./video-player/video-store";

const { ccclass, property } = _decorator;
const { observer, handle } = Observer;

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

  @handle(VideoStore, (store, url: string) => store.setUrl(url))
  private setDemoVideo() {
    return "https://d1aof1lwumql9k.cloudfront.net/114_STAGING/0027ce5a8da81ea405b551ccaa7521432ea283ca495dacdcb41f4fd13136ce1b.m3u8";
  }

  protected start(): void {
    this.loadInfoLayer();

    setTimeout(() => {
      this.setDemoVideo();
    }, 5000);
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
