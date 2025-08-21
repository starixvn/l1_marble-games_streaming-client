export type EventDetail = {
  playlist: string;
  videoLiveTimeMs: number;
  videoLength: number;
  result: string;
};

export type EventStreamPayload = {
  gameId: string;
  eventId: number;
  homeTeam: string;
  awayTeam: string;
  currentIndex: number;
  updatedIndex: number;
  eventDetails: EventDetail[];
  liveScores: string[];
  goalInfos: any[];
  matchLiveTimeMs: number;
  currentPhase: Phase;
  message: string;
};

export enum Phase {
  ScheduleEvent = "ScheduleEvent",
  UpdateOdds = "UpdateOdds",
  UpdatePreloadVideoInfo = "UpdatePreloadVideoInfo",
  UpdateVideoInfo = "UpdateVideoInfo",
  UpdateGoalInfo = "UpdateGoalInfo",
  UpdateResult = "UpdateResult",
}

export type EventData = {
  homeScore: number;
  awayScore: number;
  homeTeam: string;
  awayTeam: string;
  eventId: number;
  currentEventIndex: number;
  updatedEventIndex: number;
  liveScores: string[];
  goalInfos: any[];
  currentPhase: Phase;
  eventDetails: EventDetail[];
  matchLiveTimeMs: number;
};

export type StreamingState = {
  isConnected: boolean;
  error?: string;
  eventData?: EventData;
  currentGame: string;
};

export type Result = "H" | "A" | "D" | null;

export enum VideoStatus {
  Playing = "playing",
  Stopped = "stopped",
}