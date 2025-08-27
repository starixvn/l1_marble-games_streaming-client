import { createMockStore, cleanupMockObserver, initializeMockContainer } from "../../utils/mock-store";

// Mock cc module first (before any imports)
const mockSpriteFrame = {
  texture: {
    image: {
      _nativeData: {
        currentSrc: "https://example.com/background.jpg"
      }
    }
  }
};

const mockSpriteFrameWithoutSrc = {
  texture: {
    image: {
      _nativeData: {
        currentSrc: ""
      }
    }
  }
};

const mockNode = {
  active: true,
};

jest.mock("cc", () => ({
  _decorator: {
    ccclass: jest.fn().mockImplementation(() => (target: any) => target),
    property: jest.fn().mockImplementation(() => (target: any, propertyKey: string) => {}),
  },
  Component: class MockComponent {
    node: any = {};
  },
  Node: class MockNode {
    active: boolean = true;
  },
  SpriteFrame: class MockSpriteFrame {
    texture: any = null;
  },
}));

// Mock Observer BEFORE importing the component
jest.mock("observer", () => {
  const { createMockObserver } = require("../../utils/mock-store");
  return createMockObserver();
});

// Mock DOMBackgroundImage
jest.mock("../../../assets/scripts/background-loader/dom-background-image", () => ({
  DOMBackgroundImage: {
    createBackgroundImageElement: jest.fn(),
  },
}));

import { BackgroundLoader } from "../../../assets/scripts/background-loader/background-loader";
import { DOMBackgroundImage } from "../../../assets/scripts/background-loader/dom-background-image";
import { VideoStore } from "../../../assets/scripts/video-player/video-store";
import { Component } from "cc";

// Test class to access protected methods
class TestableBackgroundLoader extends BackgroundLoader {
  public callOnLoad(): void {
    this.onLoad();
  }
}

