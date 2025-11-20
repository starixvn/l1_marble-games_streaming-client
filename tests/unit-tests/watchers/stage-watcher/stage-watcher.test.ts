import "reflect-metadata";
import {
  StageWatcher,
  FeatureStage,
} from "../../../../assets/scripts/watchers/stages/stage-watcher";
import {
  GameFlowStore,
  GameFlowState,
} from "../../../../assets/scripts/features/game-flow/game-flow-store";

describe("StageWatcher", () => {
  let watcher: StageWatcher;
  let mockGameFlowStore: GameFlowStore;

  beforeEach(() => {
    // Arrange
    mockGameFlowStore = new GameFlowStore();

    // Inject mocks
    watcher = new StageWatcher() as any;
    (watcher as any).gameFlowStore = mockGameFlowStore;
  });

  describe("stage", () => {
    it("maps game flow states to feature stages", () => {
      const cases: Array<{ state: GameFlowState; expected: FeatureStage }> = [
        { state: GameFlowState.Prebet, expected: FeatureStage.Prebet },
        { state: GameFlowState.Streaming, expected: FeatureStage.Streaming },
        {
          state: GameFlowState.EventDetailChange,
          expected: FeatureStage.EventDetailChange,
        },
        {
          state: GameFlowState.PhaseChange,
          expected: FeatureStage.PhaseChange,
        },
        { state: GameFlowState.Result, expected: FeatureStage.Result },
        { state: GameFlowState.Unknown, expected: FeatureStage.Unknown },
        { state: undefined, expected: FeatureStage.Unknown },
      ];

      // Act & Assert
      for (const testCase of cases) {
        mockGameFlowStore.data.state = testCase.state;
        expect(watcher.stage).toBe(testCase.expected);
      }
    });
  });

  describe("isVideoPlaying", () => {
    it("is true for Streaming", () => {
      // Arrange
      mockGameFlowStore.data.state = GameFlowState.Streaming;

      // Act
      const result = watcher.isVideoPlaying;

      // Assert
      expect(result).toBe(true);
    });

    it("is false for non-video stages", () => {
      const nonVideoStates: GameFlowState[] = [
        GameFlowState.Prebet,
        GameFlowState.EventDetailChange,
        GameFlowState.PhaseChange,
        GameFlowState.Result,
        GameFlowState.Unknown,
      ];

      // Act & Assert
      for (const s of nonVideoStates) {
        mockGameFlowStore.data.state = s;
        expect(watcher.isVideoPlaying).toBe(false);
      }
    });
  });
});
