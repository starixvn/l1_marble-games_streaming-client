import { FulltimeManager, FullTimeDisplayStatus } from "../../../../assets/scripts/components/fulltime/fulltime-manager";
import { Node } from "cc";


describe("FulltimeManager", () => {
	let comp: FulltimeManager;

	beforeEach(() => {
		// Arrange
		comp = new FulltimeManager();
		(comp as any).unschedule = jest.fn();
		(comp as any).scheduleOnce = jest.fn();
		comp.fulltime = new Node();
		comp.result = new Node();
		comp.draw = new Node();
	});

	describe("syncCurrentPhase", () => {
		it("updates currentPhase from data", () => {
			// Arrange
			const data: any = { phase: 2 };

			// Act
			comp.syncCurrentPhase(data);

			// Assert
			expect(comp.currentPhase).toBe(2);
		});
	});

	describe("syncResult", () => {
		it("sets isDraw true when scores equal at current phase", () => {
			// Arrange
			(comp as any).currentPhase = 1;
			const data: any = { result: { 0: { homeScore: 1, awayScore: 0 }, 1: { homeScore: 2, awayScore: 2 } } };

			// Act
			comp.syncResult(data);

			// Assert
			expect(comp.isDraw).toBe(true);
		});

		it("sets isDraw false when scores differ at current phase", () => {
			// Arrange
			(comp as any).currentPhase = 0;
			const data: any = { result: { 0: { homeScore: 3, awayScore: 1 } } };

			// Act
			comp.syncResult(data);

			// Assert
			expect(comp.isDraw).toBe(false);
		});
	});

	describe("onEnable", () => {
		it("sets status to Fulltime and schedules displayResult", () => {
			// Arrange
			// Act
			(comp as any).onEnable();

			// Assert
			expect((comp as any).status).toBe(FullTimeDisplayStatus.Fulltime);
			expect((comp as any).scheduleOnce).toHaveBeenCalled();
		});
	});

	describe("displayResult", () => {
		it("sets status to Draw when isDraw is true", () => {
			// Arrange
			(comp as any).isDraw = true;

			// Act
			comp.displayResult();

			// Assert
			expect((comp as any).status).toBe(FullTimeDisplayStatus.Draw);
		});

		it("sets status to Result when isDraw is false", () => {
			// Arrange
			(comp as any).isDraw = false;

			// Act
			comp.displayResult();

			// Assert
			expect((comp as any).status).toBe(FullTimeDisplayStatus.Result);
		});
	});

	describe("onDisable", () => {
		it("calls cleanup", () => {
			// Arrange
			const spy = jest.spyOn(comp as any, "cleanup");

			// Act
			(comp as any).onDisable();

			// Assert
			expect(spy).toHaveBeenCalled();
		});
	});

	describe("onDestroy", () => {
		it("calls cleanup", () => {
			// Arrange
			const spy = jest.spyOn(comp as any, "cleanup");

			// Act
			(comp as any).onDestroy();

			// Assert
			expect(spy).toHaveBeenCalled();
		});
	});

	describe("updateUI", () => {
		it("activates only fulltime node when status is Fulltime", () => {
			// Arrange
			(comp as any).status = FullTimeDisplayStatus.Fulltime;

			// Act
			comp.updateUI();

			// Assert
			expect(comp.fulltime.active).toBe(true);
			expect(comp.result.active).toBe(false);
			expect(comp.draw.active).toBe(false);
		});

		it("activates only result node when status is Result", () => {
			// Arrange
			(comp as any).status = FullTimeDisplayStatus.Result;

			// Act
			comp.updateUI();

			// Assert
			expect(comp.fulltime.active).toBe(false);
			expect(comp.result.active).toBe(true);
			expect(comp.draw.active).toBe(false);
		});

		it("activates only draw node when status is Draw", () => {
			// Arrange
			(comp as any).status = FullTimeDisplayStatus.Draw;

			// Act
			comp.updateUI();

			// Assert
			expect(comp.fulltime.active).toBe(false);
			expect(comp.result.active).toBe(false);
			expect(comp.draw.active).toBe(true);
		});
	});

	describe("cleanup", () => {
		it("unschedules displayResult", () => {
			// Arrange
			// Act
			(comp as any).cleanup();

			// Assert
			expect((comp as any).unschedule).toHaveBeenCalled();
		});
	});
});
