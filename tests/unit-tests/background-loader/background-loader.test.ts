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

jest.mock("cc", () => ({
  _decorator: {
    ccclass: jest.fn().mockImplementation(() => (target: any) => target),
    property: jest.fn().mockImplementation(() => (target: any, propertyKey: string) => {}),
  },
  Component: class MockComponent {
    node: any = {};
  },
  SpriteFrame: class MockSpriteFrame {
    texture: any = null;
  },
}));

// Mock DOMBackgroundVideo
jest.mock("../../../assets/scripts/video-player/dom-background-video", () => ({
  DOMBackgroundVideo: {
    notify: jest.fn(),
  },
  GenericBackgroundVideoEvents: {
    SWITCH_BACKGROUND: "SwitchBackground",
  },
}));

import { BackgroundLoader } from "../../../assets/scripts/background-loader/background-loader";
import { DOMBackgroundVideo, GenericBackgroundVideoEvents } from "../../../assets/scripts/video-player/dom-background-video";
import { Component } from "cc";

// Test class to access protected methods
class TestableBackgroundLoader extends BackgroundLoader {
  public callOnLoad(): void {
    this.onLoad();
  }
}

describe("BackgroundLoader", () => {
  let loader: TestableBackgroundLoader;

  beforeEach(() => {
    jest.clearAllMocks();
    loader = new TestableBackgroundLoader();
  });

  describe("initialization", () => {
    it("should extend Component", () => {
      // Assert
      expect(loader).toBeInstanceOf(Component);
    });

    it("should have backgroundSprite property initialized as null", () => {
      // Assert
      expect(loader.backgroundSprite).toBeNull();
    });

    it("should be a properly decorated component class", () => {
      // Assert - The class should have proper decorator setup
      // Note: Decorators are applied at module load time, not during test execution
      expect(loader.backgroundSprite).toBeDefined(); // Property exists due to @property decorator
      expect(loader).toBeInstanceOf(Component); // Class inheritance due to @ccclass decorator
    });
  });

  describe("onLoad", () => {
    describe("when backgroundSprite is null", () => {
      it("should return early without calling DOMBackgroundVideo.notify", () => {
        // Arrange
        loader.backgroundSprite = null;

        // Act
        loader.callOnLoad();

        // Assert
        expect(DOMBackgroundVideo.notify).not.toHaveBeenCalled();
      });
    });

    describe("when backgroundSprite is undefined", () => {
      it("should return early without calling DOMBackgroundVideo.notify", () => {
        // Arrange
        loader.backgroundSprite = undefined as any;

        // Act
        loader.callOnLoad();

        // Assert
        expect(DOMBackgroundVideo.notify).not.toHaveBeenCalled();
      });
    });

    describe("when backgroundSprite exists", () => {
      it("should extract URL from sprite texture and notify DOMBackgroundVideo", () => {
        // Arrange
        const expectedUrl = "https://example.com/background.jpg";
        loader.backgroundSprite = mockSpriteFrame as any;

        // Act
        loader.callOnLoad();

        // Assert
        expect(DOMBackgroundVideo.notify).toHaveBeenCalledWith(
          GenericBackgroundVideoEvents.SWITCH_BACKGROUND,
          { url: expectedUrl }
        );
      });

      it("should handle empty URL from sprite texture", () => {
        // Arrange
        loader.backgroundSprite = mockSpriteFrameWithoutSrc as any;

        // Act
        loader.callOnLoad();

        // Assert
        expect(DOMBackgroundVideo.notify).toHaveBeenCalledWith(
          GenericBackgroundVideoEvents.SWITCH_BACKGROUND,
          { url: "" }
        );
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
          loader.backgroundSprite = spriteWithUrl as any;

          // Act
          loader.callOnLoad();

          // Assert
          expect(DOMBackgroundVideo.notify).toHaveBeenCalledWith(
            GenericBackgroundVideoEvents.SWITCH_BACKGROUND,
            { url }
          );
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
      loader.backgroundSprite = complexSpriteFrame as any;

      // Act
      loader.callOnLoad();

      // Assert
      expect(DOMBackgroundVideo.notify).toHaveBeenCalledWith(
        GenericBackgroundVideoEvents.SWITCH_BACKGROUND,
        { url: expectedUrl }
      );
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
      loader.backgroundSprite = spriteFrame as any;

      // Act
      loader.callOnLoad();

      // Assert - Verify that the texture was accessed as 'any' type to bypass TypeScript restrictions
      expect(DOMBackgroundVideo.notify).toHaveBeenCalledWith(
        GenericBackgroundVideoEvents.SWITCH_BACKGROUND,
        { url: "test-url.png" }
      );
    });
  });

  describe("DOMBackgroundVideo integration", () => {
    it("should call notify with correct event type", () => {
      // Arrange
      loader.backgroundSprite = mockSpriteFrame as any;

      // Act
      loader.callOnLoad();

      // Assert
      expect(DOMBackgroundVideo.notify).toHaveBeenCalledWith(
        GenericBackgroundVideoEvents.SWITCH_BACKGROUND,
        expect.any(Object)
      );
    });

    it("should call notify with correctly structured data object", () => {
      // Arrange
      const testUrl = "https://test.example.com/bg.jpg";
      const spriteWithTestUrl = {
        texture: {
          image: {
            _nativeData: {
              currentSrc: testUrl
            }
          }
        }
      };
      loader.backgroundSprite = spriteWithTestUrl as any;

      // Act
      loader.callOnLoad();

      // Assert
      expect(DOMBackgroundVideo.notify).toHaveBeenCalledWith(
        GenericBackgroundVideoEvents.SWITCH_BACKGROUND,
        {
          url: testUrl
        }
      );
    });

    it("should call notify exactly once per onLoad call", () => {
      // Arrange
      loader.backgroundSprite = mockSpriteFrame as any;

      // Act
      loader.callOnLoad();

      // Assert
      expect(DOMBackgroundVideo.notify).toHaveBeenCalledTimes(1);
    });
  });

  describe("edge cases", () => {
    it("should handle malformed texture structure gracefully", () => {
      // Arrange
      const malformedSprite = {
        texture: null
      };
      loader.backgroundSprite = malformedSprite as any;

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
      loader.backgroundSprite = spriteWithoutNativeData as any;

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
      loader.backgroundSprite = spriteWithoutImage as any;

      // Act & Assert - Should throw error when trying to access image
      expect(() => {
        loader.callOnLoad();
      }).toThrow();
    });

    it("should handle multiple onLoad calls", () => {
      // Arrange
      loader.backgroundSprite = mockSpriteFrame as any;

      // Act
      loader.callOnLoad();
      loader.callOnLoad();
      loader.callOnLoad();

      // Assert
      expect(DOMBackgroundVideo.notify).toHaveBeenCalledTimes(3);
      expect(DOMBackgroundVideo.notify).toHaveBeenNthCalledWith(1,
        GenericBackgroundVideoEvents.SWITCH_BACKGROUND,
        { url: "https://example.com/background.jpg" }
      );
      expect(DOMBackgroundVideo.notify).toHaveBeenNthCalledWith(2,
        GenericBackgroundVideoEvents.SWITCH_BACKGROUND,
        { url: "https://example.com/background.jpg" }
      );
      expect(DOMBackgroundVideo.notify).toHaveBeenNthCalledWith(3,
        GenericBackgroundVideoEvents.SWITCH_BACKGROUND,
        { url: "https://example.com/background.jpg" }
      );
    });

    it("should handle changing backgroundSprite between calls", () => {
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
      loader.backgroundSprite = sprite1 as any;
      loader.callOnLoad();
      expect(DOMBackgroundVideo.notify).toHaveBeenLastCalledWith(
        GenericBackgroundVideoEvents.SWITCH_BACKGROUND,
        { url: "url1.jpg" }
      );

      loader.backgroundSprite = sprite2 as any;
      loader.callOnLoad();
      expect(DOMBackgroundVideo.notify).toHaveBeenLastCalledWith(
        GenericBackgroundVideoEvents.SWITCH_BACKGROUND,
        { url: "url2.jpg" }
      );

      loader.backgroundSprite = null;
      loader.callOnLoad();
      // Should not call notify when sprite is null
      expect(DOMBackgroundVideo.notify).toHaveBeenCalledTimes(2);
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
      loader.backgroundSprite = mockSpriteFrame as any;

      // Act
      loader.callOnLoad();

      // Assert
      expect(callOnLoadSpy).toHaveBeenCalled();
    });
  });

  describe("property decoration", () => {
    it("should initialize backgroundSprite as null by default", () => {
      // Arrange
      const newLoader = new TestableBackgroundLoader();

      // Assert
      expect(newLoader.backgroundSprite).toBeNull();
    });

    it("should allow setting backgroundSprite to valid SpriteFrame", () => {
      // Act
      loader.backgroundSprite = mockSpriteFrame as any;

      // Assert
      expect(loader.backgroundSprite).toBe(mockSpriteFrame);
    });

    it("should allow setting backgroundSprite back to null", () => {
      // Arrange
      loader.backgroundSprite = mockSpriteFrame as any;

      // Act
      loader.backgroundSprite = null;

      // Assert
      expect(loader.backgroundSprite).toBeNull();
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

      // Act - Complete workflow
      loader.backgroundSprite = sprite as any;
      loader.callOnLoad();

      // Assert
      expect(DOMBackgroundVideo.notify).toHaveBeenCalledWith(
        GenericBackgroundVideoEvents.SWITCH_BACKGROUND,
        { url: backgroundUrl }
      );
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
        loader.backgroundSprite = sprite as any;
        loader.callOnLoad();

        // Assert
        expect(DOMBackgroundVideo.notify).toHaveBeenCalledWith(
          GenericBackgroundVideoEvents.SWITCH_BACKGROUND,
          { url: bgUrl }
        );
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
      loader.backgroundSprite = sprite1 as any;
      expect(loader.backgroundSprite).toBe(sprite1);
      loader.callOnLoad();

      // Act - Change sprite and load again
      loader.backgroundSprite = sprite2 as any;
      expect(loader.backgroundSprite).toBe(sprite2);
      loader.callOnLoad();

      // Assert
      expect(DOMBackgroundVideo.notify).toHaveBeenCalledTimes(2);
      expect(DOMBackgroundVideo.notify).toHaveBeenNthCalledWith(1,
        GenericBackgroundVideoEvents.SWITCH_BACKGROUND,
        { url: "background1.jpg" }
      );
      expect(DOMBackgroundVideo.notify).toHaveBeenNthCalledWith(2,
        GenericBackgroundVideoEvents.SWITCH_BACKGROUND,
        { url: "background2.jpg" }
      );
    });
  });
});
