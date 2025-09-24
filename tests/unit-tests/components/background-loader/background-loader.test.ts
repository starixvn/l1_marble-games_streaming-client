jest.mock("../../../../assets/scripts/components/background-loader/dom-background-image", () => ({
	DOMBackgroundImage: {
		createBackgroundImageElement: jest.fn(),
	},
}));

import { BackgroundLoader } from "../../../../assets/scripts/components/background-loader/background-loader";
import { DOMBackgroundImage } from "../../../../assets/scripts/components/background-loader/dom-background-image";
import { Node, SpriteFrame } from "cc";


describe("BackgroundLoader", () => {
	let comp: BackgroundLoader;

	beforeEach(() => {
		// Arrange
		comp = new BackgroundLoader();
	});

	describe("onLoad", () => {
		it("creates background image when backgroundImage is present", () => {
			// Arrange
			const textureLike: any = { image: { _nativeData: { currentSrc: "http://img.png" } } };
			const spriteFrame = new SpriteFrame();
			(spriteFrame as any).texture = textureLike;
			comp.backgroundImage = spriteFrame;
			const spy = jest.spyOn(DOMBackgroundImage, "createBackgroundImageElement").mockReturnValue({} as any);

			// Act
			(comp as any).onLoad();

			// Assert
			expect(spy).toHaveBeenCalledWith("http://img.png");
		});
	});

	describe("updateVideoPlaceholderNode", () => {
		it("sets node active when node exists", () => {
			// Arrange
			const node = new Node();
			comp.videoPlaceholderNode = node;

			// Act
			comp.updateVideoPlaceholderNode(true);

			// Assert
			expect(node.active).toBe(true);
		});

		it("does nothing when node is null", () => {
			// Arrange
			comp.videoPlaceholderNode = null as any;

			// Act
			comp.updateVideoPlaceholderNode(false);

			// Assert
			expect(comp.videoPlaceholderNode).toBeNull();
		});
	});
});
