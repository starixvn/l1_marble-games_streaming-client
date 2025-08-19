import {
  _decorator,
  Component,
  error,
  instantiate,
  Node,
  Prefab,
  resources,
} from "cc";
import { init } from "db://i18n/LanguageData";
import { Container } from "inversify";
import mobx from "mobx";
import Observer from "observer";
import type { EventData } from "./streaming/streaming-type";

import { ScoreStore } from "./scores/score-store";
import { Store } from "./store";
import { handleWindowMessage } from "./store-decorator";
import { StreamingHandler } from "./streaming/streaming-handler";
import { StreamingStore } from "./streaming/streaming-store";
import { Phase } from "./streaming/streaming-type";
import { TeamStore } from "./team/team-store";
import { TimeStore } from "./time/time-store";
import { VideoStore } from "./video-player/video-store";
import { gameSettings } from "./game-settings";

const { ccclass, property } = _decorator;
const { observer, handle, render } = Observer;

const container = new Container({
  autoBindInjectable: true,
  defaultScope: "Singleton",
});

Observer.configure({
  default: { mobx, container: { resolve: (ctor) => container.get(ctor) } },
});

window.addEventListener("message", handleWindowMessage(container));

@ccclass
@observer
export class Startup extends Component {

  game = "";
  operator = ""

  @render(Store, (store) => store)
  private loadOperator(store: Store) {
    this.operator = store.operator;
    this.game = store.game;
  }

  @property(Node)
  private readonly infoLayer: Node = null;

  @render(Store, (store) => store.language)
  private initLanguage(language: string) {
    init(language);
  }

  @render(Store, (store) => store.game)
  private loadGame(game: string) {
    resources.load(`games/${game}`, Prefab, this.onLoadedInfoLayer());

    this.loadStreaming();
  }

  @handle(StreamingHandler, (handler) => handler.connect())
  private loadStreaming() {
    // trigger handler, no need function body
  }

  private onLoadedInfoLayer() {
    return (err: Error, prefab: Prefab) => {
      if (err) {
        error(err);

        return;
      }

      const info = instantiate(prefab);

      this.infoLayer.removeAllChildren();
      this.infoLayer.addChild(info);
    };
  }

  @render(StreamingStore, (store) => store.eventData)
  private renderEventData(eventData: EventData) {
    if (!eventData?.eventId) {
      return;
    }

    const [firstHalfHomeScore, firstHalfAwayScore] = eventData.liveScores[0]
      .split(":")
      .map(Number);

    this.updateTeamName({
      home: eventData.homeTeam,
      away: eventData.awayTeam,
    });

    this.updateScore({
      home: eventData.homeScore,
      away: eventData.awayScore,
    });

    this.update1HalfScore({
      home: firstHalfHomeScore,
      away: firstHalfAwayScore,
    });

    const defaultPlaylist = `${gameSettings.streamingUrl}${this.operator}_${this.game}_intro.m3u8`;

    const currentEventDetail =
      eventData.eventDetails[eventData.currentEventIndex];

    const isHalfTime = eventData.currentEventIndex === 0 || eventData.matchLiveTimeMs / 1000 <= gameSettings.videoDuration;
    
    const truePlaylist = 
      currentEventDetail.playlist && currentEventDetail.playlist !== ""
        ? currentEventDetail.playlist
        : defaultPlaylist;
    
    const videoLiveTime = 
      eventData.currentPhase === Phase.ScheduleEvent || eventData.currentPhase === Phase.UpdateResult
        ? 0 
        : currentEventDetail.videoLiveTimeMs;


    this.updateVideoStore({
      videoLiveTimeMs: videoLiveTime,
      currentPhase: eventData.currentPhase,
      url: truePlaylist,
      halfIndex: isHalfTime ? 0 : 1,
    });

    this.updateTimeStore({
      matchLiveTime: eventData.matchLiveTimeMs,
      halfIndex: eventData.currentEventIndex,
      currentPhase: eventData.currentPhase,
    });
  }

  @handle(TeamStore, (store, data: TeamStore) => store.update(data))
  private updateTeamName(data: { home: string; away: string }) {
    return data;
  }

  @handle(ScoreStore, (store, data: ScoreStore) => store.update(data))
  private updateScore(data: { home: number; away: number }) {
    return data;
  }

  @handle(ScoreStore, (store, data: ScoreStore) => store.updatePrevious(data))
  private update1HalfScore(data: { home: number; away: number }) {
    return data;
  }

  @handle(
    VideoStore,
    (
      store,
      data: { videoLiveTimeMs: number; currentPhase: Phase; url: string; halfIndex: number }
    ) => store.update(data)
  )
  private updateVideoStore(data: {
    videoLiveTimeMs: number;
    currentPhase: Phase;
    url: string;
    halfIndex: number;
  }) {
    return data;
  }

  @handle(TimeStore, (store, data: TimeStore) => store.update(data))
  private updateTimeStore(data: {
    matchLiveTime: number;
    halfIndex: number;
    currentPhase: Phase;
  }) {
    return data;
  }
}
