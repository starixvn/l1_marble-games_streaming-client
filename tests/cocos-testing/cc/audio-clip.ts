import { Asset } from "./asset";

export class AudioClip extends Asset {
    protected _nativeAsset: any = null;
    protected _nativeDep: any = null;
    loadMode = 0;
    duration = 0;

    validate = jest.fn().mockReturnValue(true);
    getDuration = jest.fn().mockReturnValue(0);
    setCurrentTime = jest.fn();
    setVolume = jest.fn();
    setLoop = jest.fn();
    play = jest.fn();
    stop = jest.fn();
    playOneShot = jest.fn();
}
