jest.mock(
  "../../../../assets/scripts/components/video-player/dom-background-video",
  () => ({
    DOMBackgroundVideo: {
      GAME_CONTAINER_ID: "Cocos3dGameContainer",
      GAME_CANVAS_ID: "GameCanvas",
      VIDEO_ID: "VideoBackground",
      resizeCallbacks: new Map(),
      videos: new Map(),
      genericEventNotifier: new (class {
        addEventListener = jest.fn();
        dispatchEvent = jest.fn();
        removeEventListener = jest.fn();
      })(),
      resizeObserver: { observe: () => {}, disconnect: () => {} },
      applyConfig: jest.fn(),
      toFront: jest.fn(),
      changeBackground: jest.fn(),
      createOrLoadVideoElement: jest.fn(() => ({
        style: {},
        muted: false,
        playsInline: true,
        autoplay: true,
        preload: "auto",
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
      })),
      removeVideoElement: jest.fn(),
    },
  })
);
jest.mock("hls.js", () => ({
  __esModule: true,
  default: class HlsMock {
    static Events = { ERROR: "ERROR", FRAG_LOADED: "FRAG_LOADED" };
    static isSupported() {
      return true;
    }
  },
  Events: { ERROR: "ERROR", FRAG_LOADED: "FRAG_LOADED" },
}));
jest.mock("observer", () =>
  require("../../../utils/mock-store").createMockObserver()
);

import { BackgroundVideoPlayer } from "../../../../assets/scripts/components/video-player/background-video-player";
import { FeatureStage } from "../../../../assets/scripts/watchers/stages/stage-watcher";
import { GameStore } from "../../../../assets/scripts/local-stores/game/game-store";
import {
  initializeMockContainer,
  cleanupMockObserver,
  createMockStore,
} from "../../../utils/mock-store";

