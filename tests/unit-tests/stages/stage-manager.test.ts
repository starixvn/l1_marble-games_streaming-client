import { StageManager } from "../../../assets/scripts/stages/stage-manager";
import { Stage } from "../../../assets/scripts/stages/stage";
import { Phase } from "../../../assets/scripts/streaming/streaming-type";

// Mock gameSettings
jest.mock("../../../assets/scripts/game-settings", () => ({
  gameSettings: {
    videoDuration: 30, // 30 seconds
  },
}));

jest.mock("db://assets/scripts/streaming/streaming-store", () => ({
  StreamingStore: jest.fn().mockImplementation(() => {
    return {
      eventData: {
        currentPhase: "prebetting",
      },
    };
  }),
}));

describe("StageManager", () => {
  let stageManager: StageManager;
  let mockTargets: Stage[];

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();

    // Create mock stage targets
    mockTargets = [
      {
        node: { name: "prebetting", active: false },
      } as Stage,
      {
        node: { name: "streaming", active: false },
      } as Stage,
      {
        node: { name: "halftime", active: false },
      } as Stage,
      {
        node: { name: "fulltime", active: false },
      } as Stage,
      {
        node: { name: "result", active: false },
      } as Stage,
      {
        node: { name: "draw", active: false },
      } as Stage,
    ] as Stage[];

    // Create StageManager instance
    stageManager = new StageManager();
    (stageManager as any).targets = mockTargets;

    // Mock scheduleOnce and unschedule methods
    (stageManager as any).scheduleOnce = jest.fn();
    (stageManager as any).unschedule = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("initialization", () => {
    it("should initialize with default state", () => {
      // Assert
      expect(stageManager["targets"]).toBe(mockTargets);
      expect((stageManager as any).scheduledCallback).toBeNull();
    });
  });

  describe("current property", () => {
    it("should return the name of the active target", () => {
      // Arrange
      mockTargets[1].node.active = true;

      // Act & Assert
      expect(stageManager.current).toBe("streaming");
    });

    it("should return undefined when no target is active", () => {
      // Act & Assert
      expect(stageManager.current).toBeUndefined();
    });

    it("should set all targets to active based on name", () => {
      // Act
      stageManager.current = "halftime";

      // Assert
      expect(mockTargets[0].node.active).toBe(false);
      expect(mockTargets[1].node.active).toBe(false);
      expect(mockTargets[2].node.active).toBe(true);
      expect(mockTargets[3].node.active).toBe(false);
    });
  });

  describe("index property", () => {
    it("should return the index of the active target", () => {
      // Arrange
      mockTargets[2].node.active = true;

      // Act & Assert
      expect(stageManager.index).toBe(2);
    });

    it("should return -1 when no target is active", () => {
      // Act & Assert
      expect(stageManager.index).toBe(-1);
    });

    it("should set targets active based on index", () => {
      // Act
      stageManager.index = 1;

      // Assert
      expect(mockTargets[0].node.active).toBe(false);
      expect(mockTargets[1].node.active).toBe(true);
      expect(mockTargets[2].node.active).toBe(false);
    });

    it("should handle negative index by setting to 0", () => {
      // Act
      stageManager.index = -1;

      // Assert
      expect(mockTargets[0].node.active).toBe(true);
      expect(mockTargets[1].node.active).toBe(false);
    });

    it("should handle index wrapping", () => {
      // Act
      stageManager.index = 7; // Should wrap to 1 (7 % 6 = 1)

      // Assert
      expect(mockTargets[1].node.active).toBe(true);
      expect(mockTargets[0].node.active).toBe(false);
    });
  });

  describe("stages property", () => {
    it("should return array of stage names", () => {
      // Act & Assert
      expect(stageManager.stages).toEqual([
        "prebetting",
        "streaming",
        "halftime",
        "fulltime",
        "result",
        "draw",
      ]);
    });
  });

  describe("updateStage method", () => {
    it("should map ScheduleEvent to prebetting", () => {
      // Act
      stageManager["updateStage"]({
        phase: Phase.ScheduleEvent,
        eventIndex: 0,
        result: null,
        matchLiveTime: 0,
      });

      // Assert
      expect(stageManager.current).toBe("prebetting");
    });


    it("should map UpdateVideoInfo to streaming", () => {
      // Act
      stageManager["updateStage"]({
        phase: Phase.UpdateVideoInfo,
        eventIndex: 0,
        result: null,
        matchLiveTime: 0,
      });

      // Assert
      expect(stageManager.current).toBe("streaming");
    });

    it("should map UpdatePreloadVideoInfo to current stage", () => {
      // Arrange
      stageManager.current = "halftime";

      // Act
      stageManager["updateStage"]({
        phase: Phase.UpdatePreloadVideoInfo,
        eventIndex: 1,
        result: null,
        matchLiveTime: 0,
      });

      // Assert
      expect(stageManager.current).toBe("halftime");
    });

    it("should map UpdatePreloadVideoInfo to current stage when current is undefined", () => {
      // Arrange - no stage is active initially
      expect(stageManager.current).toBeUndefined();

      // Act
      stageManager["updateStage"]({
        phase: Phase.UpdatePreloadVideoInfo,
        eventIndex: 1,
        result: null,
        matchLiveTime: 0,
      });

      // Assert
      expect(stageManager.current).toBeUndefined();
    });

    it("should map UpdateResult to halftime for first event", () => {
      // Act
      stageManager["updateStage"]({
        phase: Phase.UpdateResult,
        eventIndex: 0,
        result: "H",
        matchLiveTime: 0,
      });

      // Assert
      expect(stageManager.current).toBe("halftime");
    });

    it("should map UpdateResult to halftime when match time is within video duration", () => {
      // Act
      stageManager["updateStage"]({
        phase: Phase.UpdateResult,
        eventIndex: 1,
        result: "H",
        matchLiveTime: 25000, // 25 seconds
      });

      // Assert
      expect(stageManager.current).toBe("halftime");
    });

    it("should map UpdateResult to fulltime when match time exceeds video duration", () => {
      // Act
      stageManager["updateStage"]({
        phase: Phase.UpdateResult,
        eventIndex: 1,
        result: "H",
        matchLiveTime: 35000, // 35 seconds
      });

      // Assert
      expect(stageManager.current).toBe("fulltime");
    });

    it("should return early for unknown phase", () => {
      // Act
      stageManager["updateStage"]({
        phase: "UnknownPhase" as any,
        eventIndex: 0,
        result: null,
        matchLiveTime: 0,
      });

      // Assert
      expect(stageManager.current).toBeUndefined();
    });
  });

  describe("scheduleOnce behavior", () => {
    it("should schedule callback for fulltime stage", () => {
      // Act
      stageManager["updateStage"]({
        phase: Phase.UpdateResult,
        eventIndex: 1,
        result: "H",
        matchLiveTime: 35000,
      });

      // Assert
      expect(stageManager["scheduleOnce"]).toHaveBeenCalledWith(
        expect.any(Function),
        5
      );
      expect((stageManager as any).scheduledCallback).toBeDefined();
    });

    it("should not schedule callback for non-fulltime stages", () => {
      // Act
      stageManager["updateStage"]({
        phase: Phase.UpdateVideoInfo,
        eventIndex: 0,
        result: null,
        matchLiveTime: 0,
      });

      // Assert
      expect(stageManager["scheduleOnce"]).not.toHaveBeenCalled();
      expect((stageManager as any).scheduledCallback).toBeNull();
    });

    it("should cancel previous callback when stage changes", () => {
      // Arrange - Set up initial fulltime stage
      stageManager["updateStage"]({
        phase: Phase.UpdateResult,
        eventIndex: 1,
        result: "H",
        matchLiveTime: 35000,
      });

      const firstCallback = (stageManager as any).scheduledCallback;

      // Act - Change to different stage
      stageManager["updateStage"]({
        phase: Phase.UpdateVideoInfo,
        eventIndex: 0,
        result: null,
        matchLiveTime: 0,
      });

      // Assert
      expect(stageManager["unschedule"]).toHaveBeenCalledWith(firstCallback);
      expect((stageManager as any).scheduledCallback).toBeNull();
    });

    it("should cancel previous callback when switching to another fulltime stage", () => {
      // Arrange - Set up initial fulltime stage
      stageManager["updateStage"]({
        phase: Phase.UpdateResult,
        eventIndex: 1,
        result: "H",
        matchLiveTime: 35000,
      });

      const firstCallback = (stageManager as any).scheduledCallback;

      // Act - Switch to another fulltime stage
      stageManager["updateStage"]({
        phase: Phase.UpdateResult,
        eventIndex: 1,
        result: "A",
        matchLiveTime: 40000,
      });

      // Assert
      expect(stageManager["unschedule"]).toHaveBeenCalledWith(firstCallback);
      expect((stageManager as any).scheduledCallback).toBeDefined();
      expect((stageManager as any).scheduledCallback).not.toBe(firstCallback);
    });
  });

  describe("scheduled callback execution", () => {
    it("should set stage to draw when result is D", () => {
      // Arrange
      stageManager["updateStage"]({
        phase: Phase.UpdateResult,
        eventIndex: 1,
        result: "D",
        matchLiveTime: 35000,
      });

      const callback = stageManager["scheduleOnce"].mock.calls[0][0];

      // Act
      callback();

      // Assert
      expect(stageManager.current).toBe("draw");
      expect((stageManager as any).scheduledCallback).toBeNull();
    });

    it("should set stage to result when result is H", () => {
      // Arrange
      stageManager["updateStage"]({
        phase: Phase.UpdateResult,
        eventIndex: 1,
        result: "H",
        matchLiveTime: 35000,
      });

      const callback = stageManager["scheduleOnce"].mock.calls[0][0];

      // Act
      callback();

      // Assert
      expect(stageManager.current).toBe("result");
      expect((stageManager as any).scheduledCallback).toBeNull();
    });

    it("should set stage to result when result is A", () => {
      // Arrange
      stageManager["updateStage"]({
        phase: Phase.UpdateResult,
        eventIndex: 1,
        result: "A",
        matchLiveTime: 35000,
      });

      const callback = stageManager["scheduleOnce"].mock.calls[0][0];

      // Act
      callback();

      // Assert
      expect(stageManager.current).toBe("result");
      expect((stageManager as any).scheduledCallback).toBeNull();
    });
  });

  describe("cancelScheduledCallback method", () => {
    it("should cancel existing callback", () => {
      // Arrange
      const mockCallback = jest.fn();
      (stageManager as any).scheduledCallback = mockCallback;

      // Act
      stageManager["cancelScheduledCallback"]();

      // Assert
      expect(stageManager["unschedule"]).toHaveBeenCalledWith(mockCallback);
      expect((stageManager as any).scheduledCallback).toBeNull();
    });

    it("should handle null callback gracefully", () => {
      // Arrange
      (stageManager as any).scheduledCallback = null;

      // Act
      stageManager["cancelScheduledCallback"]();

      // Assert
      expect(stageManager["unschedule"]).not.toHaveBeenCalled();
    });
  });

  describe("onDestroy method", () => {
    it("should cancel scheduled callback on destroy", () => {
      // Arrange
      const mockCallback = jest.fn();
      (stageManager as any).scheduledCallback = mockCallback;

      // Act
      stageManager["onDestroy"]();

      // Assert
      expect(stageManager["unschedule"]).toHaveBeenCalledWith(mockCallback);
    });
  });
});
