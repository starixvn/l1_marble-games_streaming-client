import { _decorator, Node } from "cc";
import Observer from "observer";
import { VideoStore } from "../video-player/video-store";
import { Stage } from "./stage";

const { ccclass, property, menu } = _decorator;
const { render, observer } = Observer;

@ccclass
@menu("Stages/StreamingStage")
@observer
export class StreamingStage extends Stage {
  @property(Node)
  background: Node = null;

  @render(VideoStore, (store) => store.defaultBackgroundEnabled)
  updateDefaultBackground(enabled: boolean) {
    this.background.active = enabled;
  }
}
