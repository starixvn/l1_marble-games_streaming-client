import { LiveScoreStore, LiveScoreData } from "../../../../assets/scripts/features/live-score/live-score-store";

// Mock the decorators and dependencies
jest.mock("inversify", () => ({
    injectable: () => (target: any) => target,
}));

jest.mock("../../../../assets/scripts/store-decorator", () => ({
    store: () => (target: any) => target,
}));

jest.mock("mobx", () => ({
    makeObservable: jest.fn(),
    observable: {},
    action: {},
}));

describe("LiveScoreStore", () => {
    describe("constructor", () => {
        it("should initialize data as null", () => {
            // Arrange & Act
            const store = new LiveScoreStore();

            // Assert
            expect(store.data).toBeNull();
        });
    });

    describe("update", () => {
        it("should update data with LiveScoreData", () => {
            // Arrange
            const store = new LiveScoreStore();
            const testData: LiveScoreData = {
                homeScore: 3,
                awayScore: 2
            };

            // Act
            store.update(testData);

            // Assert
            expect(store.data).toEqual(testData);
        });

        it("should overwrite previous LiveScoreData", () => {
            // Arrange
            const store = new LiveScoreStore();
            const firstData: LiveScoreData = {
                homeScore: 1,
                awayScore: 0
            };
            const secondData: LiveScoreData = {
                homeScore: 2,
                awayScore: 1
            };
            store.data = firstData;

            // Act
            store.update(secondData);

            // Assert
            expect(store.data).toEqual(secondData);
        });
    });
});
