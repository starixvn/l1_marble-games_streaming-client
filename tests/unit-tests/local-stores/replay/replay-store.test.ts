import { ReplayStore, type ReplayPayload } from "../../../../assets/scripts/local-stores/replay/replay-store";

describe("ReplayStore", () => {
  describe("update", () => {
    it("sets replayData to provided payload", () => {
      // Arrange
      const store = new ReplayStore();
      const payload: ReplayPayload = {
        meta: { fromTime: 10, gameId: "g1" },
        payload: [
          { time: 0, payload: { intro: { status: true, currentTime: 0, timeToPlay: 10 } } },
          { time: 1, payload: { other: { x: 1 } } },
        ],
      };

      // Act
      store.update(payload);

      // Assert
      expect(store.replayData).toEqual(payload);
    });
  });
});


