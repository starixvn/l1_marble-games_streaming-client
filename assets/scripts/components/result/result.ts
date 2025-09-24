import { _decorator, CCString, Component, Enum, Label } from "cc";
import { t } from "db://i18n/LanguageData"
import Observer from "observer";
import { type ResultData, ResultStore } from "../../features/result/result-store";

const { ccclass, property, menu } = _decorator;

const { render, observer } = Observer;

enum ResultType {
    HalfTime = 0,
    FullTime = 1,
}

@ccclass
@observer
@menu("Result")
export class Result extends Component {
    @property(Label)
    scoreLabel: Label = null;

    @property(CCString)
    prefix = "";

    @property({
        type: Enum(ResultType),
    })
    resultType: ResultType = ResultType.HalfTime;

    @render(ResultStore, (store) => store.data)
    syncResult(data: ResultData) {
        const halfIndex = this.resultType;

        const result = Object.values(data.result).reduce((acc, curr, index) => {
            if (index <= halfIndex) {
                acc.homeScore += curr.homeScore;
                acc.awayScore += curr.awayScore;
            }
            return acc;
        }, { homeScore: 0, awayScore: 0 });

        const homeScore = result.homeScore;
        const awayScore = result.awayScore;

        const prefix = this.prefix && this.prefix !== ""
            ? `${t(this.prefix)}: ` 
            : "";

        this.scoreLabel.string = `${prefix}${homeScore} - ${awayScore}`;
    }
}