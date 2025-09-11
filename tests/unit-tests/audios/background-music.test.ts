import { AudioSource } from "cc";
import { BackgroundMusic } from "../../../assets/scripts/audios/background-music";
import {
  Phase,
  type EventData,
} from "../../../assets/scripts/streaming/streaming-type";

describe("BackgroundMusic", () => {
  let backgroundMusic: BackgroundMusic;
  let mockAudioSource: jest.Mocked<AudioSource>;

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();

    // Create mock AudioSource
    mockAudioSource = {
      playing: false,
      play: jest.fn(),
      pause: jest.fn(),
    } as any;

    // Create BackgroundMusic instance
    backgroundMusic = new BackgroundMusic();
    backgroundMusic.audioSource = mockAudioSource;
  });

  afterEach(() => {
    jest.clearAllMocks();
    // Cleanup
  });

  describe("initialization", () => {
    it("should initialize with default state", () => {
      // Assert
      expect(backgroundMusic.playing).toBe(false);
      expect(backgroundMusic.muted).toBe(false);
      expect(backgroundMusic.audioSource).toBe(mockAudioSource);
    });
  });

  describe("play method", () => {
    it("should play audio when not muted, playing is true, and audioSource is not playing", () => {
      // Arrange
      (backgroundMusic as any).muted = false;
      (backgroundMusic as any).playing = true;
      (mockAudioSource as any).playing = false;

      // Act
      backgroundMusic.play();

      // Assert
      expect(mockAudioSource.play).toHaveBeenCalledTimes(1);
    });

    it("should not play audio when muted", () => {
      // Arrange
      (backgroundMusic as any).muted = true;
      (backgroundMusic as any).playing = true;
      (mockAudioSource as any).playing = false;

      // Act
      backgroundMusic.play();

      // Assert
      expect(mockAudioSource.play).not.toHaveBeenCalled();
    });

    it("should not play audio when playing is false", () => {
      // Arrange
      (backgroundMusic as any).muted = false;
      (backgroundMusic as any).playing = false;
      (mockAudioSource as any).playing = false;

      // Act
      backgroundMusic.play();

      // Assert
      expect(mockAudioSource.play).not.toHaveBeenCalled();
    });

    it("should not call play audio when audioSource is already playing", () => {
      // Arrange
      (backgroundMusic as any).muted = false;
      (backgroundMusic as any).playing = true;
      (mockAudioSource as any).playing = true;

      // Act
      backgroundMusic.play();

      // Assert
      expect(mockAudioSource.play).not.toHaveBeenCalled();
    });
  });

  describe("pause method", () => {
    it("should pause audio source", () => {
      // Act
      backgroundMusic.pause();

      // Assert
      expect(mockAudioSource.pause).toHaveBeenCalledTimes(1);
    });
  });

  describe("syncMuted method", () => {
    it("should set muted to true when AudioStore muted is true", () => {
      // Arrange
      const audioData = { muted: true, browserBlocked: false };

      // Act
      backgroundMusic["syncMuted"](audioData);

      // Assert
      expect(backgroundMusic.muted).toBe(true);
    });

    it("should set muted to true when AudioStore browserBlocked is true", () => {
      // Arrange
      const audioData = { muted: false, browserBlocked: true };

      // Act
      backgroundMusic["syncMuted"](audioData);

      // Assert
      expect(backgroundMusic.muted).toBe(true);
    });

    it("should set muted to false when both AudioStore muted and browserBlocked are false", () => {
      // Arrange
      const audioData = { muted: false, browserBlocked: false };

      // Act
      backgroundMusic["syncMuted"](audioData);

      // Assert
      expect(backgroundMusic.muted).toBe(false);
    });

    it("should pause audio when muted becomes true", () => {
      // Arrange
      (backgroundMusic as any).muted = false;
      const audioData = { muted: true, browserBlocked: false };

      // Act
      backgroundMusic["syncMuted"](audioData);

      // Assert
      expect(mockAudioSource.pause).toHaveBeenCalledTimes(1);
    });

    it("should call play when muted becomes false and playing is true", () => {
      // Arrange
      (backgroundMusic as any).muted = true;
      (backgroundMusic as any).playing = true;
      const audioData = { muted: false, browserBlocked: false };
      (mockAudioSource as any).playing = false;

      // Act
      backgroundMusic["syncMuted"](audioData);

      // Assert
      expect(mockAudioSource.play).toHaveBeenCalledTimes(1);
    });
  });

  describe("renderEventData method", () => {
    const createEventData = (currentPhase: Phase): EventData => ({
      homeScore: 0,
      awayScore: 0,
      homeTeam: "Home",
      awayTeam: "Away",
      eventId: 1,
      currentEventIndex: 0,
      updatedEventIndex: 0,
      liveScores: ["0:0"],
      goalInfos: [],
      currentPhase,
      eventDetails: [],
      matchLiveTimeMs: 0,
    });

    it("should set playing to true and call play on ScheduleEvent phase", () => {
      // Arrange
      (backgroundMusic as any).playing = false;
      (backgroundMusic as any).muted = false; // Set muted to false so play() will be called
      const eventData = createEventData(Phase.ScheduleEvent);

      // Act
      backgroundMusic["renderEventData"](eventData);

      // Assert
      expect(backgroundMusic.playing).toBe(true);
      expect(mockAudioSource.play).toHaveBeenCalledTimes(1);
    });

    it("should set playing to false and call pause on UpdateVideoInfo phase", () => {
      // Arrange
      (backgroundMusic as any).playing = true;
      const eventData = createEventData(Phase.UpdateVideoInfo);

      // Act
      backgroundMusic["renderEventData"](eventData);

      // Assert
      expect(backgroundMusic.playing).toBe(false);
      expect(mockAudioSource.pause).toHaveBeenCalledTimes(1);
    });

    it("should set playing to true and call play on UpdateResult phase", () => {
      // Arrange
      (backgroundMusic as any).playing = false;
      (backgroundMusic as any).muted = false; // Set muted to false so play() will be called
      const eventData = createEventData(Phase.UpdateResult);

      // Act
      backgroundMusic["renderEventData"](eventData);

      // Assert
      expect(backgroundMusic.playing).toBe(true);
      expect(mockAudioSource.play).toHaveBeenCalledTimes(1);
    });

    it("should handle unknown phase gracefully", () => {
      // Arrange
      (backgroundMusic as any).playing = true;
      const eventData = createEventData("UnknownPhase" as any);

      // Act
      backgroundMusic["renderEventData"](eventData);

      // Assert
      expect(backgroundMusic.playing).toBe(true); // Should remain unchanged
      expect(mockAudioSource.play).not.toHaveBeenCalled();
      expect(mockAudioSource.pause).not.toHaveBeenCalled();
    });

    it("should not call play when muted is true even for play phases", () => {
      // Arrange
      (backgroundMusic as any).playing = false;
      (backgroundMusic as any).muted = true; // Keep muted true
      const eventData = createEventData(Phase.ScheduleEvent);

      // Act
      backgroundMusic["renderEventData"](eventData);

      // Assert
      expect(backgroundMusic.playing).toBe(true);
      expect(mockAudioSource.play).not.toHaveBeenCalled(); // Should not call play when muted
    });
  });
});
