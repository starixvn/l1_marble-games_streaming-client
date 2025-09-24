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
import { Phase, VideoStatus } from "./streaming/streaming-type";
import { TeamStore } from "./team/team-store";
import { TimeStore } from "./time/time-store";
import { VideoStore } from "./video-player/video-store";
import { gameSettings } from "./game-settings";
import { IntroStore } from "./intro/intro-store";
import { CommentatorVoiceStore, type VoiceConfig } from "./commentators-voices/commentator-voice-store";

const { ccclass, property } = _decorator;
const { observer, handle, render } = Observer;

const container = new Container({
  autobind: true,
  defaultScope: "Singleton",
});

Observer.configure({
  default: { mobx, container: { resolve: (ctor) => container.get(ctor, {
    autobind: true,
  }) } },
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
    this.setIntroUrl(`${gameSettings.streamingUrl}${store.operator}_${store.game}_intro.m3u8`);
  }

  @property(Node)
  private readonly infoLayer: Node = null;

  @render(Store, (store) => store.language)
  private initLanguage(language: string) {
    init(language);
  }

  @render(Store, (store) => store.game)
  public loadGame(game: string) {
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
  public renderEventData(eventData: EventData) {
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
    const videoLiveTime = currentEventDetail.videoLiveTimeMs;


    if (this.isPlayingIntro(eventData)) {
      const introTime = eventData.introTime / 1000;
      this.updateIntroStore({
        currentTime: introTime,
        status: VideoStatus.Playing,
      });
    } else {
      this.updateIntroStore({
        currentTime: 0,
        status: VideoStatus.Stopped,
      });
    }
    
    if (eventData.voiceConfigDetail) {
      this.initCommentatorVoices(eventData.voiceConfigDetail);
    }

    if (eventData.currentPhase === Phase.UpdateVideoInfo && eventData.voice) {
      this.updateVoice(eventData.voice);
    }

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

  @handle(CommentatorVoiceStore, (store, voice: string) => store.playVoice(voice))
  public updateVoice(voice: string) {
    return voice;
  }

  @handle(CommentatorVoiceStore, (store, config: VoiceConfig) => store.initVoices(config))
  public initCommentatorVoices(config: VoiceConfig) {
    return config;
  } 

  @handle(TeamStore, (store, data: TeamStore) => store.update(data))
  public updateTeamName(data: { home: string; away: string }) {
    return data;
  }

  @handle(ScoreStore, (store, data: ScoreStore) => store.update(data))
  public updateScore(data: { home: number; away: number }) {
    return data;
  }

  @handle(ScoreStore, (store, data: ScoreStore) => store.updatePrevious(data))
  public update1HalfScore(data: { home: number; away: number }) {
    return data;
  }

  @handle(
    VideoStore,
    (
      store,
      data: { videoLiveTimeMs: number; currentPhase: Phase; url: string; halfIndex: number }
    ) => store.update(data)
  )
  public updateVideoStore(data: {
    videoLiveTimeMs: number;
    currentPhase: Phase;
    url: string;
    halfIndex: number;
  }) {
    return data;
  }

  @handle(IntroStore, (store, data: IntroStore) => store.update(data))
  public updateIntroStore(data: {
    currentTime: number;
    status: VideoStatus;
  }) {
    return data;
  }

  @handle(TimeStore, (store, data: TimeStore) => store.update(data))
  public updateTimeStore(data: {
    matchLiveTime: number;
    halfIndex: number;
    currentPhase: Phase;
  }) {
    return data;
  }

  @handle(IntroStore, (store, url: string) => store.setUrl(url))
  public setIntroUrl(url: string) {
    return url;
  }

  private isPlayingIntro({ currentEventIndex, matchLiveTimeMs, currentPhase, introTime }: {
    currentEventIndex: number;
    matchLiveTimeMs: number;
    currentPhase: Phase;
    introTime?: number;
  }) {
    return currentPhase === Phase.ScheduleEvent || currentPhase === Phase.PlayIntro;
  }
}
