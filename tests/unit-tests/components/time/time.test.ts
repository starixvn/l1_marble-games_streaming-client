import { Time } from "../../../../assets/scripts/components/time/time";
import { Label } from "cc";

jest.mock("db://i18n/LanguageData", () => ({
	t: (key: string) => {
		if (key === "Common.1st_half") return "1st Half";
		if (key === "Common.2nd_half") return "2nd Half";
		return key;
	}
}));

jest.mock("../../../../assets/scripts/game-settings", () => ({
	gameSettings: {
		halfDuration: 45,
		videoDuration: 30,
	}
}));

describe("Time", () => {
	let comp: Time;
	let halfLabel: Label;
	let minutesLabel: Label;
	let secondsLabel: Label;

	beforeEach(() => {
		// Arrange
		comp = new Time();
		halfLabel = new Label();
		minutesLabel = new Label();
		secondsLabel = new Label();
		(comp as any).halfLabel = halfLabel as any;
		(comp as any).minutesLabel = minutesLabel as any;
		(comp as any).secondsLabel = secondsLabel as any;
	});

	describe("syncPaused", () => {
		it("sets paused true when not streaming", () => {
			// Arrange
			const data: any = { state: "Prebet" };

			// Act
			(comp as any).syncPaused(data);

			// Assert
			expect((comp as any).paused).toBe(true);
		});
	});

	describe("syncMatchLiveTime", () => {
		it("stores timeToStream", () => {
			// Arrange
			const data: any = { timeToStream: 123456 };

			// Act
			(comp as any).syncMatchLiveTime(data);

			// Assert
			expect((comp as any)._timeToStream).toBe(123456);
		});
	});

	describe("syncHalf", () => {
		it("updates half index and label", () => {
			// Arrange
			const data: any = { phase: 1 };

			// Act
			(comp as any).syncHalf(data);

			// Assert
			expect((comp as any)._halfIndex).toBe(1);
			expect(halfLabel.string).toBe("2nd Half");
		});
	});

	describe("update (paused)", () => {
		it("resets splitSeconds and sets seconds to base half duration", () => {
			// Arrange
			(comp as any).paused = true;
			(comp as any)._halfIndex = 0;

			// Act
			(comp as any).update(0);

			// Assert
			expect((comp as any).splitSeconds).toBe(0);
			expect((comp as any).seconds).toBe(0);
			expect(minutesLabel.string).toContain(":");
			expect(secondsLabel.string.length).toBe(2);
		});
	});

	describe("update (playing)", () => {
		it("calculates seconds and splitSeconds and updates labels", () => {
			// Arrange
			(comp as any).paused = false;
			(comp as any)._halfIndex = 0;
			(comp as any)._timeToStream = Date.now() - 5000; // 5 seconds ago

			// Act
			(comp as any).update(0);

			// Assert
			expect(typeof (comp as any).seconds).toBe("number");
			expect(typeof (comp as any).splitSeconds).toBe("number");
			expect(minutesLabel.string.endsWith(":")) .toBe(true);
			expect(secondsLabel.string.length).toBe(2);
		});
	});
});
