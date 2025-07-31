import { injectable } from "inversify";
import mobx from "mobx";
import {
  EventData,
  EventStreamPayload,
  Phase,
  StreamingState,
} from "./streaming-type";

@injectable()
export class StreamingStore {
  constructor() {
    mobx.makeAutoObservable(this);
  }

  private state: StreamingState = {
    isConnected: false,
    error: null,
    eventData: null,
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
      updatedEventIndex: payload.updatedIndex,
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

  setCurrentGame(game: string): void {
    this.state.currentGame = game;
  }

  reset(): void {
    this.state = {
      isConnected: false,
      error: null,
      eventData: null,
      currentGame: "default",
    };
  }
}
