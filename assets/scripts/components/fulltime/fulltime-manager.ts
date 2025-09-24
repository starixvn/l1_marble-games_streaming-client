import { _decorator, Component, Node } from "cc";
import Observer  from "observer";
import { type ResultData, ResultStore } from "../../features/result/result-store";
import { type CurrentEventData, CurrentEventStore } from "../../features/current-event/current-event-store";

const { ccclass, property, menu } = _decorator;

const { render, observer } = Observer;

export enum FullTimeDisplayStatus {
    Fulltime,
    Result,
    Draw
}

const TIME_TO_DISPLAY_RESULT = 5;

@ccclass
@menu("FulltimeManager")
@observer
export class FulltimeManager extends Component {
    private status: FullTimeDisplayStatus = FullTimeDisplayStatus.Fulltime;

    @property(Node)
    fulltime: Node = null;

    @property(Node)
    result: Node = null;
    
    @property(Node)
    draw: Node = null;

    isDraw = false;

    currentPhase = 0;

    @render(CurrentEventStore, (store) => store.data)
    syncCurrentPhase(data: CurrentEventData) {
        this.currentPhase = data.phase;
    }

    @render(ResultStore, (store) => store.data)
    syncResult(data: ResultData) {
        const homeScore = data.result[this.currentPhase]?.homeScore ?? 0;
        const awayScore = data.result[this.currentPhase]?.awayScore ?? 0;
        this.isDraw = homeScore === awayScore;
    }


    protected onEnable(): void {
        this.status = FullTimeDisplayStatus.Fulltime;
        this.updateUI();
        this.scheduleOnce(this.displayResult.bind(this), TIME_TO_DISPLAY_RESULT);
    }

    displayResult() {
        this.status = this.isDraw ? FullTimeDisplayStatus.Draw : FullTimeDisplayStatus.Result;
        this.updateUI();
    }

    protected onDisable(): void {
        this.cleanup();
    }

    protected onDestroy(): void {
        super.onDestroy();
        this.cleanup();
    }

    updateUI() {
        this.fulltime.active = this.status === FullTimeDisplayStatus.Fulltime;
        this.result.active = this.status === FullTimeDisplayStatus.Result;
        this.draw.active = this.status === FullTimeDisplayStatus.Draw;
    }

    private cleanup() {
        this.unschedule(this.displayResult);
    }
}