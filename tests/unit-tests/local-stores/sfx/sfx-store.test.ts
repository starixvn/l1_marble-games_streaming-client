import { AudioClip } from "cc";
import { SfxStore, loadSfx } from "../../../../assets/scripts/local-stores/sfx/sfx-store";
import { bundleManager } from "../../../../assets/scripts/asset-loader/bundle-manager";

// Mock bundleManager
jest.mock("../../../../assets/scripts/asset-loader/bundle-manager", () => ({
	bundleManager: {
		loadResourcesAsset: jest.fn()
	}
}));

describe("loadSfx", () => {
	beforeEach(() => {
		jest.clearAllMocks();
	});

	it("returns AudioClip when loading succeeds", async () => {
		// Arrange
		const sfxName = "test-sfx";
		const mockAudioClip = new AudioClip();
		(bundleManager.loadResourcesAsset as jest.Mock).mockResolvedValue(mockAudioClip);

		// Act
		const result = await loadSfx(sfxName);

		// Assert
		expect(result).toBe(mockAudioClip);
		expect(bundleManager.loadResourcesAsset).toHaveBeenCalledWith(sfxName, AudioClip, null);
	});

	it("throws error when loading fails", async () => {
		// Arrange
		const sfxName = "test-sfx";
		(bundleManager.loadResourcesAsset as jest.Mock).mockResolvedValue(null);

		// Act & Assert
		await expect(loadSfx(sfxName)).rejects.toThrow(`Failed to load sfx: ${sfxName}`);
		expect(bundleManager.loadResourcesAsset).toHaveBeenCalledWith(sfxName, AudioClip, null);
	});
});

describe("SfxStore", () => {
	let store: SfxStore;

	beforeEach(() => {
		jest.clearAllMocks();
		// Arrange
		store = new SfxStore();
	});

	describe("constructor", () => {
		it("initializes with empty cache and playingSfx array", () => {
			// Act
			const newStore = new SfxStore();

			// Assert
			expect(newStore.sfxCache.size).toBe(0);
			expect(newStore.playingSfx).toEqual([]);
		});
	});

	describe("loadSfx", () => {
		it("loads sfx and caches it", async () => {
			// Arrange
			const sfxName = "test-sfx";
			const mockAudioClip = new AudioClip();
			(bundleManager.loadResourcesAsset as jest.Mock).mockResolvedValue(mockAudioClip);

			// Act
			const result = await store.loadSfx(sfxName);

			// Assert
			expect(result).toBe(mockAudioClip);
			expect(store.sfxCache.get(sfxName)).toBe(mockAudioClip);
			expect(bundleManager.loadResourcesAsset).toHaveBeenCalledWith(sfxName, AudioClip, null);
		});

		it("throws error when loading fails", async () => {
			// Arrange
			const sfxName = "test-sfx";
			(bundleManager.loadResourcesAsset as jest.Mock).mockResolvedValue(null);

			// Act & Assert
			await expect(store.loadSfx(sfxName)).rejects.toThrow(`Failed to load sfx: ${sfxName}`);
			expect(store.sfxCache.has(sfxName)).toBe(false);
		});
	});

	describe("playSfx", () => {
		it("plays single sfx string", async () => {
			// Arrange
			const sfxName = "test-sfx";
			const mockAudioClip = new AudioClip();
			store.sfxCache.set(sfxName, mockAudioClip);

			// Act
			await store.playSfx(sfxName);

			// Assert
			expect(store.playingSfx).toEqual([mockAudioClip]);
		});

		it("plays multiple sfx from array", async () => {
			// Arrange
			const sfxNames = ["sfx1", "sfx2", "sfx3"];
			const mockAudioClips = [new AudioClip(), new AudioClip(), new AudioClip()];
			sfxNames.forEach((name, index) => {
				store.sfxCache.set(name, mockAudioClips[index]);
			});

			// Act
			await store.playSfx(sfxNames);

			// Assert
			expect(store.playingSfx).toEqual(mockAudioClips);
		});

		it("loads and plays sfx when not cached", async () => {
			// Arrange
			const sfxName = "uncached-sfx";
			const mockAudioClip = new AudioClip();
			(bundleManager.loadResourcesAsset as jest.Mock).mockResolvedValue(mockAudioClip);

			// Act
			await store.playSfx(sfxName);

			// Assert
			expect(store.playingSfx).toEqual([mockAudioClip]);
			expect(store.sfxCache.get(sfxName)).toBe(mockAudioClip);
			expect(bundleManager.loadResourcesAsset).toHaveBeenCalledWith(sfxName, AudioClip, null);
		});

		it("loads and plays multiple uncached sfx from array", async () => {
			// Arrange
			const sfxNames = ["uncached1", "uncached2"];
			const mockAudioClips = [new AudioClip(), new AudioClip()];
			(bundleManager.loadResourcesAsset as jest.Mock)
				.mockResolvedValueOnce(mockAudioClips[0])
				.mockResolvedValueOnce(mockAudioClips[1]);

			// Act
			await store.playSfx(sfxNames);

			// Assert
			expect(store.playingSfx).toEqual(mockAudioClips);
			expect(store.sfxCache.get(sfxNames[0])).toBe(mockAudioClips[0]);
			expect(store.sfxCache.get(sfxNames[1])).toBe(mockAudioClips[1]);
			expect(bundleManager.loadResourcesAsset).toHaveBeenCalledTimes(2);
		});
	});

	describe("playOneSfx", () => {
		it("returns cached sfx when available", async () => {
			// Arrange
			const sfxName = "cached-sfx";
			const mockAudioClip = new AudioClip();
			store.sfxCache.set(sfxName, mockAudioClip);

			// Act
			const result = await (store as any).playOneSfx(sfxName);

			// Assert
			expect(result).toBe(mockAudioClip);
			expect(bundleManager.loadResourcesAsset).not.toHaveBeenCalled();
		});

		it("loads sfx when not cached", async () => {
			// Arrange
			const sfxName = "uncached-sfx";
			const mockAudioClip = new AudioClip();
			(bundleManager.loadResourcesAsset as jest.Mock).mockResolvedValue(mockAudioClip);

			// Act
			const result = await (store as any).playOneSfx(sfxName);

			// Assert
			expect(result).toBe(mockAudioClip);
			expect(store.sfxCache.get(sfxName)).toBe(mockAudioClip);
			expect(bundleManager.loadResourcesAsset).toHaveBeenCalledWith(sfxName, AudioClip, null);
		});
	});
});
