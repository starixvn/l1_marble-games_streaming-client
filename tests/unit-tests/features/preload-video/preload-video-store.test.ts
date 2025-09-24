import { PreloadVideoStore, PreloadVideoData } from "../../../../assets/scripts/features/preload-video/preload-video-store";

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

describe("PreloadVideoStore", () => {
    describe("constructor", () => {
        it("should initialize data with default values", () => {
            // Arrange & Act
            const store = new PreloadVideoStore();

            // Assert
            expect(store.data).toEqual({
                videoLink: ""
            });
        });
    });

    describe("update", () => {
        it("should update data with PreloadVideoData", () => {
            // Arrange
            const store = new PreloadVideoStore();
            const testData: PreloadVideoData = {
                videoLink: "https://example.com/preload-video.mp4"
            };

            // Act
            store.update(testData);

            // Assert
            expect(store.data).toEqual(testData);
        });

        it("should overwrite previous PreloadVideoData", () => {
            // Arrange
            const store = new PreloadVideoStore();
            const firstData: PreloadVideoData = {
                videoLink: "https://example.com/first-preload.mp4"
            };
            const secondData: PreloadVideoData = {
                videoLink: "https://example.com/second-preload.mp4"
            };
            store.data = firstData;

            // Act
            store.update(secondData);

            // Assert
            expect(store.data).toEqual(secondData);
        });
    });
});
