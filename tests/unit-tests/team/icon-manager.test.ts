import { IconManager } from "../../../assets/scripts/team/icon-manager";
import { Icon } from "../../../assets/scripts/team/icon";
import { Team } from "../../../assets/scripts/team/team";
import { Sprite, SpriteFrame } from "cc";

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

describe("IconManager", () => {
  let iconManager: IconManager;
  let mockIcon1: Icon;
  let mockIcon2: Icon;
  let mockSprite1: Sprite;
  let mockSprite2: Sprite;
  let mockSpriteFrame: SpriteFrame;

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();

    // Create mock sprites
    mockSprite1 = {
      spriteFrame: null,
    } as Sprite;

    mockSprite2 = {
      spriteFrame: null,
    } as Sprite;

    mockSpriteFrame = {
      name: "test_sprite_frame",
    } as SpriteFrame;

    // Create mock icons
    mockIcon1 = {
      team: Team.HOME,
      getComponent: jest.fn().mockReturnValue(mockSprite1),
    } as any;

    mockIcon2 = {
      team: Team.HOME,
      getComponent: jest.fn().mockReturnValue(mockSprite2),
    } as any;

    // Create IconManager instance
    iconManager = new IconManager();
    iconManager.team = Team.HOME;
    (iconManager as any).targets = [mockIcon1, mockIcon2];
    (iconManager as any).sprites = [mockSprite1, mockSprite2];
    (iconManager as any).operator = "";
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("initialization", () => {
    it("should initialize with default values", () => {
      // Arrange
      const newManager = new IconManager();

      // Assert
      expect(newManager.team).toBe(Team.HOME);
      expect((newManager as any).targets).toEqual([]);
      expect((newManager as any).sprites).toEqual([]);
      expect((newManager as any).operator).toBe("");
    });
  });

  describe("onLoad method", () => {
    it("should populate sprites array from targets", () => {
      // Arrange
      const newManager = new IconManager();
      (newManager as any).targets = [mockIcon1, mockIcon2];

      // Act
      (newManager as any).onLoad();

      // Assert
      expect((newManager as any).sprites).toEqual([mockSprite1, mockSprite2]);
      expect(mockIcon1.getComponent).toHaveBeenCalledWith(Sprite);
      expect(mockIcon2.getComponent).toHaveBeenCalledWith(Sprite);
    });

    it("should handle empty targets array", () => {
      // Arrange
      const newManager = new IconManager();
      (newManager as any).targets = [];

      // Act
      (newManager as any).onLoad();

      // Assert
      expect((newManager as any).sprites).toEqual([]);
    });
  });

  describe("syncOperator method", () => {
    it("should update operator value", () => {
      // Arrange
      const operator = "testOperator";

      // Act
      (iconManager as any).syncOperator(operator);

      // Assert
      expect((iconManager as any).operator).toBe(operator);
    });
  });

  describe("syncTeamName method", () => {
    let setter: jest.SpyInstance;

    beforeEach(() => {
      setter = jest
        .spyOn(iconManager as any, "name", "set")
        .mockImplementation(() => {
          return;
        });
    });

    it("should update name for HOME team", () => {
      // Arrange
      iconManager.team = Team.HOME;
      (iconManager as any).operator = "testOperator";
      const teamData = { home: "team_home", away: "team_away" };

      // Act
      (iconManager as any).syncTeamName(teamData);

      // Assert
      expect(setter).toHaveBeenCalledWith("team_home");
    });

    it("should update name for AWAY team", () => {
      // Arrange
      iconManager.team = Team.AWAY;
      const teamData = { home: "team_home", away: "team_away" };
      (iconManager as any).name = jest.fn();

      // Act
      (iconManager as any).syncTeamName(teamData);

      // Assert
      expect(setter).toHaveBeenCalledWith("team_away");
    });

    it("should not update name when home team data is null", () => {
      // Arrange
      iconManager.team = Team.HOME;
      const teamData = { home: null, away: "team_away" };

      // Act
      (iconManager as any).syncTeamName(teamData);

      // Assert
      expect(setter).not.toHaveBeenCalled();
    });

    it("should not update name when away team data is null", () => {
      // Arrange
      iconManager.team = Team.AWAY;
      const teamData = { home: "team_home", away: null };

      // Act
      (iconManager as any).syncTeamName(teamData);

      // Assert
      expect(setter).not.toHaveBeenCalled();
    });
  });

  describe("name getter", () => {
    it("should return sprite frame name from first sprite", () => {
      // Arrange
      mockSprite1.spriteFrame = mockSpriteFrame;

      // Act
      const result = (iconManager as any).name;

      // Assert
      expect(result).toBe("test_sprite_frame");
    });

    it("should return empty string when no sprites exist", () => {
      // Arrange
      (iconManager as any).sprites = [];

      // Act
      const result = (iconManager as any).name;

      // Assert
      expect(result).toBe("");
    });
  });

  describe("onFocusInEditor method", () => {
    it("should filter icons by team", () => {
      // Arrange
      const mockHomeIcon = { team: Team.HOME } as Icon;
      const mockAwayIcon = { team: Team.AWAY } as Icon;
      const mockNode = {
        getComponentsInChildren: jest
          .fn()
          .mockReturnValue([mockHomeIcon, mockAwayIcon]),
      };
      (iconManager as any).node = mockNode;
      iconManager.team = Team.HOME;

      // Act
      (iconManager as any).onFocusInEditor();

      // Assert
      expect((iconManager as any).targets).toEqual([mockHomeIcon]);
      expect(mockNode.getComponentsInChildren).toHaveBeenCalledWith(Icon);
    });

    it("should handle empty children array", () => {
      // Arrange
      const mockNode = {
        getComponentsInChildren: jest.fn().mockReturnValue([]),
      };
      (iconManager as any).node = mockNode;

      // Act
      (iconManager as any).onFocusInEditor();

      // Assert
      expect((iconManager as any).targets).toEqual([]);
    });

    it("should filter for AWAY team", () => {
      // Arrange
      const mockHomeIcon = { team: Team.HOME } as Icon;
      const mockAwayIcon = { team: Team.AWAY } as Icon;
      const mockNode = {
        getComponentsInChildren: jest
          .fn()
          .mockReturnValue([mockHomeIcon, mockAwayIcon]),
      };
      (iconManager as any).node = mockNode;
      iconManager.team = Team.AWAY;

      // Act
      (iconManager as any).onFocusInEditor();

      // Assert
      expect((iconManager as any).targets).toEqual([mockAwayIcon]);
    });
  });
});
