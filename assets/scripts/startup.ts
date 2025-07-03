import { _decorator, Component } from "cc";
import mobx from "mobx";
import Observer from "observer";
import { Container } from "inversify";
import { VideoStore } from "./video-player/video-store";

const { ccclass } = _decorator;
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
  @handle(VideoStore, (store, url: string) => store.setUrl(url))
  private setDemoVideo() {
    return "https://d1aof1lwumql9k.cloudfront.net/114_STAGING/0027ce5a8da81ea405b551ccaa7521432ea283ca495dacdcb41f4fd13136ce1b.m3u8";
  }
}
