import { Icon } from "../../../assets/scripts/team/icon";
import { Team } from "../../../assets/scripts/team/team";

describe("Icon", () => {
  let icon: Icon;

  beforeEach(() => {
    icon = new Icon();
  });

  afterEach(() => {
    // Cleanup
  });

  describe("initialization", () => {
    it("should initialize with default team value", () => {
      // Assert
      expect(icon.team).toBe(Team.HOME);
    });
  });

  describe("team property", () => {
    it("should accept Team.HOME value", () => {
      // Act
      icon.team = Team.HOME;

      // Assert
      expect(icon.team).toBe(Team.HOME);
    });

    it("should accept Team.AWAY value", () => {
      // Act
      icon.team = Team.AWAY;

      // Assert
      expect(icon.team).toBe(Team.AWAY);
    });
  });

  describe("component inheritance", () => {
    it("should be an instance of Component", () => {
      // Assert
      expect(icon).toBeInstanceOf(Icon);
    });

    it("should have proper class name", () => {
      // Assert
      expect(icon.constructor.name).toBe("Icon");
    });
  });
});
