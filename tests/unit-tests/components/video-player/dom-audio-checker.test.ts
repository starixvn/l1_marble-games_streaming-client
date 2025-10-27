// Mock global objects before importing the module
const mockAudioContext = {
  state: 'running',
  currentTime: 0,
  destination: {},
  createOscillator: jest.fn(),
  createGain: jest.fn(),
  close: jest.fn(),
};

const mockOscillator = {
  connect: jest.fn(),
  start: jest.fn(),
  stop: jest.fn(),
};

const mockGainNode = {
  connect: jest.fn(),
  gain: {
    setValueAtTime: jest.fn(),
  },
};

// Capture listeners and spy on document methods instead of replacing document
const listeners: Record<string, any> = {};
jest.spyOn(document, "addEventListener").mockImplementation((type: any, listener: any) => {
  listeners[type] = listener;
});
jest.spyOn(document, "removeEventListener").mockImplementation((type: any) => {
  delete listeners[type];
});

// Define audio constructors on the global object (window/globalThis are the same in jsdom)
Object.defineProperty(globalThis as any, "AudioContext", {
  value: jest.fn().mockImplementation(() => mockAudioContext),
  configurable: true,
  writable: true,
});
Object.defineProperty(globalThis as any, "webkitAudioContext", {
  value: jest.fn().mockImplementation(() => mockAudioContext),
  configurable: true,
  writable: true,
});

// Import the module after setting up mocks
import { canPlayAudio, initializeAudio } from "../../../../assets/scripts/components/video-player/dom-audio-checker";

// Mock setTimeout to control timing in tests
jest.useFakeTimers();

