import { Label } from "cc";
import { Score } from "../../../../assets/scripts/components/scores/score";

jest.mock("db://i18n/LanguageData", () => ({
  t: (key: string) => (key === "common.Prefix" ? "Prefix" : ""),
}));

describe("Score", () => {
  let comp: Score;
  let label: Label;

  beforeEach(() => {
    // Arrange
    comp = new Score();
    label = new Label();
    (comp as any).label = label as any;
  });

  describe("syncResult", () => {
    it("updates previous score from result data", () => {
      // Arrange
      const data: any = { result: { 0: { homeScore: 2, awayScore: 1 } } };

      // Act
      (comp as any).syncResult(data);
      (comp as any).isPreviousScore = true;
      (comp as any).render();

      // Assert
      expect(label.string).toBe("2 - 1");
    });
  });

  describe("syncScore", () => {
    it("updates score and triggers render", () => {
      // Arrange
      const data: any = { homeScore: 5, awayScore: 3 };

      // Act
      (comp as any).syncScore(data);

      // Assert
      expect(label.string).toBe("5 - 3");
    });
  });

  describe("render", () => {
    it("renders with prefix when provided", () => {
      // Arrange
      (comp as any).score = "7 - 8";
      (comp as any).prefix = "common.Prefix";

      // Act
      (comp as any).render();

      // Assert
      expect(label.string).toBe("Prefix: 7 - 8");
    });

    it("renders without prefix when not provided", () => {
      // Arrange
      (comp as any).score = "1 - 0";
      (comp as any).prefix = "";

      // Act
      (comp as any).render();

      // Assert
      expect(label.string).toBe("1 - 0");
    });
  });

  describe("onFocusInEditor", () => {
    it("assigns label from node component", () => {
      // Arrange
      const nodeLabel = new Label();
      (comp as any).node.getComponent = jest.fn().mockReturnValue(nodeLabel);

      // Act
      (comp as any).onFocusInEditor();

      // Assert
      expect((comp as any).label).toBe(nodeLabel as any);
    });
  });
});
