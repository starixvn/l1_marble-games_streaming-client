import { AudioClip } from "cc";
import { inject, injectable } from "inversify";
import { bundleManager } from "../../asset-loader/bundle-manager";
import mobx from "mobx";
import { store } from "../../store-decorator";
import { AudioStore } from "../audio/audio-store";
import { VisibilityStore } from "../visibility/visibility-store";

export async function loadSfx(sfx: string) {
    const audioClip = await bundleManager.loadResourcesAsset(sfx, AudioClip, null);
    
    if (audioClip) {
        return audioClip;
    } else {
        throw new Error(`Failed to load sfx: ${sfx}`);
    }
}


@injectable()
@store("SfxStore")
export class SfxStore {

    @inject(AudioStore)
    audioStore: AudioStore;

    @inject(VisibilityStore)
    visibilityStore: VisibilityStore;

    constructor() {
        mobx.makeAutoObservable(this);
    }

    sfxCache = new Map<string, AudioClip>();
    playingSfx: AudioClip[] = [];

    async loadSfx(sfx: string) {
        const audioClip = await loadSfx(sfx) as AudioClip;
        this.sfxCache.set(sfx, audioClip);
        return audioClip;
    }

    async playSfx(sfx: string | string[]) {
        if (this.audioStore.muted || this.audioStore.browserBlocked || !this.visibilityStore.isVisible) {
            return;
        }

        if (Array.isArray(sfx)) {
            this.playingSfx = await Promise.all(sfx.map(this.playOneSfx.bind(this)));
        } else {
            this.playingSfx = [await this.playOneSfx(sfx)];
        }
    }

    private async playOneSfx(sfx: string) {
        let audioClip = this.sfxCache.get(sfx);
        if (!audioClip) {
            audioClip = await this.loadSfx(sfx);
        }
        return audioClip;
    }

}