import { StreamingStore } from "db://assets/scripts/streaming/streaming-store";
import { StreamingHandler } from "../../../assets/scripts/streaming/streaming-handler";
import {
  Phase,
  type EventStreamPayload,
} from "../../../assets/scripts/streaming/streaming-type";
import { Store } from "db://assets/scripts/store";

class MockEventSource {
  public onopen: (() => void) | null = null;
  public onmessage: ((ev: { data: string }) => void) | null = null;
  public onerror: ((ev?: any) => void) | null = null;
  public readyState = 2; // CLOSED by default
  constructor(public url: string) {}
  close = jest.fn(() => {
    this.readyState = 2;
  });
}

describe("StreamingHandler", () => {
  let handler: StreamingHandler;
  let streamingStore: StreamingStore;
  let store: Store;

  const originalEventSource = (global as any).EventSource;

  const createPayload = (
    partial: Partial<EventStreamPayload> = {}
  ): EventStreamPayload => ({
    gameId: "g",
    eventId: 1,
    homeTeam: "H",
    awayTeam: "A",
    currentIndex: 0,
    updatedIndex: 0,
    eventDetails: [
      { playlist: "p", videoLiveTimeMs: 0, videoLength: 1, result: "" },
    ],
    liveScores: ["0:0"],
    goalInfos: [],
    matchLiveTimeMs: 0,
    currentPhase: Phase.UpdateVideoInfo,
    message: "",
    ...partial,
  });

  beforeEach(() => {
    handler = new StreamingHandler();
    streamingStore = {
      setCurrentGame: jest.fn(),
      setConnected: jest.fn(),
      setError: jest.fn(),
      updateStateWithPayload: jest.fn(),
      reset: jest.fn(),
    } as any;
    store = new Store();
    (handler as any).streamingStore = streamingStore;
    (handler as any).store = store;
    (global as any).EventSource = MockEventSource;
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.clearAllMocks();
    (global as any).EventSource = originalEventSource;
    jest.useRealTimers();
  });

  it("should connect and set current game", () => {
    // Arrange
    store.game = "default";

    // Act
    handler.connect();

    // Assert
    expect(streamingStore.setCurrentGame).toHaveBeenCalledWith("default");
  });

  it("should handle onopen", () => {
    //Act
    handler.connect();
    (handler as any).eventSource.onopen?.();

    // Assert
    expect(streamingStore.setConnected).toHaveBeenCalledWith(true);
    expect(streamingStore.setError).toHaveBeenCalledWith(null);
  });

  it("should handle onmessage", () => {
    // Arrange
    const payload = createPayload({ eventId: 42 });

    // Act
    handler.connect();
    (handler as any).eventSource.onmessage?.({
      data: JSON.stringify(payload),
    });

    // Assert
    expect(streamingStore.updateStateWithPayload).toHaveBeenCalledWith(payload);
  });

  it("should handle onerror", () => {
    // Arrange
    jest.spyOn(handler as any, "attemptReconnect");

    // Act
    handler.connect();
    (handler as any).eventSource.onerror?.({});

    // Assert
    expect(streamingStore.setConnected).toHaveBeenCalledWith(false);
    expect(streamingStore.setError).toHaveBeenCalledWith("Connection lost");
    expect(handler["attemptReconnect"]).toHaveBeenCalled();
  });

  it("should disconnect and reset store", () => {
    // Arrange
    handler.connect();

    // Act
    const es: MockEventSource = (handler as any).eventSource as MockEventSource;
    handler.disconnect();

    // Assert
    expect(es.close).toHaveBeenCalled();
    expect(streamingStore.reset).toHaveBeenCalled();
  });
});
