import { _decorator, Component, Node, SpriteFrame } from "cc";
import Observer from "observer";
import { BackgroundStore } from "../../local-stores/background/background-store";
import { DOMBackgroundImage } from "./dom-background-image";
const { ccclass, property } = _decorator;
const { observer, render } = Observer;

@ccclass("BackgroundLoader")
@observer
export class BackgroundLoader extends Component {
  @property(Node)
  public videoPlaceholderNode: Node = null;

  @property(SpriteFrame)
  public backgroundImage: SpriteFrame = null;

  protected onLoad(): void {
    if (!this.backgroundImage) {
      return;
    }

    const imagePath = (this.backgroundImage.texture as any).image._nativeData
      .currentSrc;

    DOMBackgroundImage.createBackgroundImageElement(imagePath);
  }

  @render(BackgroundStore, (store) => store.isShowingBackground)
  updateVideoPlaceholderNode(isShowingBackground: boolean) {
    if (this.videoPlaceholderNode) {
      this.videoPlaceholderNode.active = isShowingBackground;
    }
  }
}
