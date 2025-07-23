export enum Theme {
  "default" = "default",
  "clb_wc_2001" = "2001",
  "galaxy" = "galaxy",
  "epl_mun" = "epl_mun",
  "epl_mci" = "epl_mci",
  "epl_che" = "epl_che",
  "epl_liv" = "epl_liv",
  "epl_ars" = "epl_ars",
  "epl_tot" = "epl_tot",
}

export enum ProductCode {
  "SM_CLUB_WC_25" = "SM_CLUB_WC_25",
  "SM_SPINNER_EPL" = "SM_SPINNER_EPL",
  "SM_SPINNER_GALAXY" = "SM_SPINNER_GALAXY",
}

export const ThemeProductCodeMapping = {
  [Theme.default]: ProductCode.SM_SPINNER_GALAXY,
  [Theme.clb_wc_2001]: ProductCode.SM_CLUB_WC_25,
  [Theme.galaxy]: ProductCode.SM_SPINNER_GALAXY,
  [Theme.epl_mun]: ProductCode.SM_SPINNER_EPL,
  [Theme.epl_mci]: ProductCode.SM_SPINNER_EPL,
  [Theme.epl_che]: ProductCode.SM_SPINNER_EPL,
  [Theme.epl_liv]: ProductCode.SM_SPINNER_EPL,
  [Theme.epl_ars]: ProductCode.SM_SPINNER_EPL,
  [Theme.epl_tot]: ProductCode.SM_SPINNER_EPL,
};

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

export enum Phase {
  "OddsAvailable",
  "VideoInfoAvailable",
  "ResultAvailable",
}

export interface EventData {
  theme: Theme;
  productCode: ProductCode;
  homeTeam: string;
  awayTeam: string;
  eventID: number;
  currentHalf: number;
  currentVideoTime: number;
  homeScore: number;
  awayScore: number;
  currentPhase: Phase;
}

export interface StreamingState {
  isConnected: boolean;
  error?: string;
  currentPayload?: VideoPayload;
  eventData?: EventData;
  reconnectAttempts: number;
  currentTheme: Theme;
}
