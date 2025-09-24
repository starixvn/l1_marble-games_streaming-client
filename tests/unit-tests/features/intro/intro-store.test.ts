import { IntroStore, IntroData } from "../../../../assets/scripts/features/intro/intro-store";

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

describe("IntroStore", () => {
    describe("constructor", () => {
        it("should initialize data with default values", () => {
            // Arrange & Act
            const store = new IntroStore();

            // Assert
            expect(store.data).toEqual({
                resourceServer: "",
                introTime: 0,
                timeToPlay: 0,
                isPlaying: false,
                duration: 0
            });
        });
    });

    describe("update", () => {
        it("should update data with IntroData", () => {
            // Arrange
            const store = new IntroStore();
            const testData: IntroData = {
                resourceServer: "https://cdn.example.com",
                introTime: 5000,
                timeToPlay: 1500,
                isPlaying: true,
                duration: 30000
            };

            // Act
            store.update(testData);

            // Assert
            expect(store.data).toEqual(testData);
        });

        it("should overwrite previous IntroData", () => {
            // Arrange
            const store = new IntroStore();
            const firstData: IntroData = {
                resourceServer: "https://old-server.com",
                introTime: 3000,
                timeToPlay: 1000,
                isPlaying: false,
                duration: 20000
            };
            const secondData: IntroData = {
                resourceServer: "https://new-server.com",
                introTime: 7000,
                timeToPlay: 2000,
                isPlaying: true,
                duration: 45000
            };
            store.data = firstData;

            // Act
            store.update(secondData);

            // Assert
            expect(store.data).toEqual(secondData);
        });
    });
});
