import { Asset, AssetManager, assetManager, log } from "cc";
import { BundleManager, bundleManager } from "../../../assets/scripts/asset-loader/bundle-manager";

// Mock asset types for testing
class MockAsset extends Asset {}
class MockImageAsset extends Asset {}

describe("BundleManager", () => {
  let manager: BundleManager;
  let mockBundle: AssetManager.Bundle;

  beforeEach(() => {
    jest.clearAllMocks();
    manager = BundleManager.getInstance();
    mockBundle = new AssetManager.Bundle();
    
    // Reset the singleton instance for clean testing
    (BundleManager as any)._instance = new BundleManager();
    manager = BundleManager.getInstance();
  });

  afterEach(() => {
    // Clear cached bundles and assets
    manager["bundles"] = {};
    manager.cachedAssets = {};
  });

  describe("getInstance", () => {
    it("should return singleton instance", () => {
      // Act
      const instance1 = BundleManager.getInstance();
      const instance2 = BundleManager.getInstance();
      
      // Assert
      expect(instance1).toBe(instance2);
      expect(instance1).toBeInstanceOf(BundleManager);
    });
  });

  describe("loadBundle", () => {
    it("should load bundle successfully", async () => {
      // Arrange
      const bundleName = "test-bundle";
      (assetManager.loadBundle as jest.Mock).mockImplementation((name, callback) => {
        callback(null, mockBundle);
      });

      // Act
      const result = await manager.loadBundle(bundleName);

      // Assert
      expect(result).toBe(mockBundle);
      expect(assetManager.loadBundle).toHaveBeenCalledWith(bundleName, expect.any(Function));
      expect(manager["bundles"][bundleName]).toBe(mockBundle);
    });

    it("should return cached bundle if already loaded", async () => {
      // Arrange
      const bundleName = "cached-bundle";
      manager["bundles"][bundleName] = mockBundle;

      // Act
      const result = await manager.loadBundle(bundleName);

      // Assert
      expect(result).toBe(mockBundle);
      expect(assetManager.loadBundle).not.toHaveBeenCalled();
    });

    it("should return null on load error", async () => {
      // Arrange
      const bundleName = "error-bundle";
      const error = new Error("Load failed");
      (assetManager.loadBundle as jest.Mock).mockImplementation((name, callback) => {
        callback(error, null);
      });

      // Act
      const result = await manager.loadBundle(bundleName);

      // Assert
      expect(result).toBeNull();
      expect(log).toHaveBeenCalledWith("Can not load bundle ", bundleName);
    });
  });

  describe("getRemoteAsset", () => {
    it("should load remote asset successfully", async () => {
      // Arrange
      const url = "https://example.com/asset.jpg";
      const mockAsset = new MockImageAsset();
      (assetManager.loadRemote as jest.Mock).mockImplementation((assetUrl, callback) => {
        callback(null, mockAsset);
      });

      // Act
      const result = await manager.getRemoteAsset<MockImageAsset>(url);

      // Assert
      expect(result).toBe(mockAsset);
      expect(assetManager.loadRemote).toHaveBeenCalledWith(url, expect.any(Function));
      expect(log).toHaveBeenCalledWith(`Successfully loaded asset from ${url}`);
    });

    it("should return null on remote asset load error", async () => {
      // Arrange
      const url = "https://example.com/invalid.jpg";
      const error = new Error("Network error");
      (assetManager.loadRemote as jest.Mock).mockImplementation((assetUrl, callback) => {
        callback(error, null);
      });

      // Act
      const result = await manager.getRemoteAsset<MockImageAsset>(url);

      // Assert
      expect(result).toBeNull();
      expect(log).toHaveBeenCalledWith(`Failed to load asset from ${url}:`, error);
    });
  });

  describe("loadAssetsFromBundle", () => {
    it("should load asset from bundle successfully", async () => {
      // Arrange
      const bundleName = "test-bundle";
      const assetPath = "images/sprite";
      const assetType = MockImageAsset;
      const mockAsset = new MockImageAsset();
      const onProgress = jest.fn();
      
      (assetManager.loadBundle as jest.Mock).mockImplementation((name, callback) => {
        callback(null, mockBundle);
      });
      (mockBundle.load as jest.Mock).mockImplementation((path, type, progress, callback) => {
        callback(null, mockAsset);
      });

      // Act
      const result = await manager.loadAssetsFromBundle(bundleName, assetPath, assetType, onProgress);

      // Assert
      expect(result).toBe(mockAsset);
      expect(mockBundle.load).toHaveBeenCalledWith(assetPath, assetType, onProgress, expect.any(Function));
    });

    it("should cache asset when isCached is true", async () => {
      // Arrange
      const bundleName = "test-bundle";
      const assetPath = "images/cached-sprite";
      const assetType = MockImageAsset;
      const mockAsset = new MockImageAsset();
      
      (assetManager.loadBundle as jest.Mock).mockImplementation((name, callback) => {
        callback(null, mockBundle);
      });
      (mockBundle.load as jest.Mock).mockImplementation((path, type, progress, callback) => {
        callback(null, mockAsset);
      });

      // Act
      const result = await manager.loadAssetsFromBundle(bundleName, assetPath, assetType, null, true);

      // Assert
      expect(result).toBe(mockAsset);
      expect(manager.cachedAssets[assetPath]).toBe(mockAsset);
    });

    it("should return null when bundle load fails", async () => {
      // Arrange
      const bundleName = "invalid-bundle";
      const assetPath = "images/sprite";
      const assetType = MockImageAsset;
      
      (assetManager.loadBundle as jest.Mock).mockImplementation((name, callback) => {
        callback(new Error("Bundle not found"), null);
      });

      // Act
      const result = await manager.loadAssetsFromBundle(bundleName, assetPath, assetType, null);

      // Assert
      expect(result).toBeNull();
    });

    it("should return null when asset load fails", async () => {
      // Arrange
      const bundleName = "test-bundle";
      const assetPath = "images/invalid-sprite";
      const assetType = MockImageAsset;
      
      (assetManager.loadBundle as jest.Mock).mockImplementation((name, callback) => {
        callback(null, mockBundle);
      });
      (mockBundle.load as jest.Mock).mockImplementation((path, type, progress, callback) => {
        callback(new Error("Asset not found"), null);
      });

      // Act
      const result = await manager.loadAssetsFromBundle(bundleName, assetPath, assetType, null);

      // Assert
      expect(result).toBeNull();
      expect(log).toHaveBeenCalledWith(`Cannot load asset ${assetPath} from bundle ${bundleName}`);
    });
  });

  describe("loadSharedAsset", () => {
    it("should load asset from shared-bundle", async () => {
      // Arrange
      const assetPath = "images/shared-sprite";
      const assetType = MockImageAsset;
      const mockAsset = new MockImageAsset();
      const onProgress = jest.fn();
      
      (assetManager.loadBundle as jest.Mock).mockImplementation((name, callback) => {
        callback(null, mockBundle);
      });
      (mockBundle.load as jest.Mock).mockImplementation((path, type, progress, callback) => {
        callback(null, mockAsset);
      });

      // Act
      const result = await manager.loadSharedAsset(assetPath, assetType, onProgress);

      // Assert
      expect(result).toBe(mockAsset);
      expect(assetManager.loadBundle).toHaveBeenCalledWith("shared-bundle", expect.any(Function));
    });
  });

  describe("loadInstantSharedAsset", () => {
    it("should load asset from shared-instant-bundle", async () => {
      // Arrange
      const assetPath = "images/instant-sprite";
      const assetType = MockImageAsset;
      const mockAsset = new MockImageAsset();
      
      (assetManager.loadBundle as jest.Mock).mockImplementation((name, callback) => {
        callback(null, mockBundle);
      });
      (mockBundle.load as jest.Mock).mockImplementation((path, type, progress, callback) => {
        callback(null, mockAsset);
      });

      // Act
      const result = await manager.loadInstantSharedAsset(assetPath, assetType);

      // Assert
      expect(result).toBe(mockAsset);
      expect(assetManager.loadBundle).toHaveBeenCalledWith("shared-instant-bundle", expect.any(Function));
    });
  });

  describe("loadResourcesAsset", () => {
    it("should load asset from resources bundle", async () => {
      // Arrange
      const assetPath = "images/resource-sprite";
      const assetType = MockImageAsset;
      const mockAsset = new MockImageAsset();
      
      (assetManager.loadBundle as jest.Mock).mockImplementation((name, callback) => {
        callback(null, mockBundle);
      });
      (mockBundle.load as jest.Mock).mockImplementation((path, type, progress, callback) => {
        callback(null, mockAsset);
      });

      // Act
      const result = await manager.loadResourcesAsset(assetPath, assetType);

      // Assert
      expect(result).toBe(mockAsset);
      expect(assetManager.loadBundle).toHaveBeenCalledWith("resources", expect.any(Function));
    });
  });

  describe("loadPortraitDirectSharedAsset", () => {
    it("should load asset from shared-portrait-direct-bundle", async () => {
      // Arrange
      const assetPath = "images/portrait-sprite";
      const assetType = MockImageAsset;
      const mockAsset = new MockImageAsset();
      
      (assetManager.loadBundle as jest.Mock).mockImplementation((name, callback) => {
        callback(null, mockBundle);
      });
      (mockBundle.load as jest.Mock).mockImplementation((path, type, progress, callback) => {
        callback(null, mockAsset);
      });

      // Act
      const result = await manager.loadPortraitDirectSharedAsset(assetPath, assetType);

      // Assert
      expect(result).toBe(mockAsset);
      expect(assetManager.loadBundle).toHaveBeenCalledWith("shared-portrait-direct-bundle", expect.any(Function));
    });
  });

  describe("bundleManager export", () => {
    it("should export singleton instance", () => {
      // Assert
      expect(bundleManager).toBeInstanceOf(BundleManager);
      expect(bundleManager.constructor.name).toBe('BundleManager');
    });
  });
});
