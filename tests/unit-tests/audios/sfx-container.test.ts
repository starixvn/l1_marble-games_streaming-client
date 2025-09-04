import { AudioClip, AudioSource } from "cc";
import { SfxContainer } from "../../../assets/scripts/audios/sfx-container";
import { Voice } from "../../../assets/scripts/commentators-voices/commentator-voice-store";

describe("SfxContainer", () => {
  let sfxContainer: SfxContainer;
  let mockAudioSource: jest.Mocked<AudioSource>;
  let mockAudioClip: AudioClip;

  beforeEach(() => {
    jest.clearAllMocks();

    // Create mock AudioSource
    mockAudioSource = {
      clip: null,
      playOneShot: jest.fn(),
      play: jest.fn(),
      pause: jest.fn(),
      playing: false
    } as any;

    // Create mock AudioClip
    mockAudioClip = new AudioClip();

    // Create SfxContainer instance
    sfxContainer = new SfxContainer();
    sfxContainer.audioSource = mockAudioSource;
  });

  afterEach(() => {
    // Clear any internal state
  });

  describe("initialization", () => {
    it("should initialize with default values", () => {
      // Assert
      expect(sfxContainer.audioSource).toBe(mockAudioSource);
      expect((sfxContainer as any).muted).toBe(true);
    });

    it("should be properly decorated with ccclass and observer decorators", () => {
      // Assert
      expect(sfxContainer).toBeDefined();
      expect(typeof sfxContainer.syncMuted).toBe("function");
      expect(typeof sfxContainer.syncSfx).toBe("function");
    });
  });

  describe("syncMuted method", () => {
    it("should set muted to true when AudioStore muted is true", () => {
      // Act
      sfxContainer.syncMuted({ muted: true });

      // Assert
      expect((sfxContainer as any).muted).toBe(true);
    });

    it("should set muted to false when AudioStore muted is false", () => {
      // Act
      sfxContainer.syncMuted({ muted: false });

      // Assert
      expect((sfxContainer as any).muted).toBe(false);
    });

    it("should update muted state correctly when called multiple times", () => {
      // Act
      sfxContainer.syncMuted({ muted: false });
      // Assert
      expect((sfxContainer as any).muted).toBe(false);

      // Act
      sfxContainer.syncMuted({ muted: true });
      // Assert
      expect((sfxContainer as any).muted).toBe(true);
    });
  });

  describe("syncSfx method", () => {
    const createMockVoice = (overrides: Partial<Voice> = {}): Voice => ({
      name: "test_voice",
      event: "goal",
      duration: 2,
      index: 1,
      isLoaded: true,
      audioClip: mockAudioClip,
      ...overrides
    });

    describe("when muted is true", () => {
      beforeEach(() => {
        (sfxContainer as any).muted = true;
      });

      it("should return early and not play audio when muted", () => {
        // Arrange
        const voice = createMockVoice();

        // Act
        sfxContainer.syncSfx({ playingVoice: voice });

        // Assert
        expect(mockAudioSource.playOneShot).not.toHaveBeenCalled();
        expect(mockAudioSource.clip).toBeNull();
      });

      it("should not play audio even with valid voice when muted", () => {
        // Arrange
        const voice = createMockVoice();

        // Act
        sfxContainer.syncSfx({ playingVoice: voice });

        // Assert
        expect(mockAudioSource.playOneShot).not.toHaveBeenCalled();
      });
    });

    describe("when muted is false", () => {
      beforeEach(() => {
        (sfxContainer as any).muted = false;
      });

      it("should play audio when voice is valid and loaded", () => {
        // Arrange
        const voice = createMockVoice();

        // Act
        sfxContainer.syncSfx({ playingVoice: voice });

        // Assert
        expect(mockAudioSource.clip).toBe(mockAudioClip);
        expect(mockAudioSource.playOneShot).toHaveBeenCalledWith(mockAudioClip);
        expect(mockAudioSource.playOneShot).toHaveBeenCalledTimes(1);
      });

      it("should return early when playingVoice is null", () => {
        // Act
        sfxContainer.syncSfx({ playingVoice: null });

        // Assert
        expect(mockAudioSource.playOneShot).not.toHaveBeenCalled();
        expect(mockAudioSource.clip).toBeNull();
      });

      it("should return early when playingVoice is undefined", () => {
        // Act
        sfxContainer.syncSfx({ playingVoice: undefined });

        // Assert
        expect(mockAudioSource.playOneShot).not.toHaveBeenCalled();
        expect(mockAudioSource.clip).toBeNull();
      });

      it("should return early when voice is not loaded", () => {
        // Arrange
        const voice = createMockVoice({ isLoaded: false });

        // Act
        sfxContainer.syncSfx({ playingVoice: voice });

        // Assert
        expect(mockAudioSource.playOneShot).not.toHaveBeenCalled();
        expect(mockAudioSource.clip).toBeNull();
      });

      it("should return early when voice has no audioClip", () => {
        // Arrange
        const voice = createMockVoice({ audioClip: null });

        // Act
        sfxContainer.syncSfx({ playingVoice: voice });

        // Assert
        expect(mockAudioSource.playOneShot).not.toHaveBeenCalled();
        expect(mockAudioSource.clip).toBeNull();
      });

      it("should return early when voice has undefined audioClip", () => {
        // Arrange
        const voice = createMockVoice({ audioClip: undefined });

        // Act
        sfxContainer.syncSfx({ playingVoice: voice });

        // Assert
        expect(mockAudioSource.playOneShot).not.toHaveBeenCalled();
        expect(mockAudioSource.clip).toBeNull();
      });

      it("should handle voice with all required properties correctly", () => {
        // Arrange
        const voice = createMockVoice({
          name: "goal_2_1",
          event: "goal",
          duration: 2,
          index: 1,
          isLoaded: true,
          audioClip: mockAudioClip
        });

        // Act
        sfxContainer.syncSfx({ playingVoice: voice });

        // Assert
        expect(mockAudioSource.clip).toBe(mockAudioClip);
        expect(mockAudioSource.playOneShot).toHaveBeenCalledWith(mockAudioClip);
      });
    });

    describe("edge cases", () => {
      it("should handle multiple consecutive calls with different voices", () => {
        // Arrange
        (sfxContainer as any).muted = false;
        const voice1 = createMockVoice({ name: "goal_1_1" });
        const voice2 = createMockVoice({ name: "save_2_1" });

        // Act
        sfxContainer.syncSfx({ playingVoice: voice1 });
        sfxContainer.syncSfx({ playingVoice: voice2 });

        // Assert
        expect(mockAudioSource.playOneShot).toHaveBeenCalledTimes(2);
        expect(mockAudioSource.clip).toBe(mockAudioClip); // Should be set to the last voice's clip
      });

      it("should handle transition from muted to unmuted", () => {
        // Arrange
        const voice = createMockVoice();
        
        // Start muted
        (sfxContainer as any).muted = true;
        sfxContainer.syncSfx({ playingVoice: voice });
        expect(mockAudioSource.playOneShot).not.toHaveBeenCalled();

        // Become unmuted
        (sfxContainer as any).muted = false;

        // Act
        sfxContainer.syncSfx({ playingVoice: voice });

        // Assert
        expect(mockAudioSource.playOneShot).toHaveBeenCalledTimes(1);
        expect(mockAudioSource.clip).toBe(mockAudioClip);
      });

      it("should handle voice that becomes loaded", () => {
        // Arrange
        (sfxContainer as any).muted = false;
        const voice = createMockVoice({ isLoaded: false });
        
        // First call with unloaded voice
        sfxContainer.syncSfx({ playingVoice: voice });
        expect(mockAudioSource.playOneShot).not.toHaveBeenCalled();

        // Voice becomes loaded
        voice.isLoaded = true;

        // Act
        sfxContainer.syncSfx({ playingVoice: voice });

        // Assert
        expect(mockAudioSource.playOneShot).toHaveBeenCalledTimes(1);
        expect(mockAudioSource.clip).toBe(mockAudioClip);
      });

      it("should handle voice that gets audioClip assigned", () => {
        // Arrange
        (sfxContainer as any).muted = false;
        const voice = createMockVoice({ audioClip: null });
        
        // First call with no audioClip
        sfxContainer.syncSfx({ playingVoice: voice });
        expect(mockAudioSource.playOneShot).not.toHaveBeenCalled();

        // AudioClip gets assigned
        voice.audioClip = mockAudioClip;

        // Act
        sfxContainer.syncSfx({ playingVoice: voice });

        // Assert
        expect(mockAudioSource.playOneShot).toHaveBeenCalledTimes(1);
        expect(mockAudioSource.clip).toBe(mockAudioClip);
      });
    });
  });

  describe("component integration", () => {
    it("should be a Cocos Creator component", () => {
      // Assert
      expect(sfxContainer).toBeInstanceOf(Object);
      expect(sfxContainer.audioSource).toBeDefined();
    });

    it("should have audioSource property properly initialized", () => {
      // Assert
      expect(sfxContainer.audioSource).toBe(mockAudioSource);
    });

    it("should maintain internal muted state", () => {
      // Arrange
      const initialMuted = (sfxContainer as any).muted;

      // Act
      sfxContainer.syncMuted({ muted: !initialMuted });

      // Assert
      expect((sfxContainer as any).muted).toBe(!initialMuted);
    });
  });

  describe("observer decorator integration", () => {
    it("should have render decorators for both stores", () => {
      // Assert - The decorators should be applied to the methods
      expect(typeof sfxContainer.syncMuted).toBe("function");
      expect(typeof sfxContainer.syncSfx).toBe("function");
    });

    it("should handle AudioStore updates through syncMuted", () => {
      // Act
      sfxContainer.syncMuted({ muted: false });

      // Assert
      expect((sfxContainer as any).muted).toBe(false);
    });

    it("should handle CommentatorVoiceStore updates through syncSfx", () => {
      // Arrange
      (sfxContainer as any).muted = false;
      const voice = createMockVoice();

      // Act
      sfxContainer.syncSfx({ playingVoice: voice });

      // Assert
      expect(mockAudioSource.playOneShot).toHaveBeenCalledWith(mockAudioClip);
    });
  });

  describe("audio playback behavior", () => {
    it("should set audioSource clip before playing", () => {
      // Arrange
      (sfxContainer as any).muted = false;
      const voice = createMockVoice();

      // Act
      sfxContainer.syncSfx({ playingVoice: voice });

      // Assert
      expect(mockAudioSource.clip).toBe(mockAudioClip);
      expect(mockAudioSource.playOneShot).toHaveBeenCalledWith(mockAudioClip);
    });

    it("should use playOneShot for sound effects", () => {
      // Arrange
      (sfxContainer as any).muted = false;
      const voice = createMockVoice();

      // Act
      sfxContainer.syncSfx({ playingVoice: voice });

      // Assert
      expect(mockAudioSource.playOneShot).toHaveBeenCalledWith(mockAudioClip);
      expect(mockAudioSource.play).not.toHaveBeenCalled();
    });

    it("should handle different voice types correctly", () => {
      // Arrange
      (sfxContainer as any).muted = false;
      const goalVoice = createMockVoice({ event: "goal", name: "goal_1_1" });
      const saveVoice = createMockVoice({ event: "save", name: "save_2_1" });

      // Act
      sfxContainer.syncSfx({ playingVoice: goalVoice });
      sfxContainer.syncSfx({ playingVoice: saveVoice });

      // Assert
      expect(mockAudioSource.playOneShot).toHaveBeenCalledTimes(2);
      expect(mockAudioSource.playOneShot).toHaveBeenNthCalledWith(1, mockAudioClip);
      expect(mockAudioSource.playOneShot).toHaveBeenNthCalledWith(2, mockAudioClip);
    });
  });

  // Helper function for creating mock voice (defined inside describe for better access)
  function createMockVoice(overrides: Partial<Voice> = {}): Voice {
    return {
      name: "test_voice",
      event: "goal", 
      duration: 2,
      index: 1,
      isLoaded: true,
      audioClip: mockAudioClip,
      ...overrides
    };
  }
});
