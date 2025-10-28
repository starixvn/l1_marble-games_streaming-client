import { GameStore, type GameData } from "../../../../assets/scripts/local-stores/game/game-store";

describe("GameStore", () => {
  describe("update", () => {
    it("sets data to provided GameData", () => {
      // Arrange
      const store = new GameStore();
      const data: GameData = { gameId: "gm-123" };

      // Act
      store.update(data);

      // Assert
      expect(store.data).toEqual({ gameId: "gm-123" });
    });
  });
});


