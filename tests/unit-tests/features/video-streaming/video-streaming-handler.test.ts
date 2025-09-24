import "reflect-metadata"
import { Container } from "inversify";
import { VideoStreamingData, VideoStreamingStore } from "../../../../assets/scripts/features/video-streaming/video-streaming-store";
import { VideoStreamingHandler } from "../../../../assets/scripts/features/video-streaming/video-streaming-handler";

describe("VideoStreamingHandler", () => {
    let container: Container;
    let store: jest.Mocked<VideoStreamingStore>;
    const FIXED_DATE_NOW = 10000; // Fixed timestamp for predictable tests

    beforeEach(() => {
        // Mock Date.now() to return fixed value
        jest.spyOn(Date, 'now').mockReturnValue(FIXED_DATE_NOW);
        
        container = new Container();
        store = {
            update: jest.fn(),
        } as unknown as jest.Mocked<VideoStreamingStore>;
        container.bind(VideoStreamingStore).toConstantValue(store);
        container.bind(VideoStreamingHandler).toSelf();
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    describe("name", () => {
        it("should have fixed name as videoStreaming", () => {
            // Arrange
            const handler = container.get(VideoStreamingHandler);
            const expected = "videoStreaming";

            // Act
            const actual = handler.name;

            // Assert
            expect(actual).toBe(expected);
        });
    });

    describe("update", () => {
        it("should call store.update with calculated currentTime", () => {
            // Arrange
            const handler = container.get(VideoStreamingHandler);
            const testData: VideoStreamingData = {
                videoLink: "https://example.com/video.mp4",
                timeToStream: 1500,
                currentTime: 300, // This will be overridden by the handler
                phaseIndex: 2
            };
            const expectedCurrentTime = (FIXED_DATE_NOW - testData.timeToStream) / 1000; // (10000 - 1500) / 1000 = 8.5

            // Act 
            handler.update(testData);

            // Assert
            expect(store.update).toHaveBeenCalledWith({
                ...testData,
                currentTime: expectedCurrentTime
            });
        });
    });
});
