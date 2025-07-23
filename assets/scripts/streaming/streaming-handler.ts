import { injectable, inject } from "inversify";
import { StreamingStore, VideoPayload, GameData } from "./streaming-store";

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

    const url = `https://streaming-service.lumigame.com/live/${
      theme === "2001" ? "SM_CLUB_WC_25" : "SM_SPINNER_GALAXY"
    }`;

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

    // Update store with new payload
    this.streamingStore.setCurrentPayload(payload);

    // Process game data if available
    if (payload.result) {
      this.processGameData(payload.result);
    }

    // Handle any messages
    if (payload.message) {
      console.log("StreamingHandler: Server message:", payload.message);
    }

    // Emit custom event for other components to listen to
    if (typeof window !== "undefined") {
      window.dispatchEvent(
        new CustomEvent("videoPayloadReceived", {
          detail: payload,
        })
      );
    }
  }

  private processGameData(gameData: any): void {
    // Update teams data
    if (gameData.teams) {
      if (gameData.teams.home) {
        this.streamingStore.updateTeamData("home", gameData.teams.home);
      }
      if (gameData.teams.away) {
        this.streamingStore.updateTeamData("away", gameData.teams.away);
      }
    }

    // Update score data
    if (gameData.score) {
      this.streamingStore.updateScore(gameData.score);
    }

    // Update events data
    if (gameData.events) {
      this.streamingStore.updateEvents(gameData.events);
    }

    // Update the complete game data in store
    this.streamingStore.setGameData(gameData);
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
    this.streamingStore.setConnected(false);
    this.streamingStore.setCurrentPayload(null);
    this.streamingStore.setError(null);
  }

  // Public methods for external access
  getConnectionStatus(): { isConnected: boolean; error: string | null } {
    return this.streamingStore.connectionStatus;
  }

  getCurrentPayload(): VideoPayload | null {
    return this.streamingStore.currentPayload;
  }

  getGameData(): GameData | null {
    return this.streamingStore.gameData;
  }

  getCurrentTheme(): string {
    return this.streamingStore.currentTheme;
  }

  // Method to manually trigger a test payload (for development)
  simulatePayload(): void {
    const testPayload: VideoPayload = {
      eventId: 1,
      eventDetailIndex: 0,
      videoUrl: "https://example.com/test-video.mp4",
      videoStartTime: new Date().toISOString(),
      videoPlayingTime: 0,
      videoLength: 90,
      result: {
        teams: {
          home: { name: "Home Team", shortName: "HOME", icon: "clb_home" },
          away: { name: "Away Team", shortName: "AWAY", icon: "clb_away" },
        },
        score: { home: 1, away: 0 },
        events: [],
      },
      message: "Test payload for development",
      gameId: "test-game",
    };

    this.handleVideoPayload(testPayload);
  }
}
