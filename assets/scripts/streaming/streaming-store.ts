import { injectable } from "inversify";
import mobx from "mobx";
import { EventData, EventStreamPayload, Phase, StreamingState } from "./streaming-type";

@injectable()
export class StreamingStore {
  constructor() {
    mobx.makeAutoObservable(this);
  }

  private state: StreamingState = {
    isConnected: false,
    error: null,
    eventData: null,
    reconnectAttempts: 0,
    currentGame: "default",
  };

  get isConnected(): boolean {
    return this.state.isConnected;
  }

  get error(): string | null {
    return this.state.error;
  }

  get eventData(): EventData | null {
    return this.state.eventData;
  }

  get reconnectAttempts(): number {
    return this.state.reconnectAttempts;
  }

  get currentGame(): string {
    return this.state.currentGame;
  }

  get connectionStatus(): { isConnected: boolean; error: string | null } {
    return {
      isConnected: this.state.isConnected,
      error: this.state.error,
    };
  }

  updateStateWithPayload(payload: EventStreamPayload): void {
    this.state.eventData = {
      homeTeam: payload.homeTeam,
      awayTeam: payload.awayTeam,
      eventId: payload.eventId,
      currentEventIndex: payload.currentIndex,
      liveScores: payload.liveScores,
      goalInfos: payload.goalInfos,
      currentPhase: payload.currentPhase,
      eventDetails: payload.eventDetails,
      matchLiveTimeMs: payload.matchLiveTimeMs,
    };
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

  setReconnectAttempts(attempts: number): void {
    this.state.reconnectAttempts = attempts;
  }

  setCurrentGame(game: string): void {
    this.state.currentGame = game;
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
      eventData: null,
      reconnectAttempts: 0,
      currentGame: "default",
    };
  }
}
