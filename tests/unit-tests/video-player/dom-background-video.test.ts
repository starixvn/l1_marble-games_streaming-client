const mockResizeObserver = {
  observe: jest.fn(),
  disconnect: jest.fn(),
  unobserve: jest.fn(),
};

global.ResizeObserver = jest.fn().mockImplementation((callback) => {
  (mockResizeObserver as any).callback = callback;
  return mockResizeObserver;
});
import { DOMBackgroundVideo } from "../../../assets/scripts/video-player/dom-background-video";

describe("DOMBackgroundVideo", () => {
  let mockContainer: any;
  let mockGameCanvas: any;
  let mockVideoElement: any;
  let originalGetElementById: any;
  let originalCreateElement: any;

  beforeEach(() => {
    jest.clearAllMocks();
    mockContainer = {
      getBoundingClientRect: jest.fn().mockReturnValue({
        width: 800,
        height: 600,
        top: 0,
        left: 0,
        bottom: 600,
        right: 800,
      }),
      insertBefore: jest.fn(),
      firstChild: null,
      style: {},
    };

    mockGameCanvas = {
      style: {},
    };

    mockVideoElement = {
      id: '',
      muted: false,
      style: {},
      width: 0,
      height: 0,
      playsInline: false,
      autoplay: false,
      preload: '',
      remove: jest.fn(),
    };

    originalGetElementById = document.getElementById;
    originalCreateElement = document.createElement;
    
    document.getElementById = jest.fn();
    document.createElement = jest.fn().mockReturnValue(mockVideoElement);
  });

  afterEach(() => {
    document.getElementById = originalGetElementById;
    document.createElement = originalCreateElement;
  });

  describe("createOrLoadVideoElement", () => {
    describe("when container and game canvas exist, but video does not exist", () => {
      it("should create a new video element with correct properties and styles", () => {
        // Arrange
        (document.getElementById as jest.Mock)
          .mockReturnValueOnce(mockContainer)
          .mockReturnValueOnce(mockGameCanvas)
          .mockReturnValueOnce(null);

        const expectedSize = {
          width: 800,
          height: 600,
          top: 0,
          left: 0,
          bottom: 600,
          right: 800,
        };

        // Act
        const result = DOMBackgroundVideo.createOrLoadVideoElement();

        // Assert
        expect(document.getElementById).toHaveBeenCalledWith(DOMBackgroundVideo.GAME_CONTAINER_ID);
        expect(document.getElementById).toHaveBeenCalledWith(DOMBackgroundVideo.GAME_CANVAS_ID);
        expect(document.getElementById).toHaveBeenCalledWith(DOMBackgroundVideo.VIDEO_ID);
        
        expect(document.createElement).toHaveBeenCalledWith("video");
        expect(mockContainer.getBoundingClientRect).toHaveBeenCalled();
        expect(mockContainer.insertBefore).toHaveBeenCalledWith(mockVideoElement, mockContainer.firstChild);
        
        expect(mockVideoElement.id).toBe(DOMBackgroundVideo.VIDEO_ID);
        expect(mockVideoElement.muted).toBe(true);
        expect(mockVideoElement.playsInline).toBe(true);
        expect(mockVideoElement.autoplay).toBe(true);
        expect(mockVideoElement.preload).toBe("auto");
        expect(mockVideoElement.width).toBe(expectedSize.width);
        expect(mockVideoElement.height).toBe(expectedSize.height);
        
        expect(mockVideoElement.style.visibility).toBe("visible");
        expect(mockVideoElement.style.position).toBe("absolute");
        expect(mockVideoElement.style.bottom).toBe("0px");
        expect(mockVideoElement.style.left).toBe("0px");
        expect(mockVideoElement.style.width).toBe("800px");
        expect(mockVideoElement.style.height).toBe("600px");
        expect(mockVideoElement.style.zIndex).toBe("10");
        
        expect(mockGameCanvas.style.zIndex).toBe("11");
        expect(mockGameCanvas.style.position).toBe("relative");
        
        expect(mockResizeObserver.observe).toHaveBeenCalled();
        
        expect(result).toBe(mockVideoElement);
      });
    });

    describe("when container exists in portrait mode and video does not exist", () => {
      it("should create video element with swapped dimensions for portrait orientation", () => {
        // Arrange
        const portraitSize = {
          width: 400,
          height: 800,
          top: 0,
          left: 0,
          bottom: 800,
          right: 400,
        };
        
        mockContainer.getBoundingClientRect.mockReturnValue(portraitSize);
        (document.getElementById as jest.Mock)
          .mockReturnValueOnce(mockContainer)
          .mockReturnValueOnce(mockGameCanvas)
          .mockReturnValueOnce(null);

        // Act
        const result = DOMBackgroundVideo.createOrLoadVideoElement();

        // Assert
        expect(mockVideoElement.style.width).toBe("800px");
        expect(mockVideoElement.style.height).toBe("400px");
        expect(mockVideoElement.width).toBe(portraitSize.width);
        expect(mockVideoElement.height).toBe(portraitSize.height);
        expect(result).toBe(mockVideoElement);
      });
    });

    describe("when video element already exists", () => {
      it("should return existing video element without creating a new one", () => {
        // Arrange
        const existingVideo = { ...mockVideoElement, id: DOMBackgroundVideo.VIDEO_ID };
        (document.getElementById as jest.Mock)
          .mockReturnValueOnce(mockContainer)
          .mockReturnValueOnce(mockGameCanvas)
          .mockReturnValueOnce(existingVideo);

        // Act
        const result = DOMBackgroundVideo.createOrLoadVideoElement();

        // Assert
        expect(document.createElement).not.toHaveBeenCalled();
        expect(mockContainer.insertBefore).not.toHaveBeenCalled();
        expect(mockResizeObserver.observe).not.toHaveBeenCalled();
        expect(result).toBe(existingVideo);
        
        expect(mockGameCanvas.style.zIndex).toBe("11");
        expect(mockGameCanvas.style.position).toBe("relative");
      });
    });

    describe("when game canvas does not exist", () => {
      it("should still create video element but not apply game styles", () => {
        // Arrange
        (document.getElementById as jest.Mock)
          .mockReturnValueOnce(mockContainer)
          .mockReturnValueOnce(null)
          .mockReturnValueOnce(null);

        // Act
        const result = DOMBackgroundVideo.createOrLoadVideoElement();

        // Assert
        expect(document.createElement).toHaveBeenCalledWith("video");
        expect(result).toBe(mockVideoElement);
        expect(mockGameCanvas.style.zIndex).toBeUndefined();
      });
    });

    describe("when container does not exist", () => {
      it("should handle missing container gracefully", () => {
        // Arrange
        (document.getElementById as jest.Mock)
          .mockReturnValueOnce(null)
          .mockReturnValueOnce(mockGameCanvas)
          .mockReturnValueOnce(null);

        // Act & Assert
        expect(() => DOMBackgroundVideo.createOrLoadVideoElement()).toThrow();
      });
    });
  });

  describe("removeVideoElement", () => {
    describe("when video element exists", () => {
      it("should remove video element and unregister events", () => {
        // Arrange
        const existingVideo = {
          ...mockVideoElement,
          id: DOMBackgroundVideo.VIDEO_ID,
          remove: jest.fn(),
        };
        (document.getElementById as jest.Mock).mockReturnValue(existingVideo);

        // Act
        DOMBackgroundVideo.removeVideoElement();

        // Assert
        expect(document.getElementById).toHaveBeenCalledWith(DOMBackgroundVideo.VIDEO_ID);
        expect(mockResizeObserver.disconnect).toHaveBeenCalled();
        expect(existingVideo.remove).toHaveBeenCalled();
      });
    });

    describe("when video element does not exist", () => {
      it("should not attempt to remove or unregister events", () => {
        // Arrange
        (document.getElementById as jest.Mock).mockReturnValue(null);

        // Act
        DOMBackgroundVideo.removeVideoElement();

        // Assert
        expect(document.getElementById).toHaveBeenCalledWith(DOMBackgroundVideo.VIDEO_ID);
        expect(mockResizeObserver.disconnect).not.toHaveBeenCalled();
        expect(mockVideoElement.remove).not.toHaveBeenCalled();
      });
    });
  });

  describe("static properties and constants", () => {
    it("should have correct constant values", () => {
      // Arrange & Act & Assert
      expect(DOMBackgroundVideo.GAME_CONTAINER_ID).toBe("Cocos3dGameContainer");
      expect(DOMBackgroundVideo.GAME_CANVAS_ID).toBe("GameCanvas");
      expect(DOMBackgroundVideo.VIDEO_ID).toBe("VideoBackground");
    });

    it("should have ResizeObserver instance", () => {
      // Arrange & Act & Assert
      expect((DOMBackgroundVideo as any).resizeObserver).toBeDefined();
      expect(typeof (DOMBackgroundVideo as any).resizeObserver.observe).toBe("function");
      expect(typeof (DOMBackgroundVideo as any).resizeObserver.disconnect).toBe("function");
    });
  });

  describe("onResize (private method)", () => {
    it("should resize video element when called directly", () => {
      // Arrange
      const newSize = {
        width: 1200,
        height: 900,
        top: 0,
        left: 0,
        bottom: 900,
        right: 1200,
      };
      
      mockContainer.getBoundingClientRect.mockReturnValue(newSize);
      (document.getElementById as jest.Mock)
        .mockReturnValueOnce(mockContainer)
        .mockReturnValueOnce(mockContainer)
        .mockReturnValueOnce(mockGameCanvas)
        .mockReturnValueOnce(mockVideoElement);

      // Act
      (DOMBackgroundVideo as any).onResize();

      // Assert
      expect(document.getElementById).toHaveBeenCalledWith(DOMBackgroundVideo.GAME_CONTAINER_ID);
      expect(mockContainer.getBoundingClientRect).toHaveBeenCalled();
      expect(mockVideoElement.style.width).toBe("1200px");
      expect(mockVideoElement.style.height).toBe("900px");
      expect(mockVideoElement.style.bottom).toBe("0px");
      expect(mockVideoElement.style.left).toBe("0px");
    });

    it("should handle portrait orientation in onResize", () => {
      // Arrange
      const portraitSize = {
        width: 600,
        height: 800,
        top: 0,
        left: 0,
        bottom: 800,
        right: 600,
      };
      
      mockContainer.getBoundingClientRect.mockReturnValue(portraitSize);
      (document.getElementById as jest.Mock)
        .mockReturnValueOnce(mockContainer)
        .mockReturnValueOnce(mockContainer)
        .mockReturnValueOnce(mockGameCanvas)
        .mockReturnValueOnce(mockVideoElement);

      // Act
      (DOMBackgroundVideo as any).onResize();

      // Assert
      expect(mockVideoElement.style.width).toBe("800px");
      expect(mockVideoElement.style.height).toBe("600px");
    });
  });


  describe("edge cases", () => {
    it("should handle square aspect ratio (width equals height)", () => {
      // Arrange
      const squareSize = {
        width: 600,
        height: 600,
        top: 0,
        left: 0,
        bottom: 600,
        right: 600,
      };
      
      mockContainer.getBoundingClientRect.mockReturnValue(squareSize);
      (document.getElementById as jest.Mock)
        .mockReturnValueOnce(mockContainer)
        .mockReturnValueOnce(mockGameCanvas)
        .mockReturnValueOnce(null);

      // Act
      const result = DOMBackgroundVideo.createOrLoadVideoElement();

      // Assert
      expect(mockVideoElement.style.width).toBe("600px");
      expect(mockVideoElement.style.height).toBe("600px");
      expect(result).toBe(mockVideoElement);
    });
  });
});