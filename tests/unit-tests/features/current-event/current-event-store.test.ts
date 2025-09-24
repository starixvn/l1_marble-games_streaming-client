import { CurrentEventStore, CurrentEventData } from "../../../../assets/scripts/features/current-event/current-event-store";

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

describe("CurrentEventStore", () => {
    describe("constructor", () => {
        it("should initialize data as null", () => {
            // Arrange & Act
            const store = new CurrentEventStore();

            // Assert
            expect(store.data).toBeNull();
        });
    });

    describe("update", () => {
        it("should update data with CurrentEventData", () => {
            // Arrange
            const store = new CurrentEventStore();
            const testData: CurrentEventData = {
                event: 5,
                eventDetailIndex: 2,
                phase: 1
            };

            // Act
            store.update(testData);

            // Assert
            expect(store.data).toEqual(testData);
        });

        it("should overwrite previous CurrentEventData", () => {
            // Arrange
            const store = new CurrentEventStore();
            const firstData: CurrentEventData = {
                event: 3,
                eventDetailIndex: 1,
                phase: 0
            };
            const secondData: CurrentEventData = {
                event: 7,
                eventDetailIndex: 4,
                phase: 2
            };
            store.data = firstData;

            // Act
            store.update(secondData);

            // Assert
            expect(store.data).toEqual(secondData);
        });
    });
});
