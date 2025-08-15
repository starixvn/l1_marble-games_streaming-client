import { Name } from "../../../assets/scripts/team/name";
import { Team } from "../../../assets/scripts/team/team";

describe("Name", () => {
  let name: Name;

  beforeEach(() => {
    name = new Name();
  });

  afterEach(() => {
    // Cleanup
  });

  describe("initialization", () => {
    it("should initialize with default team value", () => {
      // Assert
      expect(name.team).toBe(Team.HOME);
    });

    it("should initialize with default short value", () => {
      // Assert
      expect(name.short).toBe(false);
    });
  });

  describe("team property", () => {
    it("should accept Team.HOME value", () => {
      // Act
      name.team = Team.HOME;

      // Assert
      expect(name.team).toBe(Team.HOME);
    });

    it("should accept Team.AWAY value", () => {
      // Act
      name.team = Team.AWAY;

      // Assert
      expect(name.team).toBe(Team.AWAY);
    });
  });

  describe("short property", () => {
    it("should accept true value", () => {
      // Act
      name.short = true;

      // Assert
      expect(name.short).toBe(true);
    });

    it("should accept false value", () => {
      // Act
      name.short = false;

      // Assert
      expect(name.short).toBe(false);
    });
  });

  describe("component inheritance", () => {
    it("should be an instance of Component", () => {
      // Assert
      expect(name).toBeInstanceOf(Name);
    });

    it("should have proper class name", () => {
      // Assert
      expect(name.constructor.name).toBe("Name");
    });
  });
});
