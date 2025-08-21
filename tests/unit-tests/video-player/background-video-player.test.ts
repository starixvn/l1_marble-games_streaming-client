import { createMockStore, cleanupMockObserver, initializeMockContainer } from "../../utils/mock-store";

// Mock HLSPreloadedVideoPlayer
const mockHLSPreloadedVideoPlayer = {
  initialized: false,
  bandwidthEstimate: 1000,
  currentTime: 0,
  currentLevel: 0,
  url: "",
  muted: false,
  init: jest.fn(),
  preload: jest.fn(),
  load: jest.fn(),
  play: jest.fn(),
  pause: jest.fn(),
  destroy: jest.fn(),
  addEventListener: jest.fn(),
  removeEventListener: jest.fn(),
  off: jest.fn(),
};

jest.mock("../../../assets/scripts/video-player/preloaded-hls-player", () => ({
  HLSPreloadedVideoPlayer: jest.fn().mockImplementation(() => mockHLSPreloadedVideoPlayer)
}));

const mockHls = {
  Events: {
    ERROR: "hlsError",
    MEDIA_DETACHED: "hlsMediaDetached",
    MANIFEST_LOADING: "hlsManifestLoading",
    LEVEL_LOADED: "hlsLevelLoaded",
    MEDIA_ATTACHED: "hlsMediaAttached",
    MANIFEST_PARSED: "hlsManifestParsed",
  }
};

jest.mock("hls.js", () => mockHls);

jest.mock("observer", () => {
  const { createMockObserver } = require("../../utils/mock-store");
  return createMockObserver();
});

const mockNode = {
  emit: jest.fn(),
};

jest.mock("cc", () => ({
  _decorator: {
    ccclass: jest.fn().mockImplementation(() => (target: any) => target),
  },
  Component: class MockComponent {
    node = mockNode;
    
    protected lateUpdate(dt: number): void {
      // Mock implementation
    }
    
    protected onDestroy(): void {
      // Mock implementation
    }
  },
}));

import { BackgroundVideoPlayer } from "../../../assets/scripts/video-player/background-video-player";
import { VideoStore } from "../../../assets/scripts/video-player/video-store";
import { IntroStore } from "../../../assets/scripts/intro/intro-store";
import { Phase, VideoStatus } from "../../../assets/scripts/streaming/streaming-type";

