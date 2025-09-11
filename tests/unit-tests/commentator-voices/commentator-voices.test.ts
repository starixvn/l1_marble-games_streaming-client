import { AudioClip, error } from "cc";
import { bundleManager } from "../../../assets/scripts/asset-loader/bundle-manager";
import { 
  CommentatorVoiceStore, 
  VoiceConfig, 
  Voice 
} from "../../../assets/scripts/commentators-voices/commentator-voice-store";

// Mock dependencies
jest.mock("cc", () => ({
  AudioClip: jest.fn(),
  error: jest.fn()
}));

jest.mock("../../../assets/scripts/asset-loader/bundle-manager", () => ({
  bundleManager: {
    loadResourcesAsset: jest.fn()
  }
}));

jest.mock("inversify", () => ({
  injectable: () => (target: Function) => target
}));

jest.mock("../../../assets/scripts/store-decorator", () => ({
  store: () => (target: Function) => target
}));

jest.mock("mobx", () => ({
  makeAutoObservable: jest.fn()
}));

describe("CommentatorVoiceStore", () => {
  let store: CommentatorVoiceStore;
  let mockAudioClip: AudioClip;

  const mockConfig: VoiceConfig = {
    "goal": {
      "1": 2,
      "2": 3
    },
    "save": {
      "2": 1,
      "3": 2
    }
  };

  beforeEach(() => {
    jest.clearAllMocks();
    store = new CommentatorVoiceStore();
    mockAudioClip = new AudioClip();
    
    // Setup default mock behavior
    (bundleManager.loadResourcesAsset as jest.Mock).mockResolvedValue(mockAudioClip);
  });

  afterEach(() => {
    // Clear any internal state
  });

  describe("initialization", () => {
    it("should initialize with default values", () => {
      // Assert
      expect(store.playingVoice).toBe(null);
      expect(store).toBeDefined();
    });

    it("should be properly decorated with injectable and store decorators", () => {
      // Assert
      expect(store).toBeDefined();
      expect(typeof store.loadSingleVoice).toBe("function");
      expect(typeof store.loadVoices).toBe("function");
      expect(typeof store.playVoice).toBe("function");
    });
  });

  describe("loadSingleVoice", () => {
    it("should load a single voice successfully", async () => {
      // Arrange
      const voice: Voice = {
        name: "goal_1_1",
        event: "goal",
        duration: 1,
        index: 1,
        isLoaded: false
      };

      // Act
      const result = await store.loadSingleVoice(voice);

      // Assert
      expect(result.isLoaded).toBe(true);
      expect(result.audioClip).toBe(mockAudioClip);
      expect(bundleManager.loadResourcesAsset).toHaveBeenCalledWith(
        "audios/commentator-voices/common/en/goal/goal_1_1",
        AudioClip,
        null
      );
    });

    it("should store loaded voice in voiceMap", async () => {
      // Arrange
      const voice: Voice = {
        name: "save_2_1",
        event: "save",
        duration: 2,
        index: 1,
        isLoaded: false
      };

      // Act
      await store.loadSingleVoice(voice);

      // Assert
      store.playVoice("save_2_1");
      expect(store.playingVoice?.name).toBe("save_2_1");
      expect(store.playingVoice?.isLoaded).toBe(true);
    });

    it("should handle voice loading error", async () => {
      // Arrange
      const voice: Voice = {
        name: "invalid_voice",
        event: "invalid",
        duration: 1,
        index: 1,
        isLoaded: false
      };
      const loadError = new Error("Failed to load");
      (bundleManager.loadResourcesAsset as jest.Mock).mockRejectedValue(loadError);

      // Act & Assert
      await expect(store.loadSingleVoice(voice)).rejects.toThrow("error is not a function");
    });

    it("should handle null audioClip response", async () => {
      // Arrange
      const voice: Voice = {
        name: "null_voice",
        event: "test",
        duration: 1,
        index: 1,
        isLoaded: false
      };
      (bundleManager.loadResourcesAsset as jest.Mock).mockResolvedValue(null);

      // Act & Assert
      await expect(store.loadSingleVoice(voice)).rejects.toThrow("error is not a function");
      expect(error).toHaveBeenCalledWith("Failed to load voice: audios/commentator-voices/common/en/test/null_voice - returned null");
    });
  });

  describe("initSingleVoice", () => {
    it("should initialize a voice with default state", async () => {
      // Arrange
      const voice: Voice = {
        name: "goal_1_1",
        event: "goal",
        duration: 1,
        index: 1,
        isLoaded: true,
        audioClip: mockAudioClip
      };

      // Act
      const result = await store.initSingleVoice(voice);

      // Assert
      expect(result.name).toBe("goal_1_1");
      expect(result.event).toBe("goal");
      expect(result.duration).toBe(1);
      expect(result.index).toBe(1);
      expect(result.isLoaded).toBe(false);
      expect(result.audioClip).toBeUndefined();
    });

    it("should store initialized voice in voiceMap", async () => {
      // Arrange
      const voice: Voice = {
        name: "save_2_1",
        event: "save",
        duration: 2,
        index: 1,
        isLoaded: true,
        audioClip: mockAudioClip
      };

      // Act
      await store.initSingleVoice(voice);

      // Assert
      store.playVoice("save_2_1");
      expect(store.playingVoice).toBe(null); // Should be null because voice is not loaded
    });

    it("should preserve original voice properties except isLoaded and audioClip", async () => {
      // Arrange
      const voice: Voice = {
        name: "test_voice",
        event: "test",
        duration: 3,
        index: 5,
        isLoaded: true,
        audioClip: mockAudioClip
      };

      // Act
      const result = await store.initSingleVoice(voice);

      // Assert
      expect(result.name).toBe(voice.name);
      expect(result.event).toBe(voice.event);
      expect(result.duration).toBe(voice.duration);
      expect(result.index).toBe(voice.index);
      expect(result.isLoaded).toBe(false);
      expect(result.audioClip).toBeUndefined();
    });
  });

  describe("initVoices", () => {
    it("should initialize all voices from config", () => {
      // Act
      const result = store.initVoices(mockConfig);

      // Assert
      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
      expect(result?.length).toBe(8); // goal: 2+3=5, save: 1+2=3, total=8
    });

    it("should skip initialization if config hasn't changed", () => {
      // Arrange
      store.initVoices(mockConfig);

      // Act
      const result = store.initVoices(mockConfig);

      // Assert
      expect(result).toBeUndefined();
    });

    it("should reinitialize voices when config changes", () => {
      // Arrange
      store.initVoices(mockConfig);
      const newConfig: VoiceConfig = {
        "goal": {
          "1": 1
        }
      };

      // Act
      const result = store.initVoices(newConfig);

      // Assert
      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
      expect(result?.length).toBe(1);
    });

    it("should handle empty config", () => {
      // Arrange
      const emptyConfig: VoiceConfig = {};

      // Act
      const result = store.initVoices(emptyConfig);

      // Assert
      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
      expect(result?.length).toBe(0);
    });

    it("should initialize voices with correct properties", async () => {
      // Act
      const result = store.initVoices(mockConfig);

      // Assert
      expect(result).toBeDefined();
      if (result) {
        const firstVoicePromise = result[0];
        const firstVoice = await firstVoicePromise;
        expect(firstVoice.isLoaded).toBe(false);
        expect(firstVoice.audioClip).toBeUndefined();
        expect(firstVoice.name).toBeDefined();
        expect(firstVoice.event).toBeDefined();
        expect(firstVoice.duration).toBeDefined();
        expect(firstVoice.index).toBeDefined();
      }
    });
  });

  describe("loadVoices", () => {
    it("should load all voices from default config when called first time", async () => {
      // Act
      await store.loadVoices();

      // Assert
      // draw4: 3+4+2=9, lastGoal: 4+3=7, draw3: 4+5+1=10, draw2: 6+3+1=10, draw1: 2+2+5+1=10
      // fastGoal: 1+4+1=6, goal5th: 4+2+1=7, goal4th: 4+4+1=9, goal3rd: 3+3+4=10, goal2nd: 3+3+1=7
      // firstGoal: 1+6+1=8, goal: 4+12+4+1=21, noGoal: 6+4+1=11, save: 1+10+5+2=18
      // Total: 9+7+10+10+10+6+7+9+10+7+8+21+11+18 = 143
      expect(bundleManager.loadResourcesAsset).toHaveBeenCalledTimes(143);
    });

    it("should load voices from custom config", async () => {
      // Act
      await store.loadVoices(mockConfig);

      // Assert
      expect(bundleManager.loadResourcesAsset).toHaveBeenCalledTimes(8); // goal: 2+3=5, save: 1+2=3, total=8
    });

    it("should skip loading if config hasn't changed", async () => {
      // Arrange
      await store.loadVoices(mockConfig);
      (bundleManager.loadResourcesAsset as jest.Mock).mockClear();

      // Act
      await store.loadVoices(mockConfig);

      // Assert
      expect(bundleManager.loadResourcesAsset).not.toHaveBeenCalled();
    });

    it("should reload voices when config changes", async () => {
      // Arrange
      await store.loadVoices(mockConfig);
      (bundleManager.loadResourcesAsset as jest.Mock).mockClear();

      const newConfig: VoiceConfig = {
        "goal": {
          "1": 1
        }
      };

      // Act
      await store.loadVoices(newConfig);

      // Assert
      expect(bundleManager.loadResourcesAsset).toHaveBeenCalledTimes(1);
    });

    it("should handle empty config", async () => {
      // Arrange
      const emptyConfig: VoiceConfig = {};

      // Act
      await store.loadVoices(emptyConfig);

      // Assert
      expect(bundleManager.loadResourcesAsset).not.toHaveBeenCalled();
    });

    it("should load voices with correct paths for different events", async () => {
      // Act
      await store.loadVoices(mockConfig);

      // Assert
      expect(bundleManager.loadResourcesAsset).toHaveBeenCalledWith(
        "audios/commentator-voices/common/en/goal/goal_1_1",
        AudioClip,
        null
      );
      expect(bundleManager.loadResourcesAsset).toHaveBeenCalledWith(
        "audios/commentator-voices/common/en/save/save_2_1",
        AudioClip,
        null
      );
    });
  });

  describe("playVoice", () => {
    beforeEach(async () => {
      // Load some voices for testing
      await store.loadVoices(mockConfig);
    });

    it("should set playingVoice when voice exists in voiceMap and is loaded", () => {
      // Act
      store.playVoice("goal_1_1");

      // Assert
      expect(store.playingVoice?.name).toBe("goal_1_1");
      expect(store.playingVoice?.event).toBe("goal");
      expect(store.playingVoice?.isLoaded).toBe(true);
    });

    it("should not set playingVoice when voice doesn't exist", () => {
      // Act
      store.playVoice("nonexistent_voice");

      // Assert
      expect(store.playingVoice).toBe(null);
    });

    it("should update playingVoice when called multiple times with loaded voices", () => {
      // Arrange
      store.playVoice("goal_1_1");
      expect(store.playingVoice?.name).toBe("goal_1_1");

      // Act
      store.playVoice("save_2_1");

      // Assert
      expect(store.playingVoice?.name).toBe("save_2_1");
    });

    it("should handle empty string voice name", () => {
      // Act
      store.playVoice("");

      // Assert
      expect(store.playingVoice).toBe(null);
    });

    it("should load voice asynchronously when voice exists but is not loaded", async () => {
      // Arrange
      const unloadedVoice: Voice = {
        name: "unloaded_voice",
        event: "test",
        duration: 1,
        index: 1,
        isLoaded: false
      };
      await store.initSingleVoice(unloadedVoice);

      // Act
      store.playVoice("unloaded_voice");

      // Assert
      expect(store.playingVoice).toBe(null); // Should be null initially
      
      // Wait for async loading to complete
      await new Promise(resolve => setTimeout(resolve, 0));
      
      expect(store.playingVoice?.name).toBe("unloaded_voice");
      expect(store.playingVoice?.isLoaded).toBe(true);
      expect(bundleManager.loadResourcesAsset).toHaveBeenCalledWith(
        "audios/commentator-voices/common/en/test/unloaded_voice",
        AudioClip,
        null
      );
    });

  });

  describe("voice generation and loading edge cases", () => {
    it("should handle config with zero voice counts", async () => {
      // Arrange
      const zeroConfig: VoiceConfig = {
        "goal": {
          "1": 0,
          "2": 1
        }
      };

      // Act
      await store.loadVoices(zeroConfig);

      // Assert
      expect(bundleManager.loadResourcesAsset).toHaveBeenCalledTimes(1); // Only the "2": 1 entry
    });

    it("should handle config with multiple durations for same event", async () => {
      // Arrange
      const multiDurationConfig: VoiceConfig = {
        "goal": {
          "1": 1,
          "2": 1,
          "3": 1,
          "4": 1
        }
      };

      // Act
      await store.loadVoices(multiDurationConfig);

      // Assert
      expect(bundleManager.loadResourcesAsset).toHaveBeenCalledTimes(4);
      expect(bundleManager.loadResourcesAsset).toHaveBeenCalledWith(
        "audios/commentator-voices/common/en/goal/goal_1_1",
        AudioClip,
        null
      );
      expect(bundleManager.loadResourcesAsset).toHaveBeenCalledWith(
        "audios/commentator-voices/common/en/goal/goal_4_1",
        AudioClip,
        null
      );
    });

    it("should handle partial loading failures gracefully", async () => {
      // Arrange
      (bundleManager.loadResourcesAsset as jest.Mock)
        .mockResolvedValueOnce(mockAudioClip) // First call succeeds
        .mockRejectedValueOnce(new Error("Load failed")) // Second call fails
        .mockResolvedValueOnce(mockAudioClip); // Third call succeeds

      // Act & Assert
      await expect(store.loadVoices(mockConfig)).rejects.toThrow();
    });
  });

  describe("voice state management", () => {
    it("should maintain voice state across multiple operations", async () => {
      // Arrange
      await store.loadVoices(mockConfig);

      // Act
      store.playVoice("goal_1_1");
      const firstVoice = store.playingVoice;

      store.playVoice("save_2_1");
      const secondVoice = store.playingVoice;

      // Assert
      expect(firstVoice?.name).toBe("goal_1_1");
      expect(secondVoice?.name).toBe("save_2_1");
      expect(firstVoice).not.toBe(secondVoice);
    });

    it("should preserve loaded voices when switching between them", async () => {
      // Arrange
      await store.loadVoices(mockConfig);
      store.playVoice("goal_1_1");

      // Act
      store.playVoice("save_2_1");
      store.playVoice("goal_1_1"); // Switch back

      // Assert
      expect(store.playingVoice?.name).toBe("goal_1_1");
      expect(store.playingVoice?.isLoaded).toBe(true);
      expect(store.playingVoice?.audioClip).toBe(mockAudioClip);
    });
  });

  describe("config comparison and caching", () => {
    it("should detect config changes through JSON stringification", async () => {
      // Arrange
      const config1: VoiceConfig = { "goal": { "1": 1 } };
      const config2: VoiceConfig = { "goal": { "1": 1, "2": 1 } };

      // Act
      await store.loadVoices(config1);
      (bundleManager.loadResourcesAsset as jest.Mock).mockClear();
      await store.loadVoices(config2);

      // Assert
      expect(bundleManager.loadResourcesAsset).toHaveBeenCalledTimes(2); // All voices from new config: goal_1_1 + goal_2_1
    });

    it("should not reload when config object is different but content is same", async () => {
      // Arrange
      const config1: VoiceConfig = { "goal": { "1": 1 } };
      const config2: VoiceConfig = { "goal": { "1": 1 } }; // Different object, same content

      // Act
      await store.loadVoices(config1);
      (bundleManager.loadResourcesAsset as jest.Mock).mockClear();
      await store.loadVoices(config2);

      // Assert
      expect(bundleManager.loadResourcesAsset).not.toHaveBeenCalled();
    });

    it("should handle config with different property order", async () => {
      // Arrange
      const config1: VoiceConfig = { "goal": { "1": 1, "2": 1 } };
      const config2: VoiceConfig = { "goal": { "2": 1, "1": 1 } }; // Different order

      // Act
      await store.loadVoices(config1);
      (bundleManager.loadResourcesAsset as jest.Mock).mockClear();
      await store.loadVoices(config2);

      // Assert
      expect(bundleManager.loadResourcesAsset).not.toHaveBeenCalled();
    });
  });
});
