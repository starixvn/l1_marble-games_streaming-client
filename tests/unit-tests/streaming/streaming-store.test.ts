import { StreamingStore } from "../../../assets/scripts/streaming/streaming-store";
import {
  Phase,
  type EventStreamPayload,
} from "../../../assets/scripts/streaming/streaming-type";

describe("StreamingStore", () => {
  function createPayload(
    partial: Partial<EventStreamPayload> = {}
  ): EventStreamPayload {
    return {
      gameId: "g1",
      eventId: 100,
      homeTeam: "home_team",
      awayTeam: "away_team",
      currentIndex: 0,
      updatedIndex: 0,
      eventDetails: [
        {
          playlist: "https://example.com/stream.m3u8",
          videoLiveTimeMs: 10_000,
          videoLength: 30_000,
          result: "H",
        },
      ],
      liveScores: ["0:0"],
      goalInfos: [],
      matchLiveTimeMs: 12_345,
      currentPhase: Phase.UpdateVideoInfo,
      message: "",
      ...partial,
    } as EventStreamPayload;
  }

  let store: StreamingStore;

  beforeEach(() => {
    store = new StreamingStore();
  });

  afterEach(() => {
    store.reset();
  });

  it("should initialize with default state", () => {
    // Assert
    expect(store.isConnected).toBe(false);
    expect(store.error).toBe(null);
    expect(store.eventData).toBe(null);
    expect(store.currentGame).toBe("default");
    expect(store.result).toBe(null);
  });

  it("should toggle connection and clear error when connecting", () => {
    // Arrange
    store.setError("err");

    // Act
    store.setConnected(true);

    // Assert
    expect(store.isConnected).toBe(true);
    expect(store.error).toBe(null);

    // Act
    store.setConnected(false);

    // Assert
    expect(store.isConnected).toBe(false);
  });

  it("should set and clear error", () => {
    // Act
    store.setError("boom");

    // Assert
    expect(store.error).toBe("boom");

    // Act
    store.setError(null);

    // Assert
    expect(store.error).toBe(null);
  });

  it("should update current game", () => {
    // Act
    store.setCurrentGame("2001");

    // Assert
    expect(store.currentGame).toBe("2001");
  });

  it("should restore defaults on reset", () => {
    // Arrange
    store.setConnected(true);
    store.setError("x");
    store.setCurrentGame("2001");
    store.updateStateWithPayload(createPayload({ liveScores: ["1:0"] }));

    // Act
    store.reset();

    // Assert
    expect(store.isConnected).toBe(false);
    expect(store.error).toBe(null);
    expect(store.eventData).toBe(null);
    expect(store.currentGame).toBe("default");
  });

  it("should map payload fields and aggregate scores", () => {
    // Arrange
    const payload = createPayload({
      gameId: "g2",
      eventId: 101,
      homeTeam: "H1",
      awayTeam: "A1",
      currentIndex: 1,
      updatedIndex: 1,
      liveScores: ["1:0", "0:2"],
      matchLiveTimeMs: 22_000,
      currentPhase: Phase.UpdateGoalInfo,
    });

    // Act
    store.updateStateWithPayload(payload);

    // Assert
    const data = store.eventData!;
    expect(data.eventId).toBe(101);
    expect(data.homeTeam).toBe("H1");
    expect(data.awayTeam).toBe("A1");
    expect(data.currentEventIndex).toBe(1);
    expect(data.updatedEventIndex).toBe(1);
    expect(data.liveScores).toEqual(["1:0", "0:2"]);
    expect(data.matchLiveTimeMs).toBe(22_000);
    expect(data.currentPhase).toBe(Phase.UpdateGoalInfo);
    expect(data.homeScore).toBe(1);
    expect(data.awayScore).toBe(2);
  });

  it("should compute 0-0 when liveScores is empty", () => {
    // Act
    store.updateStateWithPayload(createPayload({ liveScores: [] }));

    // Assert
    const data = store.eventData!;
    expect(data.homeScore).toBe(0);
    expect(data.awayScore).toBe(0);
  });

  it("should compute result selector (H/A/D) and null without data", () => {
    // Assert
    expect(store.result).toBe(null);

    // Act
    store.updateStateWithPayload(createPayload({ liveScores: ["2:1"] }));
    // Assert
    expect(store.result).toBe("H");

    // Act
    store.updateStateWithPayload(createPayload({ liveScores: ["0:3"] }));
    // Assert
    expect(store.result).toBe("A");

    // Act
    store.updateStateWithPayload(createPayload({ liveScores: ["2:2"] }));
    // Assert
    expect(store.result).toBe("D");
  });

  it("should reflect connectionStatus from state", () => {
    // Assert
    expect(store.connectionStatus).toEqual({ isConnected: false, error: null });

    // Act
    store.setError("e");
    // Assert
    expect(store.connectionStatus).toEqual({ isConnected: false, error: "e" });

    // Act
    store.setConnected(true);
    // Assert
    expect(store.connectionStatus).toEqual({ isConnected: true, error: null });
  });
});