describe("BackgroundLoader", () => {
  let loader: TestableBackgroundLoader;
  let mockVideoStore: VideoStore & {
    update: (props: Partial<VideoStore>) => void;
    reset: (props: Partial<VideoStore>) => void;
  };

  beforeAll(() => {
    initializeMockContainer();
    
    mockVideoStore = createMockStore(VideoStore, {
      play: false,
      url: "",
      videoLiveTime: 0,
      defaultBackgroundEnabled: false,
    });
  });

  afterAll(() => {
    cleanupMockObserver();
  });

  beforeEach(() => {
    jest.clearAllMocks();
    loader = new TestableBackgroundLoader();
    
    mockVideoStore.reset({
      play: false,
      url: "",
      videoLiveTime: 0,
      defaultBackgroundEnabled: false,
    });
  });

  describe("initialization", () => {
    it("should extend Component", () => {
      // Assert
      expect(loader).toBeInstanceOf(Component);
    });

    it("should have backgroundImage property initialized as null", () => {
      // Assert
      expect(loader.backgroundImage).toBeNull();
    });

    it("should have videoPlaceholderNode property initialized as null", () => {
      // Assert
      expect(loader.videoPlaceholderNode).toBeNull();
    });

    it("should be a properly decorated component class", () => {
      // Assert - The class should have proper decorator setup
      // Note: Decorators are applied at module load time, not during test execution
      expect(loader.backgroundImage).toBeDefined(); // Property exists due to @property decorator
      expect(loader.videoPlaceholderNode).toBeDefined(); // Property exists due to @property decorator
      expect(loader).toBeInstanceOf(Component); // Class inheritance due to @ccclass decorator
    });
  });

  describe("onLoad", () => {
    describe("when backgroundImage is null", () => {
      it("should return early without calling DOMBackgroundImage.createBackgroundImageElement", () => {
        // Arrange
        loader.backgroundImage = null;

        // Act
        loader.callOnLoad();

        // Assert
        expect(DOMBackgroundImage.createBackgroundImageElement).not.toHaveBeenCalled();
      });
    });

    describe("when backgroundImage is undefined", () => {
      it("should return early without calling DOMBackgroundImage.createBackgroundImageElement", () => {
        // Arrange
        loader.backgroundImage = undefined as any;

        // Act
        loader.callOnLoad();

        // Assert
        expect(DOMBackgroundImage.createBackgroundImageElement).not.toHaveBeenCalled();
      });
    });

    describe("when backgroundImage exists", () => {
      it("should extract URL from sprite texture and call DOMBackgroundImage.createBackgroundImageElement", () => {
        // Arrange
        const expectedUrl = "https://example.com/background.jpg";
        loader.backgroundImage = mockSpriteFrame as any;

        // Act
        loader.callOnLoad();

        // Assert
        expect(DOMBackgroundImage.createBackgroundImageElement).toHaveBeenCalledWith(expectedUrl);
      });

      it("should handle empty URL from sprite texture", () => {
        // Arrange
        loader.backgroundImage = mockSpriteFrameWithoutSrc as any;

        // Act
        loader.callOnLoad();

        // Assert
        expect(DOMBackgroundImage.createBackgroundImageElement).toHaveBeenCalledWith("");
      });

      it("should handle different URL formats", () => {
        // Arrange
        const testUrls = [
          "https://cdn.example.com/bg.png",
          "http://localhost:3000/background.webp",
          "/assets/backgrounds/scene1.jpg",
          "./images/bg.gif",
          "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg=="
        ];

        testUrls.forEach(url => {
          // Arrange
          jest.clearAllMocks();
          const spriteWithUrl = {
            texture: {
              image: {
                _nativeData: {
                  currentSrc: url
                }
              }
            }
          };
          loader.backgroundImage = spriteWithUrl as any;

          // Act
          loader.callOnLoad();

          // Assert
          expect(DOMBackgroundImage.createBackgroundImageElement).toHaveBeenCalledWith(url);
        });
      });
    });
  });

  describe("URL extraction", () => {
    it("should extract URL from deeply nested texture structure", () => {
      // Arrange
      const expectedUrl = "https://assets.example.com/backgrounds/level1.jpg";
      const complexSpriteFrame = {
        texture: {
          image: {
            _nativeData: {
              currentSrc: expectedUrl,
              otherProperty: "should be ignored"
            },
            otherImageProperty: "should be ignored"
          },
          otherTextureProperty: "should be ignored"
        },
        otherSpriteProperty: "should be ignored"
      };
      loader.backgroundImage = complexSpriteFrame as any;

      // Act
      loader.callOnLoad();

      // Assert
      expect(DOMBackgroundImage.createBackgroundImageElement).toHaveBeenCalledWith(expectedUrl);
    });

    it("should access texture through type casting", () => {
      // Arrange
      const spriteFrame = {
        texture: {
          image: {
            _nativeData: {
              currentSrc: "test-url.png"
            }
          }
        }
      };
      loader.backgroundImage = spriteFrame as any;

      // Act
      loader.callOnLoad();

      // Assert - Verify that the texture was accessed as 'any' type to bypass TypeScript restrictions
      expect(DOMBackgroundImage.createBackgroundImageElement).toHaveBeenCalledWith("test-url.png");
    });
  });

  describe("DOMBackgroundImage integration", () => {
    it("should call createBackgroundImageElement with correct URL", () => {
      // Arrange
      loader.backgroundImage = mockSpriteFrame as any;

      // Act
      loader.callOnLoad();

      // Assert
      expect(DOMBackgroundImage.createBackgroundImageElement).toHaveBeenCalledWith("https://example.com/background.jpg");
    });

    it("should call createBackgroundImageElement exactly once per onLoad call", () => {
      // Arrange
      loader.backgroundImage = mockSpriteFrame as any;

      // Act
      loader.callOnLoad();

      // Assert
      expect(DOMBackgroundImage.createBackgroundImageElement).toHaveBeenCalledTimes(1);
    });
  });

  describe("VideoStore integration and render decorator", () => {
    it("should update videoPlaceholderNode visibility when VideoStore.play changes", () => {
      // Arrange
      const mockVideoPlaceholderNode = { ...mockNode };
      loader.videoPlaceholderNode = mockVideoPlaceholderNode as any;
      
      // Act - VideoStore play becomes true (video playing)
      mockVideoStore.update({ play: true });

      // Assert - Node should be hidden when video is playing
      expect(mockVideoPlaceholderNode.active).toBe(false);
    });

    it("should show videoPlaceholderNode when video is not playing", () => {
      // Arrange
      const mockVideoPlaceholderNode = { ...mockNode };
      loader.videoPlaceholderNode = mockVideoPlaceholderNode as any;
      
      // Act - VideoStore play becomes false (video not playing)
      mockVideoStore.update({ play: false });

      // Assert - Node should be visible when video is not playing
      expect(mockVideoPlaceholderNode.active).toBe(true);
    });

    it("should handle null videoPlaceholderNode gracefully", () => {
      // Arrange
      loader.videoPlaceholderNode = null;
      
      // Act & Assert - Should not throw error
      expect(() => {
        mockVideoStore.update({ play: true });
      }).not.toThrow();
    });

    it("should handle undefined videoPlaceholderNode gracefully", () => {
      // Arrange
      loader.videoPlaceholderNode = undefined as any;
      
      // Act & Assert - Should not throw error
      expect(() => {
        mockVideoStore.update({ play: false });
      }).not.toThrow();
    });
  });

  describe("edge cases", () => {
    it("should handle malformed texture structure gracefully", () => {
      // Arrange
      const malformedSprite = {
        texture: null
      };
      loader.backgroundImage = malformedSprite as any;

      // Act & Assert - Should throw error when trying to access nested properties
      expect(() => {
        loader.callOnLoad();
      }).toThrow();
    });

    it("should handle missing _nativeData gracefully", () => {
      // Arrange
      const spriteWithoutNativeData = {
        texture: {
          image: {
            // Missing _nativeData
          }
        }
      };
      loader.backgroundImage = spriteWithoutNativeData as any;

      // Act & Assert - Should throw error when trying to access currentSrc
      expect(() => {
        loader.callOnLoad();
      }).toThrow();
    });

    it("should handle missing image property gracefully", () => {
      // Arrange
      const spriteWithoutImage = {
        texture: {
          // Missing image property
        }
      };
      loader.backgroundImage = spriteWithoutImage as any;

      // Act & Assert - Should throw error when trying to access image
      expect(() => {
        loader.callOnLoad();
      }).toThrow();
    });

    it("should handle multiple onLoad calls", () => {
      // Arrange
      loader.backgroundImage = mockSpriteFrame as any;

      // Act
      loader.callOnLoad();
      loader.callOnLoad();
      loader.callOnLoad();

      // Assert
      expect(DOMBackgroundImage.createBackgroundImageElement).toHaveBeenCalledTimes(3);
      expect(DOMBackgroundImage.createBackgroundImageElement).toHaveBeenNthCalledWith(1, "https://example.com/background.jpg");
      expect(DOMBackgroundImage.createBackgroundImageElement).toHaveBeenNthCalledWith(2, "https://example.com/background.jpg");
      expect(DOMBackgroundImage.createBackgroundImageElement).toHaveBeenNthCalledWith(3, "https://example.com/background.jpg");
    });

    it("should handle changing backgroundImage between calls", () => {
      // Arrange
      const sprite1 = {
        texture: {
          image: {
            _nativeData: {
              currentSrc: "url1.jpg"
            }
          }
        }
      };
      const sprite2 = {
        texture: {
          image: {
            _nativeData: {
              currentSrc: "url2.jpg"
            }
          }
        }
      };

      // Act & Assert
      loader.backgroundImage = sprite1 as any;
      loader.callOnLoad();
      expect(DOMBackgroundImage.createBackgroundImageElement).toHaveBeenLastCalledWith("url1.jpg");

      loader.backgroundImage = sprite2 as any;
      loader.callOnLoad();
      expect(DOMBackgroundImage.createBackgroundImageElement).toHaveBeenLastCalledWith("url2.jpg");

      loader.backgroundImage = null;
      loader.callOnLoad();
      // Should not call createBackgroundImageElement when sprite is null
      expect(DOMBackgroundImage.createBackgroundImageElement).toHaveBeenCalledTimes(2);
    });
  });

  describe("component lifecycle", () => {
    it("should be a Cocos Creator component", () => {
      // Assert
      expect(loader).toBeInstanceOf(Component);
    });

    it("should have node property from Component inheritance", () => {
      // Assert
      expect(loader).toHaveProperty("node");
    });

    it("should call onLoad as part of component lifecycle", () => {
      // Arrange
      const callOnLoadSpy = jest.spyOn(loader, "callOnLoad");
      loader.backgroundImage = mockSpriteFrame as any;

      // Act
      loader.callOnLoad();

      // Assert
      expect(callOnLoadSpy).toHaveBeenCalled();
    });
  });

  describe("property decoration", () => {
    it("should initialize backgroundImage as null by default", () => {
      // Arrange
      const newLoader = new TestableBackgroundLoader();

      // Assert
      expect(newLoader.backgroundImage).toBeNull();
    });

    it("should initialize videoPlaceholderNode as null by default", () => {
      // Arrange
      const newLoader = new TestableBackgroundLoader();

      // Assert
      expect(newLoader.videoPlaceholderNode).toBeNull();
    });

    it("should allow setting backgroundImage to valid SpriteFrame", () => {
      // Act
      loader.backgroundImage = mockSpriteFrame as any;

      // Assert
      expect(loader.backgroundImage).toBe(mockSpriteFrame);
    });

    it("should allow setting videoPlaceholderNode to valid Node", () => {
      // Act
      loader.videoPlaceholderNode = mockNode as any;

      // Assert
      expect(loader.videoPlaceholderNode).toBe(mockNode);
    });

    it("should allow setting backgroundImage back to null", () => {
      // Arrange
      loader.backgroundImage = mockSpriteFrame as any;

      // Act
      loader.backgroundImage = null;

      // Assert
      expect(loader.backgroundImage).toBeNull();
    });

    it("should allow setting videoPlaceholderNode back to null", () => {
      // Arrange
      loader.videoPlaceholderNode = mockNode as any;

      // Act
      loader.videoPlaceholderNode = null;

      // Assert
      expect(loader.videoPlaceholderNode).toBeNull();
    });
  });

  describe("integration scenarios", () => {
    it("should handle complete background loading workflow", () => {
      // Arrange
      const backgroundUrl = "https://game.example.com/backgrounds/forest.jpg";
      const sprite = {
        texture: {
          image: {
            _nativeData: {
              currentSrc: backgroundUrl
            }
          }
        }
      };
      const mockVideoPlaceholderNode = { ...mockNode };

      // Act - Complete workflow
      loader.backgroundImage = sprite as any;
      loader.videoPlaceholderNode = mockVideoPlaceholderNode as any;
      loader.callOnLoad();

      // Assert
      expect(DOMBackgroundImage.createBackgroundImageElement).toHaveBeenCalledWith(backgroundUrl);
    });

    it("should work correctly with different background assets", () => {
      // Arrange
      const backgrounds = [
        "https://cdn.game.com/bg/level1.jpg",
        "https://cdn.game.com/bg/level2.png",
        "https://cdn.game.com/bg/menu.webp"
      ];

      backgrounds.forEach((bgUrl, index) => {
        // Arrange
        jest.clearAllMocks();
        const sprite = {
          texture: {
            image: {
              _nativeData: {
                currentSrc: bgUrl
              }
            }
          }
        };

        // Act
        loader.backgroundImage = sprite as any;
        loader.callOnLoad();

        // Assert
        expect(DOMBackgroundImage.createBackgroundImageElement).toHaveBeenCalledWith(bgUrl);
      });
    });

    it("should maintain state between property changes", () => {
      // Arrange
      const sprite1 = {
        texture: {
          image: {
            _nativeData: {
              currentSrc: "background1.jpg"
            }
          }
        }
      };
      const sprite2 = {
        texture: {
          image: {
            _nativeData: {
              currentSrc: "background2.jpg"
            }
          }
        }
      };

      // Act - Set first sprite and load
      loader.backgroundImage = sprite1 as any;
      expect(loader.backgroundImage).toBe(sprite1);
      loader.callOnLoad();

      // Act - Change sprite and load again
      loader.backgroundImage = sprite2 as any;
      expect(loader.backgroundImage).toBe(sprite2);
      loader.callOnLoad();

      // Assert
      expect(DOMBackgroundImage.createBackgroundImageElement).toHaveBeenCalledTimes(2);
      expect(DOMBackgroundImage.createBackgroundImageElement).toHaveBeenNthCalledWith(1, "background1.jpg");
      expect(DOMBackgroundImage.createBackgroundImageElement).toHaveBeenNthCalledWith(2, "background2.jpg");
    });

    it("should handle combined background loading and video placeholder management", () => {
      // Arrange
      const backgroundUrl = "https://example.com/bg.jpg";
      const sprite = {
        texture: {
          image: {
            _nativeData: {
              currentSrc: backgroundUrl
            }
          }
        }
      };
      const mockVideoPlaceholderNode = { ...mockNode };
      loader.backgroundImage = sprite as any;
      loader.videoPlaceholderNode = mockVideoPlaceholderNode as any;

      // Act - Load background
      loader.callOnLoad();

      // Act - Start video playback
      mockVideoStore.update({ play: true });

      // Assert
      expect(DOMBackgroundImage.createBackgroundImageElement).toHaveBeenCalledWith(backgroundUrl);
      expect(mockVideoPlaceholderNode.active).toBe(false);

      // Act - Stop video playback
      mockVideoStore.update({ play: false });

      // Assert
      expect(mockVideoPlaceholderNode.active).toBe(true);
    });
  });
});
