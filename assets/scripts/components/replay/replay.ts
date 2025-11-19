import { _decorator, Component, find, log, Node } from "cc";
import Observer from "observer";
import { AnimationUtils } from "../../common/utils";
import { GameStore } from "../../local-stores/game/game-store";
import { SfxStore } from "../../local-stores/sfx/sfx-store";
import { BackgroundVideoPlayer } from "../video-player/background-video-player";
const { ccclass, property } = _decorator;

const { observer, handle, render } = Observer;

@ccclass("Replay")
@observer
export class Replay extends Component {
  @property(Node)
  info: Node = null;

  protected backgroundVideoPlayer: BackgroundVideoPlayer = null;
  protected gameId: string = "";

  @render(GameStore, (store) => store.data?.gameId)
  setGameId(gameId: string) {
    this.gameId = gameId;
  }

  async onLoad() {
    AnimationUtils.delayTime(0.2);
    this.initBackgroundVideoPlayer();
  }

  onDestroy() {
    this.unscheduleAllCallbacks();
  }

  initBackgroundVideoPlayer() {
    const canvas = find("Canvas");
    const backgroundVideoPlayer = canvas?.getComponentInChildren(
      BackgroundVideoPlayer
    );
    this.backgroundVideoPlayer = backgroundVideoPlayer;
    log("init backgroundVideoPlayer", backgroundVideoPlayer);
  }

  protected setStatusNodes(nodes: Node[], active: boolean) {
    nodes?.forEach((node) => node && this.setStatusNode(node, active));
  }

  protected setStatusNode(node: Node, active: boolean) {
    node && (node.active = active);
  }

  @handle(SfxStore, (store, sfx: string) => store.playSfx(sfx))
  protected playSfx(sfx: string) {
    return sfx;
  }
}
