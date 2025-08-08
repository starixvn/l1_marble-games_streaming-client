import { Node } from "./node";

export namespace sp {
    export class AnimationState {
        clip: any;
        name: string;
        length: number;
        wrapMode: any;
        repeatCount: number;
        delay: number;
        duration: number;
        speed: number;
        time: number;
        weight: number;
        frameRate: number;

        constructor() {
            this.clip = {};
            this.name = "";
            this.length = 0;
            this.wrapMode = 0;
            this.repeatCount = 1;
            this.delay = 0;
            this.duration = 0;
            this.speed = 1;
            this.time = 0;
            this.weight = 1;
            this.frameRate = 30;
        }
    }

    export class Skeleton {
        timeScale: number;
        setAnimation = jest.fn();
        addAnimation = jest.fn();
        clearAnimation = jest.fn();
        findAnimation = jest.fn();
        setSkin = jest.fn();
        getCurrent = jest.fn();
        getState = jest.fn().mockReturnValue(new AnimationState());
        get node() {
            return this._node;
        }
        private _node = new Node();
        setMix = jest.fn();
    }

    export class SkeletonData {}
}
