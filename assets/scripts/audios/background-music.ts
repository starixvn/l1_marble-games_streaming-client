import { _decorator, AudioSource, Component } from "cc";
import Observer from "observer";
import { StreamingStore } from "../streaming/streaming-store";
import type { EventData } from "../streaming/streaming-type";
import { Phase } from "../streaming/streaming-type";
import { AudioStore } from "./audio-store";

const { ccclass, property } = _decorator;
const { observer, render } = Observer;

@ccclass
@observer
export class BackgroundMusic extends Component {
  @property(AudioSource)
  audioSource: AudioSource = null;

  isPlaying = false;

  play() {
    if (this.isPlaying && !this.audioSource.playing) {
      this.audioSource.play();
    }
  }

  pause() {
    this.audioSource.pause();
  }

  @render(AudioStore, (store) => ({
    muted: store.muted,
    browserBlocked: store.browserBlocked,
  }))
  private syncMuted({
    muted,
    browserBlocked,
  }: {
    muted: boolean;
    browserBlocked: boolean;
  }) {
    if (muted || browserBlocked) {
      this.pause();
    } else {
      this.play();
    }
  }

  @render(StreamingStore, (store) => store.eventData)
  private renderEventData(eventData: EventData) {
    switch (eventData.currentPhase) {
      case Phase.ScheduleEvent:
        this.isPlaying = true;
        this.play();
        break;
      case Phase.UpdateVideoInfo:
        this.isPlaying = false;
        this.pause();
        break;
      case Phase.UpdateResult:
        this.isPlaying = true;
        this.play();
        break;
    }
  }
}
