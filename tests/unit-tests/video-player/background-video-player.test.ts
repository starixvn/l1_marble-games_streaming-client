import { 
  createMockStore,
  cleanupMockObserver,
} from "../../utils/mock-store";

const mockHlsInstance = {
  loadSource: jest.fn(),
  attachMedia: jest.fn(),
  detachMedia: jest.fn(),
  destroy: jest.fn(),
  on: jest.fn(),
  off: jest.fn(),
  currentLevel: 0,
  bandwidthEstimate: 1000
};

const mockHls = jest.fn().mockImplementation(() => mockHlsInstance) as any;
mockHls.isSupported = jest.fn();
mockHls.Events = {
  ERROR: 'hlsError',
  MEDIA_DETACHED: 'hlsMediaDetached',
  MANIFEST_LOADING: 'hlsManifestLoading',
  LEVEL_LOADED: 'hlsLevelLoaded',
  MEDIA_ATTACHED: 'hlsMediaAttached',
  MANIFEST_PARSED: 'hlsManifestParsed'
};

jest.mock("hls.js", () => mockHls);

const mockVideoElement = {
  addEventListener: jest.fn(),
  removeEventListener: jest.fn(),
  play: jest.fn().mockResolvedValue(undefined),
  pause: jest.fn(),
  currentTime: 0,
  muted: false
};

jest.mock("../../../assets/scripts/video-player/dom-background-video", () => ({
  DOMBackgroundVideo: {
    createOrLoadVideoElement: jest.fn().mockReturnValue(mockVideoElement)
  }
}));

jest.mock("observer", () => {
  const { createMockObserver } = require("../../utils/mock-store");
  return createMockObserver();
});

const mockNode = {
  emit: jest.fn()
};

jest.mock("cc", () => ({
  _decorator: {
    ccclass: jest.fn().mockImplementation(() => (target: any) => target)
  },
  Component: class MockComponent {
    node = mockNode;
  }
}));

import { BackgroundVideoPlayer } from "../../../assets/scripts/video-player/background-video-player";
import { VideoStore } from "../../../assets/scripts/video-player/video-store";
import { DOMBackgroundVideo } from "../../../assets/scripts/video-player/dom-background-video";
import Hls from "hls.js";