describe("DOM Audio Checker", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.clearAllTimers();
    Object.keys(listeners).forEach((k) => delete listeners[k]);
    
    // Reset mock implementations
    mockAudioContext.state = 'running';
    mockAudioContext.createOscillator.mockReturnValue(mockOscillator);
    mockAudioContext.createGain.mockReturnValue(mockGainNode);
    
    // Reset window mocks
    Object.defineProperty(globalThis as any, 'AudioContext', { value: jest.fn().mockImplementation(() => mockAudioContext), configurable: true, writable: true });
    Object.defineProperty(globalThis as any, 'webkitAudioContext', { value: jest.fn().mockImplementation(() => mockAudioContext), configurable: true, writable: true });
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
  });

  describe("canPlayAudio", () => {
    it("should return true when audio context is running", async () => {
      mockAudioContext.state = 'running';
      
      const promise = canPlayAudio();
      jest.advanceTimersByTime(50);
      
      const result = await promise;
      expect(result).toBe(true);
      expect(mockAudioContext.createOscillator).toHaveBeenCalled();
      expect(mockAudioContext.createGain).toHaveBeenCalled();
      expect(mockOscillator.connect).toHaveBeenCalledWith(mockGainNode);
      expect(mockGainNode.connect).toHaveBeenCalledWith(mockAudioContext.destination);
      expect(mockOscillator.start).toHaveBeenCalled();
      expect(mockOscillator.stop).toHaveBeenCalled();
      expect(mockAudioContext.close).toHaveBeenCalled();
    });

    it("should return false when audio context is suspended", async () => {
      mockAudioContext.state = 'suspended';
      
      const result = await canPlayAudio();
      
      expect(result).toBe(false);
      expect(mockAudioContext.close).toHaveBeenCalled();
      expect(mockAudioContext.createOscillator).not.toHaveBeenCalled();
    });

    it("should return false when audio context state is not running after timeout", async () => {
      mockAudioContext.state = 'interrupted';
      
      const promise = canPlayAudio();
      jest.advanceTimersByTime(50);
      
      const result = await promise;
      expect(result).toBe(false);
      expect(mockAudioContext.close).toHaveBeenCalled();
    });

    it("should return false when AudioContext constructor throws an error", async () => {
      (globalThis as any).AudioContext = jest.fn().mockImplementation(() => {
        throw new Error('AudioContext not supported');
      });
      (globalThis as any).webkitAudioContext = undefined;
      
      const result = await canPlayAudio();
      
      expect(result).toBe(false);
    });

    it("should use webkitAudioContext when AudioContext is not available", async () => {
      (globalThis as any).AudioContext = undefined;
      (globalThis as any).webkitAudioContext = jest.fn().mockImplementation(() => mockAudioContext);
      
      const promise = canPlayAudio();
      jest.advanceTimersByTime(50);
      
      const result = await promise;
      expect(result).toBe(true);
      expect((global as any).window.webkitAudioContext).toHaveBeenCalled();
    });

    it("should handle oscillator creation errors", async () => {
      mockAudioContext.createOscillator.mockImplementation(() => {
        throw new Error('Oscillator creation failed');
      });
      
      const result = await canPlayAudio();
      
      expect(result).toBe(false);
    });
  });

  describe("initializeAudio", () => {
    let onEnableMock: jest.Mock;

    beforeEach(() => {
      onEnableMock = jest.fn();
    });

    it("should add event listeners and call enableAudio immediately", () => {
      initializeAudio(onEnableMock);
      
      expect(document.addEventListener).toHaveBeenCalledWith('click', expect.any(Function), { once: true });
      expect(document.addEventListener).toHaveBeenCalledWith('mousedown', expect.any(Function), { once: true });
      expect(document.addEventListener).toHaveBeenCalledWith('touchstart', expect.any(Function), { once: true });
      expect(document.addEventListener).toHaveBeenCalledWith('keydown', expect.any(Function), { once: true });
      expect(document.addEventListener).toHaveBeenCalledTimes(4);
    });

    it("should call onEnable callback when audio can be played", async () => {
      mockAudioContext.state = 'running';
      
      initializeAudio(onEnableMock);
      jest.advanceTimersByTime(50);
      await Promise.resolve(); // Wait for async enableAudio to complete
      
      expect(onEnableMock).toHaveBeenCalled();
      expect(document.removeEventListener).toHaveBeenCalledWith('click', expect.any(Function));
      expect(document.removeEventListener).toHaveBeenCalledWith('mousedown', expect.any(Function));
      expect(document.removeEventListener).toHaveBeenCalledWith('touchstart', expect.any(Function));
      expect(document.removeEventListener).toHaveBeenCalledWith('keydown', expect.any(Function));
    });

    it("should not call onEnable callback when audio cannot be played", async () => {
      mockAudioContext.state = 'suspended';
      
      initializeAudio(onEnableMock);
      await Promise.resolve(); // Wait for async enableAudio to complete
      
      expect(onEnableMock).not.toHaveBeenCalled();
      expect(document.removeEventListener).not.toHaveBeenCalled();
    });

    it("should work with default onEnable callback (no callback provided)", () => {
      expect(() => {
        initializeAudio();
      }).not.toThrow();
    });

    it("should handle enableAudio being called multiple times (already enabled check)", async () => {
      mockAudioContext.state = 'running';
      
      initializeAudio(onEnableMock);
      
      // First call should enable
      jest.advanceTimersByTime(50);
      await Promise.resolve();
      
      expect(onEnableMock).toHaveBeenCalledTimes(1);
      expect(document.removeEventListener).toHaveBeenCalledTimes(4);
      
      // Get the enableAudio function from the original registration call
      const enableAudioFunction = (document.addEventListener as unknown as jest.Mock).mock.calls.find((call: any) => call[0] === 'click')[1];
      
      // Reset mocks to test second call
      jest.clearAllMocks();
      mockAudioContext.state = 'running';
      
      // Call enableAudio again - should return early because already enabled
      await enableAudioFunction();
      
      expect(onEnableMock).not.toHaveBeenCalled();
      expect(document.removeEventListener).not.toHaveBeenCalled();
    });

    it("should handle errors in enableAudio gracefully", async () => {
      // Make tryToPlayAudio throw an error
      mockAudioContext.createOscillator.mockImplementation(() => {
        throw new Error('Audio error');
      });
      
      initializeAudio(onEnableMock);
      await Promise.resolve(); // Wait for async enableAudio to complete
      
      // Should not throw and should not call onEnable
      expect(onEnableMock).not.toHaveBeenCalled();
      expect(document.removeEventListener).not.toHaveBeenCalled();
    });

    it("should trigger enableAudio when click event is fired", async () => {
      mockAudioContext.state = 'suspended'; // Initially can't play
      
      initializeAudio(onEnableMock);
      await Promise.resolve(); // Initial enableAudio call
      
      expect(onEnableMock).not.toHaveBeenCalled();
      
      // Change state to allow audio
      mockAudioContext.state = 'running';
      
      // Get the click event listener and call it
      const clickListener = listeners['click'];
      const promise = clickListener();
      jest.advanceTimersByTime(50);
      await promise;
      
      expect(onEnableMock).toHaveBeenCalled();
      expect(document.removeEventListener).toHaveBeenCalledTimes(4);
    });

    it("should trigger enableAudio when mousedown event is fired", async () => {
      mockAudioContext.state = 'suspended'; // Initially can't play
      
      initializeAudio(onEnableMock);
      await Promise.resolve(); // Initial enableAudio call
      
      expect(onEnableMock).not.toHaveBeenCalled();
      
      // Change state to allow audio
      mockAudioContext.state = 'running';
      
      // Get the mousedown event listener and call it
      const mousedownListener = listeners['mousedown'];
      const promise = mousedownListener();
      jest.advanceTimersByTime(50);
      await promise;
      
      expect(onEnableMock).toHaveBeenCalled();
      expect(document.removeEventListener).toHaveBeenCalledTimes(4);
    });

    it("should trigger enableAudio when touchstart event is fired", async () => {
      mockAudioContext.state = 'suspended'; // Initially can't play
      
      initializeAudio(onEnableMock);
      await Promise.resolve(); // Initial enableAudio call
      
      expect(onEnableMock).not.toHaveBeenCalled();
      
      // Change state to allow audio
      mockAudioContext.state = 'running';
      
      // Get the touchstart event listener and call it
      const touchstartListener = listeners['touchstart'];
      const promise = touchstartListener();
      jest.advanceTimersByTime(50);
      await promise;
      
      expect(onEnableMock).toHaveBeenCalled();
      expect(document.removeEventListener).toHaveBeenCalledTimes(4);
    });

    it("should trigger enableAudio when keydown event is fired", async () => {
      mockAudioContext.state = 'suspended'; // Initially can't play
      
      initializeAudio(onEnableMock);
      await Promise.resolve(); // Initial enableAudio call
      
      expect(onEnableMock).not.toHaveBeenCalled();
      
      // Change state to allow audio
      mockAudioContext.state = 'running';
      
      // Get the keydown event listener and call it
      const keydownListener = listeners['keydown'];
      const promise = keydownListener();
      jest.advanceTimersByTime(50);
      await promise;
      
      expect(onEnableMock).toHaveBeenCalled();
      expect(document.removeEventListener).toHaveBeenCalledTimes(4);
    });

    it("should handle case where tryToPlayAudio returns false from event listener", async () => {
      mockAudioContext.state = 'suspended'; // Will always return false
      
      initializeAudio(onEnableMock);
      await Promise.resolve(); // Initial enableAudio call
      
      expect(onEnableMock).not.toHaveBeenCalled();
      
      // Trigger click event - should still not enable since audio can't play
      const clickListener = listeners['click'];
      await clickListener();
      
      expect(onEnableMock).not.toHaveBeenCalled();
      expect(document.removeEventListener).not.toHaveBeenCalled();
    });
  });
});