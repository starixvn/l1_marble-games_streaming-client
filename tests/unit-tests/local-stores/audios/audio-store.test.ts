import { AudioStore } from "../../../../assets/scripts/local-stores/audio/audio-store";


describe("AudioStore", () => {
	let store: AudioStore;

	beforeEach(() => {
		// Arrange
		store = new AudioStore();
	});

	describe("setMuted", () => {
		it("updates muted flag", () => {
			// Arrange
			// Act
			store.setMuted(true);

			// Assert
			expect(store.muted).toBe(true);
		});
	});

	describe("setBrowserBlocked", () => {
		it("updates browserBlocked flag", () => {
			// Arrange
			// Act
			store.setBrowserBlocked(false);

			// Assert
			expect(store.browserBlocked).toBe(false);
		});
	});
});
