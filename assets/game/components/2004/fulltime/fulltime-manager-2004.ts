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

  protected getSfxForStatus(status: FullTimeDisplayStatus): string | null {
    const basePath = SoundUtils.getAudioGamePath(this.gameId);

    switch (status) {
      case FullTimeDisplayStatus.Result:
        return `${basePath}${SoundName.Result}`;
      case FullTimeDisplayStatus.Winner:
        return `${basePath}${SoundName.Winner}`;
      default:
        return null;
    }
  }
}
