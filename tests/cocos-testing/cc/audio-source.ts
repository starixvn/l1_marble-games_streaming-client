import { AudioClip } from "./audio-clip";
import { Component } from "./component";

export enum AudioState {
    INIT = 0,
    PLAYING = 1,
    PAUSED = 2,
    STOPPED = 3,
    INTERRUPTED = 4,
}

export class AudioSource extends Component {
    static maxAudioChannel = 24;
    static AudioState = AudioState;
    static EventType = {
        STARTED: "started",
        ENDED: "ended",
    };

    protected _clip: AudioClip | null = null;
    protected _player: any = null;
    protected _loop: boolean = false;
    protected _playOnAwake: boolean = false;
    protected _volume: number = 1.0;

    constructor() {
        super();
    }

    set clip(val: AudioClip | null) {
        this._clip = val;
    }

    get clip(): AudioClip | null {
        return this._clip;
    }

    set loop(val: boolean) {
        this._loop = val;
    }

    get loop(): boolean {
        return this._loop;
    }

    set playOnAwake(val: boolean) {
        this._playOnAwake = val;
    }

    get playOnAwake(): boolean {
        return this._playOnAwake;
    }

    set volume(val: number) {
        this._volume = val;
    }

    get volume(): number {
        return this._volume;
    }

    onLoad = jest.fn();
    onEnable = jest.fn();
    onDisable = jest.fn();
    onDestroy = jest.fn();

    getPCMData = jest.fn().mockImplementation((channelIndex: number) => {
        return Promise.resolve(undefined);
    });

    getSampleRate = jest.fn().mockImplementation(() => {
        return Promise.resolve(44100);
    });

    play = jest.fn();
    pause = jest.fn();
    stop = jest.fn();

    playOneShot = jest.fn().mockImplementation((clip: AudioClip, volumeScale: number = 1.0) => {});

    protected _syncStates = jest.fn();

    set currentTime(num: number) {
        // Mock implementation
    }

    get currentTime(): number {
        return 0;
    }

    get duration(): number {
        return this._clip?.duration || 0;
    }

    get state(): AudioState {
        return AudioState.INIT;
    }

    get playing(): boolean {
        return false;
    }
}
