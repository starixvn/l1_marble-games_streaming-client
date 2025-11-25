import { sp } from "cc";
import { AnimationUtils } from "../../../../assets/scripts/common/utils/animation-utils";
import { ScoreSpine } from "../../../../assets/scripts/components/scores/score-spine";
import { LiveScoreData } from "../../../../assets/scripts/features/live-score/live-score-store";

jest.mock("../../../../assets/scripts/common/utils/animation-utils", () => {
  const actual = jest.requireActual(
    "../../../../assets/scripts/common/utils/animation-utils"
  );
  return {
    ...actual,
    AnimationUtils: {
      ...actual.AnimationUtils,
      delayTime: jest.fn(() => Promise.resolve()),
    },
  };
});

describe("ScoreSpine", () => {
  let comp: ScoreSpine;
  let homeSpine: sp.Skeleton;
  let awaySpine: sp.Skeleton;

  beforeEach(() => {
    // Arrange
    comp = new ScoreSpine();
    homeSpine = new sp.Skeleton();
    awaySpine = new sp.Skeleton();
    homeSpine.setAnimation = jest.fn();
    awaySpine.setAnimation = jest.fn();
    (comp as any).homeSpine = homeSpine;
    (comp as any).awaySpine = awaySpine;
    (comp as any).home = 0;
    (comp as any).away = 0;
    (comp as any).delayUpdateScore = 0;
    jest.clearAllMocks();
  });

  describe("syncScore", () => {
    it("should update home and away scores from data", async () => {
      // Arrange
      const data: LiveScoreData = {
        homeScore: 3,
        awayScore: 2,
      };

      // Act
      await comp.syncScore(data);

      // Assert
      expect((comp as any).home).toBe(3);
      expect((comp as any).away).toBe(2);
      expect(homeSpine.setAnimation).toHaveBeenCalledWith(0, "score 3", false);
      expect(awaySpine.setAnimation).toHaveBeenCalledWith(0, "score 2", false);
    });

    it("should handle null data with default values", async () => {
      // Arrange
      const data: LiveScoreData = null;

      // Act
      await comp.syncScore(data);

      // Assert
      expect((comp as any).home).toBe(0);
      expect((comp as any).away).toBe(0);
      // When score is already 0 and new score is also 0, setAnimation should not be called
      expect(homeSpine.setAnimation).not.toHaveBeenCalled();
      expect(awaySpine.setAnimation).not.toHaveBeenCalled();
    });

    it("should handle undefined data with default values", async () => {
      // Arrange
      const data: LiveScoreData = undefined;

      // Act
      await comp.syncScore(data);

      // Assert
      expect((comp as any).home).toBe(0);
      expect((comp as any).away).toBe(0);
      // When score is already 0 and new score is also 0, setAnimation should not be called
      expect(homeSpine.setAnimation).not.toHaveBeenCalled();
      expect(awaySpine.setAnimation).not.toHaveBeenCalled();
    });

    it("should delay update when delayUpdateScore is greater than 0", async () => {
      // Arrange
      (comp as any).delayUpdateScore = 100;
      const data: LiveScoreData = {
        homeScore: 1,
        awayScore: 0,
      };

      // Act
      await comp.syncScore(data);

      // Assert
      expect(AnimationUtils.delayTime).toHaveBeenCalledWith(100);
    });

    it("should not delay update when delayUpdateScore is 0", async () => {
      // Arrange
      (comp as any).delayUpdateScore = 0;
      const data: LiveScoreData = {
        homeScore: 1,
        awayScore: 0,
      };

      // Act
      await comp.syncScore(data);

      // Assert
      expect(AnimationUtils.delayTime).not.toHaveBeenCalled();
    });

    it("should not update spine when score has not changed", async () => {
      // Arrange
      (comp as any).home = 2;
      (comp as any).away = 1;
      homeSpine.setAnimation.mockClear();
      awaySpine.setAnimation.mockClear();
      const data: LiveScoreData = {
        homeScore: 2,
        awayScore: 1,
      };

      // Act
      await comp.syncScore(data);

      // Assert
      expect(homeSpine.setAnimation).not.toHaveBeenCalled();
      expect(awaySpine.setAnimation).not.toHaveBeenCalled();
    });

    it("should update only home score when away score is unchanged", async () => {
      // Arrange
      (comp as any).home = 1;
      (comp as any).away = 2;
      awaySpine.setAnimation.mockClear();
      const data: LiveScoreData = {
        homeScore: 3,
        awayScore: 2,
      };

      // Act
      await comp.syncScore(data);

      // Assert
      expect(homeSpine.setAnimation).toHaveBeenCalledWith(0, "score 3", false);
      expect(awaySpine.setAnimation).not.toHaveBeenCalled();
    });

    it("should update only away score when home score is unchanged", async () => {
      // Arrange
      (comp as any).home = 2;
      (comp as any).away = 1;
      homeSpine.setAnimation.mockClear();
      const data: LiveScoreData = {
        homeScore: 2,
        awayScore: 3,
      };

      // Act
      await comp.syncScore(data);

      // Assert
      expect(homeSpine.setAnimation).not.toHaveBeenCalled();
      expect(awaySpine.setAnimation).toHaveBeenCalledWith(0, "score 3", false);
    });
  });

  describe("setHome", () => {
    it("should set animation on homeSpine with correct animation name", () => {
      // Arrange
      const home = 5;

      // Act
      comp.setHome(home);

      // Assert
      expect(homeSpine.setAnimation).toHaveBeenCalledWith(0, "score 5", false);
    });

    it("should handle zero score", () => {
      // Arrange
      const home = 0;

      // Act
      comp.setHome(home);

      // Assert
      expect(homeSpine.setAnimation).toHaveBeenCalledWith(0, "score 0", false);
    });

    it("should handle double digit scores", () => {
      // Arrange
      const home = 10;

      // Act
      comp.setHome(home);

      // Assert
      expect(homeSpine.setAnimation).toHaveBeenCalledWith(0, "score 10", false);
    });
  });

  describe("setAway", () => {
    it("should set animation on awaySpine with correct animation name", () => {
      // Arrange
      const away = 4;

      // Act
      comp.setAway(away);

      // Assert
      expect(awaySpine.setAnimation).toHaveBeenCalledWith(0, "score 4", false);
    });

    it("should handle zero score", () => {
      // Arrange
      const away = 0;

      // Act
      comp.setAway(away);

      // Assert
      expect(awaySpine.setAnimation).toHaveBeenCalledWith(0, "score 0", false);
    });

    it("should handle double digit scores", () => {
      // Arrange
      const away = 15;

      // Act
      comp.setAway(away);

      // Assert
      expect(awaySpine.setAnimation).toHaveBeenCalledWith(0, "score 15", false);
    });
  });
});
