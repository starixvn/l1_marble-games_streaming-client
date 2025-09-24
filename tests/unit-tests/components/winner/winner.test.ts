import { Winner } from "../../../../assets/scripts/components/winner/winner";
import { Node } from "cc";

jest.mock("db://i18n/LanguageData", () => ({
	t: (key: string) => (key === "Common.HOME" || key === "Common.AWAY" ? "" : key)
}));

class MockLocalizedLabel {
	_key = "";
	set key(v: string) { this._key = v; }
	get key() { return this._key; }
	updateLabel = jest.fn();
}

describe("Winner", () => {
	let comp: Winner;

	beforeEach(() => {
		// Arrange
		comp = new Winner();
		(comp as any).home = new Node();
		(comp as any).away = new Node();
		(comp as any).label = new MockLocalizedLabel() as any;
	});

	describe("syncTeamName", () => {
		it("stores team codes and triggers render", () => {
			// Arrange
			const spy = jest.spyOn(comp as any, "render");

			// Act
			comp.syncTeamName({ homeTeamName: "HOME", awayTeamName: "AWAY" } as any);

			// Assert
			expect((comp as any).homeCode).toBe("HOME");
			expect((comp as any).awayCode).toBe("AWAY");
			expect(spy).toHaveBeenCalled();
		});
	});

	describe("syncOperator", () => {
		it("stores operator and triggers render", () => {
			// Arrange
			const spy = jest.spyOn(comp as any, "render");

			// Act
			comp.syncOperator("Operator");

			// Assert
			expect((comp as any).operator).toBe("Operator");
			expect(spy).toHaveBeenCalled();
		});
	});

	describe("updateWinner", () => {
		it("sets winner to home when home score >= away", () => {
			// Arrange
			(comp as any).homeCode = "HOME";
			(comp as any).awayCode = "AWAY";
			const data: any = { result: { 0: { homeScore: 1, awayScore: 0 }, 1: { homeScore: 0, awayScore: 0 } } };

			// Act
			comp.updateWinner(data);

			// Assert
			expect((comp as any).winner).toBe("HOME");
			expect((comp as any).home.active).toBe(true);
			expect((comp as any).away.active).toBe(false);
		});

		it("sets label key using operator when translation exists", () => {
			// Arrange
			(comp as any).homeCode = "HOME";
			(comp as any).awayCode = "AWAY";
			(comp as any).operator = "Operator";
			const data: any = { result: { 0: { homeScore: 0, awayScore: 2 } } };

			// Act
			comp.updateWinner(data);

			// Assert
			expect(((comp as any).label)._key).toBe("Operator.AWAY");
		});
	});
});
