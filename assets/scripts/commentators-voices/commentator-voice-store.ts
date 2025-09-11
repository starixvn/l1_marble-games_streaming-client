import { AudioClip, error } from "cc";
import { bundleManager } from "../asset-loader/bundle-manager";
import { injectable } from "inversify";
import { store } from "../store-decorator";
import mobx from "mobx";

export interface VoiceConfig {
    [key: string]: {
        [key: string]: number;
    };
}

const CONFIG = {
    "draw4": {
        "2": 3,
        "3": 4,
        "4": 2
    },
    "lastGoal": {
        "2": 4,
        "3": 3
    },
    "draw3": {
        "2": 4,
        "3": 5,
        "4": 1
    },
    "draw2": {
        "2": 6,
        "3": 3,
        "4": 1
    },
    "draw1": {
        "1": 2,
        "2": 2,
        "3": 5,
        "4": 1
    },
    "fastGoal": {
        "2": 1,
        "3": 4,
        "4": 1
    },
    "goal5th": {
        "2": 4,
        "3": 2,
        "4": 1
    },
    "goal4th": {
        "2": 4,
        "3": 4,
        "4": 1
    },
    "goal3rd": {
        "2": 3,
        "3": 3,
        "4": 4
    },
    "goal2nd": {
        "2": 3,
        "3": 3,
        "4": 1
    },
    "firstGoal": {
        "1": 1,
        "2": 6,
        "3": 1
    },
    "goal": {
        "1": 4,
        "2": 12,
        "3": 4,
        "4": 1
    },
    "noGoal": {
        "2": 6,
        "3": 4,
        "4": 1
    },
    "save": {
        "1": 1,
        "2": 10,
        "3": 5,
        "4": 2
    }
}

export interface Voice {
    name: string;
    event: string;
    duration: number;
    index: number;
    isLoaded: boolean;
    audioClip?: AudioClip;
}

function getAllVoices(config: VoiceConfig = CONFIG) {
    const voices = new Set<Voice>();
    for (const event in config) {
        for (const duration in config[event]) {
            for (let index = 1; index <= config[event][duration]; index++) {
                voices.add({ name: `${event}_${duration}_${index}`, event, duration: parseInt(duration), index, isLoaded: false });
            }
        }
    }
    return voices;
}

async function loadVoice({ voice, language = "en", operator = "common" }: { voice: Voice , language: string, operator: string }) {
    const voicePath = `audios/commentator-voices/${operator}/${language}/${voice.event}/${voice.name}`;
    
    try {
        const audioClip = await bundleManager.loadResourcesAsset(voicePath, AudioClip, null);
        if (audioClip) {
            return {
                ...voice,
                isLoaded: true,
                audioClip: audioClip
            };
        } else {
            error(`Failed to load voice: ${voicePath} - returned null`);
            throw new Error(`Failed to load voice: ${voicePath}`);
        }
    } catch (error) {
        error(`Error loading voice: ${voicePath}`, error);
        throw error;
    }
}

@injectable()
@store("CommentatorVoiceStore")
export class CommentatorVoiceStore {
    constructor() {
        mobx.makeAutoObservable(this);
    }
    private configJson = "";
    private voices = getAllVoices();
    private readonly voiceMap = new Map<string, Voice>();

    playingVoice: Voice | null = null;
   
    async loadSingleVoice(voice: Voice) {
        const voiceResult = await loadVoice({ voice, language: "en", operator: "common" });
        this.voiceMap.set(voice.name, voiceResult as Voice);
        return voiceResult;
    }

    async initSingleVoice(voice: Voice) {
        const initializedVoice = {
            ...voice,
            isLoaded: false,
            audioClip: undefined,
        }
        this.voiceMap.set(voice.name, initializedVoice);
        return initializedVoice;
    }

    initVoices(config: VoiceConfig = CONFIG) {
        const updatedConfigJSON = JSON.stringify(config);
        if (this.configJson === updatedConfigJSON) {
            return;
        }
        this.configJson = updatedConfigJSON;
        this.voices = getAllVoices(config);
        const voicesArray = Array.from(this.voices);
        voicesArray.forEach(voice => this.initSingleVoice(voice));
    }

    async loadVoices(config: VoiceConfig = CONFIG) { 
        const updatedConfigJSON = JSON.stringify(config);
        if (this.configJson === updatedConfigJSON) {
            return;
        }
        this.configJson = updatedConfigJSON;
        this.voices = getAllVoices(config);
        const voicesArray = Array.from(this.voices);
        await Promise.all(voicesArray.map(voice => this.loadSingleVoice(voice)));
    }

    playVoice(voice: string) {
        const voiceToPlay = this.voiceMap.get(voice)
        if (!voiceToPlay) {
            return;
        }
        if (voiceToPlay.isLoaded) {
            this.playingVoice = voiceToPlay;
        } else {
            this.loadSingleVoice(voiceToPlay)
                .then((voice) => {
                    this.playingVoice = voice as Voice;
                });
        }
    }
}