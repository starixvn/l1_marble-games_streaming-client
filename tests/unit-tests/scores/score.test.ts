import { Label } from "cc";
import { Score } from "../../../assets/scripts/scores/score";

// Mock the i18n translation function
jest.mock("db://i18n/LanguageData", () => ({
  t: jest.fn((key: string) => `translated_${key}`),
}));

describe("Score", () => {
  let score: Score;
  let mockLabel: jest.Mocked<Label>;

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();

    // Create mock Label
    mockLabel = {
      string: "",
      node: {},
      getComponent: jest.fn(),
      color: {},
      fontSize: 0,
      lineHeight: 0,
      cacheMode: 2,
      overflow: 0,
      font: null,
    } as any;

    // Create Score instance
    score = new Score();
    (score as any).label = mockLabel;
  });

  afterEach(() => {
    jest.clearAllMocks();
    // Cleanup
  });

  describe("initialization", () => {
    it("should initialize with default state", () => {
      // Assert
      expect((score as any).label).toBe(mockLabel);
      expect((score as any).prefix).toBe("");
      expect((score as any).isPreviousScore).toBe(false);
      expect((score as any).score).toBe("");
      expect((score as any).previousScore).toBe("");
    });
  });

  describe("syncScore method", () => {
    it("should update score and call render", () => {
      // Arrange
      const testScore = "2 - 1";
      jest.spyOn(score as any, "render");

      // Act
      score["syncScore"](testScore);

      // Assert
      expect((score as any).score).toBe(testScore);
      expect(score["render"]).toHaveBeenCalledTimes(1);
    });

    it("should handle empty score text", () => {
      // Arrange
      const testScore = "";
      jest.spyOn(score as any, "render");

      // Act
      score["syncScore"](testScore);

      // Assert
      expect((score as any).score).toBe(testScore);
      expect(score["render"]).toHaveBeenCalledTimes(1);
    });

    it("should handle complex score text", () => {
      // Arrange
      const testScore = "10 - 5";
      jest.spyOn(score as any, "render");

      // Act
      score["syncScore"](testScore);

      // Assert
      expect((score as any).score).toBe(testScore);
      expect(score["render"]).toHaveBeenCalledTimes(1);
    });
  });

  describe("syncPreviousScore method", () => {
    it("should update previous score and call render", () => {
      // Arrange
      const testPreviousScore = "1 - 1";
      jest.spyOn(score as any, "render");

      // Act
      score["syncPreviousScore"](testPreviousScore);

      // Assert
      expect((score as any).previousScore).toBe(testPreviousScore);
      expect(score["render"]).toHaveBeenCalledTimes(1);
    });

    it("should handle empty previous score text", () => {
      // Arrange
      const testPreviousScore = "";
      jest.spyOn(score as any, "render");

      // Act
      score["syncPreviousScore"](testPreviousScore);

      // Assert
      expect((score as any).previousScore).toBe(testPreviousScore);
      expect(score["render"]).toHaveBeenCalledTimes(1);
    });
  });

  describe("render method", () => {
    beforeEach(() => {
      // Import the mocked t function
      const { t } = require("db://i18n/LanguageData");
      t.mockClear();
    });

    it("should render current score without prefix", () => {
      // Arrange
      (score as any).score = "2 - 1";
      (score as any).prefix = "";

      // Act
      score["render"]();

      // Assert
      expect((score as any).label.string).toBe("2 - 1");
    });

    it("should render current score with prefix", () => {
      // Arrange
      (score as any).score = "3 - 0";
      (score as any).prefix = "score.label";

      // Act
      score["render"]();

      // Assert
      expect((score as any).label.string).toBe("translated_score.label: 3 - 0");
    });

    it("should render previous score when isPreviousScore is true", () => {
      // Arrange
      (score as any).score = "2 - 1";
      (score as any).previousScore = "1 - 1";
      (score as any).isPreviousScore = true;
      (score as any).prefix = "";

      // Act
      score["render"]();

      // Assert
      expect((score as any).label.string).toBe("1 - 1");
    });

    it("should render previous score with prefix when isPreviousScore is true", () => {
      // Arrange
      (score as any).score = "2 - 1";
      (score as any).previousScore = "0 - 0";
      (score as any).isPreviousScore = true;
      (score as any).prefix = "previous.score";

      // Act
      score["render"]();

      // Assert
      expect((score as any).label.string).toBe(
        "translated_previous.score: 0 - 0"
      );
    });

    it("should render current score when isPreviousScore is false", () => {
      // Arrange
      (score as any).score = "2 - 1";
      (score as any).previousScore = "1 - 1";
      (score as any).isPreviousScore = false;
      (score as any).prefix = "";

      // Act
      score["render"]();

      // Assert
      expect((score as any).label.string).toBe("2 - 1");
    });
  });

  describe("onFocusInEditor method", () => {
    it("should set label from node component", () => {
      // Arrange
      const mockNodeLabel = { string: "test" } as any;
      (score as any).node = {
        getComponent: jest.fn().mockReturnValue(mockNodeLabel),
      };

      // Act
      score.onFocusInEditor();

      // Assert
      expect((score as any).node.getComponent).toHaveBeenCalledWith(Label);
      expect((score as any).label).toBe(mockNodeLabel);
    });
  });

  describe("score display logic", () => {
    it("should display current score by default", () => {
      // Arrange
      (score as any).score = "2 - 1";
      (score as any).previousScore = "1 - 1";
      (score as any).isPreviousScore = false;

      // Act
      score["render"]();

      // Assert
      expect((score as any).label.string).toBe("2 - 1");
    });

    it("should display previous score when isPreviousScore is true", () => {
      // Arrange
      (score as any).score = "2 - 1";
      (score as any).previousScore = "1 - 1";
      (score as any).isPreviousScore = true;

      // Act
      score["render"]();

      // Assert
      expect((score as any).label.string).toBe("1 - 1");
    });

    it("should toggle between current and previous score based on isPreviousScore", () => {
      // Arrange
      (score as any).score = "3 - 2";
      (score as any).previousScore = "2 - 2";

      // Test current score
      (score as any).isPreviousScore = false;
      score["render"]();
      expect((score as any).label.string).toBe("3 - 2");

      // Test previous score
      (score as any).isPreviousScore = true;
      score["render"]();
      expect((score as any).label.string).toBe("2 - 2");
    });
  });

  describe("prefix handling", () => {
    beforeEach(() => {
      const { t } = require("db://i18n/LanguageData");
      t.mockClear();
    });

    it("should not add prefix when prefix is empty", () => {
      // Arrange
      (score as any).score = "1 - 0";
      (score as any).prefix = "";

      // Act
      score["render"]();

      // Assert
      expect((score as any).label.string).toBe("1 - 0");
    });

    it("should translate prefix when prefix is provided", () => {
      // Arrange
      (score as any).score = "2 - 1";
      (score as any).prefix = "game.score";

      // Act
      score["render"]();

      // Assert
      expect((score as any).label.string).toBe("translated_game.score: 2 - 1");
    });

    it("should call translation function with correct key", () => {
      // Arrange
      const { t } = require("db://i18n/LanguageData");
      (score as any).score = "1 - 1";
      (score as any).prefix = "score.display";

      // Act
      score["render"]();

      // Assert
      expect(t).toHaveBeenCalledWith("score.display");
    });
  });
});
