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

  protected readonly durationFade = 0.5;
  protected readonly durationFadeIn = 1;
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
      BackgroundVideoPlayerEvent.VIDEO_ABOUT_TO_END,
      this.handleVideoEnded,
      this
    );
    this.backgroundVideoPlayer.node.off(
      BackgroundVideoPlayerEvent.SYNC_DURATION,
      this.syncDurationVideo,
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
      BackgroundVideoPlayerEvent.SYNC_DURATION,
      this.syncDurationVideo,
      this
    );
    this.backgroundVideoPlayer.node.on(
      BackgroundVideoPlayerEvent.VIDEO_ABOUT_TO_END,
      this.handleVideoEnded,
      this
    );
  }

  @render(GameFlowStore, (store) => store.data)
  async preloadAndPlayIntro(gameFlowData: GameFlowData) {
    this.updateState(gameFlowData);
    this.lastGameFlowData = gameFlowData;

    if (!this.shouldHandlePhase(gameFlowData)) {
      return Promise.resolve();
    }

    const currentStateTimeMs = gameFlowData?.currentStateTimeMs ?? 0;

    if (this.isInitialPhase(currentStateTimeMs)) {
      return this.handleInitialPhase();
    }

    if (this.isStaticPhase(currentStateTimeMs)) {
      return this.shouldHandleSpine() ? this.handleStatic() : Promise.resolve();
    }

    if (this.isHideStaticPhase(currentStateTimeMs)) {
      return this.fadeNodes(true, 0);
    }

    return Promise.resolve();
  }

  protected updateState(gameFlowData: GameFlowData) {
    this.currentState = gameFlowData?.state ?? GameFlowState.Unknown;
    this.durationMs = gameFlowData?.durationMs ?? 0;
  }

  protected shouldHandlePhase(gameFlowData: GameFlowData): boolean {
    return (
      gameFlowData?.state === GameFlowState.Prebet ||
      gameFlowData?.state === GameFlowState.PhaseChange
    );
  }

  protected isInitialPhase(currentStateTimeMs: number): boolean {
    return currentStateTimeMs === 0;
  }

  protected isStaticPhase(currentStateTimeMs: number): boolean {
    return (
      (currentStateTimeMs > 0 &&
        currentStateTimeMs < this.durationMillisecondsAnimation) ||
      (currentStateTimeMs >
        this.durationVideoMs + this.durationMillisecondsAnimation &&
        currentStateTimeMs < this.durationMs)
    );
  }

  protected isHideStaticPhase(currentStateTimeMs: number): boolean {
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
      this.durationFade
    );
  }

  protected async fadeNodes(isFadeOut = false, duration = this.durationFade) {
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
    if (this.isHandlingVideoEnded || !this.shouldHandleVideoEnded()) {
      return;
    }

    this.isHandlingVideoEnded = true;

    try {
      await this.processVideoEndTransition();
    } finally {
      this.isHandlingVideoEnded = false;
    }
  }

  protected shouldHandleVideoEnded(): boolean {
    return (
      this.currentState === GameFlowState.Prebet ||
      this.currentState === GameFlowState.PhaseChange
    );
  }

  protected async processVideoEndTransition() {
    await this.fadeNodes(true, 0);

    const promises: Promise<void>[] = [this.fadeNodes(false)];

    if (this.shouldHandleSpine()) {
      promises.push(this.handleDynamic());
    }

    await Promise.all(promises);
  }

  protected async handleStatic() {
    this.fadeNodes(false, 0);
  }

  protected async handleDynamic() {
    this.fadeNodes(false, this.durationFadeIn);
  }
}
