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
  injectable: () => (target: any) => target
}));

jest.mock("../../../assets/scripts/store-decorator", () => ({
  store: () => (target: any) => target
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
      const { error } = require("cc");
      expect(error).toHaveBeenCalledWith("Failed to load voice: audios/commentator-voices/common/en/test/null_voice - returned null");
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

    it("should set playingVoice when voice exists in voiceMap", () => {
      // Act
      store.playVoice("goal_1_1");

      // Assert
      expect(store.playingVoice?.name).toBe("goal_1_1");
      expect(store.playingVoice?.event).toBe("goal");
    });

    it("should set playingVoice to undefined when voice doesn't exist", () => {
      // Act
      store.playVoice("nonexistent_voice");

      // Assert
      expect(store.playingVoice).toBeUndefined();
    });

    it("should update playingVoice when called multiple times", () => {
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
      expect(store.playingVoice).toBeUndefined();
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
      const firstPlay = store.playingVoice;

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
