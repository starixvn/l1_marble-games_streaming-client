import { injectable, inject } from "inversify";
import { StreamingStore } from "./streaming-store";
import { EventStreamPayload, Phase } from "./streaming-type";

@injectable()
export class StreamingHandler {
  private eventSource: EventSource | null = null;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000; // 1 second
  private reconnectTimeout: number | null = null;

  @inject(StreamingStore) private readonly streamingStore: StreamingStore;

  connect(game: string): void {
    console.log("StreamingHandler: Connecting to server");

    if (this.eventSource) {
      this.disconnect();
    }

    const url = `https://streaming-service.lumigame.com/live/${game}`;

    try {
      this.eventSource = new EventSource(url);
      this.setupEventListeners();
      this.streamingStore.setConnected(true);
      this.streamingStore.setError(null);
      this.streamingStore.resetReconnectAttempts();
      this.streamingStore.setCurrentGame(game);
    } catch (err) {
      this.streamingStore.setError(`Failed to connect to streaming service: ${err.message}`);
      console.error("StreamingHandler connection error:", err);
    }
  }

  private setupEventListeners(): void {
    if (!this.eventSource) return;

    this.eventSource.onopen = () => {
      console.log("StreamingHandler: Connected to server");
      this.streamingStore.setConnected(true);
      this.streamingStore.setError(null);
    };

    this.eventSource.onmessage = (event) => {
      try {
        const payload: EventStreamPayload = JSON.parse(event.data);
        this.handleEventStreamStateWithPayload(payload);
      } catch (err) {
        console.error("StreamingHandler: Failed to parse message:", err);
        this.streamingStore.setError("Failed to parse server message");
      }
    };

    this.eventSource.onerror = (event) => {
      console.error("StreamingHandler: Connection error:", event);
      this.streamingStore.setConnected(false);
      this.streamingStore.setError("Connection lost");

      // Attempt to reconnect
      this.attemptReconnect();
    };
  }

  private handleEventStreamStateWithPayload(payload: EventStreamPayload): void {
    this.streamingStore.updateStateWithPayload(payload);
  }

  private attemptReconnect(): void {
    if (this.streamingStore.reconnectAttempts >= this.maxReconnectAttempts) {
      this.streamingStore.setError("Max reconnection attempts reached");
      return;
    }

    this.streamingStore.incrementReconnectAttempts();
    console.log(
      `StreamingHandler: Attempting to reconnect (${this.streamingStore.reconnectAttempts}/${this.maxReconnectAttempts})`
    );

    // Clear any existing timeout
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
    }

    this.reconnectTimeout = setTimeout(() => {
      if (this.eventSource?.readyState === EventSource.CLOSED) {
        const params = new URLSearchParams(window.location.search);
        const game = params.get("game") || "default";
        this.connect(game);
      }
    }, this.reconnectDelay * this.streamingStore.reconnectAttempts);
  }

  disconnect(): void {
    // Clear reconnect timeout
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }

    // Close event source
    if (this.eventSource) {
      this.eventSource.close();
      this.eventSource = null;
    }

    // Reset store state
    this.streamingStore.reset();
  }
}
