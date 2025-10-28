import { inject, injectable } from "inversify";
import { Store } from "../store";
import { gameSettings } from "../game-settings";
import { FeatureHandler } from "../feature-handler/feature-handler";
import { GameStore } from "../local-stores/game/game-store";

@injectable()
export class ServerSentEventHandler {
  private eventSource: EventSource | null = null;
  private readonly maxReconnectAttempts = gameSettings.maxReconnectAttempts;
  private reconnectAttempts = 0;
  private readonly reconnectDelay = gameSettings.reconnectDelay;
  private reconnectTimeout: NodeJS.Timeout | null = null;
  private _store: Store;
  private _gameStore: GameStore;
  private _featureHandler: FeatureHandler;

  @inject(Store) 
  set store(store: Store) {
    this._store = store;
  }

  get store(): Store {
    return this._store;
  }

    @inject(GameStore)
    set gameStore(store: GameStore) {
    this._gameStore = store;
  }

  @inject(FeatureHandler) 
  set featureHandler(handler: FeatureHandler) {
    this._featureHandler = handler;
  }

  get featureHandler(): FeatureHandler {
    return this._featureHandler;
  }

  connect(): void {
    if (this.eventSource) {
      this.disconnect();
    }

    try {
      this._gameStore.update({
        gameId: this.store.game,
      });
      this.eventSource = new EventSource(this.store.serverUrl);
      this.setupEventListeners();
    } catch (err) {
      console.error("StreamingHandler connection error:", err);
    }
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
  }

  private setupEventListeners(): void {
    if (!this.eventSource) {
      return;
    }

    this.eventSource.onmessage = (event) => {
      try {
        const payload = JSON.parse(event.data);
        this.handleEventStreamStateWithPayload(payload);
      } catch (err) {
        console.error("StreamingHandler: Failed to parse message:", err);
      }
    };

    this.eventSource.onerror = (event) => {
      console.error("StreamingHandler: Connection error:", event);

      // Attempt to reconnect
      this.attemptReconnect();
    };

  }

  private handleEventStreamStateWithPayload(payload: Record<string, any>): void {
    this.featureHandler.update(payload);
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
}
