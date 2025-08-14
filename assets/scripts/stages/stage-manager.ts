import { _decorator, CCString, Component } from "cc";
import { Stage } from "./stage";
import Observer from "observer";
import { StreamingStore } from "../streaming/streaming-store";
import { Phase } from "../streaming/streaming-type";
import { gameSettings } from "../game-settings";

const { ccclass, menu, property } = _decorator;
const { observer, render } = Observer;

@ccclass
@menu("Stages/StageManager")
@observer
export class StageManager extends Component {
  @property(Stage)
  private targets: Stage[] = [];

  private scheduledCallback: any = null;

  @property({ type: CCString })
  get current() {
    return this.targets.find((target) => target.node.active)?.node.name;
  }

  set current(value: string) {
    this.targets.forEach((target) => {
      target.node.active = target.node.name === value;
    });
  }

  @property
  get index() {
    return this.targets.findIndex((target) => target.node.active);
  }

  set index(value: number) {
    if (value < 0) {
      value = 0;
    }

    const size = this.targets.length;

    this.targets.forEach((target, index) => {
      target.node.active = index === value % size;
    });
  }

  get stages() {
    return this.targets.map((target) => target.node.name);
  }

  @render(StreamingStore, (store) => ({
    phase: store.eventData.currentPhase,
    eventIndex: store.eventData.updatedEventIndex,
    result: store.result,
    matchLiveTime: store.eventData.matchLiveTimeMs,
  }))
  private updateStage(data: {
    phase: string;
    eventIndex: number;
    result: "H" | "A" | "D" | null;
    matchLiveTime: number;
  }) {
    const matchLiveTime = data.matchLiveTime / 1000;
    const isHalfTime =
      data.eventIndex === 0 || matchLiveTime <= gameSettings.videoDuration;

    const mapping = {
      [Phase.ScheduleEvent]: "prebetting",
      [Phase.UpdateOdds]: data.eventIndex === 0 ? "prebetting" : "streaming",
      [Phase.UpdateVideoInfo]: "streaming",
      [Phase.UpdateResult]: isHalfTime ? "halftime" : "fulltime",
    };

    const stage = mapping[data.phase];

    if (!stage) {
      return;
    }

    this.cancelScheduledCallback();

    if (stage === "fulltime") {
      this.current = stage;

      this.scheduledCallback = () => {
        console.log("scheduled callback");
        if (data.result === "D") {
          this.current = "draw";
        } else {
          this.current = "result";
        }

        this.scheduledCallback = null;
      };

      this.scheduleOnce(this.scheduledCallback, 5);
    } else {
      this.current = stage;
    }
  }

  private cancelScheduledCallback(): void {
    if (this.scheduledCallback) {
      this.unschedule(this.scheduledCallback);
      this.scheduledCallback = null;
    }
  }

  protected onDestroy(): void {
    this.cancelScheduledCallback();
  }

  onFocusInEditor(): void {
    this.targets = this.node.children
      .map((child) => child.components.find((c) => c instanceof Stage))
      .filter(Boolean);
  }
}
