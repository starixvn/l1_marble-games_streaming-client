// Mock HLSVideoPlayer
const mockVideoPlayerInstance = {
  id: "VideoBackground",
  initialized: false,
  bandwidthEstimate: 5000000,
  currentLevel: 1,
  url: "",
  init: jest.fn(),
  load: jest.fn(),
  play: jest.fn(),
  pause: jest.fn(),
  destroy: jest.fn(),
  addEventListener: jest.fn(),
  removeEventListener: jest.fn(),
  off: jest.fn(),
  _muted: false,
  _currentTime: 0,
  set muted(value: boolean) {
    this._muted = value;
  },
  get muted() {
    return this._muted;
  },
  get currentTime() {
    return this._currentTime;
  },
  set currentTime(value: number) {
    this._currentTime = value;
  },
};

const mockPreloadPlayerInstance = {
  id: "PreloadVideo",
  initialized: false,
  init: jest.fn(),
  load: jest.fn(),
  destroy: jest.fn(),
};

const mockHLSVideoPlayerConstructor = jest.fn().mockImplementation((options) => {
  if (options.id === "PreloadVideo") {
    return { ...mockPreloadPlayerInstance };
  }
  return { ...mockVideoPlayerInstance };
});

jest.mock("../../../../assets/scripts/components/video-player/hls-video-player", () => ({
  HLSVideoPlayer: mockHLSVideoPlayerConstructor,
}));

// Mock DOMBackgroundVideo
const mockEventNotifier = {
  addEventListener: jest.fn(),
  removeEventListener: jest.fn(),
  dispatchEvent: jest.fn(),
};

jest.mock("../../../../assets/scripts/components/video-player/dom-background-video", () => ({
  DOMBackgroundVideo: {
    applyConfig: jest.fn(),
    toFront: jest.fn(),
    changeBackground: jest.fn(),
    genericEventNotifier: mockEventNotifier,
  },
  GenericBackgroundVideoEvents: {
    SWITCH_BACKGROUND: "SwitchBackground",
  },
}));

import { HLSPreloadedVideoPlayer } from "../../../../assets/scripts/components/video-player/preloaded-hls-player";
import { DOMBackgroundVideo, GenericBackgroundVideoEvents } from "../../../../assets/scripts/components/video-player/dom-background-video";

