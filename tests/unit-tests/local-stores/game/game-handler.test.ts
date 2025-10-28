import { GameHandler } from "../../../../assets/scripts/local-stores/game/game-handler";
import { GameStore } from "../../../../assets/scripts/local-stores/game/game-store";

describe("GameHandler", () => {
  describe("openGame", () => {
    it("updates GameStore with provided gameId", () => {
      // Arrange
      const handler = new GameHandler();
      const store = new GameStore();
      const updateSpy = jest.spyOn(store, "update");
      (handler as any).gameStore = store;

      // Act
      handler.openGame("gm-9");

      // Assert
      expect(updateSpy).toHaveBeenCalledWith({ gameId: "gm-9" });
      expect(store.data).toEqual({ gameId: "gm-9" });
    });
  });
});


