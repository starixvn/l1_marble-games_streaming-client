import { injectable } from "inversify";
import mobx from "mobx";
import { store } from "../store-decorator";
import {
  EventData,
  EventStreamPayload,
  Result,
  StreamingState,
} from "./streaming-type";
import { VoiceConfig } from "../commentators-voices/commentator-voice-store";

@injectable()
@store("StreamingStore")
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

  get result(): Result {
    if (!this.state.eventData) {
      return null;
    }

    return this.state.eventData?.homeScore > this.state.eventData?.awayScore
      ? "H"
      : this.state.eventData?.homeScore < this.state.eventData?.awayScore
      ? "A"
      : "D";
  }

  updateStateWithPayload(payload: EventStreamPayload): void {
    const [homeScore, awayScore] = payload.liveScores.reduce(
      (result, score) => {
        const [home, away] = score.split(":");

        result[0] += parseInt(home);
        result[1] += parseInt(away);

        return result;
      },
      [0, 0]
    );

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
      homeScore,
      awayScore,
      voice: payload.voice,
      voiceConfigDetail: payload.voiceConfigDetail as VoiceConfig,
      introTime: payload.introTime,
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
