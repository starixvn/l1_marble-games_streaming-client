import { injectable } from "inversify";
import mobx from "mobx";

export interface VideoPayload {
  eventId: number;
  eventDetailIndex: number;
  videoUrl: string;
  videoStartTime: string;
  videoPlayingTime: number;
  videoLength: number;
  result: any;
  message?: string;
  gameId?: string;
}

export interface TeamData {
  name: string;
  shortName: string;
  icon: string;
}

export interface GameData {
  teams?: {
    home?: TeamData;
    away?: TeamData;
  };
  score?: {
    home: number;
    away: number;
  };
  events?: any[];
}

export interface StreamingState {
  isConnected: boolean;
  error: string | null;
  currentPayload: VideoPayload | null;
  gameData: GameData | null;
  reconnectAttempts: number;
  currentTheme: string;
}

@injectable()
export class StreamingStore {
  constructor() {
    mobx.makeAutoObservable(this);
  }

  private state: StreamingState = {
    isConnected: false,
    error: null,
    currentPayload: null,
    gameData: null,
    reconnectAttempts: 0,
    currentTheme: "default",
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

  get gameData(): GameData | null {
    return this.state.gameData;
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

  setConnected(connected: boolean): void {
    this.state.isConnected = connected;
    if (connected) {
      this.state.error = null;
    }
  }

  setError(error: string | null): void {
    this.state.error = error;
  }

  setCurrentPayload(payload: VideoPayload | null): void {
    this.state.currentPayload = payload;
  }

  setGameData(gameData: GameData | null): void {
    this.state.gameData = gameData;
  }

  setReconnectAttempts(attempts: number): void {
    this.state.reconnectAttempts = attempts;
  }

  setCurrentTheme(theme: string): void {
    this.state.currentTheme = theme;
  }

  incrementReconnectAttempts(): void {
    this.state.reconnectAttempts++;
  }

  resetReconnectAttempts(): void {
    this.state.reconnectAttempts = 0;
  }

  updateTeamData(team: "home" | "away", data: TeamData): void {
    if (!this.state.gameData) {
      this.state.gameData = {};
    }
    if (!this.state.gameData.teams) {
      this.state.gameData.teams = {};
    }
    this.state.gameData.teams[team] = data;
  }

  updateScore(score: { home: number; away: number }): void {
    if (!this.state.gameData) {
      this.state.gameData = {};
    }
    this.state.gameData.score = score;
  }

  updateEvents(events: any[]): void {
    if (!this.state.gameData) {
      this.state.gameData = {};
    }
    this.state.gameData.events = events;
  }

  reset(): void {
    this.state = {
      isConnected: false,
      error: null,
      currentPayload: null,
      gameData: null,
      reconnectAttempts: 0,
      currentTheme: "default",
    };
  }
}
