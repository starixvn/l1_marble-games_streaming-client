import { Label } from "cc";
import { Time } from "../../../../assets/scripts/components/time/time";

jest.mock("db://i18n/LanguageData", () => ({
  t: (key: string) => {
    if (key === "common.1st_half") return "1st Half";
    if (key === "common.2nd_half") return "2nd Half";
    return key;
  },
}));

jest.mock("../../../../assets/scripts/game-settings", () => ({
  gameSettings: {
    phaseDuration: 45,
    videoDuration: {
      default: 30,
    },
  },
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

  describe("syncGame", () => {
    it("sets game and updates videoDuration to default when game not in settings", () => {
      // Arrange
      const game = "unknownGame";

      // Act
      (comp as any).syncGame(game);

      // Assert
      expect((comp as any).game).toBe("unknownGame");
      expect((comp as any).videoDuration).toBe(30);
    });

    it("sets game and uses game-specific videoDuration when available", () => {
      // Arrange
      const gameSettings = require("../../../../assets/scripts/game-settings");
      gameSettings.gameSettings.videoDuration.soccer = 60;
      const game = "soccer";

      // Act
      (comp as any).syncGame(game);

      // Assert
      expect((comp as any).game).toBe("soccer");
      expect((comp as any).videoDuration).toBe(60);
    });
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
    it("stores streamingPhaseTime in seconds", () => {
      // Arrange
      const data: any = { streamingPhaseTime: 123456 };

      // Act
      (comp as any).syncMatchLiveTime(data);

      // Assert
      expect((comp as any)._streamingPhaseTime).toBe(123.456);
    });
  });

  describe("syncHalf", () => {
    it("updates phase index and label", () => {
      // Arrange
      const data: any = { phase: 1 };

      // Act
      (comp as any).syncHalf(data);

      // Assert
      expect((comp as any)._phaseIndex).toBe(1);
      expect(halfLabel.string).toBe("2nd Half");
    });
  });

  describe("update (paused)", () => {
    it("resets seconds and minutes to 0", () => {
      // Arrange
      (comp as any).paused = true;
      (comp as any)._phaseIndex = 0;

      // Act
      (comp as any).update(0);

      // Assert
      expect((comp as any).seconds).toBe(0);
      expect((comp as any).minutes).toBe(0);
      expect(minutesLabel.string).toContain(":");
      expect(secondsLabel.string.length).toBe(2);
    });
  });

  describe("update (playing)", () => {
    it("calculates minutes and seconds based on streaming phase time and updates labels", () => {
      // Arrange
      (comp as any).paused = false;
      (comp as any)._phaseIndex = 0;
      (comp as any)._streamingPhaseTime = 15; // 15 seconds of streaming
      (comp as any).videoDuration = 30;

      // Act
      (comp as any).update(1); // 1 second delta time

      // Assert
      expect((comp as any)._streamingPhaseTime).toBe(16); // incremented by dt
      expect(typeof (comp as any).minutes).toBe("number");
      expect(typeof (comp as any).seconds).toBe("number");
      expect((comp as any).minutes).toBeGreaterThanOrEqual(0);
      expect((comp as any).seconds).toBeGreaterThanOrEqual(0);
      expect(minutesLabel.string.endsWith(":")).toBe(true);
      expect(secondsLabel.string.length).toBe(2);
    });
  });
});
