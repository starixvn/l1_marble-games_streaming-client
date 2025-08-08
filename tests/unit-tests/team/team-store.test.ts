import { TeamStore } from "../../../assets/scripts/team/team-store";

describe("TeamStore", () => {
  let store: TeamStore;

  beforeEach(() => {
    store = new TeamStore();
  });

  afterEach(() => {
    // keep consistent cleanup intent
  });

  it("should initialize with empty names", () => {
    expect(store.home).toBe("");
    expect(store.away).toBe("");
  });

  it("should update team names", () => {
    // Act
    store.update({ home: "team_home", away: "team_away" });
    // Assert
    expect(store.home).toBe("team_home");
    expect(store.away).toBe("team_away");
  });
});
