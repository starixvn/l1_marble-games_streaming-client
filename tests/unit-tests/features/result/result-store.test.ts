import { ResultStore, ResultData } from "../../../../assets/scripts/features/result/result-store";

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

describe("ResultStore", () => {
    describe("constructor", () => {
        it("should initialize data as null", () => {
            // Arrange & Act
            const store = new ResultStore();

            // Assert
            expect(store.data).toBeNull();
        });
    });

    describe("update", () => {
        it("should update data with ResultData", () => {
            // Arrange
            const store = new ResultStore();
            const testData: ResultData = {
                result: {
                    1: { homeScore: 2, awayScore: 1 },
                    2: { homeScore: 1, awayScore: 3 }
                }
            };

            // Act
            store.update(testData);

            // Assert
            expect(store.data).toEqual(testData);
        });

        it("should overwrite previous ResultData", () => {
            // Arrange
            const store = new ResultStore();
            const firstData: ResultData = {
                result: {
                    1: { homeScore: 0, awayScore: 0 }
                }
            };
            const secondData: ResultData = {
                result: {
                    1: { homeScore: 3, awayScore: 2 },
                    2: { homeScore: 1, awayScore: 1 }
                }
            };
            store.data = firstData;

            // Act
            store.update(secondData);

            // Assert
            expect(store.data).toEqual(secondData);
        });
    });
});
