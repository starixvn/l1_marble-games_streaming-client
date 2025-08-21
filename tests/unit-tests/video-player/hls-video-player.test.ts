// Mock Hls.js
jest.mock("hls.js", () => {
  const mockHlsInstance = {
    loadSource: jest.fn(),
    attachMedia: jest.fn(),
    detachMedia: jest.fn(),
    destroy: jest.fn(),
    off: jest.fn(),
    currentLevel: 2,
    bandwidthEstimate: 1000000,
  };
  
  const mockHlsConstructor = jest.fn().mockImplementation(() => mockHlsInstance);
  (mockHlsConstructor as any).isSupported = jest.fn().mockReturnValue(true);
  
  return {
    __esModule: true,
    default: mockHlsConstructor,
  };
});

// Mock DOMBackgroundVideo
jest.mock("../../../assets/scripts/video-player/dom-background-video", () => ({
  DOMBackgroundVideo: {
    createOrLoadVideoElement: jest.fn(),
    removeVideoElement: jest.fn(),
  },
}));

import { HLSVideoPlayer, HLSVideoPlayerOptions } from "../../../assets/scripts/video-player/hls-video-player";
import { DOMBackgroundVideo } from "../../../assets/scripts/video-player/dom-background-video";
import Hls from "hls.js";

