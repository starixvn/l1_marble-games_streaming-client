import { _decorator, CCString, Component } from "cc";
import { Stage } from "./stage";

const { ccclass, menu, property } = _decorator;

@ccclass
@menu("Stages/StageManager")
export class StageManager extends Component {
  @property(Stage)
  private targets: Stage[] = [];

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

  onFocusInEditor(): void {
    this.targets = this.node.getComponentsInChildren(Stage);
  }
}
