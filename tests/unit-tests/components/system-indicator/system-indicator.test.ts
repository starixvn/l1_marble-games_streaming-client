import { SystemIndicator, NetworkStatus } from "../../../../assets/scripts/components/system-indicator/system-indicator";
import { Node } from "cc";


describe("SystemIndicator", () => {
	let comp: SystemIndicator;

	beforeEach(() => {
		// Arrange
		comp = new SystemIndicator();
	});

	describe("networkStatus", () => {
		it("sets internal network status", () => {
			// Arrange
			// Act
			(comp as any).networkStatus = NetworkStatus.BAD;

			// Assert
			expect((comp as any)._networkStatus).toBe(NetworkStatus.BAD);
		});
	});

	describe("setLiveIndicatorVisibility", () => {
		it("toggles liveNode active state", () => {
			// Arrange
			(comp as any).liveNode = new Node();

			// Act
			comp.setLiveIndicatorVisibility(true);

			// Assert
			expect((comp as any).liveNode.active).toBe(true);
		});

		it("does nothing when liveNode missing", () => {
			// Arrange
			(comp as any).liveNode = null;

			// Act
			comp.setLiveIndicatorVisibility(false);

			// Assert
			expect((comp as any).liveNode).toBeNull();
		});
	});
});
