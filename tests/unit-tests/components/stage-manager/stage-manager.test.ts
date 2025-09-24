import { StageManager } from "../../../../assets/scripts/components/stage-manager/stage-manager";
import { Stage } from "../../../../assets/scripts/components/stage/stage";
import { FeatureStage } from "../../../../assets/scripts/watchers/stages/stage-watcher";


describe("StageManager", () => {
	let manager: StageManager;

	beforeEach(() => {
		// Arrange
		manager = new StageManager();
	});

	describe("syncStage", () => {
		it("enables targets matching the stage and disables others", () => {
			// Arrange
			const a = new Stage();
			const b = new Stage();
			a.stageName = FeatureStage.Prebet;
			b.stageName = FeatureStage.Streaming;
			manager.targets = [a, b];

			// Act
			(manager as any).syncStage(FeatureStage.Streaming);

			// Assert
			expect(a.node.active).toBe(false);
			expect(b.node.active).toBe(true);
		});
	});
});
