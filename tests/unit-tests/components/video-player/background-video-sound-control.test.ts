
import { game } from "cc";
import { 
  createMockStore, 
  createMockObserver, 
  initializeMockContainer, 
  cleanupMockObserver,
  spyOnStoreMethods,
  expectStoreMethodCalled,
  expectStoreMethodCalledTimes
} from "../../../utils/mock-store";

jest.mock("../../../../assets/scripts/components/video-player/dom-audio-checker", () => ({
  initializeAudio: jest.fn((callback) => callback()),
}));

jest.mock("observer", () => createMockObserver());

global.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));

jest.mock("../../../../assets/scripts/components/video-player/background-video-player", () => ({
  BackgroundVideoPlayer: jest.fn().mockImplementation(() => ({
    muted: false,
  })),
}));

import { BackgroundVideoSoundControl } from "../../../../assets/scripts/components/video-player/background-video-sound-control";
import { BackgroundVideoPlayer } from "../../../../assets/scripts/components/video-player/background-video-player";
import { AudioStore } from "../../../../assets/scripts/audios/audio-store";

describe("BackgroundVideoSoundControl", () => {
  let component: BackgroundVideoSoundControl;
  let mockAudioStore: AudioStore & { update: (props: Partial<AudioStore>) => void; reset: (props: Partial<AudioStore>) => void };
  let mockVideoPlayer: jest.Mocked<BackgroundVideoPlayer>;
  let mockCanvas: jest.Mocked<HTMLCanvasElement>;
  let mockNode: any;
  let audioStoreSpies: Record<string, jest.SpyInstance>;

  beforeAll(() => {
    initializeMockContainer();
    mockAudioStore = createMockStore(AudioStore, {
      muted: false,
      browserBlocked: true,
    });

    mockVideoPlayer = { 
      set muted(value: boolean) {
        this._muted = value;
      },
      get muted() {
        return this._muted;
      },
      _muted: false
    } as any;
    mockCanvas = {
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
    } as any;

    Object.defineProperty(game, 'canvas', {
      value: mockCanvas,
      configurable: true,
    });

    mockNode = {
      getComponent: jest.fn().mockReturnValue(mockVideoPlayer),
    };

    component = new BackgroundVideoSoundControl();
    Object.defineProperty(component, 'node', {
      value: mockNode,
      configurable: true,
    });

    Object.defineProperty(component, 'videoPlayer', {
      value: mockVideoPlayer,
      writable: true,
      configurable: true,
    });
  });

  afterAll(() => {
    cleanupMockObserver();
  });

  beforeEach(() => {
    mockAudioStore.reset({
      muted: false,
      browserBlocked: true,
    });

    audioStoreSpies = spyOnStoreMethods(mockAudioStore, ['setBrowserBlocked', 'setMuted']);

    jest.clearAllMocks();
    
    (mockVideoPlayer as any)._muted = false;
  });

  describe("onLoad", () => {
    it("should set up event listeners and initialize video player", () => {
      // Act
      component.onLoad();

      // Assert
      expect(mockCanvas.addEventListener).toHaveBeenCalledWith("touchstart", expect.any(Function), { passive: true });
      expect(mockCanvas.addEventListener).toHaveBeenCalledWith("mousedown", expect.any(Function));
      expect(mockNode.getComponent).toHaveBeenCalledWith(BackgroundVideoPlayer);
    });
  });

  describe("onTouch", () => {
    beforeEach(() => {
      component.onLoad();
      jest.clearAllMocks();
    });

    it("should call setBrowserBlocked through @handle decorator", () => {
      // Act
      component.onTouch();

      // Assert
      expectStoreMethodCalled(audioStoreSpies, 'setBrowserBlocked', false);
      expectStoreMethodCalledTimes(audioStoreSpies, 'setBrowserBlocked', 1);
    });
  });

  describe("setBrowserBlocked", () => {
    beforeEach(() => {
      component.onLoad();
      jest.clearAllMocks();
    });

    it("should return the input value and call store method via @handle", () => {
      // Act
      const result = (component as any).setBrowserBlocked(true);

      // Assert
      expect(result).toBe(true);
      expectStoreMethodCalled(audioStoreSpies, 'setBrowserBlocked', true);
    });

    it("should handle false value correctly", () => {
      // Act
      const result = (component as any).setBrowserBlocked(false);

      // Assert
      expect(result).toBe(false);
      expectStoreMethodCalled(audioStoreSpies, 'setBrowserBlocked', false);
    });

    it("should update store state when called", () => {
      // Arrange
      mockAudioStore.browserBlocked = true;
      expect(mockAudioStore.browserBlocked).toBe(true);

      // Act
      (component as any).setBrowserBlocked(false);

      // Assert
      expect(mockAudioStore.browserBlocked).toBe(false);
    });
  });

  describe("@render AudioStore", () => {
    beforeEach(() => {
      component.onLoad();
    });

    it("should sync video player muted state from store", () => {
      // Act
      mockAudioStore.muted = true;
      mockAudioStore.browserBlocked = false;

      // Assert
      expect(mockVideoPlayer.muted).toBe(true);
    });

    it("should set video muted when browserBlocked is true", () => {
      // Act
      mockAudioStore.muted = false;
      mockAudioStore.browserBlocked = true;

      // Assert
      expect(mockVideoPlayer.muted).toBe(true);
    });

    it("should set video muted when either muted or browserBlocked is true", () => {
      // Act
      mockAudioStore.muted = true;
      mockAudioStore.browserBlocked = false;
      
      // Assert
      expect(mockVideoPlayer.muted).toBe(true);

      // Act
      mockAudioStore.muted = false;
      mockAudioStore.browserBlocked = true;
      
      // Assert
      expect(mockVideoPlayer.muted).toBe(true);

      // Act
      mockAudioStore.muted = false;
      mockAudioStore.browserBlocked = false;
      
      // Assert
      expect(mockVideoPlayer.muted).toBe(false);
    });
  });
});