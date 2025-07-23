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

  // @mobx.observable
  private state: StreamingState = {
    isConnected: false,
    error: null,
    currentPayload: null,
    gameData: null,
    reconnectAttempts: 0,
    currentTheme: "default",
  };

  // Getters
  // @mobx.computed
  get isConnected(): boolean {
    return this.state.isConnected;
  }

  // @mobx.computed
  get error(): string | null {
    return this.state.error;
  }

  // @mobx.computed
  get currentPayload(): VideoPayload | null {
    return this.state.currentPayload;
  }

  // @mobx.computed
  get gameData(): GameData | null {
    return this.state.gameData;
  }

  // @mobx.computed
  get reconnectAttempts(): number {
    return this.state.reconnectAttempts;
  }

  // @mobx.computed
  get currentTheme(): string {
    return this.state.currentTheme;
  }

  // @mobx.computed
  get connectionStatus(): { isConnected: boolean; error: string | null } {
    return {
      isConnected: this.state.isConnected,
      error: this.state.error,
    };
  }

  // Actions
  // @mobx.action
  setConnected(connected: boolean): void {
    this.state.isConnected = connected;
    if (connected) {
      this.state.error = null;
    }
  }

  // @mobx.action
  setError(error: string | null): void {
    this.state.error = error;
  }

  // @mobx.action
  setCurrentPayload(payload: VideoPayload | null): void {
    this.state.currentPayload = payload;
  }

  // @mobx.action
  setGameData(gameData: GameData | null): void {
    this.state.gameData = gameData;
  }

  // @mobx.action
  setReconnectAttempts(attempts: number): void {
    this.state.reconnectAttempts = attempts;
  }

  // @mobx.action
  setCurrentTheme(theme: string): void {
    this.state.currentTheme = theme;
  }

  // @mobx.action
  incrementReconnectAttempts(): void {
    this.state.reconnectAttempts++;
  }

  // @mobx.action
  resetReconnectAttempts(): void {
    this.state.reconnectAttempts = 0;
  }

  // @mobx.action
  updateTeamData(team: "home" | "away", data: TeamData): void {
    if (!this.state.gameData) {
      this.state.gameData = {};
    }
    if (!this.state.gameData.teams) {
      this.state.gameData.teams = {};
    }
    this.state.gameData.teams[team] = data;
  }

  // @mobx.action
  updateScore(score: { home: number; away: number }): void {
    if (!this.state.gameData) {
      this.state.gameData = {};
    }
    this.state.gameData.score = score;
  }

  // @mobx.action
  updateEvents(events: any[]): void {
    if (!this.state.gameData) {
      this.state.gameData = {};
    }
    this.state.gameData.events = events;
  }

  // @mobx.action
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
