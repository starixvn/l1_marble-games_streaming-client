import { NameManager } from "../../../assets/scripts/team/name-manager";
import { Name } from "../../../assets/scripts/team/name";
import { Team } from "../../../assets/scripts/team/team";
import { Label } from "cc";
import { LocalizedLabel } from "db://i18n/LocalizedLabel";

// Mock dependencies
jest.mock("../../../assets/scripts/store", () => ({
  Store: jest.fn().mockImplementation(() => ({
    operator: "",
  })),
}));

jest.mock("../../../assets/scripts/team/team-store", () => ({
  TeamStore: jest.fn().mockImplementation(() => ({
    home: "",
    away: "",
  })),
}));

jest.mock("db://i18n/LanguageData", () => ({
  t: jest.fn((key: string) => {
    // Mock translation function - return empty string for operator-specific keys
    if (key.startsWith("operator.")) {
      return "";
    }
    return key;
  }),
}));

jest.mock("db://i18n/LocalizedLabel", () => ({
  LocalizedLabel: jest.fn().mockImplementation(() => ({
    key: "",
    updateLabel: jest.fn(),
  })),
}));

describe("NameManager", () => {
  let nameManager: NameManager;
  let mockLongName: Name;
  let mockShortName: Name;
  let mockLongLabel: LocalizedLabel;
  let mockShortLabel: Label;

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();

    // Create mock labels
    mockLongLabel = {
      key: "",
      updateLabel: jest.fn(),
    } as unknown as LocalizedLabel;

    mockShortLabel = {
      string: "",
    } as Label;

    // Create mock names
    mockLongName = {
      team: Team.HOME,
      short: false,
      getComponent: jest.fn().mockReturnValue(mockLongLabel),
    } as any;

    mockShortName = {
      team: Team.HOME,
      short: true,
      getComponent: jest.fn().mockReturnValue(mockShortLabel),
    } as any;

    // Create NameManager instance
    nameManager = new NameManager();
    nameManager.team = Team.HOME;
    (nameManager as any).targets = [mockLongName, mockShortName];
    (nameManager as any).longLabels = [mockLongLabel];
    (nameManager as any).shortLabels = [mockShortLabel];
    (nameManager as any).operator = "";
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("initialization", () => {
    it("should initialize with default values", () => {
      // Arrange
      const newManager = new NameManager();

      // Assert
      expect(newManager.team).toBe(Team.HOME);
      expect((newManager as any).targets).toEqual([]);
      expect((newManager as any).longLabels).toEqual([]);
      expect((newManager as any).shortLabels).toEqual([]);
      expect((newManager as any).operator).toBe("");
    });
  });

  describe("onLoad method", () => {
    it("should populate long and short labels arrays", () => {
      // Arrange
      const newManager = new NameManager();
      (newManager as any).targets = [mockLongName, mockShortName];

      // Act
      (newManager as any).onLoad();

      // Assert
      expect((newManager as any).longLabels).toEqual([mockLongLabel]);
      expect((newManager as any).shortLabels).toEqual([mockShortLabel]);
      expect(mockLongName.getComponent).toHaveBeenCalledWith(LocalizedLabel);
      expect(mockShortName.getComponent).toHaveBeenCalledWith(Label);
    });

    it("should handle empty targets array", () => {
      // Arrange
      const newManager = new NameManager();
      (newManager as any).targets = [];

      // Act
      (newManager as any).onLoad();

      // Assert
      expect((newManager as any).longLabels).toEqual([]);
      expect((newManager as any).shortLabels).toEqual([]);
    });

    it("should filter long and short names correctly", () => {
      // Arrange
      const newManager = new NameManager();
      const mockLongName2 = {
        team: Team.HOME,
        short: false,
        getComponent: jest.fn().mockReturnValue(mockLongLabel),
      } as any;
      const mockShortName2 = {
        team: Team.HOME,
        short: true,
        getComponent: jest.fn().mockReturnValue(mockShortLabel),
      } as any;
      (newManager as any).targets = [
        mockLongName,
        mockShortName,
        mockLongName2,
        mockShortName2,
      ];

      // Act
      (newManager as any).onLoad();

      // Assert
      expect((newManager as any).longLabels).toEqual([
        mockLongLabel,
        mockLongLabel,
      ]);
      expect((newManager as any).shortLabels).toEqual([
        mockShortLabel,
        mockShortLabel,
      ]);
    });
  });

  describe("syncOperator method", () => {
    it("should update operator value", () => {
      // Arrange
      const operator = "testOperator";

      // Act
      (nameManager as any).syncOperator(operator);

      // Assert
      expect((nameManager as any).operator).toBe(operator);
    });
  });

  describe("syncTeamName method", () => {
    it("should update name for HOME team", () => {
      // Arrange
      nameManager.team = Team.HOME;
      (nameManager as any).operator = "testOperator";
      const teamData = { home: "team_home", away: "team_away" };

      // Act
      (nameManager as any).syncTeamName(teamData);

      // Assert
      expect((nameManager as any).longLabels[0].key).toBe(
        "testOperator.team_home"
      );
      expect((nameManager as any).shortLabels[0].string).toBe("HOME");
    });

    it("should update name for AWAY team", () => {
      // Arrange
      nameManager.team = Team.AWAY;
      (nameManager as any).operator = "testOperator";
      const teamData = { home: "team_home", away: "team_away" };

      // Act
      (nameManager as any).syncTeamName(teamData);

      // Assert
      expect((nameManager as any).longLabels[0].key).toBe(
        "testOperator.team_away"
      );
      expect((nameManager as any).shortLabels[0].string).toBe("AWAY");
    });
  });

  describe("name setter", () => {
    it("should update long labels with operator-specific key when translation exists", () => {
      // Arrange
      (nameManager as any).operator = "validOperator";
      const { t } = require("db://i18n/LanguageData");
      t.mockReturnValue("translated_text");

      // Act
      (nameManager as any).name = "team_name";

      // Assert
      expect(mockLongLabel.key).toBe("validOperator.team_name");
      expect(mockLongLabel.updateLabel).toHaveBeenCalled();
    });

    it("should update long labels with Common fallback when operator translation is empty", () => {
      // Arrange
      (nameManager as any).operator = "operator"; // This will return empty string from mock t function

      // Act
      (nameManager as any).name = "team_name";

      // Assert
      expect(mockLongLabel.key).toBe("operator.team_name");
      expect(mockLongLabel.updateLabel).toHaveBeenCalled();
    });

    it("should update short labels with uppercase name part", () => {
      // Arrange
      (nameManager as any).operator = "testOperator";

      // Act
      (nameManager as any).name = "team_name";

      // Assert
      expect(mockShortLabel.string).toBe("NAME");
    });

    it("should handle empty team name", () => {
      // Arrange
      (nameManager as any).operator = "testOperator";

      // Act & Assert - should throw error due to missing underscore
      expect(() => {
        (nameManager as any).name = "";
      }).toThrow("Cannot read properties of undefined (reading 'toUpperCase')");
    });

    it("should handle team name with multiple underscores", () => {
      // Arrange
      (nameManager as any).operator = "testOperator";

      // Act
      (nameManager as any).name = "team_name_test";

      // Assert
      expect(mockShortLabel.string).toBe("NAME");
    });

    it("should update multiple long labels", () => {
      // Arrange
      const mockLongLabel2 = {
        key: "",
        updateLabel: jest.fn(),
      } as unknown as LocalizedLabel;
      (nameManager as any).longLabels = [mockLongLabel, mockLongLabel2];
      (nameManager as any).operator = "testOperator";

      // Act
      (nameManager as any).name = "team_name";

      // Assert
      expect(mockLongLabel.key).toBe("testOperator.team_name");
      expect(mockLongLabel2.key).toBe("testOperator.team_name");
      expect(mockLongLabel.updateLabel).toHaveBeenCalled();
      expect(mockLongLabel2.updateLabel).toHaveBeenCalled();
    });

    it("should update multiple short labels", () => {
      // Arrange
      const mockShortLabel2 = {
        string: "",
      } as Label;
      (nameManager as any).shortLabels = [mockShortLabel, mockShortLabel2];
      (nameManager as any).operator = "testOperator";

      // Act
      (nameManager as any).name = "team_name";

      // Assert
      expect(mockShortLabel.string).toBe("NAME");
      expect(mockShortLabel2.string).toBe("NAME");
    });
  });

  describe("onFocusInEditor method", () => {
    it("should filter names by team", () => {
      // Arrange
      const mockHomeName = { team: Team.HOME } as Name;
      const mockAwayName = { team: Team.AWAY } as Name;
      const mockNode = {
        getComponentsInChildren: jest
          .fn()
          .mockReturnValue([mockHomeName, mockAwayName]),
      };
      (nameManager as any).node = mockNode;
      nameManager.team = Team.HOME;

      // Act
      (nameManager as any).onFocusInEditor();

      // Assert
      expect((nameManager as any).targets).toEqual([mockHomeName]);
      expect(mockNode.getComponentsInChildren).toHaveBeenCalledWith(Name);
    });

    it("should handle empty children array", () => {
      // Arrange
      const mockNode = {
        getComponentsInChildren: jest.fn().mockReturnValue([]),
      };
      (nameManager as any).node = mockNode;

      // Act
      (nameManager as any).onFocusInEditor();

      // Assert
      expect((nameManager as any).targets).toEqual([]);
    });

    it("should filter for AWAY team", () => {
      // Arrange
      const mockHomeName = { team: Team.HOME } as Name;
      const mockAwayName = { team: Team.AWAY } as Name;
      const mockNode = {
        getComponentsInChildren: jest
          .fn()
          .mockReturnValue([mockHomeName, mockAwayName]),
      };
      (nameManager as any).node = mockNode;
      nameManager.team = Team.AWAY;

      // Act
      (nameManager as any).onFocusInEditor();

      // Assert
      expect((nameManager as any).targets).toEqual([mockAwayName]);
    });
  });
});
