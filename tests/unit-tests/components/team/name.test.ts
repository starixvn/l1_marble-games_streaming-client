import { Name } from "../../../../assets/scripts/components/team/name";


describe("Name", () => {
	let comp: Name;

	beforeEach(() => {
		// Arrange
		comp = new Name();
	});

	describe("properties", () => {
		it("has default values", () => {
			// Arrange
			// Act & Assert
			expect((comp as any).short).toBe(false);
		});
	});
});
