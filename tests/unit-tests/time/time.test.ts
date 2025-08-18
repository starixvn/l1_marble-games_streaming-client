import { 
  createMockStore,
  cleanupMockObserver,
} from "../../utils/mock-store";

// Mock the i18n translation function FIRST
jest.mock("db://i18n/LanguageData", () => ({
  t: jest.fn((key: string) => `translated_${key}`),
}));

// Mock Observer BEFORE importing the component
jest.mock("observer", () => {
  const { createMockObserver } = require("../../utils/mock-store");
  return createMockObserver();
});

// NOW import the components after mocking Observer
import { Time } from "../../../assets/scripts/time/time";
import { TimeStore } from "../../../assets/scripts/time/time-store";
import { Label } from "../../cocos-testing/cc";

describe("Time", () => {
  let time: Time;
  let mockTimeStore: TimeStore & { update: (props: Partial<TimeStore>) => void; reset: (props: Partial<TimeStore>) => void };

  beforeAll(() => {
    // Create mock store with clean API
    mockTimeStore = createMockStore(TimeStore, {
      paused: true,
      matchLiveTime: 0,
      halfIndex: 0,
    });

    // Create Time component once (this will automatically set up reactions)
    time = new Time();
    
    // Initialize label components with actual Label instances
    time.halfLabel = new Label();
    time.minutesLabel = new Label();
    time.secondsLabel = new Label();
  });

  afterAll(() => {
    // Clean up everything
    cleanupMockObserver();
    jest.clearAllMocks();
  });

  beforeEach(() => {
    // Reset store to initial state before each test
    mockTimeStore.reset({});
  });

  describe("update", () => {
    describe("not paused", () => {
      it("second < 59, should plus 1 second and display it to seconds label", () => {
        // Arrange
        time.paused = false;
        time.seconds = 30;

        // Act
        (time as any).update(1);

        // Assert
        expect(time.seconds).toBe(31);
        expect(time.secondsLabel.string).toBe("31");
      });

      it("second >= 59, should display seconds to the seconds label", () => {
        // Arrange
        time.paused = false;
        time.seconds = 59;

        // Act
        (time as any).update(1);

        // Assert
        expect(time.seconds).toBe(59); // Should not increment beyond 59
        expect(time.secondsLabel.string).toBe("59");
      });

      it("second > 59, should not increment and display current seconds", () => {
        // Arrange
        time.paused = false;
        time.seconds = 65; // Above 59

        // Act
        (time as any).update(1);

        // Assert
        expect(time.seconds).toBe(65); // Should not increment when > 59
        expect(time.secondsLabel.string).toBe("65");
      });

      it("second exactly 60, should not increment and display current seconds", () => {
        // Arrange
        time.paused = false;
        time.seconds = 60; // Exactly at boundary

        // Act
        (time as any).update(1);

        // Assert
        expect(time.seconds).toBe(60); // Should not increment when >= 59
        expect(time.secondsLabel.string).toBe("60");
      });
    });

    describe("paused", () => {
      it("set seconds to 0 and label to 00", () => {
        // Arrange
        time.paused = true;
        time.seconds = 45; // Any non-zero value

        // Act
        (time as any).update(1);

        // Assert
        expect(time.seconds).toBe(0);
        expect(time.secondsLabel.string).toBe("00");
      });
    });
  });

  describe("@render store.paused", () => {
    it("should sync paused state when store.paused changes", () => {
      // Arrange

      // Act
      mockTimeStore.paused = false;

      // Assert
      expect(time.paused).toBe(false);
    });

    it("should handle paused true when store updates", () => {
      // Arrange

      // Act
      mockTimeStore.paused = true;

      // Assert
      expect(time.paused).toBe(true);
    });
  });

  describe("@render store.matchLiveTime", () => {
    it("should sync match live time and reset seconds when store updates", () => {
      // Arrange

      // Act
      mockTimeStore.matchLiveTime = 25;

      // Assert
      expect(time.minutes).toBe(25);
      expect(time.seconds).toBe(0);
    });

    it("should handle zero match live time", () => {
      // Arrange

      // Act
      mockTimeStore.matchLiveTime = 0;

      // Assert
      expect(time.minutes).toBe(0);
    });

    it("should handle single digit minutes", () => {
      // Arrange

      // Act
      mockTimeStore.matchLiveTime = 7;

      // Assert  
      expect(time.minutes).toBe(7);
      expect(time.seconds).toBe(0);
    });
  });

  describe("@render store.halfIndex", () => {
    it("should react to first half when store.halfIndex changes to 0", () => {
      // Arrange
      mockTimeStore.halfIndex = 1;

      // Act
      mockTimeStore.halfIndex = 0;

      // Assert
      expect(mockTimeStore.halfIndex).toBe(0);
    });

    it("should react to second half when store.halfIndex changes to 1", () => {
      // Arrange
      
      // Act
      mockTimeStore.halfIndex = 1;

      // Assert
      expect(mockTimeStore.halfIndex).toBe(1);
    });
  });

});