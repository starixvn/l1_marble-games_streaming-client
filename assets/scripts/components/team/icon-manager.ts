import { _decorator, Component, Enum, log, Sprite, SpriteFrame } from "cc";
import Observer from "observer";
import { bundleManager } from "../../asset-loader/bundle-manager";
import {
  type TeamNameData,
  TeamNameStore,
} from "../../features/team-name/team-name-store";
import { Store } from "../../store";
import { Icon } from "./icon";
import { Team } from "./team";

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
  private rootPath = "/icons";

  onLoad() {
    this.sprites = this.targets.map((target) => target.getComponent(Sprite));
  }

  @render(Store, (store) => store.operator)
  syncOperator(operator: string) {
    log("syncOperator---", operator);
    this.operator = operator;
  }

  @render(TeamNameStore, (store) => store.data)
  syncTeamName(data: TeamNameData) {
    if (this.team === Team.HOME && data.homeTeamName) {
      this.name = data.homeTeamName;
    } else if (this.team === Team.AWAY && data.awayTeamName) {
      this.name = data.awayTeamName;
    }
  }

  set name(value: string) {
    if (this.operator === "") {
      return;
    }
    // Load per Icon using its bundleName and path
    for (let i = 0; i < this.targets.length; i++) {
      const icon = this.targets[i];
      const sprite = this.sprites[i];

      if (!icon || !sprite) {
        continue;
      }

      this.loadSpriteForIcon(icon, sprite, value);
    }
  }

  get name() {
    const first = this.sprites[0];

    return first ? first.spriteFrame.name : "";
  }

  private async loadSpriteForIcon(
    icon: Icon,
    sprite: Sprite,
    teamName: string
  ) {
    const primaryPath = `${this.rootPath}/${this.operator}/${icon.path}${teamName}/spriteFrame`;
    const fallbackPath = `${this.rootPath}/common/${icon.path}/${teamName}/spriteFrame`;

    try {
      const spriteFrame = await bundleManager.loadAssetsFromBundle<SpriteFrame>(
        "resources",
        primaryPath,
        SpriteFrame,
        null
      );
      this.setSprite(sprite, spriteFrame);
    } catch (e) {
      log("loadSpriteForIcon error---", e);
      const spriteFrame = await bundleManager.loadAssetsFromBundle<SpriteFrame>(
        "resources",
        fallbackPath,
        SpriteFrame,
        null
      );
      this.setSprite(sprite, spriteFrame);
    }
  }

  protected setSprite(sprite: Sprite, spriteFrame: SpriteFrame) {
    if (!sprite || !spriteFrame) {
      return;
    }

    sprite.spriteFrame = spriteFrame;
  }

  onFocusInEditor(): void {
    const icons = this.node.getComponentsInChildren(Icon);
    this.targets = icons.filter((icon) => icon.team === this.team);
  }
}
