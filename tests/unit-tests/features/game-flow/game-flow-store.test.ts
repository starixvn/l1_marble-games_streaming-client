import { GameFlowStore, GameFlowData, GameFlowState } from "../../../../assets/scripts/features/game-flow/game-flow-store";

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

describe("GameFlowStore", () => {
    describe("constructor", () => {
        it("should initialize data with default values", () => {
            // Arrange & Act
            const store = new GameFlowStore();

            // Assert
            expect(store.data).toEqual({
                state: GameFlowState.Unknown
            });
        });
    });

    describe("update", () => {
        it("should update data with GameFlowData", () => {
            // Arrange
            const store = new GameFlowStore();
            const testData: GameFlowData = {
                state: GameFlowState.Streaming
            };

            // Act
            store.update(testData);

            // Assert
            expect(store.data).toEqual(testData);
        });

        it("should overwrite previous GameFlowData", () => {
            // Arrange
            const store = new GameFlowStore();
            const firstData: GameFlowData = {
                state: GameFlowState.Prebet
            };
            const secondData: GameFlowData = {
                state: GameFlowState.Result
            };
            store.data = firstData;

            // Act
            store.update(secondData);

            // Assert
            expect(store.data).toEqual(secondData);
        });
    });
});
