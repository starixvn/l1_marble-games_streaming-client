import { _decorator, CCInteger, Component, Enum, find, Node } from "cc";
import {
  AnimationUtils,
  FunctionUtils,
} from "db://assets/scripts/common/utils";
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

@ccclass("PhaseTransition")
@observer
export class PhaseTransition extends Component {
  @property(Node)
  containerAnimation: Node = null;

  @property(Node)
  backgroundImage: Node = null;

  @property({ type: Enum(GameFlowState) })
  gameFlowState: GameFlowState = GameFlowState.Unknown;

  @property(CCInteger)
  durationMillisecondsAnimation = 3000;

  protected readonly durationAnimation = 0.2;
  protected backgroundVideoPlayer: BackgroundVideoPlayer = null;
  protected currentState = GameFlowState.Unknown;
  protected durationStateTimeMs = 0;
  protected currentNodes: Node[] = [];
  protected isHandlingVideoEnded = false;

  onLoad() {
    this.currentNodes = [this.backgroundImage, this.containerAnimation];
    this.initBackgroundImage();
  }

  onDestroy() {
    this.backgroundVideoPlayer.node.off(
      BackgroundVideoPlayerEvent.VIDEO_ENDED,
      this.handleVideoEnded,
      this
    );
    this.unscheduleAllCallbacks();
  }

  protected shouldHandleSpine(): boolean {
    return this.currentState === this.gameFlowState;
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
      return Promise.resolve();
    }

    const currentStateTimeMs = gameFlowData?.currentStateTimeMs ?? 0;

    if (this.isInitialPhase(currentStateTimeMs)) {
      return this.handleInitialPhase();
    }

    if (this.isStaticSpinePhase(currentStateTimeMs)) {
      return this.shouldHandleSpine()
        ? this.handleStaticSpine()
        : Promise.resolve();
    }

    if (this.isFadeOutPhase(currentStateTimeMs)) {
      return this.fadeNodes(true);
    }

    if (this.isEndPhase(currentStateTimeMs)) {
      return this.shouldHandleSpine()
        ? this.handleStaticSpine()
        : Promise.resolve();
    }

    return Promise.resolve();
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
    }, FunctionUtils.msToSeconds(this.durationMillisecondsAnimation));

    await AnimationUtils.fadeInAndActivate(
      this.containerAnimation,
      this.durationAnimation
    );
    return this.shouldHandleSpine()
      ? this.handleDynamicSpine()
      : Promise.resolve();
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
    if (this.isHandlingVideoEnded) {
      return;
    }

    if (
      this.currentState === GameFlowState.Prebet ||
      this.currentState === GameFlowState.PhaseChange
    ) {
      this.isHandlingVideoEnded = true;
      await this.fadeNodes(false);

      const result = this.shouldHandleSpine()
        ? this.handleDynamicSpine()
        : Promise.resolve();

      await result;
      this.isHandlingVideoEnded = false;
    }
  }

  protected async handleStaticSpine() {}
  protected async handleDynamicSpine() {}
}
