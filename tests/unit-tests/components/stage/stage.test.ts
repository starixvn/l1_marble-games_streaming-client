import { Stage } from "../../../../assets/scripts/components/stage/stage";
import { FeatureStage } from "../../../../assets/scripts/watchers/stages/stage-watcher";


describe("Stage", () => {
	it("has default stageName Unknown and can be set", () => {
		// Arrange
		const comp = new Stage();

		// Act & Assert
		expect(comp.stageName).toBe(FeatureStage.Unknown);
		comp.stageName = FeatureStage.Streaming;
		expect(comp.stageName).toBe(FeatureStage.Streaming);
	});
});
