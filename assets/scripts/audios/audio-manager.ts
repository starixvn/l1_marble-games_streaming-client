import { _decorator, AudioSource, Component } from "cc";
import Observer from "observer";
import { StreamingStore } from "../streaming/streaming-store";
import type { EventData } from "../streaming/streaming-type";
import { Phase } from "../streaming/streaming-type";

const { ccclass, property } = _decorator;
const { observer, render } = Observer;

@ccclass
@observer
export class AudioManager extends Component {
  @property(AudioSource)
  audioSource: AudioSource = null;

  onLoad() {
    this.audioSource.pause();
  }

  play() {
    if (!this.audioSource.playing) {
      this.audioSource.play();
    }
  }

  pause() {
    this.audioSource.pause();
  }

  @render(StreamingStore, (store) => store.eventData)
  private renderEventData(eventData: EventData) {
    console.log("currentPhase", eventData.currentPhase);

    switch (eventData.currentPhase) {
      case Phase.ScheduleEvent:
        this.play();
        break;
      case Phase.UpdateVideoInfo:
        this.pause();
        break;
      case Phase.UpdateResult:
        this.play();
        break;
    }
  }
}
