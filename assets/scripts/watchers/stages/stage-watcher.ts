import { inject, injectable } from "inversify";
import { GameFlowState, GameFlowStore } from "../../features/game-flow/game-flow-store";
import { IntroStore } from "../../features/intro/intro-store";

export enum FeatureStage {
    Unknown,
    Prebet,
    Streaming,
    HalfTime,
    Result,
    Intro,
}


@injectable()
export class StageWatcher {
    @inject(GameFlowStore) private readonly gameFlowStore: GameFlowStore;
    @inject(IntroStore) private readonly introStore: IntroStore;

    private readonly stageMapper = new Map<GameFlowState, FeatureStage>([
        [GameFlowState.Prebet, FeatureStage.Prebet],
        [GameFlowState.Streaming, FeatureStage.Streaming],
        [GameFlowState.HalfTime, FeatureStage.HalfTime],
        [GameFlowState.Result, FeatureStage.Result],
        [GameFlowState.Unknown, FeatureStage.Unknown],
    ]);

    get stage() {
        if (this.introStore.data.isPlaying) {
            return FeatureStage.Intro;
        }

        return this.stageMapper.get(this.gameFlowStore.data.state) ?? FeatureStage.Unknown;
    }

    get isVideoPlaying() {
        return this.stage === FeatureStage.Intro || this.stage === FeatureStage.Streaming;
    }
}