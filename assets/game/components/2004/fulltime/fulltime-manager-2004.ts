import { _decorator } from "cc";
import { SoundUtils } from "db://assets/scripts/common/utils";
import {
  FullTimeDisplayStatus,
  FulltimeManager,
} from "db://assets/scripts/components/fulltime/fulltime-manager";
import Observer from "observer";

const { ccclass, menu } = _decorator;

const { observer } = Observer;

enum SoundName {
  Result = "result",
  Winner = "winner",
}

@ccclass
@menu("FulltimeManager2004")
@observer
export class FulltimeManager2004 extends FulltimeManager {
  protected gameId = "2004";
  handlePlaySfx() {
    if (this.status === FullTimeDisplayStatus.Result) {
      this.playSfx(
        `${SoundUtils.getAudioGamePath(this.gameId)}${SoundName.Result}`
      );
    }

    if (this.status === FullTimeDisplayStatus.Winner) {
      this.playSfx(
        `${SoundUtils.getAudioGamePath(this.gameId)}${SoundName.Winner}`
      );
    }
  }
}
