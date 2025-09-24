import { _decorator, AudioClip, AudioSource, Component } from 'cc';
import Observer from 'observer';
import { AudioStore } from '../../local-stores/audio/audio-store';
import { SfxStore } from '../../local-stores/sfx/sfx-store';
const { ccclass, property } = _decorator;

const { observer, render } = Observer;

@ccclass('SfxContainer')
@observer
export class SfxContainer extends Component {

    @property(AudioSource)
    audioSource: AudioSource = null;

    private muted = false;

    @render(AudioStore, (store) => ({
        muted: store.muted,
        browserBlocked: store.browserBlocked,
    }), {
        fireImmediately: false
    })
    syncMuted({ muted, browserBlocked }: { muted: boolean, browserBlocked: boolean }) {
        this.muted = muted || browserBlocked;
    }

    
    @render(SfxStore, (store) => ({
        playingSfx: store.playingSfx,
    }), {
        fireImmediately: false
    })
    syncSfx({ playingSfx }: { playingSfx: AudioClip[] }) {
        
        if (this.muted) {
            return;
        }

        playingSfx.forEach(sfx => {
            this.audioSource.clip = sfx;
            this.audioSource.playOneShot(sfx);
        });
    }
}