describe("HLSPreloadedVideoPlayer", () => {
  let player: HLSPreloadedVideoPlayer;
  let mockPreloadPlayer: any;
  let mockVideoPlayer: any;

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Reset mock instances
    mockVideoPlayerInstance.initialized = false;
    mockVideoPlayerInstance.bandwidthEstimate = 5000000;
    mockVideoPlayerInstance.currentLevel = 1;
    mockVideoPlayerInstance.url = "";
    mockVideoPlayerInstance._muted = false;
    mockVideoPlayerInstance._currentTime = 0;
    
    mockPreloadPlayerInstance.initialized = false;

    player = new HLSPreloadedVideoPlayer();
    
    // Get the actual instances created by the constructor
    mockPreloadPlayer = mockHLSVideoPlayerConstructor.mock.results[0].value;
    mockVideoPlayer = mockHLSVideoPlayerConstructor.mock.results[1].value;
  });

  describe("constructor", () => {
    it("should create preload and video players with correct IDs", () => {
      // Assert
      expect(mockHLSVideoPlayerConstructor).toHaveBeenCalledTimes(2);
      expect(mockHLSVideoPlayerConstructor).toHaveBeenCalledWith({ id: "PreloadVideo" });
      expect(mockHLSVideoPlayerConstructor).toHaveBeenCalledWith({ id: "VideoBackground" });
    });
  });

  describe("getters", () => {
    describe("initialized", () => {
      it("should return true when both players are initialized", () => {
        // Arrange
        mockPreloadPlayer.initialized = true;
        mockVideoPlayer.initialized = true;

        // Act & Assert
        expect(player.initialized).toBe(true);
      });

      it("should return false when preload player is not initialized", () => {
        // Arrange
        mockPreloadPlayer.initialized = false;
        mockVideoPlayer.initialized = true;

        // Act & Assert
        expect(player.initialized).toBe(false);
      });

      it("should return false when video player is not initialized", () => {
        // Arrange
        mockPreloadPlayer.initialized = true;
        mockVideoPlayer.initialized = false;

        // Act & Assert
        expect(player.initialized).toBe(false);
      });

      it("should return false when both players are not initialized", () => {
        // Arrange
        mockPreloadPlayer.initialized = false;
        mockVideoPlayer.initialized = false;

        // Act & Assert
        expect(player.initialized).toBe(false);
      });
    });

    describe("bandwidthEstimate", () => {
      it("should return video player bandwidthEstimate", () => {
        // Arrange
        mockVideoPlayer.bandwidthEstimate = 2500000;

        // Act & Assert
        expect(player.bandwidthEstimate).toBe(2500000);
      });
    });

    describe("currentTime", () => {
      it("should return video player currentTime", () => {
        // Arrange
        mockVideoPlayer.currentTime = 42.5;

        // Act & Assert
        expect(player.currentTime).toBe(42.5);
      });
    });

    describe("currentLevel", () => {
      it("should return video player currentLevel", () => {
        // Arrange
        mockVideoPlayer.currentLevel = 3;

        // Act & Assert
        expect(player.currentLevel).toBe(3);
      });
    });

    describe("url", () => {
      it("should return video player url", () => {
        // Arrange
        mockVideoPlayer.url = "https://example.com/video.m3u8";

        // Act & Assert
        expect(player.url).toBe("https://example.com/video.m3u8");
      });
    });
  });

  describe("setters", () => {
    describe("currentTime", () => {
      it("should set video player currentTime", () => {
        // Act
        player.currentTime = 30.5;

        // Assert
        expect(mockVideoPlayer.currentTime).toBe(30.5);
      });
    });

    describe("muted", () => {
      it("should set video player muted to true", () => {
        // Act
        player.muted = true;

        // Assert
        expect(mockVideoPlayer.muted).toBe(true);
      });

      it("should set video player muted to false", () => {
        // Act
        player.muted = false;

        // Assert
        expect(mockVideoPlayer.muted).toBe(false);
      });
    });
  });

  describe("init", () => {
    it("should initialize both players", () => {
      // Act
      player.init();

      // Assert
      expect(mockPreloadPlayer.init).toHaveBeenCalled();
      expect(mockVideoPlayer.init).toHaveBeenCalled();
    });

    it("should configure preload player as hidden and muted", () => {
      // Act
      player.init();

      // Assert
      expect(DOMBackgroundVideo.applyConfig).toHaveBeenCalledWith("PreloadVideo", {
        hidden: true,
        muted: true,
      });
    });

    it("should configure video player as visible and unmuted", () => {
      // Act
      player.init();

      // Assert
      expect(DOMBackgroundVideo.applyConfig).toHaveBeenCalledWith("VideoBackground", {
        hidden: false,
        muted: false,
      });
    });

    it("should bring video player to front", () => {
      // Act
      player.init();

      // Assert
      expect(DOMBackgroundVideo.toFront).toHaveBeenCalledWith("VideoBackground");
    });

    it("should set up background switch event listener", () => {
      // Act
      player.init();

      // Assert
      expect(mockEventNotifier.addEventListener).toHaveBeenCalledWith(
        GenericBackgroundVideoEvents.SWITCH_BACKGROUND,
        expect.any(Function)
      );
    });

    it("should handle background switch event correctly", () => {
      // Arrange
      player.init();
      const eventHandler = mockEventNotifier.addEventListener.mock.calls[0][1];
      const mockEvent = {
        detail: { url: "https://example.com/background.jpg" }
      };

      // Act
      eventHandler(mockEvent);

      // Assert
      expect(DOMBackgroundVideo.changeBackground).toHaveBeenCalledWith(
        "VideoBackground",
        "https://example.com/background.jpg"
      );
    });
  });

  describe("preload", () => {
    it("should load URL in preload player with play option", () => {
      // Arrange
      const testUrl = "https://example.com/preload.m3u8";

      // Act
      player.preload(testUrl);

      // Assert
      expect(mockPreloadPlayer.load).toHaveBeenCalledWith(testUrl, { play: true });
    });

    it("should handle empty URL", () => {
      // Act
      player.preload("");

      // Assert
      expect(mockPreloadPlayer.load).toHaveBeenCalledWith("", { play: true });
    });
  });

  describe("load", () => {
    it("should load URL in video player without play option", () => {
      // Arrange
      const testUrl = "https://example.com/video.m3u8";

      // Act
      player.load(testUrl);

      // Assert
      expect(mockVideoPlayer.load).toHaveBeenCalledWith(testUrl, { play: false });
    });

    it("should handle empty URL", () => {
      // Act
      player.load("");

      // Assert
      expect(mockVideoPlayer.load).toHaveBeenCalledWith("", { play: false });
    });
  });

  describe("play", () => {
    it("should call play on video player", () => {
      // Act
      player.play();

      // Assert
      expect(mockVideoPlayer.play).toHaveBeenCalled();
    });
  });

  describe("pause", () => {
    it("should call pause on video player", () => {
      // Act
      player.pause();

      // Assert
      expect(mockVideoPlayer.pause).toHaveBeenCalled();
    });
  });

  describe("addEventListener", () => {
    it("should delegate to video player", () => {
      // Arrange
      const eventName = "timeupdate";
      const listener = jest.fn();

      // Act
      player.addEventListener(eventName, listener);

      // Assert
      expect(mockVideoPlayer.addEventListener).toHaveBeenCalledWith(eventName, listener);
    });
  });

  describe("removeEventListener", () => {
    it("should delegate to video player", () => {
      // Arrange
      const eventName = "timeupdate";
      const listener = jest.fn();

      // Act
      player.removeEventListener(eventName, listener);

      // Assert
      expect(mockVideoPlayer.removeEventListener).toHaveBeenCalledWith(eventName, listener);
    });
  });

  describe("off", () => {
    it("should delegate to video player", () => {
      // Arrange
      const eventName = "hlsError" as any;

      // Act
      player.off(eventName);

      // Assert
      expect(mockVideoPlayer.off).toHaveBeenCalledWith(eventName);
    });
  });

  describe("destroy", () => {
    it("should destroy both players", () => {
      // Act
      player.destroy();

      // Assert
      expect(mockPreloadPlayer.destroy).toHaveBeenCalled();
      expect(mockVideoPlayer.destroy).toHaveBeenCalled();
    });
  });

  describe("edge cases", () => {
    it("should handle multiple init calls", () => {
      // Act
      player.init();
      player.init();

      // Assert
      expect(mockPreloadPlayer.init).toHaveBeenCalledTimes(2);
      expect(mockVideoPlayer.init).toHaveBeenCalledTimes(2);
      expect(DOMBackgroundVideo.applyConfig).toHaveBeenCalledTimes(4); // 2 calls per init
      expect(mockEventNotifier.addEventListener).toHaveBeenCalledTimes(2);
    });

    it("should handle operations before init", () => {
      // Act & Assert - should not throw
      expect(() => {
        player.preload("test.m3u8");
        player.load("test.m3u8");
        player.play();
        player.pause();
        player.muted = true;
        player.currentTime = 10;
      }).not.toThrow();
    });

    it("should handle property access before init", () => {
      // Act & Assert - should not throw
      expect(() => {
        const initialized = player.initialized;
        const bandwidth = player.bandwidthEstimate;
        const time = player.currentTime;
        const level = player.currentLevel;
        const url = player.url;
        
        // Verify properties return expected values
        expect(initialized).toBe(false);
        expect(typeof bandwidth).toBe("number");
        expect(typeof time).toBe("number");
        expect(typeof level).toBe("number");
        expect(typeof url).toBe("string");
      }).not.toThrow();
    });

    it("should handle event listener operations", () => {
      // Arrange
      const listener1 = jest.fn();
      const listener2 = jest.fn();

      // Act & Assert - should not throw
      expect(() => {
        player.addEventListener("play", listener1);
        player.addEventListener("pause", listener2);
        player.removeEventListener("play", listener1);
        player.off("hlsError" as any);
      }).not.toThrow();

      // Verify delegation
      expect(mockVideoPlayer.addEventListener).toHaveBeenCalledWith("play", listener1);
      expect(mockVideoPlayer.addEventListener).toHaveBeenCalledWith("pause", listener2);
      expect(mockVideoPlayer.removeEventListener).toHaveBeenCalledWith("play", listener1);
      expect(mockVideoPlayer.off).toHaveBeenCalledWith("hlsError");
    });
  });

  describe("integration scenarios", () => {
    it("should handle complete preloaded video lifecycle", () => {
      // Arrange
      const preloadUrl = "https://example.com/preload.m3u8";
      const videoUrl = "https://example.com/video.m3u8";

      // Act - Complete lifecycle
      player.init();
      player.preload(preloadUrl);
      player.load(videoUrl);
      player.currentTime = 5;
      player.muted = true;
      player.play();
      player.pause();
      player.destroy();

      // Assert
      expect(mockPreloadPlayer.init).toHaveBeenCalled();
      expect(mockVideoPlayer.init).toHaveBeenCalled();
      expect(mockPreloadPlayer.load).toHaveBeenCalledWith(preloadUrl, { play: true });
      expect(mockVideoPlayer.load).toHaveBeenCalledWith(videoUrl, { play: false });
      expect(mockVideoPlayer.currentTime).toBe(5);
      expect(mockVideoPlayer.muted).toBe(true);
      expect(mockVideoPlayer.play).toHaveBeenCalled();
      expect(mockVideoPlayer.pause).toHaveBeenCalled();
      expect(mockPreloadPlayer.destroy).toHaveBeenCalled();
      expect(mockVideoPlayer.destroy).toHaveBeenCalled();
    });

    it("should handle dual player initialization state", () => {
      // Arrange - Start with both uninitialized
      expect(player.initialized).toBe(false);

      // Act - Initialize preload player only
      mockPreloadPlayer.initialized = true;
      expect(player.initialized).toBe(false);

      // Act - Initialize video player only
      mockPreloadPlayer.initialized = false;
      mockVideoPlayer.initialized = true;
      expect(player.initialized).toBe(false);

      // Act - Initialize both players
      mockPreloadPlayer.initialized = true;
      mockVideoPlayer.initialized = true;
      expect(player.initialized).toBe(true);
    });

    it("should handle background switching workflow", () => {
      // Arrange
      player.init();
      const eventHandler = mockEventNotifier.addEventListener.mock.calls[0][1];

      // Act - Simulate background switch events
      eventHandler({ detail: { url: "bg1.jpg" } });
      eventHandler({ detail: { url: "bg2.jpg" } });
      eventHandler({ detail: { url: "" } });

      // Assert
      expect(DOMBackgroundVideo.changeBackground).toHaveBeenCalledTimes(3);
      expect(DOMBackgroundVideo.changeBackground).toHaveBeenCalledWith("VideoBackground", "bg1.jpg");
      expect(DOMBackgroundVideo.changeBackground).toHaveBeenCalledWith("VideoBackground", "bg2.jpg");
      expect(DOMBackgroundVideo.changeBackground).toHaveBeenCalledWith("VideoBackground", "");
    });

    it("should handle player configuration workflow", () => {
      // Arrange
      const eventListener = jest.fn();

      // Act - Full configuration workflow
      player.init();
      player.addEventListener("loadstart", eventListener);
      player.preload("preload.m3u8");
      player.load("main.m3u8");
      player.currentTime = 15;
      player.muted = false;

      // Assert
      expect(DOMBackgroundVideo.applyConfig).toHaveBeenCalledWith("PreloadVideo", {
        hidden: true,
        muted: true,
      });
      expect(DOMBackgroundVideo.applyConfig).toHaveBeenCalledWith("VideoBackground", {
        hidden: false,
        muted: false,
      });
      expect(DOMBackgroundVideo.toFront).toHaveBeenCalledWith("VideoBackground");
      expect(mockVideoPlayer.addEventListener).toHaveBeenCalledWith("loadstart", eventListener);
      expect(mockPreloadPlayer.load).toHaveBeenCalledWith("preload.m3u8", { play: true });
      expect(mockVideoPlayer.load).toHaveBeenCalledWith("main.m3u8", { play: false });
      expect(mockVideoPlayer.currentTime).toBe(15);
      expect(mockVideoPlayer.muted).toBe(false);
    });
  });
});
