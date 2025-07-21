import { _decorator, Component, Enum, Sprite, SpriteAtlas } from "cc";
import { Icon } from "./icon";
import { Team } from "./team";

const { ccclass, property, menu } = _decorator;

@ccclass
@menu("Team/IconManager")
export class IconManager extends Component {
  @property(SpriteAtlas)
  private atlas: SpriteAtlas = null;

  @property({ type: Enum(Team) })
  team: Team = Team.HOME;

  @property([Icon])
  private targets: Icon[] = [];

  private sprites: Sprite[] = [];

  start() {
    this.sprites = this.targets.map((target) => target.getComponent(Sprite));
  }

  set name(value: string) {
    const spriteFrame = this.atlas.getSpriteFrame(value);

    if (spriteFrame) {
      this.sprites.forEach((sprite) => {
        sprite.spriteFrame = spriteFrame;
      });
    }
  }

  get name() {
    const first = this.sprites[0];

    return first ? first.spriteFrame.name : "";
  }

  onFocusInEditor(): void {
    const icons = this.node.getComponentsInChildren(Icon);

    this.targets = icons.filter((icon) => icon.team === this.team);
  }
}
