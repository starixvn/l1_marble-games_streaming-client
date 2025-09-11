import { _decorator, AudioSource, Component } from 'cc';
import Observer from 'observer';
import { CommentatorVoiceStore, Voice } from '../commentators-voices/commentator-voice-store';
import { AudioStore } from './audio-store';
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
    }), {
        fireImmediately: false
    })
    syncMuted({ muted }: { muted: boolean }) {
        this.muted = muted;
    }

    @render(CommentatorVoiceStore, (store) => ({
        playingVoice: store.playingVoice,
    }), {
        fireImmediately: false
    })
    syncSfx({ playingVoice }: { playingVoice: Voice }) {
        if (this.muted) {
            return;
        }

        if (!playingVoice) {
            return;
        }

        if (!playingVoice.isLoaded) {
            return;
        }

        if (!playingVoice.audioClip) {
            return;
        }
        this.audioSource.clip = playingVoice.audioClip;
        this.audioSource.playOneShot(playingVoice.audioClip);
    }
}


