import {
  VideoStreamingData,
  VideoStreamingStore,
} from "../../../../assets/scripts/features/video-streaming/video-streaming-store";

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

describe("VideoStreamingStore", () => {
  describe("constructor", () => {
    it("should initialize data with default values", () => {
      // Arrange & Act
      const store = new VideoStreamingStore();

      // Assert
      expect(store.data).toEqual({
        videoLink: "",
        streamingPhaseTime: 0,
        timeToStream: 0,
        currentTime: 0,
        phaseIndex: 0,
        videoLengthMs: 0,
        preloadDurationMs: 0,
      });
    });
  });

  describe("update", () => {
    it("should update data with VideoStreamingData", () => {
      // Arrange
      const store = new VideoStreamingStore();
      const testData: VideoStreamingData = {
        videoLink: "https://example.com/video.mp4",
        timeToStream: 1500,
        streamingPhaseTime: 300,
        currentTime: 300,
        phaseIndex: 2,
        videoLengthMs: 0,
        preloadDurationMs: 0,
      };

      // Act
      store.update(testData);

      // Assert
      expect(store.data).toEqual(testData);
    });

    it("should overwrite previous VideoStreamingData", () => {
      // Arrange
      const store = new VideoStreamingStore();
      const firstData: VideoStreamingData = {
        videoLink: "https://example.com/first.mp4",
        timeToStream: 1000,
        streamingPhaseTime: 100,
        currentTime: 100,
        phaseIndex: 1,
        videoLengthMs: 0,
        preloadDurationMs: 0,
      };
      const secondData: VideoStreamingData = {
        videoLink: "https://example.com/second.mp4",
        timeToStream: 2000,
        streamingPhaseTime: 500,
        currentTime: 500,
        phaseIndex: 3,
        videoLengthMs: 0,
      };
      store.data = firstData;

      // Act
      store.update(secondData);

      // Assert
      expect(store.data).toEqual(secondData);
    });
  });
});
