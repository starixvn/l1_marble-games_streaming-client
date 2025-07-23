import { injectable, inject } from "inversify";
import { StreamingStore } from "./streaming-store";
import {
  VideoPayload,
  EventData,
  ThemeProductCodeMapping,
  Theme,
} from "./streaming-type";

@injectable()
export class StreamingHandler {
  private eventSource: EventSource | null = null;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000; // 1 second
  private reconnectTimeout: number | null = null;

  @inject(StreamingStore) private readonly streamingStore: StreamingStore;

  connect(theme: string): void {
    console.log("StreamingHandler: Connecting to server");

    if (this.eventSource) {
      this.disconnect();
    }

    const url = `https://streaming-service.lumigame.com/live/${ThemeProductCodeMapping[theme]}`;

    try {
      this.eventSource = new EventSource(url);
      this.setupEventListeners();
      this.streamingStore.setConnected(true);
      this.streamingStore.setError(null);
      this.streamingStore.resetReconnectAttempts();
      this.streamingStore.setCurrentTheme(theme);
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
        const payload: VideoPayload = JSON.parse(event.data);
        this.handleVideoPayload(payload);
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

  private handleVideoPayload(payload: VideoPayload): void {
    console.log("StreamingHandler: Received video payload:", payload);

    // Process payload
    this.processGameData(payload);

    console.log("StreamingHandler: Server message:", payload.message);
  }

  private processGameData(payload: VideoPayload): void {
    this.streamingStore.setCurrentPayload(payload);
    this.streamingStore.updateEventDataWithPayload(payload);
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
        // Get the current theme from the URL to reconnect
        const params = new URLSearchParams(window.location.search);
        const theme = params.get("theme") || "default";
        this.connect(theme);
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