describe("BackgroundVideoPlayer", () => {
  let player: BackgroundVideoPlayer;
  let mockVideoStore: VideoStore & { update: (props: Partial<VideoStore>) => void; reset: (props: Partial<VideoStore>) => void };

  beforeAll(() => {
    mockVideoStore = createMockStore(VideoStore, {
      url: "",
      videoLiveTime: 0,
      defaultBackgroundEnabled: false
    });

    player = new BackgroundVideoPlayer();
  });

  afterAll(() => {
    cleanupMockObserver();
    jest.clearAllMocks();
  });

  beforeEach(() => {
    mockVideoStore.reset({
      url: "",
      videoLiveTime: 0,
      defaultBackgroundEnabled: false
    });

    jest.clearAllMocks();
    
    player.currentTime = 0;
    (player as any)._url = "";
    (player as any).hls = null;
    (player as any).native = null;

    mockHls.isSupported.mockReturnValue(true);
    mockHlsInstance.currentLevel = 0;
    mockHlsInstance.bandwidthEstimate = 1000;
    mockVideoElement.currentTime = 0;
    mockVideoElement.muted = false;
    mockVideoElement.play.mockResolvedValue(undefined);
  });

  describe("@render VideoStore url and videoLiveTime", () => {
    it("should load video when url changes", () => {
      // Arrange
      const testUrl = "https://example.com/test.m3u8";
      const testCurrentTime = 5;
      
      // Act
      mockVideoStore.update({ url: testUrl, videoLiveTime: testCurrentTime });

      // Assert
      expect(player.currentTime).toBe(testCurrentTime);
      expect((player as any)._url).toBe(testUrl);
      expect(mockHlsInstance.loadSource).toHaveBeenCalledWith(testUrl);
      expect(mockVideoElement.play).toHaveBeenCalled();
    });

    it("should not reload video when url is same", () => {
      // Arrange
      const testUrl = "https://example.com/test.m3u8";
      (player as any)._url = testUrl;
      
      // Act
      mockVideoStore.update({ url: testUrl, videoLiveTime: 10 });

      // Assert
      expect(mockHlsInstance.loadSource).not.toHaveBeenCalled();
      expect(mockVideoElement.play).not.toHaveBeenCalled();
    });

    it("should not load video when url is empty", () => {
      // Arrange
      
      // Act
      mockVideoStore.update({ url: "", videoLiveTime: 5 });

      // Assert
      expect(mockHlsInstance.loadSource).not.toHaveBeenCalled();
      expect(mockVideoElement.play).not.toHaveBeenCalled();
    });

    it("should initialize player when loading first video", () => {
      // Arrange
      const testUrl = "https://example.com/test.m3u8";
      
      // Act
      mockVideoStore.update({ url: testUrl, videoLiveTime: 0 });

      // Assert
      expect(DOMBackgroundVideo.createOrLoadVideoElement).toHaveBeenCalled();
      expect(Hls).toHaveBeenCalledWith({
        startLevel: -1,
        capLevelToPlayerSize: true,
        lowLatencyMode: true,
        liveSyncDuration: 0.9,
        liveMaxLatencyDuration: 1,
        enableWorker: false
      });
      expect(mockHlsInstance.attachMedia).toHaveBeenCalledWith(mockVideoElement);
      expect(mockVideoElement.addEventListener).toHaveBeenCalledWith("timeupdate", expect.any(Function));
    });
  });

  describe("play", () => {
    beforeEach(() => {
      (player as any).native = mockVideoElement;
      (player as any).hls = mockHlsInstance;
    });

    it("should call native play method", () => {
      // Arrange
      
      // Act
      player.play();

      // Assert
      expect(mockVideoElement.play).toHaveBeenCalled();
    });

    it("should retry play on failure up to maxRetry times", async () => {
      // Arrange
      const maxRetry = 3;
      mockVideoElement.play.mockRejectedValue(new Error("Play failed"));
      const playSpy = jest.spyOn(player, 'play');

      // Act
      player.play(0, maxRetry);
      await new Promise(resolve => setTimeout(resolve, 0));

      // Assert
      expect(playSpy).toHaveBeenCalledTimes(maxRetry + 1);
    });

    it("should stop retrying after maxRetry attempts", async () => {
      // Arrange
      const maxRetry = 2;
      mockVideoElement.play.mockRejectedValue(new Error("Play failed"));
      const playSpy = jest.spyOn(player, 'play');

      // Act
      player.play(0, maxRetry);
      await new Promise(resolve => setTimeout(resolve, 0));

      // Assert
      expect(playSpy).toHaveBeenCalledTimes(maxRetry + 1);
    });
  });

  describe("pause", () => {
    it("should call native pause when initialized", () => {
      // Arrange
      (player as any).native = mockVideoElement;
      (player as any).hls = mockHlsInstance;
      
      // Act
      player.pause();

      // Assert
      expect(mockVideoElement.pause).toHaveBeenCalled();
    });

    it("should not call native pause when not initialized", () => {
      // Arrange
      (player as any).native = null;
      (player as any).hls = null;
      
      // Act
      player.pause();

      // Assert
      expect(mockVideoElement.pause).not.toHaveBeenCalled();
    });
  });

  describe("set muted", () => {
    beforeEach(() => {
      (player as any).native = mockVideoElement;
    });

    it("should set native muted property to true", () => {
      // Arrange
      
      // Act
      player.muted = true;

      // Assert
      expect(mockVideoElement.muted).toBe(true);
    });

    it("should set native muted property to false", () => {
      // Arrange
      
      // Act
      player.muted = false;

      // Assert
      expect(mockVideoElement.muted).toBe(false);
    });
  });

  describe("get level", () => {
    it("should return hls currentLevel when initialized", () => {
      // Arrange
      (player as any).hls = mockHlsInstance;
      mockHlsInstance.currentLevel = 2;
      
      // Act
      const level = player.level;

      // Assert
      expect(level).toBe(2);
    });

    it("should return 0 when hls is null", () => {
      // Arrange
      (player as any).hls = null;
      
      // Act
      const level = player.level;

      // Assert
      expect(level).toBe(0);
    });
  });

  describe("get bandwidthEstimate", () => {
    it("should return hls bandwidthEstimate when initialized", () => {
      // Arrange
      (player as any).hls = mockHlsInstance;
      mockHlsInstance.bandwidthEstimate = 5000;
      
      // Act
      const bandwidth = (player as any).bandwidthEstimate;

      // Assert
      expect(bandwidth).toBe(5000);
    });

    it("should return 0 when hls is null", () => {
      // Arrange
      (player as any).hls = null;
      
      // Act
      const bandwidth = (player as any).bandwidthEstimate;

      // Assert
      expect(bandwidth).toBe(0);
    });
  });

  describe("lateUpdate", () => {
    it("should increment currentTime by delta time", () => {
      // Arrange
      const initialTime = 5;
      const deltaTime = 0.016;
      player.currentTime = initialTime;
      
      // Act
      (player as any).lateUpdate(deltaTime);

      // Assert
      expect(player.currentTime).toBe(initialTime + deltaTime);
    });
  });

  describe("onLoad", () => {
    it("should call initialize method", () => {
      // Arrange
      const initializeSpy = jest.spyOn(player as any, 'initialize');
      
      // Act
      player.onLoad();

      // Assert
      expect(initializeSpy).toHaveBeenCalled();
    });
  });

  describe("onDestroy", () => {
    it("should call stop method", () => {
      // Arrange
      const stopSpy = jest.spyOn(player, 'stop');
      
      // Act
      (player as any).onDestroy();

      // Assert
      expect(stopSpy).toHaveBeenCalled();
    });
  });

  describe("stop", () => {
    it("should cleanup resources when initialized", () => {
      // Arrange
      (player as any).native = mockVideoElement;
      (player as any).hls = mockHlsInstance;
      
      // Act
      player.stop();

      // Assert
      expect(mockVideoElement.removeEventListener).toHaveBeenCalledWith("timeupdate", expect.any(Function));
      expect(mockHlsInstance.off).toHaveBeenCalledWith(mockHls.Events.ERROR);
      expect(mockHlsInstance.detachMedia).toHaveBeenCalled();
      expect(mockHlsInstance.destroy).toHaveBeenCalled();
    });

    it("should not cleanup when not initialized", () => {
      // Arrange
      (player as any).native = null;
      (player as any).hls = null;
      
      // Act
      player.stop();

      // Assert
      expect(mockVideoElement.removeEventListener).not.toHaveBeenCalled();
      expect(mockHlsInstance.off).not.toHaveBeenCalled();
      expect(mockHlsInstance.detachMedia).not.toHaveBeenCalled();
      expect(mockHlsInstance.destroy).not.toHaveBeenCalled();
    });
  });

  describe("@render VideoStore videoLiveTime", () => {
    beforeEach(() => {
      (player as any).native = mockVideoElement;
      (player as any).hls = mockHlsInstance;
    });

    it("should update currentTime and sync with native", () => {
      // Arrange
      const testTime = 15;
      const syncSpy = jest.spyOn(player as any, 'syncCurrentTime');
      
      // Act
      mockVideoStore.update({ videoLiveTime: testTime });

      // Assert
      expect(player.currentTime).toBe(testTime);
      expect(syncSpy).toHaveBeenCalled();
    });

    it("should emit syncNativeCurrentTime event", () => {
      // Arrange
      mockVideoElement.currentTime = 10;
      
      // Act
      mockVideoStore.update({ videoLiveTime: 5 });

      // Assert
      expect(mockNode.emit).toHaveBeenCalledWith("syncNativeCurrentTime", 10);
    });

    it("should sync native currentTime when difference is greater than 1 second", () => {
      // Arrange
      player.currentTime = 10;
      mockVideoElement.currentTime = 5;
      
      // Act
      mockVideoStore.update({ videoLiveTime: 10 });

      // Assert
      expect(mockVideoElement.currentTime).toBe(10);
    });

    it("should not sync native currentTime when difference is less than 1 second", () => {
      // Arrange
      player.currentTime = 10;
      mockVideoElement.currentTime = 10.5;
      
      // Act
      mockVideoStore.update({ videoLiveTime: 10 });

      // Assert
      expect(mockVideoElement.currentTime).toBe(10.5);
    });

    it("should not sync when currentTime is negative", () => {
      // Arrange
      player.currentTime = -1;
      mockVideoElement.currentTime = 5;
      
      // Act
      mockVideoStore.update({ videoLiveTime: -1 });

      // Assert
      expect(mockVideoElement.currentTime).toBe(5);
    });
  });

  describe("initialization error handling", () => {
    it("should emit hlsNotSupported and throw error when Hls is not supported", () => {
      // Arrange
      mockHls.isSupported.mockReturnValue(false);
      
      // Act & Assert
      expect(() => {
        player.onLoad();
      }).toThrow("Hls.js is not supported.");
      expect(mockNode.emit).toHaveBeenCalledWith("hlsNotSupported");
    });

    it("should setup HLS error event handler with bandwidth data", () => {
      // Arrange
      const testUrl = "https://example.com/test.m3u8";
      mockHlsInstance.bandwidthEstimate = 2000;
      
      mockVideoStore.update({ url: testUrl, videoLiveTime: 0 });
      
      const errorCalls = mockHlsInstance.on.mock.calls.filter(call => call[0] === mockHls.Events.ERROR);
      const errorHandler = errorCalls[errorCalls.length - 1]?.[1];
      
      // Act
      const errorData = { type: "networkError", details: "manifestLoadError" };
      if (errorHandler) {
        errorHandler(mockHls.Events.ERROR, errorData);
      }

      // Assert
      expect(mockNode.emit).toHaveBeenCalledWith(mockHls.Events.ERROR, {
        ...errorData,
        video: testUrl,
        bandwidth: 2000
      });
    });

    it("should setup all HLS event listeners", () => {
      // Arrange
      const testUrl = "https://example.com/test.m3u8";
      
      // Act
      mockVideoStore.update({ url: testUrl, videoLiveTime: 0 });

      // Assert
      expect(mockHlsInstance.on).toHaveBeenCalledWith(mockHls.Events.ERROR, expect.any(Function));
      expect(mockHlsInstance.on).toHaveBeenCalledTimes(Object.values(mockHls.Events).length + 1);
    });

    it("should setup generic event listeners for all HLS events", () => {
      // Arrange
      const testUrl = "https://example.com/test.m3u8";
      
      // Act
      mockVideoStore.update({ url: testUrl, videoLiveTime: 0 });

      // Assert
      Object.values(mockHls.Events).forEach(event => {
        expect(mockHlsInstance.on).toHaveBeenCalledWith(event, expect.any(Function));
      });
    });

    it("should emit generic HLS events through node", () => {
      // Arrange
      const testUrl = "https://example.com/test.m3u8";
      mockVideoStore.update({ url: testUrl, videoLiveTime: 0 });
      
      const genericHandler = mockHlsInstance.on.mock.calls.find(call => call[0] === mockHls.Events.MANIFEST_LOADING)?.[1];
      
      // Act
      if (genericHandler) {
        genericHandler(mockHls.Events.MANIFEST_LOADING, { test: "data" });
      }

      // Assert
      expect(mockNode.emit).toHaveBeenCalledWith(mockHls.Events.MANIFEST_LOADING, { test: "data" });
    });

    it("should call syncCurrentTime in error handler", () => {
      // Arrange
      const testUrl = "https://example.com/test.m3u8";
      mockVideoStore.update({ url: testUrl, videoLiveTime: 0 });
      
      const errorCalls = mockHlsInstance.on.mock.calls.filter(call => call[0] === mockHls.Events.ERROR);
      const errorHandler = errorCalls[errorCalls.length - 1]?.[1];
      const syncSpy = jest.spyOn(player as any, 'syncCurrentTime');
      
      // Act
      if (errorHandler) {
        errorHandler(mockHls.Events.ERROR, { type: "networkError" });
      }

      // Assert
      expect(syncSpy).toHaveBeenCalled();
    });

    it("should set hls and native properties after initialization", () => {
      // Arrange
      const testUrl = "https://example.com/test.m3u8";
      
      // Act
      mockVideoStore.update({ url: testUrl, videoLiveTime: 0 });

      // Assert
      expect((player as any).hls).toBe(mockHlsInstance);
      expect((player as any).native).toBe(mockVideoElement);
    });
  });
});