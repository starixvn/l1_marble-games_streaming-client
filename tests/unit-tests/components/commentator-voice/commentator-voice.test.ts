jest.mock("observer", () => require("../../../utils/mock-store").createMockObserver());
import { CommentatorVoice } from "../../../../assets/scripts/components/commentator-voice/commentator-voice";
import { initializeMockContainer, cleanupMockObserver, createMockStore, spyOnStoreMethods, expectStoreMethodCalled } from "../../../utils/mock-store";
import { Store } from "../../../../assets/scripts/store";
import { SfxStore } from "../../../../assets/scripts/local-stores/sfx/sfx-store";
import { CommentatorVoiceStore } from "../../../../assets/scripts/features/commentator-voice/commentator-voice-store";

describe("CommentatorVoice", () => {
	let comp: CommentatorVoice;
	let sfxStore: ReturnType<typeof createMockStore<SfxStore>>;
	let sfxSpies: Record<string, jest.SpyInstance>;

	beforeAll(() => {
		initializeMockContainer();
		createMockStore(Store as any, { 
			language: "en-US", 
			operator: "common" 
		} as any);
		sfxStore = createMockStore(SfxStore as any, { 
			sfxCache: new Map(), 
			playingSfx: [] 
		} as any);
		createMockStore(CommentatorVoiceStore as any, { 
			data: { fileName: "" } 
		} as any);
	});

	afterAll(() => {
		cleanupMockObserver();
	});

	beforeEach(() => {
		// Arrange
		comp = new CommentatorVoice();
		sfxSpies = spyOnStoreMethods(sfxStore as any, ["playSfx"] as any);
		jest.clearAllMocks();
	});

	describe("syncLanguageAndOperator", () => {
		it("updates languageAndOpetatorPath with provided language and operator", () => {
			// Arrange
			const language = "fr-FR";
			const operator = "betsson";

			// Act
			comp.syncLanguageAndOperator(language, operator);

			// Assert
			expect((comp as any).languageAndOpetatorPath).toBe("betsson/fr-FR/");
		});

		it("handles empty language and operator", () => {
			// Arrange
			const language = "";
			const operator = "";

			// Act
			comp.syncLanguageAndOperator(language, operator);

			// Assert
			expect((comp as any).languageAndOpetatorPath).toBe("//");
		});

		it("handles special characters in language and operator", () => {
			// Arrange
			const language = "zh-CN";
			const operator = "test-operator";

			// Act
			comp.syncLanguageAndOperator(language, operator);

			// Assert
			expect((comp as any).languageAndOpetatorPath).toBe("test-operator/zh-CN/");
		});
	});

	describe("syncPlayingVoice", () => {
		beforeEach(() => {
			// Reset to default state
			(comp as any).languageAndOpetatorPath = "common/en-US/";
		});

		it("returns early when fileName is empty string", () => {
			// Arrange
			const fileName = "";

			// Act
			comp.syncPlayingVoice({ fileName });

			// Assert
			expect(sfxSpies.playSfx).not.toHaveBeenCalled();
		});

		it("returns early when fileName is null or undefined", () => {
			// Arrange
			// Act
			comp.syncPlayingVoice({ fileName: null as any });
			comp.syncPlayingVoice({ fileName: undefined as any });

			// Assert
			expect(sfxSpies.playSfx).not.toHaveBeenCalled();
		});

		it("plays sfx with correct path when fileName is provided", () => {
			// Arrange
			const fileName = "goal_celebration";
			const expectedPath = "audios/commentator-voices/common/en-US/goal/goal_celebration";

			// Act
			comp.syncPlayingVoice({ fileName });

			// Assert
			expectStoreMethodCalled(sfxSpies, "playSfx", expectedPath);
		});

		it("extracts event name correctly from fileName with underscores", () => {
			// Arrange
			const fileName = "penalty_kick_saved.wav";
			const expectedPath = "audios/commentator-voices/common/en-US/penalty/penalty_kick_saved.wav";

			// Act
			comp.syncPlayingVoice({ fileName });

			// Assert
			expectStoreMethodCalled(sfxSpies, "playSfx", expectedPath);
		});

		it("handles fileName with multiple underscores", () => {
			// Arrange
			const fileName = "red_card_shown_player";
			const expectedPath = "audios/commentator-voices/common/en-US/red/red_card_shown_player";

			// Act
			comp.syncPlayingVoice({ fileName });

			// Assert
			expectStoreMethodCalled(sfxSpies, "playSfx", expectedPath);
		});

		it("uses updated languageAndOpetatorPath in full path", () => {
			// Arrange
			const fileName = "goal_scored";
			comp.syncLanguageAndOperator("es-ES", "betsson");
			const expectedPath = "audios/commentator-voices/betsson/es-ES/goal/goal_scored";

			// Act
			comp.syncPlayingVoice({ fileName });

			// Assert
			expectStoreMethodCalled(sfxSpies, "playSfx", expectedPath);
		});

		it("handles fileName without underscores", () => {
			// Arrange
			const fileName = "whistle_1_1";
			const expectedPath = "audios/commentator-voices/common/en-US/whistle/whistle_1_1";

			// Act
			comp.syncPlayingVoice({ fileName });

			// Assert
			expect(sfxSpies.playSfx).toHaveBeenLastCalledWith(expectedPath);
		});
	});

	describe("playSfx", () => {
		it("returns the provided sfx string", () => {
			// Arrange
			const sfxPath = "test/path/to/audio";

			// Act
			const result = (comp as any).playSfx(sfxPath);

			// Assert
			expect(result).toBe(sfxPath);
		});

		it("handles empty string", () => {
			// Arrange
			const sfxPath = "";

			// Act
			const result = (comp as any).playSfx(sfxPath);

			// Assert
			expect(result).toBe("");
		});

		it("handles special characters in path", () => {
			// Arrange
			const sfxPath = "audios/test-file_with-special.chars";

			// Act
			const result = (comp as any).playSfx(sfxPath);

			// Assert
			expect(result).toBe(sfxPath);
		});
	});
});
