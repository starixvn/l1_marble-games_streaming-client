import { injectable } from "inversify";
import mobx from "mobx";
import {
  EventData,
  Phase,
  ProductCode,
  StreamingState,
  Theme,
  VideoPayload,
} from "./streaming-type";

@injectable()
export class StreamingStore {
  constructor() {
    mobx.makeAutoObservable(this);
  }

  private state: StreamingState = {
    isConnected: false,
    error: null,
    currentPayload: null,
    eventData: null,
    reconnectAttempts: 0,
    currentTheme: Theme.default,
  };

  get isConnected(): boolean {
    return this.state.isConnected;
  }

  get error(): string | null {
    return this.state.error;
  }

  get currentPayload(): VideoPayload | null {
    return this.state.currentPayload;
  }

  get eventData(): EventData | null {
    return this.state.eventData;
  }

  get reconnectAttempts(): number {
    return this.state.reconnectAttempts;
  }

  get currentTheme(): string {
    return this.state.currentTheme;
  }

  get connectionStatus(): { isConnected: boolean; error: string | null } {
    return {
      isConnected: this.state.isConnected,
      error: this.state.error,
    };
  }

  updateEventDataWithPayload(payload: VideoPayload): void {
    this.state.eventData = {
      ...this.state.eventData,
      currentPhase: payload.message as unknown as Phase,
      currentVideoTime: payload.videoPlayingTime,
      currentHalf: payload.eventDetailIndex + 1,
      homeScore: payload.result[0],
      awayScore: payload.result[2],
      eventID: payload.eventId,
    };
  }

  setCurrentPayload(payload: VideoPayload): void {
    this.state.currentPayload = payload;
  }

  setConnected(connected: boolean): void {
    this.state.isConnected = connected;
    if (connected) {
      this.state.error = null;
    }
  }

  setError(error: string | null): void {
    this.state.error = error;
  }

  setEventData(eventData: EventData | null): void {
    this.state.eventData = eventData;
  }

  setReconnectAttempts(attempts: number): void {
    this.state.reconnectAttempts = attempts;
  }

  setCurrentTheme(theme: string): void {
    if (theme in Theme) {
      this.state.currentTheme = theme as Theme;
    } else {
      console.error(`Invalid theme: ${theme}`);
    }
  }

  incrementReconnectAttempts(): void {
    this.state.reconnectAttempts++;
  }

  resetReconnectAttempts(): void {
    this.state.reconnectAttempts = 0;
  }

  reset(): void {
    this.state = {
      isConnected: false,
      error: null,
      currentPayload: null,
      eventData: null,
      reconnectAttempts: 0,
      currentTheme: Theme.default,
    };
  }
}
