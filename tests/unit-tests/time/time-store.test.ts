import { TimeStore } from "../../../assets/scripts/time/time-store";
import { Phase } from "../../../assets/scripts/streaming/streaming-type";
import { gameSettings } from "db://assets/scripts/game-settings";

describe("TimeStore", () => {
  let store: TimeStore;
  const countUpInterval = Math.floor(
    (gameSettings.videoDuration / gameSettings.halfDuration) * 1000
  );

  beforeEach(() => {
    jest.useFakeTimers();
    store = new TimeStore();
  });

  afterEach(() => {
    if (store) {
      store.stop();
    }
    jest.useRealTimers();
  });

  it("should initialize paused with zero time and first half", () => {
    expect(store.matchLiveTime).toBe(0);
    expect(store.halfIndex).toBe(0);
    expect(store.paused).toBe(true);
  });

  it("should start counting on UpdateVideoInfo and pause at half boundary", () => {
    // Arrange: server time indicates 40s in first half
    store.update({
      matchLiveTime: 40 * countUpInterval,
      halfIndex: 0,
      currentPhase: Phase.UpdateVideoInfo,
    });

    // Act: advance 2 seconds
    jest.advanceTimersByTime(countUpInterval * 6);

    // Assert: should cap at halfDuration (30s) and paused
    expect(store.matchLiveTime).toBe(45);
    expect(store.paused).toBe(true);
  });

  it("should start counting on UpdateVideoInfo and pause at full time", () => {
    // Arrange: server time indicates 29s in first half
    store.update({
      matchLiveTime: 85 * countUpInterval,
      halfIndex: 1,
      currentPhase: Phase.UpdateVideoInfo,
    });

    // Act: advance 2 seconds
    jest.advanceTimersByTime(countUpInterval * 10);

    // Assert: should cap at halfDuration (60s) and paused
    expect(store.matchLiveTime).toBe(90);
    expect(store.paused).toBe(true);
  });

  it("should reset on ScheduleEvent and stop interval", () => {
    // Arrange
    store.update({
      matchLiveTime: 10 * countUpInterval,
      halfIndex: 0,
      currentPhase: Phase.UpdateVideoInfo,
    });
    // Act
    store.update({
      matchLiveTime: 0,
      halfIndex: 0,
      currentPhase: Phase.ScheduleEvent,
    });
    // Assert
    expect(store.matchLiveTime).toBe(0);
    expect(store.paused).toBe(true);
  });

  it("should sync forward when server time jumps by more than 1s", () => {
    // Arrange baseline 5s
    store.update({
      matchLiveTime: 5 * countUpInterval,
      halfIndex: 0,
      currentPhase: Phase.UpdateVideoInfo,
    });
    // Act server jump to 8s (diff 3s)
    store.update({
      matchLiveTime: 8 * countUpInterval,
      halfIndex: 0,
      currentPhase: Phase.UpdateVideoInfo,
    });
    // Assert
    expect(store.matchLiveTime).toBe(8);
  });

  it("should sync correct time with matchLiveTime", () => {
    // Act
    store.update({
      matchLiveTime: 5 * countUpInterval,
      halfIndex: 0,
      currentPhase: Phase.UpdateVideoInfo,
    });

    // Assert
    expect(store.matchLiveTime).toBe(5);
  });
});
