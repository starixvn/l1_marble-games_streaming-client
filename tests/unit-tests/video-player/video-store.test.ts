import { Phase } from "../../../assets/scripts/streaming/streaming-type";
import { VideoStore } from "../../../assets/scripts/video-player/video-store";

describe("VideoStore", () => {
  let store: VideoStore;

  beforeEach(() => {
    store = new VideoStore();
  });

  afterEach(() => {
    // keep consistent cleanup intent
  });

  it("should initialize with defaults", () => {
    expect(store.url).toBe("");
    expect(store.videoLiveTime).toBe(0);
    expect(store.defaultBackgroundEnabled).toBe(false);
  });

  it("should set url via setUrl", () => {
    // Act
    store.setUrl("https://example.com/stream.m3u8");
    // Assert
    expect(store.url).toBe("https://example.com/stream.m3u8");
  });

  it("should update url from event data and clear when empty", () => {
    // Arrange
    store.setUrl("initial");
    // Act
    store.updateUrlFromEventData("");
    // Assert
    expect(store.url).toBe("");

    // Act
    store.updateUrlFromEventData("v2");
    // Assert
    expect(store.url).toBe("v2");
  });

  it("should convert video live time ms to seconds", () => {
    // Act
    store.updateVideoTime(1500);
    // Assert
    expect(store.videoLiveTime).toBe(1.5);
  });

  it("should enable/disable default background flag", () => {
    // Act
    store.enableDefaultBackground(true);
    // Assert
    expect(store.defaultBackgroundEnabled).toBe(true);

    // Act
    store.enableDefaultBackground(false);
    // Assert
    expect(store.defaultBackgroundEnabled).toBe(false);
  });

  describe("updateVideoTime", () => {
    it("should update video live time", () => {
      // Act
      store.updateVideoTime(1500);
      // Assert
      expect(store.videoLiveTime).toBe(1.5);
    });
  });

  describe("updateCurrentPhase", () => {
    it("should update current phase", () => {
      // Act
      store.updateCurrentPhase(Phase.UpdateVideoInfo);
      // Assert
      expect(store.currentPhase).toBe(Phase.UpdateVideoInfo);
    });
  });

  describe("update", () => {
    it("should update all fields", () => {
      // Act
      store.update({
        videoLiveTimeMs: 1500,
        currentPhase: Phase.UpdateVideoInfo,
        url: "https://example.com/stream.m3u8",
        halfIndex: 0,
      });
      // Assert
      expect(store.videoLiveTime).toBe(1.5);
      expect(store.currentPhase).toBe(Phase.UpdateVideoInfo);
      expect(store.url).toBe("https://example.com/stream.m3u8");
      expect(store.halfIndex).toBe(0);
    });
  });
});
