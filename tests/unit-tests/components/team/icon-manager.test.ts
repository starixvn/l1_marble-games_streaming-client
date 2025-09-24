import { IconManager } from "../../../../assets/scripts/components/team/icon-manager";
import { Icon } from "../../../../assets/scripts/components/team/icon";
import { Team } from "../../../../assets/scripts/components/team/team";
import { Sprite, SpriteFrame } from "cc";
import * as CC from "cc";


describe("IconManager", () => {
	let comp: IconManager;

	beforeEach(() => {
		// Arrange
		comp = new IconManager();
	});

	describe("onLoad", () => {
		it("collects sprites from targets", () => {
			// Arrange
			const node1 = (comp as any).node;
			const icon1 = node1.addComponent(Icon);
			node1.addComponent(Sprite);
			const node2 = (comp as any).node;
			const icon2 = node2.addComponent(Icon);
			node2.addComponent(Sprite);
			(comp as any).targets = [icon1, icon2];

			// Act
			(comp as any).onLoad();

			// Assert
			expect(((comp as any).sprites as Sprite[]).length).toBe(2);
		});
	});

	describe("syncOperator", () => {
		it("stores operator", () => {
			// Arrange
			// Act
			(comp as any).syncOperator("op");

			// Assert
			expect((comp as any).operator).toBe("op");
		});
	});

	describe("syncTeamName", () => {
		it("sets name for HOME team", () => {
			// Arrange
			comp.team = Team.HOME;
			const spy = jest.spyOn(comp as any, "name", "set");
			const data: any = { homeTeamName: "team_home", awayTeamName: "team_away" };

			// Act
			(comp as any).syncTeamName(data);

			// Assert
			expect(spy).toHaveBeenCalledWith("team_home");
		});

		it("sets name for AWAY team", () => {
			// Arrange
			comp.team = Team.AWAY;
			const spy = jest.spyOn(comp as any, "name", "set");
			const data: any = { homeTeamName: "home", awayTeamName: "away" };

			// Act
			(comp as any).syncTeamName(data);

			// Assert
			expect(spy).toHaveBeenCalledWith("away");
		});
	});

	describe("name getter", () => {
		it("returns spriteFrame name of first sprite", () => {
			// Arrange
			(comp as any).sprites = [new Sprite()];
			((comp as any).sprites[0].spriteFrame as unknown as Record<string, any>)["name"] = "LOGO";

			// Act
			const result = (comp as any).name;

			// Assert
			expect(result).toBe("LOGO");
		});
	});

	describe("name setter", () => {
		it("returns early when operator is empty", () => {
			// Arrange
			(comp as any).operator = "";

			// Act
			(comp as any).name = "some_team";

			// Assert
			expect((comp as any).operator).toBe("");
		});

		it("loads sprite via operator path and applies on success", () => {
			// Arrange
			(comp as any).operator = "op";
			const s1 = new Sprite();
			const s2 = new Sprite();
			(comp as any).sprites = [s1, s2];
			(CC as any).resources = { load: jest.fn() };

			// Act
			(comp as any).name = "team";

			// Assert
			expect((CC as any).resources.load).toHaveBeenCalledWith(
				"icons/op/team/spriteFrame",
				SpriteFrame,
				expect.any(Function)
			);

			const cb = ((CC as any).resources.load as jest.Mock).mock.calls[0][2] as (err: any, spriteFrame: SpriteFrame | null) => void;
			const sf = new SpriteFrame();
			cb(null, sf);
			expect(s1.spriteFrame).toBe(sf);
			expect(s2.spriteFrame).toBe(sf);
		});

		it("falls back to common path when first load fails", () => {
			// Arrange
			(comp as any).operator = "op";
			(comp as any).sprites = [];
			(CC as any).resources = { load: jest.fn() };

			// Act
			(comp as any).name = "club";

			// Assert initial call
			expect((CC as any).resources.load).toHaveBeenCalledWith(
				"icons/op/club/spriteFrame",
				SpriteFrame,
				expect.any(Function)
			);

			const cb = ((CC as any).resources.load as jest.Mock).mock.calls[0][2] as (err: any, spriteFrame: SpriteFrame | null) => void;
			cb(new Error("fail"), null);
			// Fallback call
			expect((((CC as any).resources.load as jest.Mock).mock.calls[1][0])).toBe("icons/common/club/spriteFrame");
			expect((((CC as any).resources.load as jest.Mock).mock.calls[1][1])).toBe(SpriteFrame);
			expect((((CC as any).resources.load as jest.Mock).mock.calls[1][2])).toEqual(expect.any(Function));
		});
	});
});
