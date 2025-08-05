import { _decorator, Component } from "cc";
import Hls from "hls.js";
import Observer from "observer";
import { VideoStore } from "./video-store";

const { ccclass } = _decorator;
const { observer, handle } = Observer;

@ccclass("BackgroundVideoIntegration")
@observer
export class BackgroundVideoIntegration extends Component {
  protected onLoad(): void {
    this.node.on(Hls.Events.MEDIA_DETACHED, () => {
      this.setDefaultBackground(true);
    });

    this.node.on(Hls.Events.MANIFEST_LOADING, () =>
      this.setDefaultBackground(true),
    );

    this.node.on(Hls.Events.LEVEL_LOADED, () => {
      this.setDefaultBackground(false);
    });
  }

  @handle(VideoStore, (store, enable: boolean) =>
    store.enableDefaultBackground(enable),
  )
  setDefaultBackground(enable: boolean) {
    return enable;
  }
}
