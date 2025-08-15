import { StreamingStage } from "../../../assets/scripts/stages/streaming-stage";
import { Node } from "cc";

// Mock VideoStore
jest.mock("../../../assets/scripts/video-player/video-store", () => ({
  VideoStore: jest.fn().mockImplementation(() => ({
    defaultBackgroundEnabled: false,
  })),
}));

describe("StreamingStage", () => {
  let streamingStage: StreamingStage;
  let mockBackground: Node;

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();

    // Create mock background node
    mockBackground = {
      active: false,
    } as Node;

    // Create StreamingStage instance
    streamingStage = new StreamingStage();
    streamingStage.background = mockBackground;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("initialization", () => {
    it("should initialize with null background", () => {
      // Arrange
      const newStage = new StreamingStage();

      // Assert
      expect(newStage.background).toBeNull();
    });
  });

  describe("updateDefaultBackground method", () => {
    it("should set background active when enabled is true", () => {
      // Arrange
      const enabled = true;

      // Act
      streamingStage.updateDefaultBackground(enabled);

      // Assert
      expect(mockBackground.active).toBe(true);
    });

    it("should set background inactive when enabled is false", () => {
      // Arrange
      const enabled = false;

      // Act
      streamingStage.updateDefaultBackground(enabled);

      // Assert
      expect(mockBackground.active).toBe(false);
    });

    it("should toggle background state correctly", () => {
      // Arrange
      mockBackground.active = false;

      // Act - Enable
      streamingStage.updateDefaultBackground(true);

      // Assert
      expect(mockBackground.active).toBe(true);

      // Act - Disable
      streamingStage.updateDefaultBackground(false);

      // Assert
      expect(mockBackground.active).toBe(false);
    });

    it("should handle multiple rapid state changes", () => {
      // Arrange
      mockBackground.active = false;

      // Act
      streamingStage.updateDefaultBackground(true);
      streamingStage.updateDefaultBackground(false);
      streamingStage.updateDefaultBackground(true);
      streamingStage.updateDefaultBackground(false);

      // Assert
      expect(mockBackground.active).toBe(false);
    });
  });
});
