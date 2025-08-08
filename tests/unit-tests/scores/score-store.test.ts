import { ScoreStore } from "../../../assets/scripts/scores/score-store";

describe("ScoreStore", () => {
  let store: ScoreStore;

  beforeEach(() => {
    store = new ScoreStore();
  });

  afterEach(() => {
    // keep consistent cleanup intent
  });

  it("should initialize with zeros", () => {
    expect(store.home).toBe(0);
    expect(store.away).toBe(0);
    expect(store.previousHome).toBe(0);
    expect(store.previousAway).toBe(0);
    expect(store.scoreInText).toBe("0 - 0");
    expect(store.previousScoreInText).toBe("0 - 0");
  });

  it("should update current score", () => {
    // Act
    store.update({ home: 2, away: 1 });
    // Assert
    expect(store.home).toBe(2);
    expect(store.away).toBe(1);
    expect(store.scoreInText).toBe("2 - 1");
  });

  it("should update previous score", () => {
    // Act
    store.updatePrevious({ home: 1, away: 1 });
    // Assert
    expect(store.previousHome).toBe(1);
    expect(store.previousAway).toBe(1);
    expect(store.previousScoreInText).toBe("1 - 1");
  });
});
