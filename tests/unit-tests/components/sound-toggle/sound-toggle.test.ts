jest.mock("observer", () => require("../../../utils/mock-store").createMockObserver());
import { SoundToggle } from "../../../../assets/scripts/components/sound-toggle/sound-toggle";
import { Toggle } from "cc";
import { initializeMockContainer, cleanupMockObserver, createMockStore, spyOnStoreMethods, expectStoreMethodCalled } from "../../../utils/mock-store";
import { AudioStore } from "../../../../assets/scripts/local-stores/audio/audio-store";


describe("SoundToggle", () => {
	let comp: SoundToggle;
	let toggle: jest.Mocked<Toggle>;
	let audioStore: ReturnType<typeof createMockStore<AudioStore>>;
	let audioSpies: Record<string, jest.SpyInstance>;

	beforeAll(() => {
		initializeMockContainer();
		audioStore = createMockStore(AudioStore as any, { muted: false, browserBlocked: false } as any);
	});

	afterAll(() => {
		cleanupMockObserver();
	});

	beforeEach(() => {
		// Arrange
		comp = new SoundToggle();
		toggle = { isChecked: true } as any;
		(comp as any).soundToggle = toggle as any;
		audioSpies = spyOnStoreMethods(audioStore as any, ["setMuted"] as any);
	});

	describe("onToggleSound", () => {
		it("calls setMuted with inverse of isChecked", () => {
			// Arrange
			toggle.isChecked = false;

			// Act
			comp.onToggleSound();

			// Assert
			expectStoreMethodCalled(audioSpies, "setMuted" as never, true);
		});
	});

	describe("renderMuted", () => {
		it("updates toggle isChecked inversely to muted", () => {
			// Arrange
			// Act
			(comp as any).renderMuted(true);

			// Assert
			expect(toggle.isChecked).toBe(false);
		});
	});
});
