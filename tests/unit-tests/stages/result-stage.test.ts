import { ResultStage } from "../../../assets/scripts/stages/result-stage";
import { Node } from "cc";
import { LocalizedLabel } from "db://i18n/LocalizedLabel";

// Mock dependencies
jest.mock("../../../assets/scripts/streaming/streaming-store", () => ({
  StreamingStore: jest.fn().mockImplementation(() => ({
    result: null,
    eventData: {
      homeTeam: "",
      awayTeam: "",
    },
  })),
}));

jest.mock("../../../assets/scripts/store", () => ({
  Store: jest.fn().mockImplementation(() => ({
    operator: "",
  })),
}));

jest.mock("db://i18n/LanguageData", () => ({
  t: jest.fn((key: string) => {
    // Mock translation function - return empty string for operator-specific keys
    if (key.startsWith("operator.") || key.startsWith("testOperator.")) {
      return "";
    }
    return key;
  }),
}));

jest.mock("db://i18n/LocalizedLabel", () => ({
  LocalizedLabel: jest.fn().mockImplementation(() => ({
    _key: "",
  })),
}));

describe("ResultStage", () => {
  let resultStage: ResultStage;
  let mockHome: Node;
  let mockAway: Node;
  let mockLabel: LocalizedLabel;

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();

    // Create mock nodes
    mockHome = {
      active: false,
    } as Node;

    mockAway = {
      active: false,
    } as Node;

    mockLabel = {
      _key: "",
    } as LocalizedLabel;

    // Create ResultStage instance
    resultStage = new ResultStage();
    (resultStage as any).home = mockHome;
    (resultStage as any).away = mockAway;
    (resultStage as any).label = mockLabel;
    (resultStage as any).result = null;
    (resultStage as any).homeCode = "";
    (resultStage as any).awayCode = "";
    (resultStage as any).operator = "";
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("updateResult method", () => {
    it("should update result and call render", () => {
      // Arrange
      const result = "H";
      (resultStage as any).render = jest.fn();

      // Act
      (resultStage as any).updateResult(result);

      // Assert
      expect((resultStage as any).result).toBe(result);
      expect((resultStage as any).render).toHaveBeenCalled();
    });

    it("should handle all result types", () => {
      // Arrange
      (resultStage as any).render = jest.fn();

      // Act & Assert
      (resultStage as any).updateResult("H");
      expect((resultStage as any).result).toBe("H");

      (resultStage as any).updateResult("A");
      expect((resultStage as any).result).toBe("A");

      (resultStage as any).updateResult("D");
      expect((resultStage as any).result).toBe("D");

      (resultStage as any).updateResult(null);
      expect((resultStage as any).result).toBeNull();
    });
  });

  describe("syncOperator method", () => {
    it("should update operator and call render", () => {
      // Arrange
      const operator = "testOperator";
      (resultStage as any).render = jest.fn();

      // Act
      (resultStage as any).syncOperator(operator);

      // Assert
      expect((resultStage as any).operator).toBe(operator);
      expect((resultStage as any).render).toHaveBeenCalled();
    });

    it("should handle empty operator", () => {
      // Arrange
      const operator = "";
      (resultStage as any).render = jest.fn();

      // Act
      (resultStage as any).syncOperator(operator);

      // Assert
      expect((resultStage as any).operator).toBe(operator);
      expect((resultStage as any).render).toHaveBeenCalled();
    });
  });

  describe("updateHomeCode method", () => {
    it("should update team codes and call render", () => {
      // Arrange
      const data = { homeCode: "HOME", awayCode: "AWAY" };
      (resultStage as any).render = jest.fn();

      // Act
      (resultStage as any).updateHomeCode(data);

      // Assert
      expect((resultStage as any).homeCode).toBe("HOME");
      expect((resultStage as any).awayCode).toBe("AWAY");
      expect((resultStage as any).render).toHaveBeenCalled();
    });

    it("should handle empty team codes", () => {
      // Arrange
      const data = { homeCode: "", awayCode: "" };
      (resultStage as any).render = jest.fn();

      // Act
      (resultStage as any).updateHomeCode(data);

      // Assert
      expect((resultStage as any).homeCode).toBe("");
      expect((resultStage as any).awayCode).toBe("");
      expect((resultStage as any).render).toHaveBeenCalled();
    });
  });

  describe("render method", () => {
    beforeEach(() => {
      // Set up default state
      (resultStage as any).result = null;
      (resultStage as any).homeCode = "HOME";
      (resultStage as any).awayCode = "AWAY";
      (resultStage as any).operator = "testOperator";
    });

    it("should render home win correctly", () => {
      // Arrange
      (resultStage as any).result = "H";

      // Act
      (resultStage as any).render();

      // Assert
      expect(mockHome.active).toBe(true);
      expect(mockAway.active).toBe(false);
      expect(mockLabel._key).toBe("Common.HOME");
    });

    it("should render away win correctly", () => {
      // Arrange
      (resultStage as any).result = "A";

      // Act
      (resultStage as any).render();

      // Assert
      expect(mockHome.active).toBe(false);
      expect(mockAway.active).toBe(true);
      expect(mockLabel._key).toBe("Common.AWAY");
    });

    it("should render draw correctly", () => {
      // Arrange
      (resultStage as any).result = "D";

      // Act
      (resultStage as any).render();

      // Assert
      expect(mockHome.active).toBe(false);
      expect(mockAway.active).toBe(false);
    });

    it("should render null result correctly", () => {
      // Arrange
      (resultStage as any).result = null;

      // Act
      (resultStage as any).render();

      // Assert
      expect(mockHome.active).toBe(false);
      expect(mockAway.active).toBe(false);
    });

    it("should use Common fallback when operator translation is empty", () => {
      // Arrange
      (resultStage as any).result = "H";
      (resultStage as any).operator = "testOperator"; // This will return empty string from mock t function

      // Act
      (resultStage as any).render();

      // Assert
      expect(mockLabel._key).toBe("Common.HOME");
    });

    it("should use operator-specific key when translation exists", () => {
      // Arrange
      (resultStage as any).result = "A";
      (resultStage as any).operator = "validOperator"; // This will return the key from mock t function

      // Act
      (resultStage as any).render();

      // Assert
      expect(mockLabel._key).toBe("validOperator.AWAY");
    });
  });
});
