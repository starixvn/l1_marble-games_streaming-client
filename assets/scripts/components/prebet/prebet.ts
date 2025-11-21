import { _decorator, CCInteger, Component, find, Node } from "cc";
import { AnimationUtils } from "db://assets/scripts/common/utils";
import {
  BackgroundVideoPlayer,
  BackgroundVideoPlayerEvent,
} from "db://assets/scripts/components/video-player/background-video-player";
import {
  type GameFlowData,
  GameFlowState,
  GameFlowStore,
} from "db://assets/scripts/features/game-flow/game-flow-store";
import Observer from "observer";
const { ccclass, property } = _decorator;
const { observer, render } = Observer;

@ccclass("PreBet")
@observer
export class PreBet extends Component {
  @property(Node)
  containerAnimation: Node = null;

  @property(Node)
  backgroundImage: Node = null;

  @property(CCInteger)
  durationMillisecondsAnimation = 3000;

  protected readonly durationAnimation = 0.2;
  protected backgroundVideoPlayer: BackgroundVideoPlayer = null;
  protected currentState = GameFlowState.Unknown;
  protected durationStateTimeMs = 0;
  protected currentNodes: Node[] = [];

  onLoad() {
    this.currentNodes = [this.backgroundImage, this.containerAnimation];
  }

  initBackgroundImage() {
    const canvas = find("Canvas");
    const backgroundVideoPlayer = canvas?.getComponentInChildren(
      BackgroundVideoPlayer
    );
    this.backgroundVideoPlayer = backgroundVideoPlayer;
    this.backgroundVideoPlayer.node.on(
      BackgroundVideoPlayerEvent.VIDEO_ENDED,
      this.handleVideoEnded,
      this
    );
  }

  @render(GameFlowStore, (store) => store.data)
  async preloadAndPlayIntro(gameFlowData: GameFlowData) {
    this.updateState(gameFlowData);

    if (!this.isPrebetState(gameFlowData)) {
      return;
    }

    const currentStateTimeMs = gameFlowData?.currentStateTimeMs ?? 0;

    if (this.isInitialPhase(currentStateTimeMs)) {
      await this.handleInitialPhase();
      return;
    }

    if (this.isStaticSpinePhase(currentStateTimeMs)) {
      this.handleStaticSpine();
      return;
    }

    if (this.isFadeOutPhase(currentStateTimeMs)) {
      this.fadeNodes(true);
      return;
    }

    if (this.isEndPhase(currentStateTimeMs)) {
      this.handleStaticSpine();
    }
  }

  protected updateState(gameFlowData: GameFlowData) {
    this.currentState = gameFlowData?.state ?? GameFlowState.Unknown;
    this.durationStateTimeMs = gameFlowData?.currentStateTimeMs ?? 0;
  }

  protected isPrebetState(gameFlowData: GameFlowData): boolean {
    return (
      gameFlowData?.state === GameFlowState.Prebet ||
      gameFlowData?.state === GameFlowState.PhaseChange
    );
  }

  protected isInitialPhase(currentStateTimeMs: number): boolean {
    return currentStateTimeMs === 0;
  }

  protected isStaticSpinePhase(currentStateTimeMs: number): boolean {
    return (
      currentStateTimeMs > 0 &&
      currentStateTimeMs < this.durationMillisecondsAnimation
    );
  }

  protected isFadeOutPhase(currentStateTimeMs: number): boolean {
    const fadeOutStartTime = this.durationMillisecondsAnimation;
    const fadeOutEndTime =
      this.durationStateTimeMs - this.durationMillisecondsAnimation;
    return (
      currentStateTimeMs >= fadeOutStartTime &&
      currentStateTimeMs > fadeOutEndTime
    );
  }

  protected isEndPhase(currentStateTimeMs: number): boolean {
    const endPhaseStartTime =
      this.durationStateTimeMs - this.durationMillisecondsAnimation;
    return currentStateTimeMs > endPhaseStartTime;
  }

  protected async handleInitialPhase() {
    this.scheduleOnce(() => {
      this.fadeNodes(true);
    }, this.durationMillisecondsAnimation / 1000);

    await AnimationUtils.fadeInAndActivate(
      this.containerAnimation,
      this.durationAnimation
    );
    await this.handleDynamicSpine();
  }

  protected async fadeNodes(isFadeOut = false) {
    const promises: Promise<any>[] = [];
    this.currentNodes?.forEach((node) => {
      node &&
        promises.push(
          isFadeOut
            ? AnimationUtils.fadeOutAndDeactivate(node, this.durationAnimation)
            : AnimationUtils.fadeInAndActivate(node, this.durationAnimation)
        );
    });

    await Promise.all(promises);
  }

  async handleVideoEnded() {
    console.log("handleVideoEnded----", this.currentState);
    if (this.currentState === GameFlowState.Prebet) {
      await this.fadeNodes(false);

      await this.handleDynamicSpine();
    }
  }

  protected async handleStaticSpine() {}
  protected async handleDynamicSpine() {}
}
