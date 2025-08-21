import { _decorator, Component, SpriteFrame } from 'cc';
import { DOMBackgroundVideo, GenericBackgroundVideoEvents } from '../video-player/dom-background-video';
const { ccclass, property } = _decorator;

@ccclass('BackgroundLoader')
export class BackgroundLoader extends Component {

    @property(SpriteFrame)
    public backgroundSprite: SpriteFrame = null;

    protected onLoad(): void {
        if (!this.backgroundSprite) {
            return;
        }
        const bgUrl = (this.backgroundSprite.texture as any).image._nativeData.currentSrc;

        DOMBackgroundVideo.notify(GenericBackgroundVideoEvents.SWITCH_BACKGROUND, {
            url: bgUrl,
        });
    }
}


