import "reflect-metadata";
import { Container } from "inversify";
import { ServerSentEventHandler } from "../../../assets/scripts/server-sent-event/server-sent-event-handler";
import { Store } from "../../../assets/scripts/store";
import { FeatureHandler } from "../../../assets/scripts/feature-handler/feature-handler";
import { gameSettings } from "../../../assets/scripts/game-settings";

// Mock gameSettings
jest.mock("../../../assets/scripts/game-settings", () => ({
  gameSettings: {
    maxReconnectAttempts: 3,
    reconnectDelay: 1000
  }
}));

// Define EventSource constants first
const EVENTSOURCE_CONNECTING = 0;
const EVENTSOURCE_OPEN = 1;
const EVENTSOURCE_CLOSED = 2;

// Mock EventSource
const mockEventSource = {
  close: jest.fn(),
  addEventListener: jest.fn(),
  removeEventListener: jest.fn(),
  dispatchEvent: jest.fn(),
  onopen: null as any,
  onmessage: null as any,
  onerror: null as any,
  readyState: EVENTSOURCE_CONNECTING,
  url: "",
  withCredentials: false,
  CONNECTING: EVENTSOURCE_CONNECTING,
  OPEN: EVENTSOURCE_OPEN,
  CLOSED: EVENTSOURCE_CLOSED
};

// Mock EventSource constructor with proper typing
const MockEventSourceConstructor = jest.fn().mockImplementation(() => mockEventSource);
(MockEventSourceConstructor as any).CONNECTING = EVENTSOURCE_CONNECTING;
(MockEventSourceConstructor as any).OPEN = EVENTSOURCE_OPEN;
(MockEventSourceConstructor as any).CLOSED = EVENTSOURCE_CLOSED;

global.EventSource = MockEventSourceConstructor as any;

// Mock setTimeout and clearTimeout will be set up in beforeAll

