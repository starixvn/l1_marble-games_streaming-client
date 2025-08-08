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
});
