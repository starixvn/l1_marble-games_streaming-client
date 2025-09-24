jest.mock("observer", () => require("../../utils/mock-store").createMockObserver());
import { BackgroundMusic } from "../../../assets/scripts/audios/background-music";
import { AudioSource } from "cc";


describe("BackgroundMusic", () => {
	let comp: BackgroundMusic;
	let audioSource: jest.Mocked<AudioSource>;

	beforeEach(() => {
		// Arrange
		comp = new BackgroundMusic();
		audioSource = {
			play: jest.fn(),
			pause: jest.fn(),
			playing: false,
		} as any;
		comp.audioSource = audioSource as any;
		(comp as any).playing = true;
		comp.muted = false;
	});

	describe("play", () => {
		it("plays when not muted, playing true, and not already playing", () => {
			// Arrange
			(audioSource as any).playing = false;

			// Act
			comp.play();

			// Assert
			expect(audioSource.play).toHaveBeenCalled();
		});

		it("does not play when muted", () => {
			// Arrange
			comp.muted = true;

			// Act
			comp.play();

			// Assert
			expect(audioSource.play).not.toHaveBeenCalled();
		});
	});

	describe("pause", () => {
		it("pauses audio source", () => {
			// Arrange
			// Act
			comp.pause();

			// Assert
			expect(audioSource.pause).toHaveBeenCalled();
		});
	});

	describe("syncMuted", () => {
		it("pauses when muted true", () => {
			// Arrange
			const pauseSpy = jest.spyOn(comp, "pause");

			// Act
			(comp as any).syncMuted({ muted: true, browserBlocked: false });

			// Assert
			expect(pauseSpy).toHaveBeenCalled();
			expect((comp as any).muted).toBe(true);
		});

		it("plays when not muted and not browserBlocked", () => {
			// Arrange
			const playSpy = jest.spyOn(comp, "play");

			// Act
			(comp as any).syncMuted({ muted: false, browserBlocked: false });

			// Assert
			expect(playSpy).toHaveBeenCalled();
			expect((comp as any).muted).toBe(false);
		});
	});

	describe("renderEventData", () => {
		it("sets playing true and calls play for non-streaming states", () => {
			// Arrange
			const playSpy = jest.spyOn(comp, "play");

			// Act
			(comp as any).renderEventData("Prebet");

			// Assert
			expect(comp.playing).toBe(true);
			expect(playSpy).toHaveBeenCalled();
		});

		it("sets playing false and calls pause for streaming state", () => {
			// Arrange
			const pauseSpy = jest.spyOn(comp, "pause");

			// Act
			(comp as any).renderEventData("Streaming");

			// Assert
			expect(comp.playing).toBe(false);
			expect(pauseSpy).toHaveBeenCalled();
		});
	});
});