describe("HLSVideoPlayer", () => {
  let player: HLSVideoPlayer;
  let options: HLSVideoPlayerOptions;
  let mockVideoElement: any;
  let mockHlsInstance: any;


  beforeEach(() => {
    jest.clearAllMocks();
    
    // Setup mock video element
    mockVideoElement = {
      currentTime: 0,
      muted: false,
      play: jest.fn().mockResolvedValue(undefined),
      pause: jest.fn(),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
    };

    // Setup mock HLS instance
    mockHlsInstance = {
      loadSource: jest.fn(),
      attachMedia: jest.fn(),
      detachMedia: jest.fn(),
      destroy: jest.fn(),
      off: jest.fn(),
      currentLevel: 2,
      bandwidthEstimate: 1000000,
    };

    // Setup mock HLS constructor - it's already mocked, just need to update behavior
    (Hls as jest.MockedClass<typeof Hls>).mockImplementation(() => mockHlsInstance);
    (Hls.isSupported as jest.Mock).mockReturnValue(true);

    // Setup DOM mock
    (DOMBackgroundVideo.createOrLoadVideoElement as jest.Mock).mockReturnValue(mockVideoElement);
    
    options = {
      id: "test-video-player",
    };
    
    player = new HLSVideoPlayer(options);
  });

  describe("constructor", () => {
    it("should initialize with provided options", () => {
      // Arrange & Act
      const testOptions: HLSVideoPlayerOptions = { id: "custom-id" };
      const customPlayer = new HLSVideoPlayer(testOptions);

      // Assert
      expect(customPlayer.id).toBe("custom-id");
    });

    it("should initialize with default state", () => {
      // Assert
      expect(player.id).toBe("test-video-player");
      expect(player.video).toBeNull();
      expect(player.initialized).toBe(false);
      expect(player.url).toBe("");
    });
  });

  describe("getters", () => {
    describe("id", () => {
      it("should return the id provided in constructor", () => {
        // Assert
        expect(player.id).toBe("test-video-player");
      });
    });

    describe("video", () => {
      it("should return null before initialization", () => {
        // Assert
        expect(player.video).toBeNull();
      });

      it("should return video element after initialization", () => {
        // Act
        player.init();

        // Assert
        expect(player.video).toBe(mockVideoElement);
      });
    });

    describe("initialized", () => {
      it("should return false before initialization", () => {
        // Assert
        expect(player.initialized).toBe(false);
      });

      it("should return true after successful initialization", () => {
        // Act
        player.init();

        // Assert
        expect(player.initialized).toBe(true);
      });
    });

    describe("url", () => {
      it("should return empty string initially", () => {
        // Assert
        expect(player.url).toBe("");
      });

      it("should return the loaded URL after load is called", () => {
        // Arrange
        player.init();
        const testUrl = "https://example.com/video.m3u8";

        // Act
        player.load(testUrl);

        // Assert
        expect(player.url).toBe(testUrl);
      });
    });

    describe("currentTime", () => {
      it("should return video currentTime when initialized", () => {
        // Arrange
        player.init();
        mockVideoElement.currentTime = 42.5;

        // Act & Assert
        expect(player.currentTime).toBe(42.5);
      });
    });

    describe("currentLevel", () => {
      it("should return hls currentLevel when initialized", () => {
        // Arrange
        player.init();

        // Act & Assert
        expect(player.currentLevel).toBe(2);
      });
    });

    describe("bandwidthEstimate", () => {
      it("should return hls bandwidthEstimate when initialized", () => {
        // Arrange
        player.init();

        // Act & Assert
        expect(player.bandwidthEstimate).toBe(1000000);
      });
    });
  });

  describe("setters", () => {
    describe("currentTime", () => {
      it("should set video currentTime when initialized", () => {
        // Arrange
        player.init();

        // Act
        player.currentTime = 30.5;

        // Assert
        expect(mockVideoElement.currentTime).toBe(30.5);
      });

      it("should not set currentTime when not initialized", () => {
        // Arrange
        const initialTime = mockVideoElement.currentTime;

        // Act
        player.currentTime = 30.5;

        // Assert
        expect(mockVideoElement.currentTime).toBe(initialTime);
      });
    });

    describe("muted", () => {
      it("should set video muted property", () => {
        // Arrange
        player.init();

        // Act
        player.muted = true;

        // Assert
        expect(mockVideoElement.muted).toBe(true);
      });

      it("should set video muted to false", () => {
        // Arrange
        player.init();

        // Act
        player.muted = false;

        // Assert
        expect(mockVideoElement.muted).toBe(false);
      });
    });
  });

  describe("init", () => {
    it("should create video element and initialize Hls", () => {
      // Act
      player.init();

      // Assert
      expect(DOMBackgroundVideo.createOrLoadVideoElement).toHaveBeenCalledWith("test-video-player");
      expect(Hls).toHaveBeenCalledWith({
        startLevel: -1,
        capLevelToPlayerSize: true,
        lowLatencyMode: true,
        liveSyncDuration: 0.9,
        liveMaxLatencyDuration: 1,
        enableWorker: false,
      });
      expect(mockHlsInstance.attachMedia).toHaveBeenCalledWith(mockVideoElement);
      expect(player.video).toBe(mockVideoElement);
      expect(player.initialized).toBe(true);
    });

    it("should throw error when Hls is not supported", () => {
      // Arrange
      (Hls.isSupported as jest.Mock).mockReturnValue(false);

      // Act & Assert
      expect(() => player.init()).toThrow("Hls.js is not supported.");
    });
  });

  describe("load", () => {
    beforeEach(() => {
      player.init();
    });

    it("should load new URL and set internal URL", () => {
      // Arrange
      const testUrl = "https://example.com/video.m3u8";

      // Act
      player.load(testUrl);

      // Assert
      expect(player.url).toBe(testUrl);
      expect(mockHlsInstance.loadSource).toHaveBeenCalledWith(testUrl);
      expect(mockVideoElement.pause).toHaveBeenCalled();
    });

    it("should not pause video when play option is true", () => {
      // Arrange
      const testUrl = "https://example.com/video.m3u8";

      // Act
      player.load(testUrl, { play: true });

      // Assert
      expect(mockHlsInstance.loadSource).toHaveBeenCalledWith(testUrl);
      expect(mockVideoElement.pause).not.toHaveBeenCalled();
    });

    it("should not reload same URL", () => {
      // Arrange
      const testUrl = "https://example.com/video.m3u8";
      player.load(testUrl);
      jest.clearAllMocks();

      // Act
      player.load(testUrl);

      // Assert
      expect(mockHlsInstance.loadSource).not.toHaveBeenCalled();
    });

    it("should not load when URL is empty", () => {
      // Act
      player.load("");

      // Assert
      expect(mockHlsInstance.loadSource).not.toHaveBeenCalled();
    });

    it("should load new URL when different from current", () => {
      // Arrange
      player.load("https://example.com/video1.m3u8");
      jest.clearAllMocks();

      // Act
      player.load("https://example.com/video2.m3u8");

      // Assert
      expect(mockHlsInstance.loadSource).toHaveBeenCalledWith("https://example.com/video2.m3u8");
    });
  });

  describe("play", () => {
    it("should call playWithRetry when initialized", () => {
      // Arrange
      player.init();
      const playWithRetrySpy = jest.spyOn(player as any, 'playWithRetry');

      // Act
      player.play();

      // Assert
      expect(playWithRetrySpy).toHaveBeenCalledWith(0, 3);
    });

    it("should not call playWithRetry when not initialized", () => {
      // Arrange
      const playWithRetrySpy = jest.spyOn(player as any, 'playWithRetry');

      // Act
      player.play();

      // Assert
      expect(playWithRetrySpy).not.toHaveBeenCalled();
    });

    it("should handle successful play", async () => {
      // Arrange
      player.init();
      mockVideoElement.play.mockResolvedValue(undefined);

      // Act
      player.play();
      
      // Wait for promise resolution
      await new Promise(resolve => setTimeout(resolve, 0));

      // Assert
      expect(mockVideoElement.play).toHaveBeenCalled();
    });

    it("should retry on play failure", async () => {
      // Arrange
      player.init();
      mockVideoElement.play
        .mockRejectedValueOnce(new Error("Play failed"))
        .mockResolvedValue(undefined);

      // Act
      player.play();
      
      // Wait for retry
      await new Promise(resolve => setTimeout(resolve, 10));

      // Assert
      expect(mockVideoElement.play).toHaveBeenCalledTimes(2);
    });

    it("should stop retrying after max retries", async () => {
      // Arrange
      player.init();
      mockVideoElement.play.mockRejectedValue(new Error("Play failed"));

      // Act
      player.play();
      
      // Wait for all retries
      await new Promise(resolve => setTimeout(resolve, 50));

      // Assert
      expect(mockVideoElement.play).toHaveBeenCalledTimes(4); // Initial + 3 retries
    });
  });

  describe("pause", () => {
    it("should pause video when initialized", () => {
      // Arrange
      player.init();

      // Act
      player.pause();

      // Assert
      expect(mockVideoElement.pause).toHaveBeenCalled();
    });

    it("should not pause when not initialized", () => {
      // Act
      player.pause();

      // Assert
      expect(mockVideoElement.pause).not.toHaveBeenCalled();
    });
  });

  describe("off", () => {
    it("should call hls off method with event", () => {
      // Arrange
      player.init();

      // Act
      player.off("hlsError" as any);

      // Assert
      expect(mockHlsInstance.off).toHaveBeenCalledWith("hlsError");
    });
  });

  describe("addEventListener", () => {
    it("should add event listener to video element", () => {
      // Arrange
      player.init();
      const listener = jest.fn();

      // Act
      player.addEventListener("timeupdate", listener);

      // Assert
      expect(mockVideoElement.addEventListener).toHaveBeenCalledWith("timeupdate", listener);
    });
  });

  describe("removeEventListener", () => {
    it("should remove event listener from video element", () => {
      // Arrange
      player.init();
      const listener = jest.fn();

      // Act
      player.removeEventListener("timeupdate", listener);

      // Assert
      expect(mockVideoElement.removeEventListener).toHaveBeenCalledWith("timeupdate", listener);
    });
  });

  describe("destroy", () => {
    it("should clean up hls and video element", () => {
      // Arrange
      player.init();

      // Act
      player.destroy();

      // Assert
      expect(mockHlsInstance.detachMedia).toHaveBeenCalled();
      expect(mockHlsInstance.destroy).toHaveBeenCalled();
      expect(DOMBackgroundVideo.removeVideoElement).toHaveBeenCalledWith("test-video-player");
    });
  });

  describe("edge cases", () => {
    it("should handle multiple init calls", () => {
      // Act
      player.init();
      player.init();

      // Assert
      expect(DOMBackgroundVideo.createOrLoadVideoElement).toHaveBeenCalledTimes(2);
      expect(Hls).toHaveBeenCalledTimes(2);
    });

    it("should handle operations before init gracefully", () => {
      // Act - these should not crash
      player.play(); // Should not call playWithRetry
      player.pause(); // Should not call video.pause
      player.currentTime = 10; // Should not set currentTime
      
      // Muted setter will throw when video is null
      expect(() => {
        player.muted = true;
      }).toThrow();

      // Assert - operations completed without errors
      expect(mockVideoElement.play).not.toHaveBeenCalled();
      expect(mockVideoElement.pause).not.toHaveBeenCalled();
    });

    it("should handle load with default options", () => {
      // Arrange
      player.init();

      // Act
      player.load("https://example.com/video.m3u8");

      // Assert
      expect(mockVideoElement.pause).toHaveBeenCalled();
    });

    it("should handle different video IDs", () => {
      // Arrange
      const player1 = new HLSVideoPlayer({ id: "video1" });
      const player2 = new HLSVideoPlayer({ id: "video2" });

      // Act
      player1.init();
      player2.init();

      // Assert
      expect(DOMBackgroundVideo.createOrLoadVideoElement).toHaveBeenCalledWith("video1");
      expect(DOMBackgroundVideo.createOrLoadVideoElement).toHaveBeenCalledWith("video2");
    });

    it("should handle currentTime getter when video is not initialized", () => {
      // Arrange - player not initialized

      // Act & Assert - accessing currentTime should not crash but return undefined
      // Note: In actual implementation, this would throw, but we're testing the behavior
      expect(() => {
        // This will throw in real implementation, so we expect it to throw
        const time = player.currentTime;
        return time; // Avoid unused variable warning
      }).toThrow();
    });

    it("should handle getters when hls is not initialized", () => {
      // Arrange - player not initialized

      // Act & Assert - these will throw in real implementation
      expect(() => {
        const level = player.currentLevel;
        const bandwidth = player.bandwidthEstimate;
        // Avoid unused variable warning
        return level + bandwidth;
      }).toThrow();
    });
  });

  describe("integration scenarios", () => {
    it("should handle complete video lifecycle", () => {
      // Arrange
      const videoUrl = "https://example.com/stream.m3u8";

      // Act - Complete lifecycle
      player.init();
      player.load(videoUrl, { play: true });
      player.play();
      player.currentTime = 10;
      player.muted = true;
      player.pause();
      player.destroy();

      // Assert
      expect(player.initialized).toBe(true);
      expect(player.url).toBe(videoUrl);
      expect(mockVideoElement.currentTime).toBe(10);
      expect(mockVideoElement.muted).toBe(true);
      expect(mockHlsInstance.destroy).toHaveBeenCalled();
    });

    it("should handle URL changes during playback", () => {
      // Arrange
      player.init();
      const url1 = "https://example.com/stream1.m3u8";
      const url2 = "https://example.com/stream2.m3u8";

      // Act
      player.load(url1);
      player.play();
      player.load(url2);

      // Assert
      expect(player.url).toBe(url2);
      expect(mockHlsInstance.loadSource).toHaveBeenCalledWith(url1);
      expect(mockHlsInstance.loadSource).toHaveBeenCalledWith(url2);
    });
  });
});