import {
  _decorator,
  Component,
  Enum,
  resources,
  Sprite,
  SpriteFrame,
} from "cc";
import Observer from "observer";
import { Store } from "../store";
import { Icon } from "./icon";
import { Team } from "./team";
import { TeamStore } from "./team-store";

const { ccclass, property, menu } = _decorator;
const { render, observer } = Observer;

@ccclass
@menu("Team/IconManager")
@observer
export class IconManager extends Component {
  @property({ type: Enum(Team) })
  team: Team = Team.HOME;

  @property([Icon])
  private targets: Icon[] = [];

  private sprites: Sprite[] = [];
  private operator = "";

  start() {
    this.sprites = this.targets.map((target) => target.getComponent(Sprite));
  }

  @render(Store, (store) => store.operator)
  private syncOperator(operator: string) {
    this.operator = operator;
  }

  @render(TeamStore, (store) => ({ home: store.home, away: store.away }))
  private syncTeamName({ home, away }: TeamStore) {
    if (this.team === Team.HOME) {
      this.name = home;
    } else {
      this.name = away;
    }
  }

  set name(value: string) {
    if (this.operator === "") {
      return;
    }

    const path = `icons/${this.operator}/${value}/spriteFrame`;

    const onError = () => {
      const fallbackPath = `icons/common/${value}/spriteFrame`;

      resources.load(fallbackPath, SpriteFrame, this.onLoadedSpriteFrame());
    };

    resources.load(path, SpriteFrame, this.onLoadedSpriteFrame(onError));
  }

  get name() {
    const first = this.sprites[0];

    return first ? first.spriteFrame.name : "";
  }

  private onLoadedSpriteFrame(onError?: () => void) {
    return (err: Error, spriteFrame: SpriteFrame) => {
      if (err || !spriteFrame) {
        onError?.();

        return;
      }

      this.sprites.forEach((sprite) => {
        sprite.spriteFrame = spriteFrame;
      });
    };
  }

  onFocusInEditor(): void {
    const icons = this.node.getComponentsInChildren(Icon);

    this.targets = icons.filter((icon) => icon.team === this.team);
  }
}
