import { BackgroundStore } from "../../../../assets/scripts/local-stores/background/background-store";

describe("BackgroundStore", () => {
    let store: BackgroundStore;

    beforeEach(() => {
        store = new BackgroundStore();
    });

    describe("constructor", () => {
        it("should initialize with default state", () => {
            // Arrange
            const newStore = new BackgroundStore();

            // Act & Assert
            expect(newStore.isShowingBackground).toBe(false);
        });
    });

    describe("showBackground", () => {
        it("should set isShowingBackground to true when passed true", () => {
            // Arrange
            store.isShowingBackground = false;

            // Act
            store.showBackground(true);

            // Assert
            expect(store.isShowingBackground).toBe(true);
        });

        it("should set isShowingBackground to false when passed false", () => {
            // Arrange
            store.isShowingBackground = true;

            // Act
            store.showBackground(false);

            // Assert
            expect(store.isShowingBackground).toBe(false);
        });
    });
});
