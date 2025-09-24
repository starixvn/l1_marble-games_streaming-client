import { _decorator, AudioSource, Component } from 'cc';
import Observer from 'observer';
import { CommentatorVoiceStore, Voice } from '../local-stores/commentators-voices/commentator-voice-store';
import { AudioStore } from './audio-store';
import { type CommentatorVoiceData, CommentatorVoiceStore as FeatureCommentatorVoiceStore} from '../features/commentator-voice/commentator-voice-store';
const { ccclass, property } = _decorator;

const { observer, render, handle } = Observer;

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

    @render(FeatureCommentatorVoiceStore, (store) => store.data, {
        fireImmediately: false
    })
    syncPlayingVoice(data: CommentatorVoiceData) {
        this.playVoice(data.fileName);
    }

    @render(CommentatorVoiceStore, (store) => ({
        playingVoice: store.playingVoice,
    }), {
        fireImmediately: false
    })
    syncSfx({ playingVoice }: { playingVoice: Voice }) {
        console.log(`syncSfx: ${JSON.stringify(playingVoice.name)}`)
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

    @handle(CommentatorVoiceStore, (store, voice: string) => store.playVoice(voice))
    playVoice(voice: string) {
        return voice;
    }
}


