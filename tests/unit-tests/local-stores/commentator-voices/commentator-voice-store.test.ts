import { CommentatorVoiceStore, Voice, VoiceConfig } from "../../../../assets/scripts/local-stores/commentators-voices/commentator-voice-store";
import { Store } from "../../../../assets/scripts/store";
import { bundleManager } from "../../../../assets/scripts/asset-loader/bundle-manager";
import { AudioClip } from "cc";


const mockBundleManager = bundleManager as jest.Mocked<typeof bundleManager>;

describe("CommentatorVoiceStore", () => {
    let store: CommentatorVoiceStore;
    let mockStore: Store;
    let mockAudioClip: AudioClip;

    beforeEach(() => {
        // Mock Store
        mockStore = {
            language: "en-US",
            operator: "common"
        } as Store;

        mockAudioClip = {} as AudioClip;
        mockBundleManager.loadResourcesAsset = jest.fn().mockResolvedValue(mockAudioClip);

        store = new CommentatorVoiceStore();
        (store as any).store = mockStore;
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe("constructor", () => {
        it("should initialize with default state", () => {
            // Arrange
            const newStore = new CommentatorVoiceStore();

            // Act & Assert
            expect(newStore.playingVoice).toBeNull();
        });
    });

    describe("loadSingleVoice", () => {
        it("should load a voice and add it to voiceMap", async () => {
            // Arrange
            const voice: Voice = {
                name: "test_voice",
                event: "test",
                duration: 2,
                index: 1,
                isLoaded: false
            };

            // Act
            const result = await store.loadSingleVoice(voice);

            // Assert
            expect(mockBundleManager.loadResourcesAsset).toHaveBeenCalledWith(
                "audios/commentator-voices/common/en-US/test/test_voice",
                AudioClip,
                null
            );
            expect(result.isLoaded).toBe(true);
            expect(result.audioClip).toBe(mockAudioClip);
        });

        it("should throw error when bundle manager returns null", async () => {
            // Arrange
            const voice: Voice = {
                name: "test_voice",
                event: "test",
                duration: 2,
                index: 1,
                isLoaded: false
            };
            mockBundleManager.loadResourcesAsset.mockResolvedValue(null);

            // Act & Assert
            await expect(store.loadSingleVoice(voice)).rejects.toThrow("Failed to load voice: audios/commentator-voices/common/en-US/test/test_voice");
        });

        it("should throw error when bundle manager throws", async () => {
            // Arrange
            const voice: Voice = {
                name: "test_voice",
                event: "test",
                duration: 2,
                index: 1,
                isLoaded: false
            };
            const error = new Error("Bundle manager error");
            mockBundleManager.loadResourcesAsset.mockRejectedValue(error);

            // Act & Assert
            await expect(store.loadSingleVoice(voice)).rejects.toThrow("Bundle manager error");
        });
    });

    describe("initSingleVoice", () => {
        it("should initialize a voice and add it to voiceMap", async () => {
            // Arrange
            const voice: Voice = {
                name: "test_voice",
                event: "test",
                duration: 2,
                index: 1,
                isLoaded: true,
                audioClip: mockAudioClip
            };

            // Act
            const result = await store.initSingleVoice(voice);

            // Assert
            expect(result.name).toBe("test_voice");
            expect(result.isLoaded).toBe(false);
            expect(result.audioClip).toBeUndefined();
        });
    });

    describe("initVoices", () => {
        it("should initialize voices from config", () => {
            // Arrange
            const config: VoiceConfig = {
                "test": {
                    "2": 1
                }
            };

            // Act
            store.initVoices(config);

            // Assert
            expect((store as any).configJson).toBe(JSON.stringify(config));
        });

        it("should not reinitialize if config is the same", () => {
            // Arrange
            const config: VoiceConfig = {
                "test": {
                    "2": 1
                }
            };
            store.initVoices(config);
            const originalConfigJson = (store as any).configJson;

            // Act
            store.initVoices(config);

            // Assert
            expect((store as any).configJson).toBe(originalConfigJson);
        });
    });

    describe("loadVoices", () => {
        it("should load all voices from config", async () => {
            // Arrange
            const config: VoiceConfig = {
                "test": {
                    "2": 1
                }
            };

            // Act
            await store.loadVoices(config);

            // Assert
            expect(mockBundleManager.loadResourcesAsset).toHaveBeenCalledWith(
                "audios/commentator-voices/common/en-US/test/test_2_1",
                AudioClip,
                null
            );
            expect((store as any).configJson).toBe(JSON.stringify(config));
        });

        it("should not reload if config is the same", async () => {
            // Arrange
            const config: VoiceConfig = {
                "test": {
                    "2": 1
                }
            };
            await store.loadVoices(config);
            jest.clearAllMocks();

            // Act
            await store.loadVoices(config);

            // Assert
            expect(mockBundleManager.loadResourcesAsset).not.toHaveBeenCalled();
        });
    });

    describe("playVoice", () => {
        it("should set playingVoice when voice is loaded", () => {
            // Arrange
            const voice: Voice = {
                name: "test_voice",
                event: "test",
                duration: 2,
                index: 1,
                isLoaded: true,
                audioClip: mockAudioClip
            };
            (store as any).voiceMap.set("test_voice", voice);

            // Act
            store.playVoice("test_voice");

            // Assert
            expect(store.playingVoice).toStrictEqual(voice);
        });

        it("should load and set playingVoice when voice is not loaded", async () => {
            // Arrange
            const voice: Voice = {
                name: "test_voice",
                event: "test",
                duration: 2,
                index: 1,
                isLoaded: false
            };
            (store as any).voiceMap.set("test_voice", voice);

            // Act
            store.playVoice("test_voice");

            // Assert
            expect(mockBundleManager.loadResourcesAsset).toHaveBeenCalled();
        });

        it("should do nothing when voice is not found", () => {
            // Arrange
            const originalPlayingVoice = store.playingVoice;

            // Act
            store.playVoice("nonexistent_voice");

            // Assert
            expect(store.playingVoice).toBe(originalPlayingVoice);
        });
    });
});
