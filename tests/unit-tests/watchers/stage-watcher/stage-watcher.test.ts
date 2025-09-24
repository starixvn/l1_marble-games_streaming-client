import "reflect-metadata";
import { StageWatcher, FeatureStage } from "../../../../assets/scripts/watchers/stages/stage-watcher";
import { GameFlowStore, GameFlowState } from "../../../../assets/scripts/features/game-flow/game-flow-store";
import { IntroStore } from "../../../../assets/scripts/features/intro/intro-store";


describe("StageWatcher", () => {
	let watcher: StageWatcher;
	let mockGameFlowStore: GameFlowStore;
	let mockIntroStore: IntroStore;

	beforeEach(() => {
		// Arrange
		mockGameFlowStore = new GameFlowStore();
		mockIntroStore = new IntroStore();

		// Inject mocks
		watcher = new StageWatcher() as any;
		(watcher as any).gameFlowStore = mockGameFlowStore;
		(watcher as any).introStore = mockIntroStore;
	});

	describe("stage", () => {
		it("returns Intro when intro is playing", () => {
			// Arrange
			mockIntroStore.data.isPlaying = true;
			mockGameFlowStore.data.state = GameFlowState.Streaming;

			// Act
			const result = watcher.stage;

			// Assert
			expect(result).toBe(FeatureStage.Intro);
		});

		it("maps game flow states to feature stages when intro not playing", () => {
			// Arrange
			mockIntroStore.data.isPlaying = false;

			const cases: Array<{ state: GameFlowState; expected: FeatureStage }> = [
				{ state: GameFlowState.Prebet, expected: FeatureStage.Prebet },
				{ state: GameFlowState.Streaming, expected: FeatureStage.Streaming },
				{ state: GameFlowState.HalfTime, expected: FeatureStage.HalfTime },
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
		it("is true for Intro", () => {
			// Arrange
			mockIntroStore.data.isPlaying = true;

			// Act
			const result = watcher.isVideoPlaying;

			// Assert
			expect(result).toBe(true);
		});

		it("is true for Streaming", () => {
			// Arrange
			mockIntroStore.data.isPlaying = false;
			mockGameFlowStore.data.state = GameFlowState.Streaming;

			// Act
			const result = watcher.isVideoPlaying;

			// Assert
			expect(result).toBe(true);
		});

		it("is false for non-video stages", () => {
			// Arrange
			mockIntroStore.data.isPlaying = false;

			const nonVideoStates: GameFlowState[] = [
				GameFlowState.Prebet,
				GameFlowState.HalfTime,
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
