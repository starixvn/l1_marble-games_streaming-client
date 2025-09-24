jest.mock("../../../../assets/scripts/components/video-player/dom-background-video", () => ({
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
}));
jest.mock("hls.js", () => ({
	__esModule: true,
	default: class HlsMock {
		static Events = { ERROR: "ERROR", FRAG_LOADED: "FRAG_LOADED" };
		static isSupported() { return true; }
	},
	Events: { ERROR: "ERROR", FRAG_LOADED: "FRAG_LOADED" }
}));
jest.mock("observer", () => require("../../../utils/mock-store").createMockObserver());

import { BackgroundVideoPlayer } from "../../../../assets/scripts/components/video-player/background-video-player";
import { FeatureStage } from "../../../../assets/scripts/watchers/stages/stage-watcher";
import { initializeMockContainer, cleanupMockObserver } from "../../../utils/mock-store";


describe("BackgroundVideoPlayer", () => {
	let comp: BackgroundVideoPlayer;
	let hls: any;

	beforeEach(() => {
		// Arrange
		comp = new BackgroundVideoPlayer();
		hls = {
			initialized: true,
			load: jest.fn(),
			preload: jest.fn(),
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
    initializeMockContainer();
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
	});

	describe("setStoreInfo", () => {
		it("stores operator and game", () => {
			// Arrange
			// Act
			(comp as any).setStoreInfo({ operator: "op", game: "gm" });

			// Assert
			expect((comp as any)._operator).toBe("op");
			expect((comp as any)._game).toBe("gm");
		});
	});

	describe("setIntroUrl", () => {
		it("builds intro url using operator and game", () => {
			// Arrange
			(comp as any)._operator = "op";
			(comp as any)._game = "gm";

			// Act
			(comp as any).setIntroUrl("http://host/");

			// Assert
			expect((comp as any)._introUrl).toBe("http://host/op_gm_intro.m3u8");
		});
	});

	describe("playIntro", () => {
		it("loads and plays when status true and url set", () => {
			// Arrange
			(comp as any)._introUrl = "http://u";
			const syncSpy = jest.spyOn(comp as any, "syncCurrentTime");
			const playSpy = jest.spyOn(comp, "play");

			// Act
			(comp as any).playIntro({ currentTime: 10, status: true, timeToPlay: 0 });

			// Assert
			expect(hls.load).toHaveBeenCalledWith("http://u");
			expect(playSpy).toHaveBeenCalled();
			expect(syncSpy).toHaveBeenCalled();
			expect(comp.currentTime).toBe(10);
		});

		it("returns early when url is empty", () => {
			// Arrange
			(comp as any)._introUrl = "";

			// Act
			(comp as any).playIntro({ currentTime: 1, status: true, timeToPlay: 0 });

			// Assert
			expect(hls.load).not.toHaveBeenCalled();
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
	});

	describe("playVideo", () => {
		it("loads, plays and syncs current time", () => {
			// Arrange
			const playSpy = jest.spyOn(comp, "play");
			const syncSpy = jest.spyOn(comp as any, "syncCurrentTime");

			// Act
			(comp as any).playVideo({ videoLink: "v", currentTime: 33 });

			// Assert
			expect(hls.load).toHaveBeenCalledWith("v");
			expect(playSpy).toHaveBeenCalled();
			expect(syncSpy).toHaveBeenCalled();
			expect(comp.currentTime).toBe(33);
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
	});

	describe("muted", () => {
		it("sets muted on player", () => {
			// Arrange
			// Act
			(comp as any).muted = true;

			// Assert
			expect(hls.muted).toBe(true);
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

	describe("lateUpdate", () => {
		it("increments currentTime by dt", () => {
			// Arrange
			comp.currentTime = 1;

			// Act
			(comp as any).lateUpdate(0.5);

			// Assert
			expect(comp.currentTime).toBe(1.5);
		});
	});

	describe("onLoad", () => {
		it("calls initialize", () => {
			// Arrange
			const spy = jest.spyOn(comp as any, "initialize").mockImplementation(() => {});

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
	});

	describe("syncCurrentTime", () => {
		it("emits and syncs player time when delta > 1", () => {
			// Arrange
			hls.currentTime = 1;
			comp.currentTime = 5;

			// Act
			(comp as any).syncCurrentTime();

			// Assert
			expect((comp as any).node.emit).toHaveBeenCalledWith("syncNativeCurrentTime", 1);
			expect(hls.currentTime).toBe(5);
		});
	});

	describe("initialize", () => {
		it("initializes player, registers events and play state callback", () => {
			// Arrange
			const initInstance = {
				init: jest.fn(),
				addEventListener: jest.fn(),
				onPlayStateChanged: undefined as any,
				preload: jest.fn(),
			};
			jest.spyOn<any, any>(comp as any, "initialize").mockRestore();
			const ctorSpy = jest.spyOn(require("../../../../assets/scripts/components/video-player/preloaded-hls-player"), "HLSPreloadedVideoPlayer").mockImplementation(() => initInstance as any);
			const showSpy = jest.spyOn(comp as any, "showBackground");
			(comp as any)._introUrl = "intro.m3u8";

			// Act
			(comp as any)["initialize"]();

			// Assert
			expect(initInstance.init).toHaveBeenCalled();
			expect(initInstance.addEventListener).toHaveBeenCalledWith("timeupdate", expect.any(Function));
			// invoke play state changed
			initInstance.onPlayStateChanged(true);
			expect(showSpy).toHaveBeenCalled();
			expect(initInstance.preload).toHaveBeenCalledWith("intro.m3u8");
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
