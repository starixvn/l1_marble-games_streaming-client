import { _decorator, CCInteger, Component, Enum, find, log, Node } from "cc";
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

  @property(CCInteger)
  durationVideoMs = 24000;

  protected readonly durationAnimation = 0.3;
  protected backgroundVideoPlayer: BackgroundVideoPlayer = null;
  protected currentState = GameFlowState.Unknown;
  protected durationMs = 0;
  protected currentNodes: Node[] = [];
  protected isHandlingVideoEnded = false;
  protected lastGameFlowData: GameFlowData | null = null;

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

  protected syncDurationVideo(duration: number) {
    log(
      "syncDurationVideo-----------",
      this.durationVideoMs,
      this.currentState
    );
    this.durationVideoMs = duration * 1000;
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
    this.backgroundVideoPlayer.node.on(
      BackgroundVideoPlayerEvent.SYNC_DURATION,
      this.syncDurationVideo,
      this
    );
  }

  @render(GameFlowStore, (store) => store.data)
  async preloadAndPlayIntro(gameFlowData: GameFlowData) {
    this.updateState(gameFlowData);
    this.lastGameFlowData = gameFlowData;

    if (!this.isPresentTeamPhase(gameFlowData)) {
      return Promise.resolve();
    }

    const currentStateTimeMs = gameFlowData?.currentStateTimeMs ?? 0;

    if (this.isInitialPhase(currentStateTimeMs)) {
      return this.handleInitialPhase();
    }

    if (this.isStaticPresentTeamPhase(currentStateTimeMs)) {
      return this.shouldHandleSpine()
        ? this.handleStaticSpine()
        : Promise.resolve();
    }

    if (this.isHideStaticPresentTeamPhase(currentStateTimeMs)) {
      return this.fadeNodes(true, 0);
    }

    return Promise.resolve();
  }

  protected async recalculatePhases(gameFlowData: GameFlowData) {
    const currentStateTimeMs = gameFlowData?.currentStateTimeMs ?? 0;

    if (this.isStaticPresentTeamPhase(currentStateTimeMs)) {
      return this.shouldHandleSpine()
        ? this.handleStaticSpine()
        : Promise.resolve();
    }

    if (this.isHideStaticPresentTeamPhase(currentStateTimeMs)) {
      return this.fadeNodes(true, 0);
    }

    return Promise.resolve();
  }

  protected updateState(gameFlowData: GameFlowData) {
    this.currentState = gameFlowData?.state ?? GameFlowState.Unknown;
    this.durationMs = gameFlowData?.durationMs ?? 0;
  }

  protected isPresentTeamPhase(gameFlowData: GameFlowData): boolean {
    return (
      gameFlowData?.state === GameFlowState.Prebet ||
      gameFlowData?.state === GameFlowState.PhaseChange
    );
  }

  protected isInitialPhase(currentStateTimeMs: number): boolean {
    return currentStateTimeMs === 0;
  }

  protected isStaticPresentTeamPhase(currentStateTimeMs: number): boolean {
    return (
      (currentStateTimeMs > 0 &&
        currentStateTimeMs < this.durationMillisecondsAnimation) ||
      (currentStateTimeMs >
        this.durationVideoMs + this.durationMillisecondsAnimation &&
        currentStateTimeMs < this.durationMs)
    );
  }

  protected isHideStaticPresentTeamPhase(currentStateTimeMs: number): boolean {
    return (
      currentStateTimeMs > this.durationMillisecondsAnimation &&
      currentStateTimeMs <
        this.durationVideoMs + this.durationMillisecondsAnimation
    );
  }

  protected async handleInitialPhase() {
    this.scheduleOnce(() => {
      this.fadeNodes(true);
    }, FunctionUtils.msToSeconds(this.durationMillisecondsAnimation));

    await AnimationUtils.fadeInAndActivate(
      this.containerAnimation,
      this.durationAnimation
    );
  }

  protected async fadeNodes(
    isFadeOut = false,
    duration = this.durationAnimation
  ) {
    const promises: Promise<any>[] = [];
    this.currentNodes?.forEach((node) => {
      node &&
        promises.push(
          isFadeOut
            ? AnimationUtils.fadeOutAndDeactivate(node, duration)
            : AnimationUtils.fadeInAndActivate(node, duration)
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
      await this.fadeNodes(true, 0);
      this.isHandlingVideoEnded = true;
      await this.fadeNodes(false);

      const result = this.shouldHandleSpine()
        ? this.handleDynamicSpine()
        : Promise.resolve();

      await result;
      this.isHandlingVideoEnded = false;
    }
  }

  protected async handleStaticSpine() {
    this.fadeNodes(false, 0);
  }
  protected async handleDynamicSpine() {}
}