describe("ServerSentEventHandler", () => {
  let container: Container;
  let handler: ServerSentEventHandler;
  let mockStore: jest.Mocked<Store>;
  let mockFeatureHandler: jest.Mocked<FeatureHandler>;

  beforeAll(() => {
    jest.useFakeTimers();
  });

  afterAll(() => {
    jest.useRealTimers();
  });

  beforeEach(() => {
    // Arrange
    container = new Container();
    
    mockStore = {
      serverUrl: "http://test-server.com/events",
      game: "test-game",
      language: "en",
      operator: "test-operator"
    } as jest.Mocked<Store>;

    mockFeatureHandler = {
      update: jest.fn()
    } as unknown as jest.Mocked<FeatureHandler>;

    // Bind dependencies to container
    container.bind(Store).toConstantValue(mockStore);
    container.bind(FeatureHandler).toConstantValue(mockFeatureHandler);
    container.bind(ServerSentEventHandler).toSelf();

    // Get handler from container
    handler = container.get(ServerSentEventHandler);

    // Reset mocks
    jest.clearAllMocks();
    mockEventSource.close.mockClear();
    MockEventSourceConstructor.mockClear();
    
    // Reset EventSource event handlers
    mockEventSource.onopen = null;
    mockEventSource.onmessage = null;
    mockEventSource.onerror = null;
    mockEventSource.readyState = EVENTSOURCE_CONNECTING;
  });

  afterEach(() => {
    jest.clearAllTimers();
  });


  describe("constructor", () => {
    it("should initialize with default state", () => {
      // Arrange
      const newContainer = new Container();
      newContainer.bind(Store).toConstantValue(mockStore);
      newContainer.bind(FeatureHandler).toConstantValue(mockFeatureHandler as any);
      newContainer.bind(ServerSentEventHandler).toSelf();
      const newHandler = newContainer.get(ServerSentEventHandler);

      // Act & Assert
      expect((newHandler as any).eventSource).toBeNull();
      expect((newHandler as any).reconnectAttempts).toBe(0);
      expect((newHandler as any).reconnectTimeout).toBeNull();
      expect((newHandler as any).maxReconnectAttempts).toBe(gameSettings.maxReconnectAttempts);
      expect((newHandler as any).reconnectDelay).toBe(gameSettings.reconnectDelay);
    });
  });

  describe("connect", () => {
    it("should create new EventSource with store serverUrl", () => {
      // Arrange
      
      // Act
      handler.connect();

      // Assert
      expect(MockEventSourceConstructor).toHaveBeenCalledWith(mockStore.serverUrl);
      expect((handler as any).eventSource).toBe(mockEventSource);
    });

    it("should disconnect existing connection before creating new one", () => {
      // Arrange
      (handler as any).eventSource = mockEventSource;
      const disconnectSpy = jest.spyOn(handler, 'disconnect');

      // Act
      handler.connect();

      // Assert
      expect(disconnectSpy).toHaveBeenCalled();
    });

    it("should setup event listeners after creating EventSource", () => {
      // Arrange
      const setupListenersSpy = jest.spyOn(handler as any, 'setupEventListeners');

      // Act
      handler.connect();

      // Assert
      expect(setupListenersSpy).toHaveBeenCalled();
    });

    it("should handle EventSource creation error", () => {
      // Arrange
      MockEventSourceConstructor.mockImplementationOnce(() => {
        throw new Error("Connection failed");
      });

      // Act
      handler.connect();

      // Assert
      expect((handler as any).eventSource).toBeNull();
    });
  });

  describe("disconnect", () => {
    it("should clear reconnect timeout when it exists", () => {
      // Arrange
      const timeoutId = setTimeout(() => {}, 1000);
      (handler as any).reconnectTimeout = timeoutId;
      const clearTimeoutSpy = jest.spyOn(global, 'clearTimeout');

      // Act
      handler.disconnect();

      // Assert
      expect(clearTimeoutSpy).toHaveBeenCalledWith(timeoutId);
      expect((handler as any).reconnectTimeout).toBeNull();
    });

    it("should not clear timeout when reconnectTimeout is null", () => {
      // Arrange
      (handler as any).reconnectTimeout = null;
      const clearTimeoutSpy = jest.spyOn(global, 'clearTimeout');

      // Act
      handler.disconnect();

      // Assert
      expect(clearTimeoutSpy).not.toHaveBeenCalled();
    });

    it("should close EventSource when it exists", () => {
      // Arrange
      (handler as any).eventSource = mockEventSource;

      // Act
      handler.disconnect();

      // Assert
      expect(mockEventSource.close).toHaveBeenCalled();
      expect((handler as any).eventSource).toBeNull();
    });

    it("should not close EventSource when it is null", () => {
      // Arrange
      (handler as any).eventSource = null;

      // Act
      handler.disconnect();

      // Assert
      expect(mockEventSource.close).not.toHaveBeenCalled();
    });
  });

  describe("setupEventListeners", () => {
    it("should return early when eventSource is null", () => {
      // Arrange
      (handler as any).eventSource = null;

      // Act
      (handler as any).setupEventListeners();

      // Assert
      expect(mockEventSource.onopen).toBeNull();
      expect(mockEventSource.onmessage).toBeNull();
      expect(mockEventSource.onerror).toBeNull();
    });

    it("should set onopen handler when eventSource exists", () => {
      // Arrange
      (handler as any).eventSource = mockEventSource;

      // Act
      (handler as any).setupEventListeners();

      // Assert
      expect(mockEventSource.onopen).toBeInstanceOf(Function);
    });

    it("should set onmessage handler when eventSource exists", () => {
      // Arrange
      (handler as any).eventSource = mockEventSource;

      // Act
      (handler as any).setupEventListeners();

      // Assert
      expect(mockEventSource.onmessage).toBeInstanceOf(Function);
    });

    it("should set onerror handler when eventSource exists", () => {
      // Arrange
      (handler as any).eventSource = mockEventSource;

      // Act
      (handler as any).setupEventListeners();

      // Assert
      expect(mockEventSource.onerror).toBeInstanceOf(Function);
    });

    it("should handle valid JSON message in onmessage", () => {
      // Arrange
      (handler as any).eventSource = mockEventSource;
      const handlePayloadSpy = jest.spyOn(handler as any, 'handleEventStreamStateWithPayload');
      const testPayload = { test: "data" };
      const mockEvent = { data: JSON.stringify(testPayload) };

      // Act
      (handler as any).setupEventListeners();
      mockEventSource.onmessage(mockEvent);

      // Assert
      expect(handlePayloadSpy).toHaveBeenCalledWith(testPayload);
    });

    it("should handle invalid JSON message in onmessage", () => {
      // Arrange
      (handler as any).eventSource = mockEventSource;
      const handlePayloadSpy = jest.spyOn(handler as any, 'handleEventStreamStateWithPayload');
      const mockEvent = { data: "invalid json" };

      // Act
      (handler as any).setupEventListeners();
      mockEventSource.onmessage(mockEvent);

      // Assert
      expect(handlePayloadSpy).not.toHaveBeenCalled();
    });

    it("should call attemptReconnect in onerror", () => {
      // Arrange
      (handler as any).eventSource = mockEventSource;
      const attemptReconnectSpy = jest.spyOn(handler as any, 'attemptReconnect');
      const mockEvent = {};

      // Act
      (handler as any).setupEventListeners();
      mockEventSource.onerror(mockEvent);

      // Assert
      expect(attemptReconnectSpy).toHaveBeenCalled();
    });
  });

  describe("handleEventStreamStateWithPayload", () => {
    it("should call featureHandler update with payload", () => {
      // Arrange
      const testPayload = { event: "test", data: { value: 123 } };

      // Act
      (handler as any).handleEventStreamStateWithPayload(testPayload);

      // Assert
      expect(mockFeatureHandler.update).toHaveBeenCalledWith(testPayload);
    });

    it("should handle empty payload", () => {
      // Arrange
      const emptyPayload = {};

      // Act
      (handler as any).handleEventStreamStateWithPayload(emptyPayload);

      // Assert
      expect(mockFeatureHandler.update).toHaveBeenCalledWith(emptyPayload);
    });
  });

  describe("attemptReconnect", () => {
    it("should disconnect when max reconnect attempts reached", () => {
      // Arrange
      (handler as any).reconnectAttempts = 3;
      const disconnectSpy = jest.spyOn(handler, 'disconnect');

      // Act
      (handler as any).attemptReconnect();

      // Assert
      expect(disconnectSpy).toHaveBeenCalled();
    });

    it("should increment reconnect attempts", () => {
      // Arrange
      (handler as any).reconnectAttempts = 1;

      // Act
      (handler as any).attemptReconnect();

      // Assert
      expect((handler as any).reconnectAttempts).toBe(2);
    });

    it("should clear existing reconnect timeout", () => {
      // Arrange
      const timeoutId = setTimeout(() => {}, 1000);
      (handler as any).reconnectTimeout = timeoutId;
      const clearTimeoutSpy = jest.spyOn(global, 'clearTimeout');

      // Act
      (handler as any).attemptReconnect();

      // Assert
      expect(clearTimeoutSpy).toHaveBeenCalledWith(timeoutId);
    });

    it("should set new reconnect timeout", () => {
      // Arrange
      const setTimeoutSpy = jest.spyOn(global, 'setTimeout');

      // Act
      (handler as any).attemptReconnect();

      // Assert
      expect(setTimeoutSpy).toHaveBeenCalledWith(expect.any(Function), gameSettings.reconnectDelay);
    });

    it("should reconnect when EventSource is closed", () => {
      // Arrange
      mockEventSource.readyState = EVENTSOURCE_CLOSED;
      (handler as any).eventSource = mockEventSource;
      const connectSpy = jest.spyOn(handler, 'connect');

      // Act
      (handler as any).attemptReconnect();
      jest.runOnlyPendingTimers();

      // Assert
      expect(connectSpy).toHaveBeenCalled();
    });

    it("should not reconnect when EventSource is not closed", () => {
      // Arrange
      mockEventSource.readyState = EVENTSOURCE_OPEN;
      (handler as any).eventSource = mockEventSource;
      const connectSpy = jest.spyOn(handler, 'connect');

      // Act
      (handler as any).attemptReconnect();
      jest.runOnlyPendingTimers();

      // Assert
      expect(connectSpy).not.toHaveBeenCalled();
    });
  });
});
