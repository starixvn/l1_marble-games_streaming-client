jest.mock("observer", () => require("../../utils/mock-store").createMockObserver());
import { SfxContainer } from "../../../assets/scripts/audios/sfx-container";
import { AudioSource } from "cc";
import { initializeMockContainer, cleanupMockObserver, createMockStore, spyOnStoreMethods, expectStoreMethodCalled } from "../../utils/mock-store";
import { CommentatorVoiceStore, Voice } from "../../../assets/scripts/local-stores/commentators-voices/commentator-voice-store";
import { CommentatorVoiceStore as FeatureCommentatorVoiceStore } from "../../../assets/scripts/features/commentator-voice/commentator-voice-store";


describe("SfxContainer", () => {
	let comp: SfxContainer;
	let audioSource: jest.Mocked<AudioSource>;
	let voiceStore: ReturnType<typeof createMockStore<CommentatorVoiceStore>>;
	let voiceStoreSpies: Record<string, jest.SpyInstance>;

	beforeAll(() => {
		initializeMockContainer();
		voiceStore = createMockStore(CommentatorVoiceStore as any, { playingVoice: null } as any);
		createMockStore(FeatureCommentatorVoiceStore as any, { data: { fileName: "" } } as any);
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
		voiceStoreSpies = spyOnStoreMethods(voiceStore as any, ["playVoice"] as any);
	});

	describe("syncMuted", () => {
		it("updates local muted flag", () => {
			// Arrange
			// Act
			(comp as any).syncMuted({ muted: true });

			// Assert
			expect((comp as any).muted).toBe(true);
		});
	});

	describe("syncPlayingVoice", () => {
		it("calls playVoice with fileName", () => {
			// Arrange
			const spy = jest.spyOn(comp as any, "playVoice");

			// Act
			(comp as any).syncPlayingVoice({ fileName: "v1" } as any);

			// Assert
			expect(spy).toHaveBeenCalledWith("v1");
		});
	});

	describe("syncSfx", () => {
		it("returns early when muted", () => {
			// Arrange
			(comp as any).muted = true;

			// Act
			(comp as any).syncSfx({ playingVoice: {} as any });

			// Assert
			expect(audioSource.playOneShot).not.toHaveBeenCalled();
		});

		it("plays when playingVoice is loaded and has clip", () => {
			// Arrange
			(comp as any).muted = false;
			const voice: Voice = { name: "a", event: "e", duration: 1, index: 1, isLoaded: true, audioClip: {} as any };

			// Act
			(comp as any).syncSfx({ playingVoice: voice });

			// Assert
			expect(audioSource.clip).toBe(voice.audioClip);
			expect(audioSource.playOneShot).toHaveBeenCalledWith(voice.audioClip);
		});
	});

	describe("playVoice", () => {
		it("returns voice and calls store via handle", () => {
			// Arrange
			// Act
			const result = (comp as any).playVoice("goal");

			// Assert
			expect(result).toBe("goal");
			expectStoreMethodCalled(voiceStoreSpies, "playVoice" as never, "goal");
		});
	});
});
