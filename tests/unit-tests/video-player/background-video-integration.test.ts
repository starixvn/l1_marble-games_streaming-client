import { BackgroundVideoIntegration } from "../../../assets/scripts/video-player/background-video-integration";
import { VideoStore } from "../../../assets/scripts/video-player/video-store";

// Mock Hls.js
jest.mock("hls.js", () => ({
  Events: {
    MEDIA_DETACHED: "hls-media-detached",
    MANIFEST_LOADING: "hls-manifest-loading",
    LEVEL_LOADED: "hls-level-loaded",
  },
}));

describe("BackgroundVideoIntegration", () => {
  let backgroundVideoIntegration: BackgroundVideoIntegration;
  let mockNode: any;

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();

    // Create mock node with event emitter
    mockNode = {
      on: jest.fn(),
      off: jest.fn(),
    };

    // Create BackgroundVideoIntegration instance
    backgroundVideoIntegration = new BackgroundVideoIntegration();
    (backgroundVideoIntegration as any).node = mockNode;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("initialization", () => {
    it("should initialize with default state", () => {
      // Assert
      expect(backgroundVideoIntegration).toBeInstanceOf(
        BackgroundVideoIntegration
      );
    });
  });

  describe("onLoad method", () => {
    it("should register HLS event listeners", () => {
      // Act
      backgroundVideoIntegration["onLoad"]();

      // Assert
      expect(mockNode.on).toHaveBeenCalledTimes(3);
      expect(mockNode.on).toHaveBeenCalledWith(
        "hls-media-detached",
        expect.any(Function)
      );
      expect(mockNode.on).toHaveBeenCalledWith(
        "hls-manifest-loading",
        expect.any(Function)
      );
      expect(mockNode.on).toHaveBeenCalledWith(
        "hls-level-loaded",
        expect.any(Function)
      );
    });

    it("should call setDefaultBackground(true) when MEDIA_DETACHED event is triggered", () => {
      // Arrange
      jest.spyOn(backgroundVideoIntegration as any, "setDefaultBackground");

      // Act
      backgroundVideoIntegration["onLoad"]();

      // Get the callback for MEDIA_DETACHED event
      const mediaDetachedCallback = mockNode.on.mock.calls.find(
        (call) => call[0] === "hls-media-detached"
      )[1];

      // Trigger the callback
      mediaDetachedCallback();

      // Assert
      expect(
        backgroundVideoIntegration["setDefaultBackground"]
      ).toHaveBeenCalledWith(true);
    });

    it("should call setDefaultBackground(true) when MANIFEST_LOADING event is triggered", () => {
      // Arrange
      jest.spyOn(backgroundVideoIntegration as any, "setDefaultBackground");

      // Act
      backgroundVideoIntegration["onLoad"]();

      // Get the callback for MANIFEST_LOADING event
      const manifestLoadingCallback = mockNode.on.mock.calls.find(
        (call) => call[0] === "hls-manifest-loading"
      )[1];

      // Trigger the callback
      manifestLoadingCallback();

      // Assert
      expect(
        backgroundVideoIntegration["setDefaultBackground"]
      ).toHaveBeenCalledWith(true);
    });

    it("should call setDefaultBackground(false) when LEVEL_LOADED event is triggered", () => {
      // Arrange
      jest.spyOn(backgroundVideoIntegration as any, "setDefaultBackground");

      // Act
      backgroundVideoIntegration["onLoad"]();

      // Get the callback for LEVEL_LOADED event
      const levelLoadedCallback = mockNode.on.mock.calls.find(
        (call) => call[0] === "hls-level-loaded"
      )[1];

      // Trigger the callback
      levelLoadedCallback();

      // Assert
      expect(
        backgroundVideoIntegration["setDefaultBackground"]
      ).toHaveBeenCalledWith(false);
    });
  });

  describe("setDefaultBackground method", () => {
    it("should return the enable parameter", () => {
      // Act
      const resultTrue =
        backgroundVideoIntegration["setDefaultBackground"](true);
      const resultFalse =
        backgroundVideoIntegration["setDefaultBackground"](false);

      // Assert
      expect(resultTrue).toBe(true);
      expect(resultFalse).toBe(false);
    });

    it("should handle different boolean values", () => {
      // Act & Assert
      expect(backgroundVideoIntegration["setDefaultBackground"](true)).toBe(
        true
      );
      expect(backgroundVideoIntegration["setDefaultBackground"](false)).toBe(
        false
      );
    });
  });
});
