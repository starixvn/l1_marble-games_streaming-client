import { _decorator, Component, sp } from "cc";

const { ccclass, property } = _decorator;

@ccclass("TestAnimation")
export class TestAnimation extends Component {
  @property(sp.Skeleton)
  skeleton: sp.Skeleton = null;

  linkVideo =
    "https://d1aof1lwumql9k.cloudfront.net/ultra_live_galaxy/3b810e887ba52f3b39b9910e59bcecb34312f053643fba38c66b8ffd942c87cb.m3u8";

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
