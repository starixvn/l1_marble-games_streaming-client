import { _decorator, Component, find, log, Node, sp } from "cc";
import Observer from "observer";
import { AnimationUtils } from "../../common/utils";
import { SfxStore } from "../../local-stores/sfx/sfx-store";
import { BackgroundVideoPlayer } from "../video-player/background-video-player";
const { ccclass, property } = _decorator;

const { observer, handle } = Observer;

@ccclass("Replay")
@observer
export class Replay extends Component {
  @property(sp.Skeleton)
  transitionSpine: sp.Skeleton = null;

  @property(Node)
  info: Node = null;

  protected backgroundVideoPlayer: BackgroundVideoPlayer = null;
  protected isHomeScoreChanged = false;
  protected readonly durationAnimGoal = 3;
  protected readonly durationAnimNode = 0.2;
  protected readonly durationDelayAfterGoal = 0.4;

  async onLoad() {
    AnimationUtils.delayTime(0.2);
    this.initBackgroundVideoPlayer();
    this.setStatusNode(this.transitionSpine.node, false);
  }

  initBackgroundVideoPlayer() {
    const canvas = find("Canvas");
    const backgroundVideoPlayer = canvas?.getComponentInChildren(
      BackgroundVideoPlayer
    );
    this.backgroundVideoPlayer = backgroundVideoPlayer;
    log("init backgroundVideoPlayer", backgroundVideoPlayer);
  }

  protected setNodesActive(nodes: Node[], active: boolean) {
    nodes?.forEach((node) => this.setStatusNode(node, active));
  }

  protected setStatusNode(node: Node, active: boolean) {
    node && (node.active = active);
  }

  @handle(SfxStore, (store, sfx: string) => store.playSfx(sfx))
  protected playSfx(sfx: string) {
    return sfx;
  }
}
