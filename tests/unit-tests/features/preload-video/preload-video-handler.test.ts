import "reflect-metadata"
import { Container } from "inversify";
import { PreloadVideoHandler } from "../../../../assets/scripts/features/preload-video/preload-video-handler";
import { PreloadVideoStore } from "../../../../assets/scripts/features/preload-video/preload-video-store";

describe("PreloadVideoHandler", () => {
    let container: Container;
    let store: jest.Mocked<PreloadVideoStore>;

    beforeEach(() => {
        container = new Container();
        store = {
            update: jest.fn(),
        } as unknown as jest.Mocked<PreloadVideoStore>;
        
        container.bind(PreloadVideoStore).toConstantValue(store);
        container.bind(PreloadVideoHandler).toSelf();
    });

    describe("name", () => {
        it("should have fixed name as preloadVideo", () => {
            // Arrange
            const handler = container.get(PreloadVideoHandler);
            const expected = "preloadVideo";
            
            // Act
            const actual = handler.name;

            // Assert
            expect(actual).toBe(expected);
        });
    });
});

