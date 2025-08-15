import { LabelStage } from "../../../assets/scripts/stages/label-stage";
import { LocalizedLabel } from "db://i18n/LocalizedLabel";

// Mock LocalizedLabel
jest.mock("db://i18n/LocalizedLabel", () => ({
  LocalizedLabel: jest.fn().mockImplementation(() => ({
    key: "",
  })),
}));

describe("LabelStage", () => {
  let labelStage: LabelStage;
  let mockLabel: LocalizedLabel;

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();

    // Create mock label
    mockLabel = {
      key: "",
    } as LocalizedLabel;

    // Create LabelStage instance
    labelStage = new LabelStage();
    labelStage.label = mockLabel;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("initialization", () => {
    it("should initialize with null label", () => {
      // Arrange
      const newStage = new LabelStage();

      // Assert
      expect(newStage.label).toBeNull();
    });
  });

  describe("syncLabelContent method", () => {
    it("should update label key when label exists", () => {
      // Arrange
      const testText = "test.label.key";

      // Act
      labelStage.syncLabelContent(testText);

      // Assert
      expect(mockLabel.key).toBe(testText);
    });

    it("should not update label key when label is null", () => {
      // Arrange
      labelStage.label = null;
      const testText = "test.label.key";

      // Act
      labelStage.syncLabelContent(testText);

      // Assert
      expect(mockLabel.key).toBe("");
    });

    it("should handle empty string", () => {
      // Arrange
      const testText = "";

      // Act
      labelStage.syncLabelContent(testText);

      // Assert
      expect(mockLabel.key).toBe(testText);
    });

    it("should handle special characters in text", () => {
      // Arrange
      const testText = "test.label.with.special.chars!@#$%";

      // Act
      labelStage.syncLabelContent(testText);

      // Assert
      expect(mockLabel.key).toBe(testText);
    });

    it("should handle unicode characters", () => {
      // Arrange
      const testText = "test.label.with.unicode.测试.🎉";

      // Act
      labelStage.syncLabelContent(testText);

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

      labelStage.label = null;
      (labelStage as any).getComponentInChildren = jest
        .fn()
        .mockReturnValue(mockChildLabel);

      // Act
      labelStage.onFocusInEditor();

      // Assert
      expect(labelStage.label).toBe(mockChildLabel);
      expect((labelStage as any).getComponentInChildren).toHaveBeenCalledWith(
        LocalizedLabel
      );
    });

    it("should not assign label when no LocalizedLabel found", () => {
      // Arrange
      labelStage.label = null;
      (labelStage as any).getComponentInChildren = jest
        .fn()
        .mockReturnValue(null);

      // Act
      labelStage.onFocusInEditor();

      // Assert
      expect(labelStage.label).toBeNull();
      expect((labelStage as any).getComponentInChildren).toHaveBeenCalledWith(
        LocalizedLabel
      );
    });
  });
});