describe("BackgroundVideoPlayer", () => {
  let player: BackgroundVideoPlayer;
  let mockVideoStore: VideoStore & {
    update: (props: Partial<VideoStore>) => void;
    reset: (props: Partial<VideoStore>) => void;
  };
  let mockIntroStore: IntroStore & {
    update: (props: Partial<IntroStore>) => void;
    reset: (props: Partial<IntroStore>) => void;
  };

  beforeAll(() => {
    initializeMockContainer();
    
    mockVideoStore = createMockStore(VideoStore, {
      url: "",
      videoLiveTime: 0,
      currentPhase: Phase.ScheduleEvent,
      halfIndex: 0,
    });

    mockIntroStore = createMockStore(IntroStore, {
      url: "",
      currentTime: 0,
      status: VideoStatus.Stopped,
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
      currentPhase: Phase.ScheduleEvent,
      halfIndex: 0,
    });

    mockIntroStore.reset({
      url: "",
      currentTime: 0,
      status: VideoStatus.Stopped,
    });

    jest.clearAllMocks();

    player.currentTime = 0;
    
    // Set up mock player instance on the component
    (player as any).hlsPlayer = mockHLSPreloadedVideoPlayer;
    
    mockHLSPreloadedVideoPlayer.initialized = false;
    mockHLSPreloadedVideoPlayer.bandwidthEstimate = 1000;
    mockHLSPreloadedVideoPlayer.currentTime = 0;
    mockHLSPreloadedVideoPlayer.currentLevel = 0;
    mockHLSPreloadedVideoPlayer.url = "";
    mockHLSPreloadedVideoPlayer.muted = false;
  });

  describe("initialization", () => {
    it("should initialize with default values", () => {
      // Assert
      expect(player.currentTime).toBe(0);
      expect((player as any).hlsPlayer).toBeDefined();
    });

    it("should not be initialized by default", () => {
      // Assert
      expect((player as any).initialized).toBe(false);
    });
  });

  describe("setIntroUrl method", () => {
    it("should call preload when intro url is set", () => {
      // Arrange
      const testUrl = "https://example.com/intro.m3u8";

      // Act
      (player as any).setIntroUrl(testUrl);

      // Assert
      expect(mockHLSPreloadedVideoPlayer.preload).toHaveBeenCalledWith(testUrl);
    });

    it("should handle empty intro url", () => {
      // Act
      (player as any).setIntroUrl("");

      // Assert
      expect(mockHLSPreloadedVideoPlayer.preload).toHaveBeenCalledWith("");
    });
  });

  describe("load method", () => {
    it("should call preload and load when video url is set", () => {
      // Arrange
      const testUrl = "https://example.com/video.m3u8";

      // Act
      (player as any).load(testUrl);

      // Assert
      expect(mockHLSPreloadedVideoPlayer.preload).toHaveBeenCalledWith(testUrl);
      expect(mockHLSPreloadedVideoPlayer.load).toHaveBeenCalledWith(testUrl);
    });

    it("should handle empty video url", () => {
      // Act
      (player as any).load("");

      // Assert
      expect(mockHLSPreloadedVideoPlayer.preload).toHaveBeenCalledWith("");
      expect(mockHLSPreloadedVideoPlayer.load).toHaveBeenCalledWith("");
    });
  });

  describe("playVideo method", () => {
    beforeEach(() => {
      mockHLSPreloadedVideoPlayer.initialized = true;
    });

    describe("should play video for valid phases", () => {
      it("should play video when phase is UpdateVideoInfo", () => {
        // Arrange
        const testTime = 15;
        const syncSpy = jest.spyOn(player as any, "syncCurrentTime");

        // Act
        (player as any).playVideo({
          phase: Phase.UpdateVideoInfo,
          videoLiveTime: testTime,
          halfIndex: 0
        });

        // Assert
        expect(player.currentTime).toBe(testTime);
        expect(syncSpy).toHaveBeenCalled();
        expect(mockHLSPreloadedVideoPlayer.play).toHaveBeenCalled();
      });

      it("should play video when phase is ScheduleEvent", () => {
        // Arrange
        const testTime = 25;
        const syncSpy = jest.spyOn(player as any, "syncCurrentTime");

        // Act
        (player as any).playVideo({
          phase: Phase.ScheduleEvent,
          videoLiveTime: testTime,
          halfIndex: 1
        });

        // Assert
        expect(player.currentTime).toBe(testTime);
        expect(syncSpy).toHaveBeenCalled();
        expect(mockHLSPreloadedVideoPlayer.play).toHaveBeenCalled();
      });

      it("should play video when phase is UpdateResult and halfIndex is 0", () => {
        // Arrange
        const testTime = 35;
        const syncSpy = jest.spyOn(player as any, "syncCurrentTime");

        // Act
        (player as any).playVideo({
          phase: Phase.UpdateResult,
          videoLiveTime: testTime,
          halfIndex: 0
        });

        // Assert
        expect(player.currentTime).toBe(testTime);
        expect(syncSpy).toHaveBeenCalled();
        expect(mockHLSPreloadedVideoPlayer.play).toHaveBeenCalled();
      });
    });

    describe("should not play video for invalid conditions", () => {
      it("should not play video when phase is UpdateResult and halfIndex is not 0", () => {
        // Arrange
        const initialTime = player.currentTime;
        const syncSpy = jest.spyOn(player as any, "syncCurrentTime");

        // Act
        (player as any).playVideo({
          phase: Phase.UpdateResult,
          videoLiveTime: 40,
          halfIndex: 1
        });

        // Assert
        expect(player.currentTime).toBe(initialTime);
        expect(syncSpy).not.toHaveBeenCalled();
        expect(mockHLSPreloadedVideoPlayer.play).not.toHaveBeenCalled();
      });

      it("should not play video when phase is UpdateOdds", () => {
        // Arrange
        const initialTime = player.currentTime;
        const syncSpy = jest.spyOn(player as any, "syncCurrentTime");

        // Act
        (player as any).playVideo({
          phase: Phase.UpdateOdds,
          videoLiveTime: 50,
          halfIndex: 0
        });

        // Assert
        expect(player.currentTime).toBe(initialTime);
        expect(syncSpy).not.toHaveBeenCalled();
        expect(mockHLSPreloadedVideoPlayer.play).not.toHaveBeenCalled();
      });

      it("should not play video when phase is UpdatePreloadVideoInfo", () => {
        // Arrange
        const initialTime = player.currentTime;
        const syncSpy = jest.spyOn(player as any, "syncCurrentTime");

        // Act
        (player as any).playVideo({
          phase: Phase.UpdatePreloadVideoInfo,
          videoLiveTime: 60,
          halfIndex: 0
        });

        // Assert
        expect(player.currentTime).toBe(initialTime);
        expect(syncSpy).not.toHaveBeenCalled();
        expect(mockHLSPreloadedVideoPlayer.play).not.toHaveBeenCalled();
      });

      it("should not play video when phase is UpdateGoalInfo", () => {
        // Arrange
        const initialTime = player.currentTime;
        const syncSpy = jest.spyOn(player as any, "syncCurrentTime");

        // Act
        (player as any).playVideo({
          phase: Phase.UpdateGoalInfo,
          videoLiveTime: 70,
          halfIndex: 0
        });

        // Assert
        expect(player.currentTime).toBe(initialTime);
        expect(syncSpy).not.toHaveBeenCalled();
        expect(mockHLSPreloadedVideoPlayer.play).not.toHaveBeenCalled();
      });
    });
  });

  describe("pause method", () => {
    it("should call hlsPlayer pause when initialized", () => {
      // Arrange
      mockHLSPreloadedVideoPlayer.initialized = true;

      // Act
      player.pause();

      // Assert
      expect(mockHLSPreloadedVideoPlayer.pause).toHaveBeenCalled();
    });

    it("should not call hlsPlayer pause when not initialized", () => {
      // Arrange
      mockHLSPreloadedVideoPlayer.initialized = false;

      // Act
      player.pause();

      // Assert
      expect(mockHLSPreloadedVideoPlayer.pause).not.toHaveBeenCalled();
    });
  });

  describe("muted property", () => {
    it("should set hlsPlayer muted property to true", () => {
      // Act
      player.muted = true;

      // Assert
      expect(mockHLSPreloadedVideoPlayer.muted).toBe(true);
    });

    it("should set hlsPlayer muted property to false", () => {
      // Act
      player.muted = false;

      // Assert
      expect(mockHLSPreloadedVideoPlayer.muted).toBe(false);
    });
  });

  describe("level property", () => {
    it("should return hlsPlayer currentLevel when initialized", () => {
      // Arrange
      mockHLSPreloadedVideoPlayer.currentLevel = 2;

      // Act
      const level = player.level;

      // Assert
      expect(level).toBe(2);
    });

    it("should return 0 when hlsPlayer is null", () => {
      // Arrange
      (player as any).hlsPlayer = null;

      // Act
      const level = player.level;

      // Assert
      expect(level).toBe(0);
    });
  });

  describe("bandwidthEstimate property", () => {
    it("should return hlsPlayer bandwidthEstimate when initialized", () => {
      // Arrange
      mockHLSPreloadedVideoPlayer.bandwidthEstimate = 5000;

      // Act
      const bandwidth = (player as any).bandwidthEstimate;

      // Assert
      expect(bandwidth).toBe(5000);
    });

    it("should return 0 when hlsPlayer is null", () => {
      // Arrange
      (player as any).hlsPlayer = null;

      // Act
      const bandwidth = (player as any).bandwidthEstimate;

      // Assert
      expect(bandwidth).toBe(0);
    });
  });

  describe("lateUpdate method", () => {
    it("should increment currentTime by dt", () => {
      // Arrange
      player.currentTime = 10;
      const dt = 0.016; // ~60fps

      // Act
      (player as any).lateUpdate(dt);

      // Assert
      expect(player.currentTime).toBeCloseTo(10.016);
    });
  });

  describe("onLoad method", () => {
    it("should call initialize method", () => {
      // Arrange
      const initializeSpy = jest.spyOn(player as any, "initialize");

      // Act
      player.onLoad();

      // Assert
      expect(initializeSpy).toHaveBeenCalled();
    });
  });

  describe("onDestroy method", () => {
    it("should call stop method", () => {
      // Arrange
      const stopSpy = jest.spyOn(player, "stop");

      // Act
      (player as any).onDestroy();

      // Assert
      expect(stopSpy).toHaveBeenCalled();
    });
  });

  describe("stop method", () => {
    it("should cleanup resources when initialized", () => {
      // Arrange
      mockHLSPreloadedVideoPlayer.initialized = true;

      // Act
      player.stop();

      // Assert
      expect(mockHLSPreloadedVideoPlayer.removeEventListener).toHaveBeenCalledWith(
        "timeupdate",
        expect.any(Function)
      );
      expect(mockHLSPreloadedVideoPlayer.off).toHaveBeenCalledWith(mockHls.Events.ERROR);
      expect(mockHLSPreloadedVideoPlayer.destroy).toHaveBeenCalled();
    });

    it("should not cleanup when not initialized", () => {
      // Arrange
      mockHLSPreloadedVideoPlayer.initialized = false;

      // Act
      player.stop();

      // Assert
      expect(mockHLSPreloadedVideoPlayer.removeEventListener).not.toHaveBeenCalled();
      expect(mockHLSPreloadedVideoPlayer.off).not.toHaveBeenCalled();
      expect(mockHLSPreloadedVideoPlayer.destroy).not.toHaveBeenCalled();
    });
  });

  describe("syncCurrentTime method", () => {
    beforeEach(() => {
      mockHLSPreloadedVideoPlayer.initialized = true;
    });

    it("should emit syncNativeCurrentTime event", () => {
      // Arrange
      mockHLSPreloadedVideoPlayer.currentTime = 25.5;

      // Act
      (player as any).syncCurrentTime();

      // Assert
      expect(mockNode.emit).toHaveBeenCalledWith("syncNativeCurrentTime", 25.5);
    });

    it("should sync currentTime when difference is greater than 1 second", () => {
      // Arrange
      player.currentTime = 30;
      mockHLSPreloadedVideoPlayer.currentTime = 25;

      // Act
      (player as any).syncCurrentTime();

      // Assert
      expect(mockHLSPreloadedVideoPlayer.currentTime).toBe(30);
    });

    it("should not sync currentTime when difference is less than 1 second", () => {
      // Arrange
      player.currentTime = 25.5;
      mockHLSPreloadedVideoPlayer.currentTime = 25;
      const originalTime = mockHLSPreloadedVideoPlayer.currentTime;

      // Act
      (player as any).syncCurrentTime();

      // Assert
      expect(mockHLSPreloadedVideoPlayer.currentTime).toBe(originalTime);
    });

    it("should not sync when currentTime is negative", () => {
      // Arrange
      player.currentTime = -5;
      mockHLSPreloadedVideoPlayer.currentTime = 25;
      const originalTime = mockHLSPreloadedVideoPlayer.currentTime;

      // Act
      (player as any).syncCurrentTime();

      // Assert
      expect(mockHLSPreloadedVideoPlayer.currentTime).toBe(originalTime);
    });

    it("should not sync when not initialized", () => {
      // Arrange
      mockHLSPreloadedVideoPlayer.initialized = false;
      player.currentTime = 30;
      mockHLSPreloadedVideoPlayer.currentTime = 25;
      const originalTime = mockHLSPreloadedVideoPlayer.currentTime;

      // Act
      (player as any).syncCurrentTime();

      // Assert
      expect(mockHLSPreloadedVideoPlayer.currentTime).toBe(originalTime);
    });
  });

  describe("initialize method", () => {
    it("should create HLSPreloadedVideoPlayer and set up event listeners", () => {
      // Act
      (player as any).initialize();

      // Assert
      expect(mockHLSPreloadedVideoPlayer.init).toHaveBeenCalled();
      expect(mockHLSPreloadedVideoPlayer.addEventListener).toHaveBeenCalledWith(
        "timeupdate",
        expect.any(Function)
      );
      
      // Verify that HLS events are set up
      Object.values(mockHls.Events).forEach((event) => {
        expect(mockHLSPreloadedVideoPlayer.addEventListener).toHaveBeenCalledWith(
          event,
          expect.any(Function)
        );
      });
    });
  });
});






