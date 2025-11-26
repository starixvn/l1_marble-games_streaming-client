import { Label } from "cc";
import { Result } from "../../../../assets/scripts/components/result/result";

jest.mock("db://i18n/LanguageData", () => ({
  t: (key: string) => (key === "common.Prefix" ? "Prefix" : ""),
}));

describe("Result", () => {
  let comp: Result;
  let label: Label;

  beforeEach(() => {
    // Arrange
    comp = new Result();
    label = new Label();
    comp.scoreLabel = label as any;
  });

  describe("syncResult", () => {
    it("sets label string without prefix when prefix is empty", () => {
      // Arrange
      comp.prefix = "" as any;
      (comp as any).resultType = 0; // HalfTime
      const data: any = {
        result: {
          0: { homeScore: 1, awayScore: 2 },
          1: { homeScore: 3, awayScore: 4 },
        },
      };

      // Act
      comp.syncResult(data);

      // Assert
      expect(label.string).toBe("1 - 2");
    });

    it("sets label string with translated prefix when prefix provided", () => {
      // Arrange
      comp.prefix = "common.Prefix" as any;
      (comp as any).resultType = 1; // FullTime aggregates both
      const data: any = {
        result: {
          0: { homeScore: 1, awayScore: 2 },
          1: { homeScore: 3, awayScore: 4 },
        },
      };

      // Act
      comp.syncResult(data);

      // Assert
      expect(label.string).toBe("Prefix: 4 - 6");
    });
  });
});
