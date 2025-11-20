jest.mock("observer", () =>
  require("../../../utils/mock-store").createMockObserver()
);
import { CommentatorVoice } from "../../../../assets/scripts/components/commentator-voice/commentator-voice";
import { CommentatorVoiceStore } from "../../../../assets/scripts/features/commentator-voice/commentator-voice-store";
import { AudioStore } from "../../../../assets/scripts/local-stores/audio/audio-store";
import { SfxStore } from "../../../../assets/scripts/local-stores/sfx/sfx-store";
import { VisibilityStore } from "../../../../assets/scripts/local-stores/visibility/visibility-store";
import { Store } from "../../../../assets/scripts/store";
import {
  cleanupMockObserver,
  createMockStore,
  expectStoreMethodCalled,
  initializeMockContainer,
  spyOnStoreMethods,
} from "../../../utils/mock-store";

describe("CommentatorVoice", () => {
  let comp: CommentatorVoice;
  let sfxStore: ReturnType<typeof createMockStore<SfxStore>>;
  let sfxSpies: Record<string, jest.SpyInstance>;

  beforeAll(() => {
    initializeMockContainer();
    createMockStore(
      Store as any,
      {
        language: "en-US",
        operator: "common",
      } as any
    );
    createMockStore(
      AudioStore as any,
      {
        muted: false,
        browserBlocked: false,
      } as any
    );
    createMockStore(
      VisibilityStore as any,
      {
        isVisible: true,
      } as any
    );
    sfxStore = createMockStore(
      SfxStore as any,
      {
        sfxCache: new Map(),
        playingSfx: [],
        audioStore: {
          muted: false,
          browserBlocked: false,
        },
        visibilityStore: {
          isVisible: true,
        },
      } as any
    );
    createMockStore(
      CommentatorVoiceStore as any,
      {
        data: { fileName: "" },
      } as any
    );
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

  describe("syncLanguageSupport", () => {
    beforeEach(() => {
      // Reset to default state
      (comp as any).languagePath = "en-US/";
    });

    it("updates languagePath with supported language en-US", () => {
      // Arrange
      const language = "en-US";

      // Act
      comp.syncLanguageSupport(language);

      // Assert
      expect((comp as any).languagePath).toBe("en-US/");
    });

    it("updates languagePath with supported language vi-VN", () => {
      // Arrange
      const language = "vi-VN";

      // Act
      comp.syncLanguageSupport(language);

      // Assert
      expect((comp as any).languagePath).toBe("vi-VN/");
    });

    it("does not update languagePath when language is not supported", () => {
      // Arrange
      const language = "fr-FR";
      const initialPath = (comp as any).languagePath;

      // Act
      comp.syncLanguageSupport(language);

      // Assert
      expect((comp as any).languagePath).toBe(initialPath);
    });

    it("does not update languagePath when language is empty string", () => {
      // Arrange
      const language = "";
      const initialPath = (comp as any).languagePath;

      // Act
      comp.syncLanguageSupport(language);

      // Assert
      expect((comp as any).languagePath).toBe(initialPath);
    });

    it("does not update languagePath when language is not in languagesSupport", () => {
      // Arrange
      const language = "zh-CN";
      const initialPath = (comp as any).languagePath;

      // Act
      comp.syncLanguageSupport(language);

      // Assert
      expect((comp as any).languagePath).toBe(initialPath);
    });
  });

  describe("syncPlayingVoice", () => {
    beforeEach(() => {
      // Reset to default state
      (comp as any).languagePath = "en-US/";
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
      const expectedPath =
        "audios/commentator-voices/en-US/goal/goal_celebration";

      // Act
      comp.syncPlayingVoice({ fileName });

      // Assert
      expectStoreMethodCalled(sfxSpies, "playSfx", expectedPath);
    });

    it("extracts event name correctly from fileName with underscores", () => {
      // Arrange
      const fileName = "penalty_kick_saved.wav";
      const expectedPath =
        "audios/commentator-voices/en-US/penalty/penalty_kick_saved.wav";

      // Act
      comp.syncPlayingVoice({ fileName });

      // Assert
      expectStoreMethodCalled(sfxSpies, "playSfx", expectedPath);
    });

    it("handles fileName with multiple underscores", () => {
      // Arrange
      const fileName = "red_card_shown_player";
      const expectedPath =
        "audios/commentator-voices/en-US/red/red_card_shown_player";

      // Act
      comp.syncPlayingVoice({ fileName });

      // Assert
      expectStoreMethodCalled(sfxSpies, "playSfx", expectedPath);
    });

    it("uses updated languagePath in full path", () => {
      // Arrange
      const fileName = "goal_scored";
      comp.syncLanguageSupport("vi-VN");
      const expectedPath = "audios/commentator-voices/vi-VN/goal/goal_scored";

      // Act
      comp.syncPlayingVoice({ fileName });

      // Assert
      expectStoreMethodCalled(sfxSpies, "playSfx", expectedPath);
    });

    it("handles fileName without underscores", () => {
      // Arrange
      const fileName = "whistle_1_1";
      const expectedPath =
        "audios/commentator-voices/en-US/whistle/whistle_1_1";

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
