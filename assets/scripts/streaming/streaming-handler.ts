import { inject, injectable } from "inversify";
import { Store } from "../store";
import { StreamingStore } from "./streaming-store";
import { EventStreamPayload } from "./streaming-type";
import { gameSettings } from "../game-settings";

@injectable()
export class StreamingHandler {
  private eventSource: EventSource | null = null;
  private maxReconnectAttempts = gameSettings.maxReconnectAttempts;
  private reconnectAttempts = 0;
  private reconnectDelay = gameSettings.reconnectDelay;
  private reconnectTimeout: NodeJS.Timeout | null = null;

  @inject(StreamingStore) private readonly streamingStore: StreamingStore;

  @inject(Store) private readonly store: Store;

  connect(): void {
    if (this.eventSource) {
      this.disconnect();
    }

    try {
      this.eventSource = new EventSource(this.store.serverUrl);
      this.setupEventListeners();
    } catch (err) {
      this.streamingStore.setError(
        `Failed to connect to streaming service: ${err.message}`
      );
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

    this.streamingStore.setCurrentGame(this.store.game);
  }

  private handleEventStreamStateWithPayload(payload: EventStreamPayload): void {
    this.streamingStore.updateStateWithPayload(payload);
  }

  private attemptReconnect(): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.log("StreamingHandler: Max reconnection attempts reached");
      this.disconnect();
      return;
    }

    this.reconnectAttempts++;

    console.log(
      `StreamingHandler: Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})`
    );

    // Clear any existing timeout
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
    }

    this.reconnectTimeout = setTimeout(() => {
      if (this.eventSource?.readyState === EventSource.CLOSED) {
        this.connect();
      }
    }, this.reconnectDelay);
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
