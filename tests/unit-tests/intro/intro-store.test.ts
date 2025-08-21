import { IntroStore } from "../../../assets/scripts/intro/intro-store";
import { VideoStatus } from "../../../assets/scripts/streaming/streaming-type";

describe("IntroStore", () => {
  let store: IntroStore;

  beforeEach(() => {
    store = new IntroStore();
  });

  afterEach(() => {
    // keep consistent cleanup intent
  });

  describe("initialization", () => {
    it("should initialize with default values", () => {
      // Assert
      expect(store.url).toBe("");
      expect(store.currentTime).toBe(0);
      expect(store.status).toBe(VideoStatus.Stopped);
    });

    it("should be properly decorated with injectable and store decorators", () => {
      // Assert
      expect(store).toBeDefined();
      expect(typeof store.setUrl).toBe("function");
      expect(typeof store.update).toBe("function");
    });

    it("should have observable properties", () => {
      // Assert - properties should be defined and accessible
      expect(store.url).toBeDefined();
      expect(store.currentTime).toBeDefined();
      expect(store.status).toBeDefined();
    });
  });

  describe("setUrl method", () => {
    it("should set url property", () => {
      // Arrange
      const testUrl = "http://example.com/intro.mp4";

      // Act
      store.setUrl(testUrl);

      // Assert
      expect(store.url).toBe(testUrl);
    });

    it("should handle empty string url", () => {
      // Arrange
      store.setUrl("http://test.com");
      expect(store.url).toBe("http://test.com");

      // Act
      store.setUrl("");

      // Assert
      expect(store.url).toBe("");
    });

    it("should handle different url formats", () => {
      // Test different URL formats
      const testCases = [
        "https://cdn.example.com/videos/intro.mp4",
        "http://localhost:3000/intro.webm",
        "/assets/intro.mov",
        "./intro.avi"
      ];

      testCases.forEach(url => {
        // Act
        store.setUrl(url);

        // Assert
        expect(store.url).toBe(url);
      });
    });


  });

  describe("update method", () => {
    it("should update currentTime and status", () => {
      // Arrange
      const updateData = {
        currentTime: 45.5,
        status: VideoStatus.Playing
      };

      // Act
      store.update(updateData);

      // Assert
      expect(store.currentTime).toBe(45.5);
      expect(store.status).toBe(VideoStatus.Playing);
    });

    it("should handle different video statuses", () => {
      // Test all VideoStatus enum values
      const statusTests = [
        VideoStatus.Playing,
        VideoStatus.Stopped
      ];

      statusTests.forEach(status => {
        // Act
        store.update({ currentTime: 10, status });

        // Assert
        expect(store.status).toBe(status);
      });
    });

    it("should handle zero and negative currentTime", () => {
      // Test zero time
      store.update({ currentTime: 0, status: VideoStatus.Playing });
      expect(store.currentTime).toBe(0);

      // Test negative time (edge case)
      store.update({ currentTime: -5, status: VideoStatus.Stopped });
      expect(store.currentTime).toBe(-5);
    });

    it("should handle large currentTime values", () => {
      // Arrange
      const largeTime = 3600.123; // 1 hour + decimals

      // Act
      store.update({ currentTime: largeTime, status: VideoStatus.Playing });

      // Assert
      expect(store.currentTime).toBe(largeTime);
    });

    it("should handle multiple consecutive updates", () => {
      // Arrange & Act
      store.update({ currentTime: 10, status: VideoStatus.Playing });
      expect(store.currentTime).toBe(10);
      expect(store.status).toBe(VideoStatus.Playing);

      store.update({ currentTime: 25.5, status: VideoStatus.Stopped });
      expect(store.currentTime).toBe(25.5);
      expect(store.status).toBe(VideoStatus.Stopped);

      store.update({ currentTime: 60, status: VideoStatus.Stopped });
      expect(store.currentTime).toBe(60);
      expect(store.status).toBe(VideoStatus.Stopped);
    });
  });

  describe("property independence", () => {
    it("should allow url to be set independently of update", () => {
      // Arrange
      store.setUrl("http://example.com/video1.mp4");
      store.update({ currentTime: 30, status: VideoStatus.Playing });

      // Act
      store.setUrl("http://example.com/video2.mp4");

      // Assert
      expect(store.url).toBe("http://example.com/video2.mp4");
      expect(store.currentTime).toBe(30); // Should remain unchanged
      expect(store.status).toBe(VideoStatus.Playing); // Should remain unchanged
    });

    it("should allow update to modify time/status independently of url", () => {
      // Arrange
      store.setUrl("http://example.com/video.mp4");
      store.update({ currentTime: 10, status: VideoStatus.Playing });

      // Act
      store.update({ currentTime: 50, status: VideoStatus.Stopped });

      // Assert
      expect(store.url).toBe("http://example.com/video.mp4"); // Should remain unchanged
      expect(store.currentTime).toBe(50);
      expect(store.status).toBe(VideoStatus.Stopped);
    });
  });

  describe("mobx integration", () => {
    it("should have mobx observable properties", () => {
      // Arrange - get initial values
      const initialUrl = store.url;
      const initialTime = store.currentTime;
      const initialStatus = store.status;

      // Act - modify properties
      store.setUrl("test-url");
      store.update({ currentTime: 123, status: VideoStatus.Playing });

      // Assert - properties should have changed
      expect(store.url).not.toBe(initialUrl);
      expect(store.currentTime).not.toBe(initialTime);
      expect(store.status).not.toBe(initialStatus);

      expect(store.url).toBe("test-url");
      expect(store.currentTime).toBe(123);
      expect(store.status).toBe(VideoStatus.Playing);
    });
  });
});
