const mockResizeObserver = {
  observe: jest.fn(),
  disconnect: jest.fn(),
  unobserve: jest.fn(),
};

global.ResizeObserver = jest.fn().mockImplementation((callback) => {
  (mockResizeObserver as any).callback = callback;
  return mockResizeObserver;
});

import { DOMBackgroundVideo, VideoConfigOption, GenericBackgroundVideoEvents } from "../../../assets/scripts/video-player/dom-background-video";

describe("DOMBackgroundVideo", () => {
  let mockContainer: any;
  let mockGameCanvas: any;
  let mockVideoElement: any;
  let originalGetElementById: any;
  let originalCreateElement: any;

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Clear static maps and state
    (DOMBackgroundVideo as any).videos.clear();
    (DOMBackgroundVideo as any).resizeCallbacks.clear();
    
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
    
    // Clean up static state
    (DOMBackgroundVideo as any).videos.clear();
    (DOMBackgroundVideo as any).resizeCallbacks.clear();
  });

  describe("createOrLoadVideoElement", () => {
    describe("when container and game canvas exist, but video does not exist", () => {
      it("should create a new video element with correct properties and styles", () => {
        // Arrange
        (document.getElementById as jest.Mock)
          .mockReturnValueOnce(mockContainer) // container for createOrLoadVideoElement
          .mockReturnValueOnce(mockGameCanvas) // game canvas for createOrLoadVideoElement
          .mockReturnValueOnce(mockContainer); // container for registerEvents

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
        
        expect(mockVideoElement.style.position).toBe("absolute");
        expect(mockVideoElement.style.bottom).toBe("0px");
        expect(mockVideoElement.style.left).toBe("0px");
        expect(mockVideoElement.style.width).toBe("800px");
        expect(mockVideoElement.style.height).toBe("600px");
        expect(mockVideoElement.style.zIndex).toBe("9"); // HIDDEN

        
        expect(mockGameCanvas.style.zIndex).toBe("11");
        expect(mockGameCanvas.style.position).toBe("relative");
        
        expect(mockResizeObserver.observe).toHaveBeenCalledWith(mockContainer);
        
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
          .mockReturnValueOnce(mockContainer) // container
          .mockReturnValueOnce(mockGameCanvas); // game canvas

        // Act
        const result = DOMBackgroundVideo.createOrLoadVideoElement();

        // Assert
        expect(mockVideoElement.style.width).toBe("800px"); // height becomes width
        expect(mockVideoElement.style.height).toBe("400px"); // width becomes height
        expect(mockVideoElement.width).toBe(portraitSize.width);
        expect(mockVideoElement.height).toBe(portraitSize.height);
        expect(result).toBe(mockVideoElement);
      });
    });

    describe("when video element already exists", () => {
      it("should return existing video element without creating a new one", () => {
        // Arrange
        const existingVideo = { ...mockVideoElement, id: "VideoBackground" };
        (DOMBackgroundVideo as any).videos.set("VideoBackground", existingVideo);
        
        (document.getElementById as jest.Mock)
          .mockReturnValueOnce(mockContainer) // container
          .mockReturnValueOnce(mockGameCanvas); // game canvas

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
          .mockReturnValueOnce(mockContainer) // container
          .mockReturnValueOnce(null); // no game canvas

        // Act
        const result = DOMBackgroundVideo.createOrLoadVideoElement();

        // Assert
        expect(document.createElement).toHaveBeenCalledWith("video");
        expect(result).toBe(mockVideoElement);
        expect(mockGameCanvas.style.zIndex).toBeUndefined();
      });
    });

    describe("with custom video ID", () => {
      it("should create video element with custom ID", () => {
        // Arrange
        const customId = "CustomVideo";
        (document.getElementById as jest.Mock)
          .mockReturnValueOnce(mockContainer) // container
          .mockReturnValueOnce(mockGameCanvas); // game canvas

        // Act
        const result = DOMBackgroundVideo.createOrLoadVideoElement(customId);

        // Assert
        expect(mockVideoElement.id).toBe(customId);
        expect(result).toBe(mockVideoElement);
        
        // Verify it's stored in the videos map with custom ID
        expect((DOMBackgroundVideo as any).videos.get(customId)).toBe(mockVideoElement);
      });
    });
  });

  describe("removeVideoElement", () => {
    describe("when video element exists", () => {
      it("should remove video element and clean up resources", () => {
        // Arrange
        const videoId = "TestVideo";
        const existingVideo = { ...mockVideoElement, id: videoId };
        (DOMBackgroundVideo as any).videos.set(videoId, existingVideo);
        (DOMBackgroundVideo as any).resizeCallbacks.set(videoId, jest.fn());

        // Act
        DOMBackgroundVideo.removeVideoElement(videoId);

        // Assert
        expect(existingVideo.remove).toHaveBeenCalled();
        expect((DOMBackgroundVideo as any).videos.has(videoId)).toBe(false);
        expect((DOMBackgroundVideo as any).resizeCallbacks.has(videoId)).toBe(false);
      });

      it("should disconnect resize observer when removing last video", () => {
        // Arrange
        const videoId = "LastVideo";
        const existingVideo = { ...mockVideoElement, id: videoId };
        (DOMBackgroundVideo as any).videos.set(videoId, existingVideo);

        // Act
        DOMBackgroundVideo.removeVideoElement(videoId);

        // Assert
        expect(mockResizeObserver.disconnect).toHaveBeenCalled();
      });

      it("should not disconnect resize observer when other videos remain", () => {
        // Arrange
        const video1 = { ...mockVideoElement, id: "Video1" };
        const video2 = { ...mockVideoElement, id: "Video2" };
        (DOMBackgroundVideo as any).videos.set("Video1", video1);
        (DOMBackgroundVideo as any).videos.set("Video2", video2);

        // Act
        DOMBackgroundVideo.removeVideoElement("Video1");

        // Assert
        expect(mockResizeObserver.disconnect).not.toHaveBeenCalled();
        expect((DOMBackgroundVideo as any).videos.has("Video2")).toBe(true);
      });
    });

    describe("when video element does not exist", () => {
      it("should not attempt to remove or clean up", () => {
        // Act
        DOMBackgroundVideo.removeVideoElement("NonExistentVideo");

        // Assert
        expect(mockResizeObserver.disconnect).not.toHaveBeenCalled();
        expect(mockVideoElement.remove).not.toHaveBeenCalled();
      });
    });
  });

  describe("applyConfig", () => {
    it("should apply configuration to existing video", () => {
      // Arrange
      const videoId = "TestVideo";
      const video = { ...mockVideoElement, style: {} };
      (DOMBackgroundVideo as any).videos.set(videoId, video);
      
      const config: VideoConfigOption = {
        zIndex: 15,
        muted: true,
        hidden: false
      };

      // Act
      DOMBackgroundVideo.applyConfig(videoId, config);

      // Assert
      expect(video.style.zIndex).toBe("15");
      expect(video.muted).toBe(true);
      expect(video.style.visibility).toBe("visible");
    });

    it("should handle hidden configuration", () => {
      // Arrange
      const videoId = "TestVideo";
      const video = { ...mockVideoElement, style: {} };
      (DOMBackgroundVideo as any).videos.set(videoId, video);
      
      const config: VideoConfigOption = {
        hidden: true
      };

      // Act
      DOMBackgroundVideo.applyConfig(videoId, config);

      // Assert
      expect(video.style.visibility).toBe("hidden");
    });

    it("should use default values when config properties are undefined", () => {
      // Arrange
      const videoId = "TestVideo";
      const video = { ...mockVideoElement, style: {} };
      (DOMBackgroundVideo as any).videos.set(videoId, video);
      
      const config: VideoConfigOption = {};

      // Act
      DOMBackgroundVideo.applyConfig(videoId, config);

      // Assert
      expect(video.style.zIndex).toBe("10"); // HTMLZIndex.VIDEO
      expect(video.muted).toBe(false);
      expect(video.style.visibility).toBe("visible");
    });

    it("should not apply config if video does not exist", () => {
      // Arrange
      const config: VideoConfigOption = { zIndex: 15 };

      // Act & Assert - should not throw
      expect(() => DOMBackgroundVideo.applyConfig("NonExistentVideo", config)).not.toThrow();
    });
  });

  describe("toFront", () => {
    it("should bring specified video to front and hide others", () => {
      // Arrange
      const video1 = { ...mockVideoElement, id: "Video1", style: {} };
      const video2 = { ...mockVideoElement, id: "Video2", style: {} };
      const video3 = { ...mockVideoElement, id: "Video3", style: {} };
      
      (DOMBackgroundVideo as any).videos.set("Video1", video1);
      (DOMBackgroundVideo as any).videos.set("Video2", video2);
      (DOMBackgroundVideo as any).videos.set("Video3", video3);

      // Act
      DOMBackgroundVideo.toFront("Video2");

      // Assert
      expect(video1.style.zIndex).toBe("9"); // HIDDEN
      expect(video2.style.zIndex).toBe("10"); // VIDEO (front)
      expect(video3.style.zIndex).toBe("9"); // HIDDEN
    });

    it("should not error if video does not exist", () => {
      // Act & Assert - should not throw
      expect(() => DOMBackgroundVideo.toFront("NonExistentVideo")).not.toThrow();
    });
  });

  describe("changeBackground", () => {
    it("should set background image on specified video", () => {
      // Arrange
      const videoId = "TestVideo";
      const video = { ...mockVideoElement, style: {} };
      (DOMBackgroundVideo as any).videos.set(videoId, video);
      const imageUrl = "https://example.com/background.jpg";

      // Spy on console.log since the method logs
      const consoleSpy = jest.spyOn(console, "log").mockImplementation();

      // Act
      DOMBackgroundVideo.changeBackground(videoId, imageUrl);

      // Assert
      expect(video.style.background).toBe(`url(${imageUrl}) center/cover no-repeat`);
      expect(video.style.backgroundSize).toBe("100% 100%");
      expect(consoleSpy).toHaveBeenCalledWith("changing background", videoId, imageUrl);

      // Cleanup
      consoleSpy.mockRestore();
    });
  });

  describe("notify", () => {
    it("should dispatch custom event through genericEventNotifier", () => {
      // Arrange
      const testData = { url: "test.jpg" };
      const consoleSpy = jest.spyOn(console, "log").mockImplementation();
      const dispatchSpy = jest.spyOn(DOMBackgroundVideo.genericEventNotifier, "dispatchEvent");

      // Act
      DOMBackgroundVideo.notify(GenericBackgroundVideoEvents.SWITCH_BACKGROUND, testData);

      // Assert
      expect(consoleSpy).toHaveBeenCalledWith("notifying", GenericBackgroundVideoEvents.SWITCH_BACKGROUND, testData);
      expect(dispatchSpy).toHaveBeenCalledWith(expect.any(CustomEvent));
      
      const dispatchedEvent = dispatchSpy.mock.calls[0][0] as CustomEvent;
      expect(dispatchedEvent.type).toBe(GenericBackgroundVideoEvents.SWITCH_BACKGROUND);
      expect(dispatchedEvent.detail).toEqual(testData);

      // Cleanup
      consoleSpy.mockRestore();
      dispatchSpy.mockRestore();
    });
  });

  describe("onResize (private method)", () => {
    it("should handle portrait orientation correctly", () => {
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
      
      // Create existing video
      const videoId = "TestVideo";
      const video = { ...mockVideoElement, style: {} };
      (DOMBackgroundVideo as any).videos.set(videoId, video);
      
      (document.getElementById as jest.Mock)
        .mockReturnValue(mockContainer);

      // Act - simulate resize by calling the private onResize method
      (DOMBackgroundVideo as any).onResize(videoId);

      // Assert
      expect(video.style.width).toBe("800px"); // height becomes width in portrait
      expect(video.style.height).toBe("400px"); // width becomes height in portrait
    });
  });

  describe("event management", () => {
    it("should register events when creating first video", () => {
      // Arrange
      (document.getElementById as jest.Mock)
        .mockReturnValueOnce(mockContainer) // container for createOrLoadVideoElement
        .mockReturnValueOnce(mockGameCanvas) // game canvas for createOrLoadVideoElement
        .mockReturnValueOnce(mockContainer); // container for registerEvents

      // Act
      DOMBackgroundVideo.createOrLoadVideoElement();

      // Assert
      expect(mockResizeObserver.observe).toHaveBeenCalledWith(mockContainer);
    });

    it("should not register events multiple times", () => {
      // Arrange
      (document.getElementById as jest.Mock)
        .mockReturnValueOnce(mockContainer) // container for Video1
        .mockReturnValueOnce(mockGameCanvas) // game canvas for Video1
        .mockReturnValueOnce(mockContainer) // container for registerEvents (first video)
        .mockReturnValueOnce(mockContainer) // container for Video2  
        .mockReturnValueOnce(mockGameCanvas); // game canvas for Video2

      // Act - create multiple videos
      DOMBackgroundVideo.createOrLoadVideoElement("Video1");
      DOMBackgroundVideo.createOrLoadVideoElement("Video2");

      // Assert - observe should only be called once
      expect(mockResizeObserver.observe).toHaveBeenCalledTimes(1);
    });

    it("should unregister events when removing last video", () => {
      // Arrange - create and then remove a video
      (document.getElementById as jest.Mock)
        .mockReturnValueOnce(mockContainer) // container for createOrLoadVideoElement
        .mockReturnValueOnce(mockGameCanvas) // game canvas for createOrLoadVideoElement
        .mockReturnValueOnce(mockContainer); // container for registerEvents
      
      DOMBackgroundVideo.createOrLoadVideoElement("OnlyVideo");

      // Act
      DOMBackgroundVideo.removeVideoElement("OnlyVideo");

      // Assert
      expect(mockResizeObserver.disconnect).toHaveBeenCalled();
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
        .mockReturnValueOnce(mockGameCanvas);

      // Act
      const result = DOMBackgroundVideo.createOrLoadVideoElement();

      // Assert - should use landscape orientation logic (width >= height)
      expect(mockVideoElement.style.width).toBe("600px");
      expect(mockVideoElement.style.height).toBe("600px");
      expect(result).toBe(mockVideoElement);
    });

    it("should handle multiple video lifecycle", () => {
      // Arrange
      (document.getElementById as jest.Mock)
        .mockReturnValueOnce(mockContainer) // container for Video1
        .mockReturnValueOnce(mockGameCanvas) // game canvas for Video1
        .mockReturnValueOnce(mockContainer) // container for registerEvents (first video)
        .mockReturnValueOnce(mockContainer) // container for Video2
        .mockReturnValueOnce(mockGameCanvas); // game canvas for Video2

      // Act - create multiple videos
      const video1 = DOMBackgroundVideo.createOrLoadVideoElement("Video1");
      const video2 = DOMBackgroundVideo.createOrLoadVideoElement("Video2");

      // Assert - both videos should exist
      expect((DOMBackgroundVideo as any).videos.size).toBe(2);
      expect((DOMBackgroundVideo as any).videos.get("Video1")).toBe(video1);
      expect((DOMBackgroundVideo as any).videos.get("Video2")).toBe(video2);

      // Act - remove one video
      DOMBackgroundVideo.removeVideoElement("Video1");

      // Assert - only one video should remain
      expect((DOMBackgroundVideo as any).videos.size).toBe(1);
      expect((DOMBackgroundVideo as any).videos.has("Video1")).toBe(false);
      expect((DOMBackgroundVideo as any).videos.has("Video2")).toBe(true);
    });
  });
});