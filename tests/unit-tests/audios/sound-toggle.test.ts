import { Toggle } from "cc";
import { SoundToggle } from "../../../assets/scripts/audios/sound-toggle";
import { AudioStore } from "db://assets/scripts/audios/audio-store";

describe("SoundToggle", () => {
  let soundToggle: SoundToggle;
  let mockToggle: jest.Mocked<Toggle>;

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();

    // Create mock Toggle
    mockToggle = {
      isChecked: false,
      _set: jest.fn(),
      _internalToggle: jest.fn(),
      playEffect: jest.fn(),
      setIsCheckedWithoutNotify: jest.fn(),
    } as any;

    // Create SoundToggle instance
    soundToggle = new SoundToggle();
    soundToggle.soundToggle = mockToggle;

    // Mock the setMuted method
    jest
      .spyOn(soundToggle as any, "setMuted")
      .mockImplementation((muted: boolean) => muted);
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.restoreAllMocks();
    // Cleanup
  });

  describe("initialization", () => {
    it("should initialize with default state", () => {
      // Assert
      expect(soundToggle.soundToggle).toBe(mockToggle);
    });
  });

  describe("onToggleSound method", () => {
    it("should set muted to true when toggle is unchecked", () => {
      // Arrange
      (mockToggle as any).isChecked = false;

      // Act
      soundToggle.onToggleSound();

      // Assert
      expect(soundToggle["setMuted"]).toHaveBeenCalledWith(true);
    });

    it("should set muted to false when toggle is checked", () => {
      // Arrange
      (mockToggle as any).isChecked = true;

      // Act
      soundToggle.onToggleSound();

      // Assert
      expect(soundToggle["setMuted"]).toHaveBeenCalledWith(false);
    });
  });

  describe("setMuted method", () => {
    it("should return false when passed false", () => {
      // Act
      const result = soundToggle["setMuted"](false);

      // Assert
      expect(result).toBe(false);
    });

    it("should return true when passed true", () => {
      // Act
      const result = soundToggle["setMuted"](true);

      // Assert
      expect(result).toBe(true);
    });
  });

  describe("renderMuted method", () => {
    it("should set toggle to checked when muted is false", () => {
      // Arrange
      const muted = false;

      // Act
      soundToggle["renderMuted"](muted);

      // Assert
      expect(mockToggle.isChecked).toBe(true);
    });

    it("should set toggle to unchecked when muted is true", () => {
      // Arrange
      const muted = true;

      // Act
      soundToggle["renderMuted"](muted);

      // Assert
      expect(mockToggle.isChecked).toBe(false);
    });
  });
});
