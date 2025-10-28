import { _decorator, Component } from "cc";
import Observer from "observer";
import { type ReplayMeta, type ReplayPayload, ReplayStore } from "../../local-stores/replay/replay-store";
import { FeatureHandler } from "../../feature-handler/feature-handler";
import { IntroData } from "../../features/intro/intro-store";
import { VideoStreamingData } from "../../features/video-streaming/video-streaming-store";
import { GameHandler } from "../../local-stores/game/game-handler";

const { ccclass } = _decorator;
const { observer, render, handle } = Observer;

type ReplayInterceptArgs = {
    key: string;
    value: any;
}

type ReplayInterceptOptions = {
    meta: ReplayMeta;
    time: number;
    now: number;
}

const mapper = {
    "intro": (value: IntroData, options: ReplayInterceptOptions) => {
        return {
            ...value,
            timeToPlay: (options.now + (value.timeToPlay - options.meta.fromTime)),
        }
    },
    "videoStreaming": (value: VideoStreamingData, options: ReplayInterceptOptions) => {
        return {
            ...value,
            timeToStream: (options.now + (value.timeToStream - options.meta.fromTime)),
        }
    },
    "default": (value: any, options: ReplayInterceptOptions) => {
        return value;
    }
}



function intercept(args: ReplayInterceptArgs, options: ReplayInterceptOptions) {
    const mapperKey = mapper[args.key] ?? mapper.default;
    return mapperKey(args.value, options);
}

@ccclass
@observer
export class Replay extends Component {
    @render(ReplayStore, (store) => store.replayData)
    renderReplayData(replayData: ReplayPayload | undefined) {
        if (!replayData) {
            return;
        }

        const now = Date.now();
        this.openGame(replayData.meta.gameId);
        for (const item of replayData.payload) {
            const interceptedPayload = this.interceptEvent(item.payload, replayData.meta, item.time, now)
            this.scheduleOnce(() => {
                this.replayEvent(interceptedPayload)
            }, item.time)
        }
    }

    @handle(FeatureHandler, (handler, payload: Record<string, object>) => handler.update(payload))
    replayEvent(payload: Record<string, object>) {
        return payload;
    }
    
    @handle(GameHandler, (handler, gameId: string) => handler.openGame(gameId))
    openGame(gameId: string) {
        return gameId;
    }

    interceptEvent(payload: Record<string, object>, meta: ReplayMeta | undefined, time: number, now: number) {
        return Object.fromEntries(Object.entries(payload).map(([key, value]) => [key, intercept({ key, value }, { meta, time, now })]));
    }
}