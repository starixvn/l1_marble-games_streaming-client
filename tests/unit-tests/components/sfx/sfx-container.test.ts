jest.mock("observer", () => require("../../../utils/mock-store").createMockObserver());
import { SfxContainer } from "../../../../assets/scripts/components/sfx/sfx-container";
import { AudioSource, AudioClip } from "cc";
import { initializeMockContainer, cleanupMockObserver, createMockStore } from "../../../utils/mock-store";
import { SfxStore } from "../../../../assets/scripts/local-stores/sfx/sfx-store";


describe("SfxContainer", () => {
	let comp: SfxContainer;
	let audioSource: jest.Mocked<AudioSource>;

	beforeAll(() => {
		initializeMockContainer();
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


	describe("syncSfx", () => {
		it("plays each sfx in playingSfx array", () => {
			// Arrange
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
			// Act
			(comp as any).syncSfx({ playingSfx: [] });

			// Assert
			expect(audioSource.playOneShot).not.toHaveBeenCalled();
		});
	});
});
