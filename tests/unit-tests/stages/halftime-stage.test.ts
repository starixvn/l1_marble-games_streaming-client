import { HalftimeStage } from "../../../assets/scripts/stages/halftime-stage";
import { LocalizedLabel } from "db://i18n/LocalizedLabel";

// Mock LocalizedLabel
jest.mock("db://i18n/LocalizedLabel", () => ({
  LocalizedLabel: jest.fn().mockImplementation(() => ({
    key: "",
  })),
}));

describe("HalftimeStage", () => {
  let halftimeStage: HalftimeStage;
  let mockLabel: LocalizedLabel;

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();

    // Create mock label
    mockLabel = {
      key: "",
    } as LocalizedLabel;

    // Create HalftimeStage instance
    halftimeStage = new HalftimeStage();
    halftimeStage.label = mockLabel;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("initialization", () => {
    it("should initialize with null label", () => {
      // Arrange
      const newStage = new HalftimeStage();

      // Assert
      expect(newStage.label).toBeNull();
    });
  });

  describe("syncLabelContent method", () => {
    it("should update label key when label exists", () => {
      // Arrange
      const testText = "test.label.key";

      // Act
      halftimeStage.syncLabelContent(testText);

      // Assert
      expect(mockLabel.key).toBe(testText);
    });

    it("should not update label key when label is null", () => {
      // Arrange
      halftimeStage.label = null;
      const testText = "test.label.key";

      // Act
      halftimeStage.syncLabelContent(testText);

      // Assert
      expect(mockLabel.key).toBe("");
    });

    it("should handle empty string", () => {
      // Arrange
      const testText = "";

      // Act
      halftimeStage.syncLabelContent(testText);

      // Assert
      expect(mockLabel.key).toBe(testText);
    });

    it("should handle special characters in text", () => {
      // Arrange
      const testText = "test.label.with.special.chars!@#$%";

      // Act
      halftimeStage.syncLabelContent(testText);

      // Assert
      expect(mockLabel.key).toBe(testText);
    });
  });

  describe("onFocusInEditor method", () => {
    it("should find and assign LocalizedLabel from children", () => {
      // Arrange
      const mockChildLabel = {
        key: "found.label",
      } as LocalizedLabel;

      halftimeStage.label = null;
      (halftimeStage as any).getComponentInChildren = jest
        .fn()
        .mockReturnValue(mockChildLabel);

      // Act
      halftimeStage.onFocusInEditor();

      // Assert
      expect(halftimeStage.label).toBe(mockChildLabel);
      expect(
        (halftimeStage as any).getComponentInChildren
      ).toHaveBeenCalledWith(LocalizedLabel);
    });

    it("should not assign label when no LocalizedLabel found", () => {
      // Arrange
      halftimeStage.label = null;
      (halftimeStage as any).getComponentInChildren = jest
        .fn()
        .mockReturnValue(null);

      // Act
      halftimeStage.onFocusInEditor();

      // Assert
      expect(halftimeStage.label).toBeNull();
      expect(
        (halftimeStage as any).getComponentInChildren
      ).toHaveBeenCalledWith(LocalizedLabel);
    });
  });
});