describe("BackgroundVideoPlayer", () => {
  let comp: BackgroundVideoPlayer;
  let hls: any;

  beforeEach(() => {
    // Arrange
    initializeMockContainer();
    createMockStore(GameStore, { data: { gameId: "gm" } } as any);
    comp = new BackgroundVideoPlayer();
    hls = {
      initialized: true,
      load: jest.fn(),
      preload: jest.fn(),
      stopPreload: jest.fn(),
      play: jest.fn(),
      pause: jest.fn(),
      currentTime: 0,
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      off: jest.fn(),
      destroy: jest.fn(),
      currentLevel: 2,
      bandwidthEstimate: 123,
      muted: false,
      onPlayStateChanged: undefined,
      onHlsLoaded: undefined,
      onHlsPlayed: undefined,
    };
    (comp as any).hlsPlayer = hls;
  });

  afterAll(() => {
    cleanupMockObserver();
  });

  describe("syncPlayVideo", () => {
    it("pauses and shows background when not Intro/Streaming", () => {
      // Arrange
      const pauseSpy = jest.spyOn(comp, "pause");
      const showSpy = jest.spyOn(comp as any, "showBackground");

      // Act
      (comp as any).syncPlayVideo(FeatureStage.Result);

      // Assert
      expect(pauseSpy).toHaveBeenCalled();
      expect(showSpy).toHaveBeenCalledWith(true);
    });

    it("does not pause or show background when stage is Intro", () => {
      // Arrange
      const pauseSpy = jest.spyOn(comp, "pause");
      const showSpy = jest.spyOn(comp as any, "showBackground");

      // Act
      (comp as any).syncPlayVideo(FeatureStage.Intro);

      // Assert
      expect(pauseSpy).not.toHaveBeenCalled();
      expect(showSpy).not.toHaveBeenCalled();
    });

    it("does not pause or show background when stage is Streaming", () => {
      // Arrange
      const pauseSpy = jest.spyOn(comp, "pause");
      const showSpy = jest.spyOn(comp as any, "showBackground");

      // Act
      (comp as any).syncPlayVideo(FeatureStage.Streaming);

      // Assert
      expect(pauseSpy).not.toHaveBeenCalled();
      expect(showSpy).not.toHaveBeenCalled();
    });
  });

  describe("setIntroData", () => {
    it("stores intro data", () => {
      // Arrange
      const introData = {
        prebet: "https://example.com/prebet.m3u8",
        halftime: "https://example.com/halftime.m3u8",
      };

      // Act
      (comp as any).setIntroData(introData);

      // Assert
      expect((comp as any).introData).toEqual(introData);
    });
  });

  describe("setPreloadVideoLink", () => {
    it("preloads when link provided", () => {
      // Arrange
      // Act
      (comp as any).setPreloadVideoLink("link");

      // Assert
      expect(hls.preload).toHaveBeenCalledWith("link");
    });

    it("does not preload when videoLink is falsy", () => {
      // Arrange
      // Act
      (comp as any).setPreloadVideoLink("");

      // Assert
      expect(hls.preload).not.toHaveBeenCalled();
    });

    it("does not preload when videoLink is null", () => {
      // Arrange
      // Act
      (comp as any).setPreloadVideoLink(null);

      // Assert
      expect(hls.preload).not.toHaveBeenCalled();
    });

    it("does not preload when videoLink is undefined", () => {
      // Arrange
      // Act
      (comp as any).setPreloadVideoLink(undefined);

      // Assert
      expect(hls.preload).not.toHaveBeenCalled();
    });
  });

  describe("preloadAndPlayIntro", () => {
    beforeEach(() => {
      jest.useFakeTimers();
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it("preloads and plays prebet intro when state is Prebet", () => {
      // Arrange
      (comp as any).introData = {
        prebet: "https://example.com/prebet.m3u8",
        halftime: "",
      };
      const showSpy = jest.spyOn(comp as any, "showBackground");
      const playIntroSpy = jest.spyOn(comp as any, "playIntro");

      // Act
      (comp as any).preloadAndPlayIntro({
        state: "Prebet",
        currentStateTimeMs: 5000,
      });

      // Assert - preload called immediately
      expect(hls.preload).toHaveBeenCalledWith(
        "https://example.com/prebet.m3u8"
      );

      // Fast-forward timers
      jest.runAllTimers();

      // Assert - playIntro called after timeout
      expect(showSpy).toHaveBeenCalledWith(false);
      expect(playIntroSpy).toHaveBeenCalledWith({
        videoLink: "https://example.com/prebet.m3u8",
        currentTime: 2000, // 5000 - 3000
      });
    });

    it("preloads and plays halftime intro when state is PhaseChange", () => {
      // Arrange
      (comp as any).introData = {
        prebet: "",
        halftime: "https://example.com/halftime.m3u8",
      };
      const showSpy = jest.spyOn(comp as any, "showBackground");
      const playIntroSpy = jest.spyOn(comp as any, "playIntro");

      // Act
      (comp as any).preloadAndPlayIntro({
        state: "PhaseChange",
        currentStateTimeMs: 4000,
      });

      // Assert - preload called immediately
      expect(hls.preload).toHaveBeenCalledWith(
        "https://example.com/halftime.m3u8"
      );

      // Fast-forward timers
      jest.runAllTimers();

      // Assert - playIntro called after timeout
      expect(showSpy).toHaveBeenCalledWith(false);
      expect(playIntroSpy).toHaveBeenCalledWith({
        videoLink: "https://example.com/halftime.m3u8",
        currentTime: 1000, // 4000 - 3000
      });
    });

    it("does not preload when prebet intro URL is empty", () => {
      // Arrange
      (comp as any).introData = {
        prebet: "",
        halftime: "",
      };

      // Act
      (comp as any).preloadAndPlayIntro({
        state: "Prebet",
        currentStateTimeMs: 5000,
      });

      // Assert
      expect(hls.preload).not.toHaveBeenCalled();
    });

    it("does not preload when halftime intro URL is empty", () => {
      // Arrange
      (comp as any).introData = {
        prebet: "",
        halftime: "",
      };

      // Act
      (comp as any).preloadAndPlayIntro({
        state: "PhaseChange",
        currentStateTimeMs: 5000,
      });

      // Assert
      expect(hls.preload).not.toHaveBeenCalled();
    });

    it("waits before playing intro when currentStateTimeMs is less than delayShowIntro", () => {
      // Arrange
      (comp as any).introData = {
        prebet: "https://example.com/prebet.m3u8",
        halftime: "",
      };
      const playIntroSpy = jest.spyOn(comp as any, "playIntro");

      // Act - currentStateTimeMs (1000) < delayShowIntro (3000)
      (comp as any).preloadAndPlayIntro({
        state: "Prebet",
        currentStateTimeMs: 1000,
      });

      // Assert - preload called immediately
      expect(hls.preload).toHaveBeenCalledWith(
        "https://example.com/prebet.m3u8"
      );

      // Fast-forward timers by waiting time (2000ms)
      jest.advanceTimersByTime(2000);

      // Assert - playIntro called with adjusted time
      expect(playIntroSpy).toHaveBeenCalledWith({
        videoLink: "https://example.com/prebet.m3u8",
        currentTime: 0, // (1000 - 3000) + 2000 = 0
      });
    });
  });

  describe("playIntro", () => {
    it("stops preload, loads video, and plays", () => {
      // Arrange
      const playSpy = jest.spyOn(comp, "play");
      const syncSpy = jest.spyOn(comp as any, "syncCurrentTime");

      // Act
      (comp as any).playIntro({
        videoLink: "https://example.com/intro.m3u8",
        currentTime: 5,
      });

      // Assert
      expect(hls.stopPreload).toHaveBeenCalled();
      expect(hls.load).toHaveBeenCalledWith("https://example.com/intro.m3u8");
      expect(comp.currentTime).toBe(5);
      expect(playSpy).toHaveBeenCalled();
      expect(syncSpy).toHaveBeenCalled();
    });
  });

  describe("initialized", () => {
    it("returns true when hlsPlayer is initialized", () => {
      // Arrange
      hls.initialized = true;

      // Act
      const result = (comp as any).initialized;

      // Assert
      expect(result).toBe(true);
    });

    it("returns false when hlsPlayer is not initialized", () => {
      // Arrange
      hls.initialized = false;

      // Act
      const result = (comp as any).initialized;

      // Assert
      expect(result).toBe(false);
    });

    it("returns false when hlsPlayer is null", () => {
      // Arrange
      (comp as any).hlsPlayer = null;

      // Act
      const result = (comp as any).initialized;

      // Assert
      expect(result).toBe(false);
    });

    it("returns false when hlsPlayer is undefined", () => {
      // Arrange
      (comp as any).hlsPlayer = undefined;

      // Act
      const result = (comp as any).initialized;

      // Assert
      expect(result).toBe(false);
    });
  });

  describe("playVideo", () => {
    it("loads, plays and syncs current time", () => {
      // Arrange
      const playSpy = jest.spyOn(comp, "play");
      const syncSpy = jest.spyOn(comp as any, "syncCurrentTime");

      // Act
      (comp as any).playVideo({ videoLink: "v", currentTime: 33 });

      // Assert
      expect(hls.stopPreload).toHaveBeenCalled();
      expect(hls.load).toHaveBeenCalledWith("v");
      expect(playSpy).toHaveBeenCalled();
      expect(syncSpy).toHaveBeenCalled();
      expect(comp.currentTime).toBe(33);
    });

    it("does not load or play when videoLink is empty", () => {
      // Arrange
      const playSpy = jest.spyOn(comp, "play");
      const syncSpy = jest.spyOn(comp as any, "syncCurrentTime");

      // Act
      (comp as any).playVideo({ videoLink: "", currentTime: 33 });

      // Assert
      expect(hls.stopPreload).not.toHaveBeenCalled();
      expect(hls.load).not.toHaveBeenCalled();
      expect(playSpy).not.toHaveBeenCalled();
      expect(syncSpy).not.toHaveBeenCalled();
      expect(comp.currentTime).toBe(0); // Should remain unchanged
    });

    it("does not load or play when videoLink is null", () => {
      // Arrange
      const playSpy = jest.spyOn(comp, "play");
      const syncSpy = jest.spyOn(comp as any, "syncCurrentTime");

      // Act
      (comp as any).playVideo({ videoLink: null, currentTime: 33 });

      // Assert
      expect(hls.stopPreload).not.toHaveBeenCalled();
      expect(hls.load).not.toHaveBeenCalled();
      expect(playSpy).not.toHaveBeenCalled();
      expect(syncSpy).not.toHaveBeenCalled();
      expect(comp.currentTime).toBe(0); // Should remain unchanged
    });
  });

  describe("pause", () => {
    it("pauses when initialized", () => {
      // Arrange
      // Act
      comp.pause();

      // Assert
      expect(hls.pause).toHaveBeenCalled();
    });

    it("does not pause when not initialized", () => {
      // Arrange
      hls.initialized = false;

      // Act
      comp.pause();

      // Assert
      expect(hls.pause).not.toHaveBeenCalled();
    });
  });

  describe("play", () => {
    it("plays and shows background when initialized", () => {
      // Arrange
      const showSpy = jest.spyOn(comp as any, "showBackground");

      // Act
      comp.play();

      // Assert
      expect(hls.play).toHaveBeenCalled();
      expect(showSpy).toHaveBeenCalledWith(true);
    });

    it("does not play when not initialized", () => {
      // Arrange
      hls.initialized = false;
      const showSpy = jest.spyOn(comp as any, "showBackground");

      // Act
      comp.play();

      // Assert
      expect(hls.play).not.toHaveBeenCalled();
      expect(showSpy).not.toHaveBeenCalled();
    });
  });

  describe("muted", () => {
    it("sets muted on player", () => {
      // Arrange
      // Act
      (comp as any).muted = true;

      // Assert
      expect(hls.muted).toBe(true);
    });

    it("throws error when hlsPlayer is null", () => {
      // Arrange
      (comp as any).hlsPlayer = null;

      // Act & Assert
      expect(() => {
        (comp as any).muted = true;
      }).toThrow();
    });
  });

  describe("level", () => {
    it("returns current level when player exists", () => {
      // Arrange
      // Act
      const level = (comp as any).level;

      // Assert
      expect(level).toBe(2);
    });

    it("returns 0 when player missing", () => {
      // Arrange
      (comp as any).hlsPlayer = null;

      // Act
      const level = (comp as any).level;

      // Assert
      expect(level).toBe(0);
    });
  });

  describe("update", () => {
    it("increments currentTime by dt when initialized", () => {
      // Arrange
      comp.currentTime = 1;

      // Act
      (comp as any).update(0.5);

      // Assert
      expect(comp.currentTime).toBe(1.5);
    });

    it("does not increment currentTime when not initialized", () => {
      // Arrange
      comp.currentTime = 1;
      hls.initialized = false;

      // Act
      (comp as any).update(0.5);

      // Assert
      expect(comp.currentTime).toBe(1);
    });
  });

  describe("onLoad", () => {
    it("calls initialize", () => {
      // Arrange
      const spy = jest
        .spyOn(comp as any, "initialize")
        .mockImplementation(() => {});

      // Act
      (comp as any).onLoad();

      // Assert
      expect(spy).toHaveBeenCalled();
    });
  });

  describe("onDestroy", () => {
    it("calls stop", () => {
      // Arrange
      const spy = jest.spyOn(comp as any, "stop").mockImplementation(() => {});

      // Act
      (comp as any).onDestroy();

      // Assert
      expect(spy).toHaveBeenCalled();
    });
  });

  describe("stop", () => {
    it("removes listeners and destroys when initialized", () => {
      // Arrange
      // Act
      (comp as any).stop();

      // Assert
      expect(hls.removeEventListener).toHaveBeenCalled();
      expect(hls.off).toHaveBeenCalled();
      expect(hls.destroy).toHaveBeenCalled();
    });

    it("does not remove listeners or destroy when not initialized", () => {
      // Arrange
      hls.initialized = false;

      // Act
      (comp as any).stop();

      // Assert
      expect(hls.removeEventListener).not.toHaveBeenCalled();
      expect(hls.destroy).not.toHaveBeenCalled();
    });
  });

  describe("syncCurrentTime", () => {
    it("emits and syncs player time when delta > 1", () => {
      // Arrange
      comp.currentTime = 5; // Component time is ahead
      hls.currentTime = 1; // Player time is behind by more than 1 second

      // Act
      (comp as any).syncCurrentTime();

      // Assert
      expect((comp as any).node.emit).toHaveBeenCalledWith(
        "syncNativeCurrentTime",
        1
      );
      expect(hls.currentTime).toBe(5); // Should sync to component time
    });

    it("does not sync player time when delta <= 1", () => {
      // Arrange
      comp.currentTime = 5; // Component time
      hls.currentTime = 4.5; // Player time is within 1 second

      // Act
      (comp as any).syncCurrentTime();

      // Assert
      expect((comp as any).node.emit).toHaveBeenCalledWith(
        "syncNativeCurrentTime",
        4.5
      );
      expect(hls.currentTime).toBe(4.5); // Should not be changed
    });

    it("does not sync player time when not initialized", () => {
      // Arrange
      comp.currentTime = 5; // Component time is ahead
      hls.currentTime = 1; // Player time is behind by more than 1 second
      hls.initialized = false;

      // Act
      (comp as any).syncCurrentTime();

      // Assert
      expect((comp as any).node.emit).toHaveBeenCalledWith(
        "syncNativeCurrentTime",
        1
      );
      expect(hls.currentTime).toBe(1); // Should not be changed when not initialized
    });

    it("does not sync when currentTime is negative", () => {
      // Arrange
      comp.currentTime = -3; // Negative component time
      hls.currentTime = 1;

      // Act
      (comp as any).syncCurrentTime();

      // Assert
      expect((comp as any).node.emit).toHaveBeenCalledWith(
        "syncNativeCurrentTime",
        1
      );
      expect(hls.currentTime).toBe(1); // Should not be changed when currentTime < 0
    });

    it("syncs when currentTime is 0 and delta > 1", () => {
      // Arrange
      comp.currentTime = 0; // Component time is 0
      hls.currentTime = 2; // Player time is ahead by more than 1 second

      // Act
      (comp as any).syncCurrentTime();

      // Assert
      expect((comp as any).node.emit).toHaveBeenCalledWith(
        "syncNativeCurrentTime",
        2
      );
      expect(hls.currentTime).toBe(0); // Should sync to component time (0)
    });
  });

  describe("initialize", () => {
    it("initializes player, registers events and play state callback", () => {
      // Arrange
      const initInstance = {
        init: jest.fn(),
        addEventListener: jest.fn(),
        onPlayStateChanged: undefined as any,
      };
      jest.spyOn<any, any>(comp as any, "initialize").mockRestore();
      const ctorSpy = jest
        .spyOn(
          require("../../../../assets/scripts/components/video-player/preloaded-hls-player"),
          "HLSPreloadedVideoPlayer"
        )
        .mockImplementation(() => initInstance as any);
      const showSpy = jest.spyOn(comp as any, "showBackground");

      // Act
      (comp as any)["initialize"]();

      // Assert
      expect(initInstance.init).toHaveBeenCalled();
      expect(initInstance.addEventListener).toHaveBeenCalledWith(
        "timeupdate",
        expect.any(Function)
      );
      // invoke play state changed
      initInstance.onPlayStateChanged(true);
      expect(showSpy).toHaveBeenCalledWith(false); // showBackground(!play) = showBackground(false)
      ctorSpy.mockRestore();
    });

    it("onPlayStateChanged shows background when play is false", () => {
      // Arrange
      const initInstance = {
        init: jest.fn(),
        addEventListener: jest.fn(),
        onPlayStateChanged: undefined as any,
      };
      jest.spyOn<any, any>(comp as any, "initialize").mockRestore();
      const ctorSpy = jest
        .spyOn(
          require("../../../../assets/scripts/components/video-player/preloaded-hls-player"),
          "HLSPreloadedVideoPlayer"
        )
        .mockImplementation(() => initInstance as any);
      const showSpy = jest.spyOn(comp as any, "showBackground");

      // Act
      (comp as any)["initialize"]();
      initInstance.onPlayStateChanged(false);

      // Assert
      expect(showSpy).toHaveBeenCalledWith(true); // showBackground(!play) = showBackground(true)
      ctorSpy.mockRestore();
    });
  });

  describe("showBackground", () => {
    it("returns the provided flag", () => {
      // Arrange
      // Act
      const result = (comp as any).showBackground(true);

      // Assert
      expect(result).toBe(true);
    });
  });
});
