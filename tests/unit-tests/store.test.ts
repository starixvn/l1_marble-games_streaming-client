import mobx from "mobx";
import { Store } from "../../assets/scripts/store";

// Mock mobx
jest.mock("mobx", () => ({
  makeAutoObservable: jest.fn()
}));

describe("Store", () => {
  let mockLocation: any;
  let originalLocation: Location;

  beforeEach(() => {
    // Clear all mocks
    jest.clearAllMocks();
    
    // Store original location
    originalLocation = globalThis.location;
    
    // Create mock location
    mockLocation = {
      host: "test.lumigame.com",
      search: ""
    };
    
    // Replace globalThis.location
    Object.defineProperty(globalThis, "location", {
      value: mockLocation,
      writable: true,
      configurable: true
    });
  });

  afterEach(() => {
    // Restore original location
    Object.defineProperty(globalThis, "location", {
      value: originalLocation,
      writable: true,
      configurable: true
    });
  });

  describe("constructor", () => {
    it("should initialize with default values and make observable", () => {
      // Arrange & Act
      const store = new Store();

      // Assert
      expect(mobx.makeAutoObservable).toHaveBeenCalledWith(store);
      expect(store.eventId).toBe(null);
      expect(store.game).toBe(null);
      expect(store.language).toBe("en-US");
      expect(store.operator).toBe("common");
    });
  });

  describe("init", () => {
    it("should parse valid token and set properties", () => {
      // Arrange
      const store = new Store();
      const tokenData = "game=gm-123&language=zh-CN&operator=test&event=evt-456";
      const encodedToken = btoa(tokenData);
      mockLocation.search = `?token=${encodedToken}`;

      // Act
      store.init(mockLocation);

      // Assert
      expect(store.game).toBe("gm-123");
      expect(store.language).toBe("zh-CN");
      expect(store.operator).toBe("test");
      expect(store.eventId).toBe("evt-456");
    });

    it("should handle missing token parameter", () => {
      // Arrange
      const store = new Store();
      mockLocation.search = "?other=value";

      // Act
      store.init(mockLocation);

      // Assert
      expect(store.game).toBe(null);
      expect(store.language).toBe("en-US");
      expect(store.operator).toBe("common");
      expect(store.eventId).toBe(null);
    });

    it("should handle partial token data with defaults", () => {
      // Arrange
      const store = new Store();
      const tokenData = "game=gm-789";
      const encodedToken = btoa(tokenData);
      mockLocation.search = `?token=${encodedToken}`;

      // Act
      store.init(mockLocation);

      // Assert
      expect(store.game).toBe("gm-789");
      expect(store.language).toBe("en-US");
      expect(store.operator).toBe("common");
      expect(store.eventId).toBe(null);
    });

    it("should handle empty token data", () => {
      // Arrange
      const store = new Store();
      const encodedToken = btoa("");
      mockLocation.search = `?token=${encodedToken}`;

      // Act
      store.init(mockLocation);

      // Assert
      expect(store.game).toBe(null);
      expect(store.language).toBe("en-US");
      expect(store.operator).toBe("common");
      expect(store.eventId).toBe(null);
    });
  });

  describe("replayUrl", () => {
    it("should construct URL for production domain", () => {
      // Arrange
      const store = new Store();
      store.eventId = "test-event-123";
      mockLocation.host = "mgtv.lumigame.com";

      // Act
      const result = store.replayUrl;

      // Assert
      expect(result).toBe("https://mgstreaming.lumigame.com/replay/test-event-123");
    });

    it("should handle localhost and use default domain", () => {
      // Arrange
      const store = new Store();
      store.eventId = "localhost-event";
      mockLocation.host = "localhost:3000";

      // Act
      const result = store.replayUrl;

      // Assert
      expect(result).toBe("https://mgstreaming.lumigame.com/replay/localhost-event");
    });

    it("should handle subdomain correctly", () => {
      // Arrange
      const store = new Store();
      store.eventId = "sub-event";
      mockLocation.host = "sub.mgtv.lumigame.com";

      // Act
      const result = store.replayUrl;

      // Assert
      expect(result).toBe("https://mgstreaming.lumigame.com/replay/sub-event");
    });

    it("should handle different domain structure", () => {
      // Arrange
      const store = new Store();
      store.eventId = "custom-event";
      mockLocation.host = "app.example.org";

      // Act
      const result = store.replayUrl;

      // Assert
      expect(result).toBe("https://mgstreaming.example.org/replay/custom-event");
    });
  });

  describe("serverUrl", () => {
    it("should construct URL for production domain", () => {
      // Arrange
      const store = new Store();
      store.game = "test-game-456";
      mockLocation.host = "mgtv.lumigame.com";

      // Act
      const result = store.serverUrl;

      // Assert
      expect(result).toBe("https://mgstreaming.lumigame.com/live/test-game-456");
    });

    it("should handle localhost and use default domain", () => {
      // Arrange
      const store = new Store();
      store.game = "localhost-game";
      mockLocation.host = "localhost:8080";

      // Act
      const result = store.serverUrl;

      // Assert
      expect(result).toBe("https://mgstreaming.lumigame.com/live/localhost-game");
    });

    it("should handle subdomain correctly", () => {
      // Arrange
      const store = new Store();
      store.game = "sub-game";
      mockLocation.host = "test.mgtv.lumigame.com";

      // Act
      const result = store.serverUrl;

      // Assert
      expect(result).toBe("https://mgstreaming.lumigame.com/live/sub-game");
    });

    it("should handle different domain structure", () => {
      // Arrange
      const store = new Store();
      store.game = "custom-game";
      mockLocation.host = "staging.example.net";

      // Act
      const result = store.serverUrl;

      // Assert
      expect(result).toBe("https://mgstreaming.example.net/live/custom-game");
    });
  });
});
