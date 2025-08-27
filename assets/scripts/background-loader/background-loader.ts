import { _decorator, Component, Node, SpriteFrame } from 'cc';
import { DOMBackgroundImage } from './dom-background-image';
import Observer from 'observer';
import { VideoStore } from '../video-player/video-store';
const { ccclass, property } = _decorator;
const { observer, render } = Observer;

@ccclass('BackgroundLoader')
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

        const imagePath = (this.backgroundImage.texture as any).image._nativeData.currentSrc;

        DOMBackgroundImage.createBackgroundImageElement(imagePath);
    }

    @render(VideoStore, (store) => store.play)
    private updateVideoPlaceholderNode(play: boolean) {
        if (this.videoPlaceholderNode) {
            this.videoPlaceholderNode.active = !play;
        }
    }
}


