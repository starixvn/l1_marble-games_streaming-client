import { _decorator, Component, sp } from "cc";

const { ccclass, property } = _decorator;

@ccclass("TestAnimation")
export class TestAnimation extends Component {
  @property(sp.Skeleton)
  skeleton: sp.Skeleton = null;

  onChangeAnimationIn() {
    this.skeleton.setAnimation(0, "prebet-in", false);
  }

  onChangeAnimationIn2() {
    this.skeleton.setAnimation(0, "ingame-in", false);
  }

  onChangeAnimationOut() {
    this.skeleton.setAnimation(0, "prebet-out", false);
  }

  onChangeAnimationOut2() {
    this.skeleton.setAnimation(0, "ingame-out", false);
  }
}
