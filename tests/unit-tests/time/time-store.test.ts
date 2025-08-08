import { TimeStore } from "../../../assets/scripts/time/time-store";
import { Phase } from "../../../assets/scripts/streaming/streaming-type";

describe("TimeStore", () => {
  let store: TimeStore;

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
    // Arrange: server time indicates 29s in first half
    store.update({
      matchLiveTime: 29_000,
      halfIndex: 0,
      currentPhase: Phase.UpdateVideoInfo,
    });

    // Act: advance 2 seconds
    jest.advanceTimersByTime(2_000);

    // Assert: should cap at halfDuration (30s) and paused
    expect(store.matchLiveTime).toBe(30);
    expect(store.paused).toBe(true);
  });

  it("should start counting on UpdateVideoInfo and pause at full time", () => {
    // Arrange: server time indicates 29s in first half
    store.update({
      matchLiveTime: 59_000,
      halfIndex: 1,
      currentPhase: Phase.UpdateVideoInfo,
    });

    // Act: advance 2 seconds
    jest.advanceTimersByTime(2_000);

    // Assert: should cap at halfDuration (60s) and paused
    expect(store.matchLiveTime).toBe(60);
    expect(store.paused).toBe(true);
  });

  it("should reset on ScheduleEvent and stop interval", () => {
    // Arrange
    store.update({
      matchLiveTime: 10_000,
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
      matchLiveTime: 5_000,
      halfIndex: 0,
      currentPhase: Phase.UpdateVideoInfo,
    });
    // Act server jump to 8s (diff 3s)
    store.update({
      matchLiveTime: 8_000,
      halfIndex: 0,
      currentPhase: Phase.UpdateVideoInfo,
    });
    // Assert
    expect(store.matchLiveTime).toBe(8);
  });
});
