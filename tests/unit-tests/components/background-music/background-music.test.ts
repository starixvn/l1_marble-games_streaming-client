jest.mock("observer", () => require("../../../utils/mock-store").createMockObserver());
import { BackgroundMusic } from "../../../../assets/scripts/components/background-music/background-music";
import { AudioSource } from "cc";


describe("BackgroundMusic", () => {
	let comp: BackgroundMusic;
	let audioSource: jest.Mocked<AudioSource>;

	beforeEach(() => {
		// Arrange
		comp = new BackgroundMusic();
		audioSource = {
			play: jest.fn(),
			stop: jest.fn(),
			playing: false,
		} as any;
		comp.audioSource = audioSource as any;
		comp.isPlaying = true;
	});

	describe("play", () => {
		it("plays when isPlaying is true and not already playing", () => {
			// Arrange
			(audioSource as any).playing = false;
			comp.isPlaying = true;

			// Act
			comp.play();

			// Assert
			expect(audioSource.play).toHaveBeenCalled();
		});

		it("does not play when isPlaying is false", () => {
			// Arrange
			comp.isPlaying = false;

			// Act
			comp.play();

			// Assert
			expect(audioSource.play).not.toHaveBeenCalled();
		});

		it("does not play when already playing", () => {
			// Arrange
			(audioSource as any).playing = true;
			comp.isPlaying = true;

			// Act
			comp.play();

			// Assert
			expect(audioSource.play).not.toHaveBeenCalled();
		});
	});

	describe("pause", () => {
		it("stops audio source", () => {
			// Arrange
			// Act
			comp.pause();

			// Assert
			expect(audioSource.stop).toHaveBeenCalled();
		});
	});

	describe("renderEventData", () => {
		it("sets isPlaying true and calls play when isPlaying is true", () => {
			// Arrange
			const playSpy = jest.spyOn(comp, "play");

			// Act
			(comp as any).renderEventData(true);

			// Assert
			expect(comp.isPlaying).toBe(true);
			expect(playSpy).toHaveBeenCalled();
		});

		it("sets isPlaying false and calls pause when isPlaying is false", () => {
			// Arrange
			const pauseSpy = jest.spyOn(comp, "pause");

			// Act
			(comp as any).renderEventData(false);

			// Assert
			expect(comp.isPlaying).toBe(false);
			expect(pauseSpy).toHaveBeenCalled();
		});
	});
});
