import { Node } from "cc";
import { AnimationUtils } from "../../../../assets/scripts/common/utils";
import {
  FullTimeDisplayStatus,
  FulltimeManager,
} from "../../../../assets/scripts/components/fulltime/fulltime-manager";

jest.mock("../../../../assets/scripts/common/utils", () => {
  const actual = jest.requireActual("../../../../assets/scripts/common/utils");
  return {
    ...actual,
    AnimationUtils: {
      ...actual.AnimationUtils,
      fadeInAndActivate: jest.fn((node: any) => {
        node.active = true;
        return Promise.resolve();
      }),
      fadeOutAndDeactivate: jest.fn((node: any) => {
        node.active = false;
        return Promise.resolve();
      }),
    },
  };
});

describe("FulltimeManager", () => {
  let comp: FulltimeManager;

  beforeEach(() => {
    // Arrange
    comp = new FulltimeManager();
    (comp as any).unschedule = jest.fn();
    (comp as any).scheduleOnce = jest.fn();
    comp.result = new Node();
    comp.winner = new Node();
    comp.draw = new Node();
    (comp as any).durationMinutes = 0;
  });

  describe("syncCurrentPhase", () => {
    it("updates currentPhase from data", () => {
      // Arrange
      const data: any = { phase: 2 };

      // Act
      comp.syncCurrentPhase(data);

      // Assert
      expect(comp["currentPhase"]).toBe(2);
    });
  });

  describe("syncResult", () => {
    it("sets isDraw true when total scores equal across all phases", () => {
      // Arrange
      const data: any = {
        result: {
          0: { homeScore: 1, awayScore: 1 },
          1: { homeScore: 2, awayScore: 2 },
        },
      };

      // Act
      comp.syncResult(data);

      // Assert
      expect(comp.isDraw).toBe(true);
    });

    it("sets isDraw false when total scores differ across all phases", () => {
      // Arrange
      const data: any = {
        result: {
          0: { homeScore: 3, awayScore: 1 },
          1: { homeScore: 1, awayScore: 1 },
        },
      };

      // Act
      comp.syncResult(data);

      // Assert
      expect(comp.isDraw).toBe(false);
    });

    it("sets isDraw true when all phases have equal scores", () => {
      // Arrange
      const data: any = {
        result: {
          0: { homeScore: 0, awayScore: 0 },
          1: { homeScore: 2, awayScore: 2 },
        },
      };

      // Act
      comp.syncResult(data);

      // Assert
      expect(comp.isDraw).toBe(true);
    });
  });

  describe("transitionToWinnerOrDraw", () => {
    it("sets status to Draw when isDraw is true and updates UI", () => {
      // Arrange
      (comp as any).isDraw = true;
      const updateUISpy = jest.spyOn(comp as any, "updateUI");

      // Act
      comp["transitionToWinnerOrDraw"]();

      // Assert
      expect((comp as any).status).toBe(FullTimeDisplayStatus.Draw);
      expect(updateUISpy).toHaveBeenCalled();
    });

    it("sets status to Winner when isDraw is false and updates UI", () => {
      // Arrange
      (comp as any).isDraw = false;
      const updateUISpy = jest.spyOn(comp as any, "updateUI");

      // Act
      comp["transitionToWinnerOrDraw"]();

      // Assert
      expect((comp as any).status).toBe(FullTimeDisplayStatus.Winner);
      expect(updateUISpy).toHaveBeenCalled();
    });
  });

  describe("onDisable", () => {
    it("calls cleanup", () => {
      // Arrange
      const spy = jest.spyOn(comp as any, "cleanup");

      // Act
      (comp as any).onDisable();

      // Assert
      expect(spy).toHaveBeenCalled();
    });
  });

  describe("onDestroy", () => {
    it("calls cleanup", () => {
      // Arrange
      const spy = jest.spyOn(comp as any, "cleanup");

      // Act
      (comp as any).onDestroy();

      // Assert
      expect(spy).toHaveBeenCalled();
    });
  });

  describe("updateUI", () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    it("calls fadeInAndActivate for fulltime node and fadeOutAndDeactivate for others when status is Result", () => {
      // Arrange
      (comp as any).status = FullTimeDisplayStatus.Result;

      // Act
      comp["updateUI"]();

      // Assert
      expect(AnimationUtils.fadeInAndActivate).toHaveBeenCalledWith(
        comp.result,
        comp["durationAppear"]
      );
      expect(AnimationUtils.fadeOutAndDeactivate).toHaveBeenCalledWith(
        comp.winner,
        0
      );
      expect(AnimationUtils.fadeOutAndDeactivate).toHaveBeenCalledWith(
        comp.draw,
        0
      );
      expect(comp.result.active).toBe(true);
      expect(comp.winner.active).toBe(false);
      expect(comp.draw.active).toBe(false);
    });

    it("calls fadeInAndActivate for winner node and fadeOutAndDeactivate for others when status is Winner", () => {
      // Arrange
      (comp as any).status = FullTimeDisplayStatus.Winner;

      // Act
      comp["updateUI"]();

      // Assert
      expect(AnimationUtils.fadeOutAndDeactivate).toHaveBeenCalledWith(
        comp.result,
        0
      );
      expect(AnimationUtils.fadeInAndActivate).toHaveBeenCalledWith(
        comp.winner,
        comp["durationAppear"]
      );
      expect(AnimationUtils.fadeOutAndDeactivate).toHaveBeenCalledWith(
        comp.draw,
        0
      );
      expect(comp.result.active).toBe(false);
      expect(comp.winner.active).toBe(true);
      expect(comp.draw.active).toBe(false);
    });

    it("calls fadeInAndActivate for draw node and fadeOutAndDeactivate for others when status is Draw", () => {
      // Arrange
      (comp as any).status = FullTimeDisplayStatus.Draw;

      // Act
      comp["updateUI"]();

      // Assert
      expect(AnimationUtils.fadeOutAndDeactivate).toHaveBeenCalledWith(
        comp.result,
        0
      );
      expect(AnimationUtils.fadeOutAndDeactivate).toHaveBeenCalledWith(
        comp.winner,
        0
      );
      expect(AnimationUtils.fadeInAndActivate).toHaveBeenCalledWith(
        comp.draw,
        comp["durationAppear"]
      );
      expect(comp.result.active).toBe(false);
      expect(comp.winner.active).toBe(false);
      expect(comp.draw.active).toBe(true);
    });
  });

  describe("cleanup", () => {
    it("unschedules transitionToWinnerOrDraw", () => {
      // Arrange
      // Act
      (comp as any).cleanup();

      // Assert
      expect((comp as any).unschedule).toHaveBeenCalled();
    });
  });
});
