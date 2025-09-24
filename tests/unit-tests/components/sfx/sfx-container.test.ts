jest.mock("observer", () => require("../../../utils/mock-store").createMockObserver());
import { SfxContainer } from "../../../../assets/scripts/components/sfx/sfx-container";
import { AudioSource, AudioClip } from "cc";
import { initializeMockContainer, cleanupMockObserver, createMockStore } from "../../../utils/mock-store";
import { AudioStore } from "../../../../assets/scripts/local-stores/audio/audio-store";
import { SfxStore } from "../../../../assets/scripts/local-stores/sfx/sfx-store";


describe("SfxContainer", () => {
	let comp: SfxContainer;
	let audioSource: jest.Mocked<AudioSource>;

	beforeAll(() => {
		initializeMockContainer();
		createMockStore(AudioStore as any, { muted: false, browserBlocked: false } as any);
		createMockStore(SfxStore as any, { playingSfx: [] } as any);
	});

	afterAll(() => {
		cleanupMockObserver();
	});

	beforeEach(() => {
		// Arrange
		comp = new SfxContainer();
		audioSource = {
			clip: undefined as any,
			playOneShot: jest.fn(),
		} as any;
		comp.audioSource = audioSource as any;
	});

	describe("syncMuted", () => {
		it("sets muted to true when muted is true", () => {
			// Arrange
			// Act
			(comp as any).syncMuted({ muted: true, browserBlocked: false });

			// Assert
			expect((comp as any).muted).toBe(true);
		});

		it("sets muted to true when browserBlocked is true", () => {
			// Arrange
			// Act
			(comp as any).syncMuted({ muted: false, browserBlocked: true });

			// Assert
			expect((comp as any).muted).toBe(true);
		});

		it("sets muted to true when both muted and browserBlocked are true", () => {
			// Arrange
			// Act
			(comp as any).syncMuted({ muted: true, browserBlocked: true });

			// Assert
			expect((comp as any).muted).toBe(true);
		});

		it("sets muted to false when both muted and browserBlocked are false", () => {
			// Arrange
			// Act
			(comp as any).syncMuted({ muted: false, browserBlocked: false });

			// Assert
			expect((comp as any).muted).toBe(false);
		});
	});

	describe("syncSfx", () => {
		it("returns early when muted", () => {
			// Arrange
			(comp as any).muted = true;

			// Act
			(comp as any).syncSfx({ playingSfx: [] });

			// Assert
			expect(audioSource.playOneShot).not.toHaveBeenCalled();
		});

		it("plays each sfx in playingSfx array when not muted", () => {
			// Arrange
			(comp as any).muted = false;
			const mockAudioClip1 = {} as AudioClip;
			const mockAudioClip2 = {} as AudioClip;
			const playingSfx = [mockAudioClip1, mockAudioClip2];

			// Act
			(comp as any).syncSfx({ playingSfx });

			// Assert
			expect(audioSource.playOneShot).toHaveBeenCalledTimes(2);
			expect(audioSource.playOneShot).toHaveBeenNthCalledWith(1, mockAudioClip1);
			expect(audioSource.playOneShot).toHaveBeenNthCalledWith(2, mockAudioClip2);
			expect(audioSource.clip).toBe(mockAudioClip2);
		});

		it("does not play when playingSfx array is empty", () => {
			// Arrange
			(comp as any).muted = false;

			// Act
			(comp as any).syncSfx({ playingSfx: [] });

			// Assert
			expect(audioSource.playOneShot).not.toHaveBeenCalled();
		});
	});
});
